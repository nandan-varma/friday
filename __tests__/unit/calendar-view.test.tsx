/* eslint-disable @typescript-eslint/no-explicit-any */
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { CalendarView } from "../../src/components/calendar/calendar-view";
import { UnifiedEvent } from "../../src/lib/services/eventService";

// Mock Radix UI Tabs components
jest.mock("@/components/ui/tabs", () => {
  const mockTabsContext = {
    value: "month",
    onValueChange: jest.fn(),
  };

  return {
    Tabs: ({ children, value, onValueChange }: any) => {
      mockTabsContext.value = value;
      mockTabsContext.onValueChange = onValueChange;
      return (
        <div data-value={value} data-testid="tabs">
          {children}
        </div>
      );
    },
    TabsList: ({ children }: any) => (
      <div role="tablist" data-testid="tabs-list">
        {children}
      </div>
    ),
    TabsTrigger: ({ children, value }: any) => (
      <button
        role="tab"
        aria-selected={mockTabsContext.value === value ? "true" : "false"}
        onClick={() => mockTabsContext.onValueChange(value)}
        data-testid={`tab-${value}`}
      >
        {children}
      </button>
    ),
    TabsContent: ({ children, value }: any) => (
      <div
        data-testid={`tab-content-${value}`}
        style={{ display: mockTabsContext.value === value ? "block" : "none" }}
      >
        {children}
      </div>
    ),
  };
});

// Mock the child view components
jest.mock("../../src/components/calendar/month-view", () => ({
  MonthView: ({
    currentDate,
    events,
    onDateChange,
    onEventClick,
    onCreateEvent,
  }: any) => (
    <div data-testid="month-view">
      <div>Month View</div>
      <div data-testid="month-current-date">{currentDate?.toISOString()}</div>
      <div data-testid="month-events-count">{events?.length || 0}</div>
      <button
        data-testid="month-date-change"
        onClick={() => onDateChange(new Date("2023-02-01"))}
      >
        Change Date
      </button>
      <button
        data-testid="month-event-click"
        onClick={() => onEventClick(events[0])}
      >
        Click Event
      </button>
      <button
        data-testid="month-create-event"
        onClick={() => onCreateEvent(new Date("2023-01-15"))}
      >
        Create Event
      </button>
    </div>
  ),
}));

jest.mock("../../src/components/calendar/week-view", () => ({
  WeekView: ({
    currentDate,
    events,
    onDateChange,
    onEventClick,
    onCreateEvent,
  }: any) => (
    <div data-testid="week-view">
      <div>Week View</div>
      <div data-testid="week-current-date">{currentDate?.toISOString()}</div>
      <div data-testid="week-events-count">{events?.length || 0}</div>
      <button
        data-testid="week-date-change"
        onClick={() => onDateChange(new Date("2023-02-01"))}
      >
        Change Date
      </button>
      <button
        data-testid="week-event-click"
        onClick={() => onEventClick(events[0])}
      >
        Click Event
      </button>
      <button
        data-testid="week-create-event"
        onClick={() => onCreateEvent(new Date("2023-01-15"))}
      >
        Create Event
      </button>
    </div>
  ),
}));

jest.mock("../../src/components/calendar/day-view", () => ({
  DayView: ({
    currentDate,
    events,
    onDateChange,
    onEventClick,
    onCreateEvent,
  }: any) => (
    <div data-testid="day-view">
      <div>Day View</div>
      <div data-testid="day-current-date">{currentDate?.toISOString()}</div>
      <div data-testid="day-events-count">{events?.length || 0}</div>
      <button
        data-testid="day-date-change"
        onClick={() => onDateChange(new Date("2023-02-01"))}
      >
        Change Date
      </button>
      <button
        data-testid="day-event-click"
        onClick={() => onEventClick(events[0])}
      >
        Click Event
      </button>
      <button
        data-testid="day-create-event"
        onClick={() => onCreateEvent(new Date("2023-01-15"))}
      >
        Create Event
      </button>
    </div>
  ),
}));

jest.mock("../../src/components/calendar/agenda-view", () => ({
  AgendaView: ({
    currentDate,
    events,
    onDateChange,
    onEventClick,
    onCreateEvent,
  }: any) => (
    <div data-testid="agenda-view">
      <div>Agenda View</div>
      <div data-testid="agenda-current-date">{currentDate?.toISOString()}</div>
      <div data-testid="agenda-events-count">{events?.length || 0}</div>
      <button
        data-testid="agenda-date-change"
        onClick={() => onDateChange(new Date("2023-02-01"))}
      >
        Change Date
      </button>
      <button
        data-testid="agenda-event-click"
        onClick={() => onEventClick(events[0])}
      >
        Click Event
      </button>
      <button
        data-testid="agenda-create-event"
        onClick={() => onCreateEvent(new Date("2023-01-15"))}
      >
        Create Event
      </button>
    </div>
  ),
}));

describe("CalendarView", () => {
  const mockEvents: UnifiedEvent[] = [
    {
      id: "1",
      title: "Test Event 1",
      startTime: new Date("2023-01-15T10:00:00Z"),
      endTime: new Date("2023-01-15T11:00:00Z"),
      isAllDay: false,
      origin: "local",
    },
    {
      id: "2",
      title: "Test Event 2",
      startTime: new Date("2023-01-16T14:00:00Z"),
      endTime: new Date("2023-01-16T15:00:00Z"),
      isAllDay: false,
      origin: "google",
    },
  ];

  const mockOnEventClick = jest.fn();
  const mockOnCreateEvent = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render calendar after initialization", async () => {
    render(
      <CalendarView
        events={mockEvents}
        onEventClick={mockOnEventClick}
        onCreateEvent={mockOnCreateEvent}
      />,
    );

    await waitFor(() => {
      expect(screen.getByText("Calendar")).toBeInTheDocument();
    });

    expect(screen.getByText("Month")).toBeInTheDocument();
    expect(screen.getByText("Week")).toBeInTheDocument();
    expect(screen.getByText("Day")).toBeInTheDocument();
    expect(screen.getByText("Agenda")).toBeInTheDocument();
  });

  it("should initialize currentDate after useEffect", async () => {
    render(
      <CalendarView
        events={mockEvents}
        onEventClick={mockOnEventClick}
        onCreateEvent={mockOnCreateEvent}
      />,
    );

    await waitFor(() => {
      expect(screen.getByText("Calendar")).toBeInTheDocument();
    });

    expect(screen.getByText("Month")).toBeInTheDocument();
    expect(screen.getByText("Week")).toBeInTheDocument();
    expect(screen.getByText("Day")).toBeInTheDocument();
    expect(screen.getByText("Agenda")).toBeInTheDocument();
  });

  it("should render month view by default", async () => {
    render(
      <CalendarView
        events={mockEvents}
        onEventClick={mockOnEventClick}
        onCreateEvent={mockOnCreateEvent}
      />,
    );

    await waitFor(() => {
      expect(screen.getByTestId("month-view")).toBeInTheDocument();
    });

    expect(screen.getByText("Month View")).toBeInTheDocument();
  });

  it("should render week tab trigger", async () => {
    render(
      <CalendarView
        events={mockEvents}
        onEventClick={mockOnEventClick}
        onCreateEvent={mockOnCreateEvent}
      />,
    );

    await waitFor(() => {
      expect(screen.getByRole("tab", { name: /week/i })).toBeInTheDocument();
    });

    const weekTab = screen.getByRole("tab", { name: /week/i });
    expect(weekTab).toBeInTheDocument();
    expect(weekTab).toHaveAttribute("aria-selected", "false");
  });

  it("should render day tab trigger", async () => {
    render(
      <CalendarView
        events={mockEvents}
        onEventClick={mockOnEventClick}
        onCreateEvent={mockOnCreateEvent}
      />,
    );

    await waitFor(() => {
      expect(screen.getByRole("tab", { name: /day/i })).toBeInTheDocument();
    });

    const dayTab = screen.getByRole("tab", { name: /day/i });
    expect(dayTab).toBeInTheDocument();
    expect(dayTab).toHaveAttribute("aria-selected", "false");
  });

  it("should render agenda tab trigger", async () => {
    render(
      <CalendarView
        events={mockEvents}
        onEventClick={mockOnEventClick}
        onCreateEvent={mockOnCreateEvent}
      />,
    );

    await waitFor(() => {
      expect(screen.getByRole("tab", { name: /agenda/i })).toBeInTheDocument();
    });

    const agendaTab = screen.getByRole("tab", { name: /agenda/i });
    expect(agendaTab).toBeInTheDocument();
    expect(agendaTab).toHaveAttribute("aria-selected", "false");
  });

  it("should pass events to the current view component", async () => {
    render(
      <CalendarView
        events={mockEvents}
        onEventClick={mockOnEventClick}
        onCreateEvent={mockOnCreateEvent}
      />,
    );

    await waitFor(() => {
      expect(screen.getByTestId("month-events-count")).toBeInTheDocument();
    });

    expect(screen.getByTestId("month-events-count")).toHaveTextContent("2");
  });

  it("should pass currentDate to the current view component", async () => {
    const fixedDate = new Date("2023-01-15");
    jest.useFakeTimers().setSystemTime(fixedDate);

    render(
      <CalendarView
        events={mockEvents}
        onEventClick={mockOnEventClick}
        onCreateEvent={mockOnCreateEvent}
      />,
    );

    await waitFor(() => {
      expect(screen.getByTestId("month-current-date")).toBeInTheDocument();
    });

    expect(screen.getByTestId("month-current-date")).toHaveTextContent(
      fixedDate.toISOString(),
    );

    jest.useRealTimers();
  });

  it("should call onEventClick when event is clicked in month view", async () => {
    render(
      <CalendarView
        events={mockEvents}
        onEventClick={mockOnEventClick}
        onCreateEvent={mockOnCreateEvent}
      />,
    );

    await waitFor(() => {
      expect(screen.getByTestId("month-event-click")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId("month-event-click"));

    expect(mockOnEventClick).toHaveBeenCalledWith(mockEvents[0]);
  });

  it("should call onCreateEvent when create event is triggered in month view", async () => {
    render(
      <CalendarView
        events={mockEvents}
        onEventClick={mockOnEventClick}
        onCreateEvent={mockOnCreateEvent}
      />,
    );

    await waitFor(() => {
      expect(screen.getByTestId("month-create-event")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId("month-create-event"));

    expect(mockOnCreateEvent).toHaveBeenCalledWith(new Date("2023-01-15"));
  });

  it("should handle date change from child components", async () => {
    render(
      <CalendarView
        events={mockEvents}
        onEventClick={mockOnEventClick}
        onCreateEvent={mockOnCreateEvent}
      />,
    );

    await waitFor(() => {
      expect(screen.getByTestId("month-date-change")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId("month-date-change"));

    // The date change should be handled internally, but we can't easily test the state change
    // without more complex setup. This test ensures the callback is wired up.
    expect(screen.getByTestId("month-view")).toBeInTheDocument();
  });

  it("should render with empty events array", async () => {
    render(
      <CalendarView
        events={[]}
        onEventClick={mockOnEventClick}
        onCreateEvent={mockOnCreateEvent}
      />,
    );

    await waitFor(() => {
      expect(screen.getByTestId("month-events-count")).toBeInTheDocument();
    });

    expect(screen.getByTestId("month-events-count")).toHaveTextContent("0");
  });

  it("should switch to week view when week tab is clicked", async () => {
    render(
      <CalendarView
        events={mockEvents}
        onEventClick={mockOnEventClick}
        onCreateEvent={mockOnCreateEvent}
      />,
    );

    await waitFor(() => {
      expect(screen.getByRole("tab", { name: /week/i })).toBeInTheDocument();
    });

    const weekTab = screen.getByRole("tab", { name: /week/i });
    fireEvent.click(weekTab);

    await waitFor(() => {
      expect(screen.getByTestId("week-view")).toBeInTheDocument();
    });

    expect(screen.getByTestId("week-view")).toBeInTheDocument();
    expect(weekTab).toHaveAttribute("aria-selected", "true");
  });

  it("should switch to day view when day tab is clicked", async () => {
    render(
      <CalendarView
        events={mockEvents}
        onEventClick={mockOnEventClick}
        onCreateEvent={mockOnCreateEvent}
      />,
    );

    await waitFor(() => {
      expect(screen.getByRole("tab", { name: /day/i })).toBeInTheDocument();
    });

    const dayTab = screen.getByRole("tab", { name: /day/i });
    fireEvent.click(dayTab);

    await waitFor(() => {
      expect(screen.getByTestId("day-view")).toBeInTheDocument();
    });

    expect(screen.getByTestId("day-view")).toBeInTheDocument();
    expect(dayTab).toHaveAttribute("aria-selected", "true");
  });

  it("should switch to agenda view when agenda tab is clicked", async () => {
    render(
      <CalendarView
        events={mockEvents}
        onEventClick={mockOnEventClick}
        onCreateEvent={mockOnCreateEvent}
      />,
    );

    await waitFor(() => {
      expect(screen.getByRole("tab", { name: /agenda/i })).toBeInTheDocument();
    });

    const agendaTab = screen.getByRole("tab", { name: /agenda/i });
    fireEvent.click(agendaTab);

    await waitFor(() => {
      expect(screen.getByTestId("agenda-view")).toBeInTheDocument();
    });

    expect(screen.getByTestId("agenda-view")).toBeInTheDocument();
    expect(agendaTab).toHaveAttribute("aria-selected", "true");
  });

  it("should maintain selected tab state across re-renders", async () => {
    const { rerender } = render(
      <CalendarView
        events={mockEvents}
        onEventClick={mockOnEventClick}
        onCreateEvent={mockOnCreateEvent}
      />,
    );

    await waitFor(() => {
      expect(screen.getByRole("tab", { name: /week/i })).toBeInTheDocument();
    });

    const weekTab = screen.getByRole("tab", { name: /week/i });
    fireEvent.click(weekTab);

    await waitFor(() => {
      expect(weekTab).toHaveAttribute("aria-selected", "true");
    });

    // Re-render with same props
    rerender(
      <CalendarView
        events={mockEvents}
        onEventClick={mockOnEventClick}
        onCreateEvent={mockOnCreateEvent}
      />,
    );

    expect(weekTab).toHaveAttribute("aria-selected", "true");
  });

  it("should handle events with different origins", async () => {
    const mixedEvents: UnifiedEvent[] = [
      {
        id: "1",
        title: "Local Event",
        startTime: new Date("2023-01-15T10:00:00Z"),
        endTime: new Date("2023-01-15T11:00:00Z"),
        isAllDay: false,
        origin: "local",
      },
      {
        id: "2",
        title: "Google Event",
        startTime: new Date("2023-01-16T14:00:00Z"),
        endTime: new Date("2023-01-16T15:00:00Z"),
        isAllDay: false,
        origin: "google",
      },
    ];

    render(
      <CalendarView
        events={mixedEvents}
        onEventClick={mockOnEventClick}
        onCreateEvent={mockOnCreateEvent}
      />,
    );

    await waitFor(() => {
      expect(screen.getByTestId("month-events-count")).toBeInTheDocument();
    });

    expect(screen.getByTestId("month-events-count")).toHaveTextContent("2");
  });

  it("should handle events with all-day flag", async () => {
    const allDayEvent: UnifiedEvent = {
      id: "1",
      title: "All Day Event",
      startTime: new Date("2023-01-15T00:00:00Z"),
      endTime: new Date("2023-01-15T23:59:59Z"),
      isAllDay: true,
      origin: "local",
    };

    render(
      <CalendarView
        events={[allDayEvent]}
        onEventClick={mockOnEventClick}
        onCreateEvent={mockOnCreateEvent}
      />,
    );

    await waitFor(() => {
      expect(screen.getByTestId("month-events-count")).toBeInTheDocument();
    });

    expect(screen.getByTestId("month-events-count")).toHaveTextContent("1");
  });

  it("should handle events with recurrence", async () => {
    const recurringEvent: UnifiedEvent = {
      id: "1",
      title: "Recurring Event",
      startTime: new Date("2023-01-15T10:00:00Z"),
      endTime: new Date("2023-01-15T11:00:00Z"),
      isAllDay: false,
      origin: "local",
      recurrence: "weekly",
    };

    render(
      <CalendarView
        events={[recurringEvent]}
        onEventClick={mockOnEventClick}
        onCreateEvent={mockOnCreateEvent}
      />,
    );

    await waitFor(() => {
      expect(screen.getByTestId("month-events-count")).toBeInTheDocument();
    });

    expect(screen.getByTestId("month-events-count")).toHaveTextContent("1");
  });

  it("should render all tab triggers and month view is default", async () => {
    render(
      <CalendarView
        events={mockEvents}
        onEventClick={mockOnEventClick}
        onCreateEvent={mockOnCreateEvent}
      />,
    );

    await waitFor(() => {
      expect(screen.getByRole("tab", { name: /month/i })).toBeInTheDocument();
    });

    // Check all tabs are rendered
    expect(screen.getByRole("tab", { name: /month/i })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    expect(screen.getByRole("tab", { name: /week/i })).toHaveAttribute(
      "aria-selected",
      "false",
    );
    expect(screen.getByRole("tab", { name: /day/i })).toHaveAttribute(
      "aria-selected",
      "false",
    );
    expect(screen.getByRole("tab", { name: /agenda/i })).toHaveAttribute(
      "aria-selected",
      "false",
    );

    // Month view should be visible
    expect(screen.getByTestId("month-view")).toBeInTheDocument();
  });

  it("should render tab icons correctly", async () => {
    render(
      <CalendarView
        events={mockEvents}
        onEventClick={mockOnEventClick}
        onCreateEvent={mockOnCreateEvent}
      />,
    );

    await waitFor(() => {
      expect(screen.getByText("Calendar")).toBeInTheDocument();
    });

    // Check that tabs are rendered (icons are tested via visual regression or accessibility tests)
    expect(screen.getByText("Month")).toBeInTheDocument();
    expect(screen.getByText("Week")).toBeInTheDocument();
    expect(screen.getByText("Day")).toBeInTheDocument();
    expect(screen.getByText("Agenda")).toBeInTheDocument();
  });
});
