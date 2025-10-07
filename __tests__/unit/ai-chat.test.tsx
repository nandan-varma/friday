import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { AIChat } from "../../src/components/ai-chat";

// Mock the useChat hook
jest.mock("@ai-sdk/react", () => ({
  useChat: jest.fn(),
}));

// Mock the DefaultChatTransport
jest.mock("ai", () => ({
  DefaultChatTransport: jest.fn(),
  lastAssistantMessageIsCompleteWithToolCalls: jest.fn(),
}));

// Mock tool components
jest.mock("../../src/components/ai-tool-components", () => ({
  UpcomingEvents: ({ events, count, onEventClick }: any) => (
    <div data-testid="upcoming-events">
      <div>Upcoming Events: {count}</div>
      {events.map((event: any, index: number) => (
        <button
          key={index}
          data-testid={`event-${event.id}`}
          onClick={() => onEventClick(event)}
        >
          {event.title}
        </button>
      ))}
    </div>
  ),
  EventCreated: ({ event, onEventClick }: any) => (
    <div data-testid="event-created">
      <div>Event Created: {event.title}</div>
      <button
        data-testid="created-event-click"
        onClick={() => onEventClick(event)}
      >
        View Event
      </button>
    </div>
  ),
  TimeSuggestions: ({ suggestions }: any) => (
    <div data-testid="time-suggestions">
      Time Suggestions: {suggestions?.length || 0}
    </div>
  ),
  ToolLoading: ({ toolName }: any) => (
    <div data-testid={`tool-loading-${toolName}`}>Loading {toolName}...</div>
  ),
  ToolError: ({ toolName, error }: any) => (
    <div data-testid={`tool-error-${toolName}`}>
      Error in {toolName}: {error}
    </div>
  ),
}));

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";

const mockUseChat = useChat as jest.Mock;
const mockSendMessage = jest.fn();
const mockAddToolResult = jest.fn();

describe("AIChat", () => {
  const mockOnEventCreate = jest.fn();
  const mockOnEventClick = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    // Default mock for useChat
    mockUseChat.mockReturnValue({
      messages: [],
      sendMessage: mockSendMessage,
      addToolResult: mockAddToolResult,
      status: "ready",
    });
  });

  it("should render the chat interface", () => {
    render(
      <AIChat
        onEventCreate={mockOnEventCreate}
        onEventClick={mockOnEventClick}
      />,
    );

    expect(screen.getByText("AI Calendar Assistant")).toBeInTheDocument();
    expect(screen.getByText("Powered by AI")).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("Ask me about your calendar..."),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Hello! I'm your AI calendar assistant/),
    ).toBeInTheDocument();
  });

  it("should display initial suggestions", () => {
    render(
      <AIChat
        onEventCreate={mockOnEventCreate}
        onEventClick={mockOnEventClick}
      />,
    );

    expect(screen.getByText("Show me my upcoming events")).toBeInTheDocument();
    expect(screen.getByText("Create a new event")).toBeInTheDocument();
    expect(screen.getByText("Find a time for a meeting")).toBeInTheDocument();
    expect(
      screen.getByText("What's on my calendar today?"),
    ).toBeInTheDocument();
  });

  it("should call sendMessage when suggestion is clicked", () => {
    render(
      <AIChat
        onEventCreate={mockOnEventCreate}
        onEventClick={mockOnEventClick}
      />,
    );

    fireEvent.click(screen.getByText("Show me my upcoming events"));

    expect(mockSendMessage).toHaveBeenCalledWith({
      text: "Show me my upcoming events",
    });
  });

  it("should send message when Enter key is pressed", () => {
    render(
      <AIChat
        onEventCreate={mockOnEventCreate}
        onEventClick={mockOnEventClick}
      />,
    );

    const input = screen.getByPlaceholderText(
      "Ask me about your calendar...",
    ) as HTMLInputElement;
    fireEvent.change(input, { target: { value: "Test message" } });
    fireEvent.keyDown(input, { key: "Enter", code: "Enter" });

    expect(mockSendMessage).toHaveBeenCalledWith({ text: "Test message" });
  });

  it("should not send message when Shift+Enter is pressed", () => {
    render(
      <AIChat
        onEventCreate={mockOnEventCreate}
        onEventClick={mockOnEventClick}
      />,
    );

    const input = screen.getByPlaceholderText("Ask me about your calendar...");
    fireEvent.change(input, { target: { value: "Test message" } });
    fireEvent.keyDown(input, { key: "Enter", code: "Enter", shiftKey: true });

    expect(mockSendMessage).not.toHaveBeenCalled();
  });

  it("should send message when send button is clicked", () => {
    render(
      <AIChat
        onEventCreate={mockOnEventCreate}
        onEventClick={mockOnEventClick}
      />,
    );

    const input = screen.getByPlaceholderText("Ask me about your calendar...");
    // Find the send button (it's the button without text content)
    const buttons = screen.getAllByRole("button");
    const sendButton = buttons.find((button) => !button.textContent?.trim());

    if (!sendButton) throw new Error("Send button not found");

    fireEvent.change(input, { target: { value: "Test message" } });
    fireEvent.click(sendButton);

    expect(mockSendMessage).toHaveBeenCalledWith({ text: "Test message" });
  });

  it("should clear input after sending message", () => {
    render(
      <AIChat
        onEventCreate={mockOnEventCreate}
        onEventClick={mockOnEventClick}
      />,
    );

    const input = screen.getByPlaceholderText(
      "Ask me about your calendar...",
    ) as HTMLInputElement;
    // Find the send button (it's the button without text content)
    const buttons = screen.getAllByRole("button");
    const sendButton = buttons.find((button) => !button.textContent?.trim());

    if (!sendButton) throw new Error("Send button not found");

    fireEvent.change(input, { target: { value: "Test message" } });
    input.value = "Test message"; // Set value directly
    fireEvent.click(sendButton);

    expect(input.value).toBe("");
  });

  it("should display user messages", () => {
    const mockMessages = [
      {
        id: "1",
        role: "user",
        parts: [{ type: "text", text: "Hello AI" }],
      },
    ];

    mockUseChat.mockReturnValue({
      messages: mockMessages,
      sendMessage: mockSendMessage,
      addToolResult: mockAddToolResult,
      status: "ready",
    });

    render(
      <AIChat
        onEventCreate={mockOnEventCreate}
        onEventClick={mockOnEventClick}
      />,
    );

    expect(screen.getByText("Hello AI")).toBeInTheDocument();
  });

  it("should display assistant messages", () => {
    const mockMessages = [
      {
        id: "2",
        role: "assistant",
        parts: [{ type: "text", text: "Hello! How can I help?" }],
      },
    ];

    mockUseChat.mockReturnValue({
      messages: mockMessages,
      sendMessage: mockSendMessage,
      addToolResult: mockAddToolResult,
      status: "ready",
    });

    render(
      <AIChat
        onEventCreate={mockOnEventCreate}
        onEventClick={mockOnEventClick}
      />,
    );

    expect(screen.getByText("Hello! How can I help?")).toBeInTheDocument();
  });

  it("should show loading state when streaming", () => {
    mockUseChat.mockReturnValue({
      messages: [],
      sendMessage: mockSendMessage,
      addToolResult: mockAddToolResult,
      status: "streaming",
    });

    render(
      <AIChat
        onEventCreate={mockOnEventCreate}
        onEventClick={mockOnEventClick}
      />,
    );

    expect(screen.getByText("Thinking...")).toBeInTheDocument();
  });

  it("should disable input when loading", () => {
    mockUseChat.mockReturnValue({
      messages: [],
      sendMessage: mockSendMessage,
      addToolResult: mockAddToolResult,
      status: "streaming",
    });

    render(
      <AIChat
        onEventCreate={mockOnEventCreate}
        onEventClick={mockOnEventClick}
      />,
    );

    const input = screen.getByPlaceholderText("Ask me about your calendar...");
    // Find the send button (it's the button without text content)
    const buttons = screen.getAllByRole("button");
    const sendButton = buttons.find((button) => !button.textContent?.trim());

    if (!sendButton) throw new Error("Send button not found");

    expect(input).toBeDisabled();
    expect(sendButton).toBeDisabled();
  });

  it("should render upcoming events tool result", () => {
    const mockMessages = [
      {
        id: "3",
        role: "assistant",
        parts: [
          {
            type: "tool-getUpcomingEvents",
            toolCallId: "call1",
            state: "output-available",
            output: [
              {
                id: "event1",
                title: "Meeting",
                description: "Team meeting",
                location: "Office",
                startTime: new Date(),
                endTime: new Date(),
                isAllDay: false,
              },
            ],
          },
        ],
      },
    ];

    mockUseChat.mockReturnValue({
      messages: mockMessages,
      sendMessage: mockSendMessage,
      addToolResult: mockAddToolResult,
      status: "ready",
    });

    render(
      <AIChat
        onEventCreate={mockOnEventCreate}
        onEventClick={mockOnEventClick}
      />,
    );

    expect(screen.getByTestId("upcoming-events")).toBeInTheDocument();
    expect(screen.getByText("Upcoming Events: 1")).toBeInTheDocument();
    expect(screen.getByText("Meeting")).toBeInTheDocument();
  });

  it("should render event created tool result", () => {
    const mockMessages = [
      {
        id: "4",
        role: "assistant",
        parts: [
          {
            type: "tool-createEvent",
            toolCallId: "call2",
            state: "output-available",
            output: {
              id: "event2",
              title: "New Meeting",
              description: "Project discussion",
              location: "Conference Room",
              startTime: new Date(),
              endTime: new Date(),
              isAllDay: false,
            },
          },
        ],
      },
    ];

    mockUseChat.mockReturnValue({
      messages: mockMessages,
      sendMessage: mockSendMessage,
      addToolResult: mockAddToolResult,
      status: "ready",
    });

    render(
      <AIChat
        onEventCreate={mockOnEventCreate}
        onEventClick={mockOnEventClick}
      />,
    );

    expect(screen.getByTestId("event-created")).toBeInTheDocument();
    expect(screen.getByText("Event Created: New Meeting")).toBeInTheDocument();
  });

  it("should render tool loading state", () => {
    const mockMessages = [
      {
        id: "5",
        role: "assistant",
        parts: [
          {
            type: "tool-getUpcomingEvents",
            toolCallId: "call3",
            state: "input-streaming",
          },
        ],
      },
    ];

    mockUseChat.mockReturnValue({
      messages: mockMessages,
      sendMessage: mockSendMessage,
      addToolResult: mockAddToolResult,
      status: "ready",
    });

    render(
      <AIChat
        onEventCreate={mockOnEventCreate}
        onEventClick={mockOnEventClick}
      />,
    );

    expect(
      screen.getByTestId("tool-loading-getUpcomingEvents"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Loading getUpcomingEvents..."),
    ).toBeInTheDocument();
  });

  it("should render tool error state", () => {
    const mockMessages = [
      {
        id: "6",
        role: "assistant",
        parts: [
          {
            type: "tool-createEvent",
            toolCallId: "call4",
            state: "output-error",
            errorText: "Failed to create event",
          },
        ],
      },
    ];

    mockUseChat.mockReturnValue({
      messages: mockMessages,
      sendMessage: mockSendMessage,
      addToolResult: mockAddToolResult,
      status: "ready",
    });

    render(
      <AIChat
        onEventCreate={mockOnEventCreate}
        onEventClick={mockOnEventClick}
      />,
    );

    expect(screen.getByTestId("tool-error-createEvent")).toBeInTheDocument();
    expect(
      screen.getByText("Error in createEvent: Failed to create event"),
    ).toBeInTheDocument();
  });

  it("should render event statistics tool result", () => {
    const mockMessages = [
      {
        id: "7",
        role: "assistant",
        parts: [
          {
            type: "tool-getEventStats",
            toolCallId: "call5",
            state: "output-available",
            output: {
              totalEvents: 10,
              todayEvents: 2,
              upcomingEvents: 5,
              localEvents: 7,
              googleEvents: 3,
            },
          },
        ],
      },
    ];

    mockUseChat.mockReturnValue({
      messages: mockMessages,
      sendMessage: mockSendMessage,
      addToolResult: mockAddToolResult,
      status: "ready",
    });

    render(
      <AIChat
        onEventCreate={mockOnEventCreate}
        onEventClick={mockOnEventClick}
      />,
    );

    expect(screen.getByText("Calendar Statistics")).toBeInTheDocument();
    expect(screen.getAllByText("10")).toHaveLength(2); // Total Events and Sources
    expect(screen.getByText("2")).toBeInTheDocument(); // Today
    expect(screen.getByText("5")).toBeInTheDocument(); // Upcoming
  });

  it("should call onEventClick when event in tool result is clicked", () => {
    const mockMessages = [
      {
        id: "8",
        role: "assistant",
        parts: [
          {
            type: "tool-getUpcomingEvents",
            toolCallId: "call6",
            state: "output-available",
            output: [
              {
                id: "event3",
                title: "Test Event",
                description: "Test Description",
                location: "Test Location",
                startTime: new Date(),
                endTime: new Date(),
                isAllDay: false,
              },
            ],
          },
        ],
      },
    ];

    mockUseChat.mockReturnValue({
      messages: mockMessages,
      sendMessage: mockSendMessage,
      addToolResult: mockAddToolResult,
      status: "ready",
    });

    render(
      <AIChat
        onEventCreate={mockOnEventCreate}
        onEventClick={mockOnEventClick}
      />,
    );

    fireEvent.click(screen.getByTestId("event-event3"));

    expect(mockOnEventClick).toHaveBeenCalledWith({
      id: "event3",
      title: "Test Event",
      description: "Test Description",
      location: "Test Location",
      startTime: expect.any(Date),
      endTime: expect.any(Date),
      isAllDay: false,
    });
  });

  it("should call onEventClick when created event is clicked", () => {
    const mockMessages = [
      {
        id: "9",
        role: "assistant",
        parts: [
          {
            type: "tool-createEvent",
            toolCallId: "call7",
            state: "output-available",
            output: {
              id: "event4",
              title: "Created Event",
              description: "Created Description",
              location: "Created Location",
              startTime: new Date(),
              endTime: new Date(),
              isAllDay: false,
            },
          },
        ],
      },
    ];

    mockUseChat.mockReturnValue({
      messages: mockMessages,
      sendMessage: mockSendMessage,
      addToolResult: mockAddToolResult,
      status: "ready",
    });

    render(
      <AIChat
        onEventCreate={mockOnEventCreate}
        onEventClick={mockOnEventClick}
      />,
    );

    fireEvent.click(screen.getByTestId("created-event-click"));

    expect(mockOnEventClick).toHaveBeenCalledWith({
      id: "event4",
      title: "Created Event",
      description: "Created Description",
      location: "Created Location",
      startTime: expect.any(Date),
      endTime: expect.any(Date),
      isAllDay: false,
    });
  });

  it("should initialize useChat with correct transport", () => {
    render(
      <AIChat
        onEventCreate={mockOnEventCreate}
        onEventClick={mockOnEventClick}
      />,
    );

    expect(mockUseChat).toHaveBeenCalledWith({
      transport: expect.any(DefaultChatTransport),
    });

    expect(DefaultChatTransport).toHaveBeenCalledWith({
      api: "/api/chat",
    });
  });
});
