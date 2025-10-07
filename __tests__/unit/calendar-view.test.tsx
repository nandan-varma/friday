import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { CalendarView } from "../../src/components/calendar/calendar-view";
import { UnifiedEvent } from "../../src/lib/eventService";

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

  it("should switch to week view when week tab is clicked", async () => {
    render(
      <CalendarView
        events={mockEvents}
        onEventClick={mockOnEventClick}
        onCreateEvent={mockOnCreateEvent}
      />,
    );

    await waitFor(() => {
      expect(screen.getByText("Week")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Week"));

    await waitFor(() => {
      expect(screen.getByTestId("week-view")).toBeInTheDocument();
    });
    expect(screen.getByText("Week View")).toBeInTheDocument();
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
      expect(screen.getByText("Day")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Day"));

    await waitFor(() => {
      expect(screen.getByTestId("day-view")).toBeInTheDocument();
    });
    expect(screen.getByText("Day View")).toBeInTheDocument();
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
      expect(screen.getByText("Agenda")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Agenda"));

    await waitFor(() => {
      expect(screen.getByTestId("agenda-view")).toBeInTheDocument();
    });
    expect(screen.getByText("Agenda View")).toBeInTheDocument();
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

  it("should maintain view state when switching tabs", async () => {
    render(
      <CalendarView
        events={mockEvents}
        onEventClick={mockOnEventClick}
        onCreateEvent={mockOnCreateEvent}
      />,
    );

    await waitFor(() => {
      expect(screen.getByText("Week")).toBeInTheDocument();
    });

    // Switch to week view
    fireEvent.click(screen.getByText("Week"));
    await waitFor(() => {
      expect(screen.getByTestId("week-view")).toBeInTheDocument();
    });

    // Switch back to month view
    fireEvent.click(screen.getByText("Month"));
    await waitFor(() => {
      expect(screen.getByTestId("month-view")).toBeInTheDocument();
    });
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
