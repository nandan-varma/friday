/* eslint-disable @typescript-eslint/no-explicit-any */

// Mock server-only to allow running in test environment
jest.mock("server-only", () => ({}));

// Mock logger properly
jest.mock("../../src/lib/logger", () => {
  const mockLogger = {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
    child: jest.fn(function (this: any) {
      return this;
    }),
  };
  return { __esModule: true, default: mockLogger };
});

// Mock AI SDK and OpenAI
jest.mock("ai", () => ({
  generateObject: jest.fn(),
}));

jest.mock("@ai-sdk/openai", () => ({
  openai: jest.fn(() => ({})),
}));

// Mock the integration services
jest.mock("../../src/lib/services/localIntegrationService", () => ({
  LocalIntegrationService: {
    createEvent: jest.fn(),
    getEvents: jest.fn(),
    updateEvent: jest.fn(),
    deleteEvent: jest.fn(),
    hasEvents: jest.fn(),
  },
}));

jest.mock("../../src/lib/services/googleIntegrationService", () => ({
  GoogleIntegrationService: {
    getCalendarEvents: jest.fn(),
    hasValidIntegration: jest.fn(),
    createCalendarEvent: jest.fn(),
    updateCalendarEvent: jest.fn(),
    deleteCalendarEvent: jest.fn(),
  },
}));

// Import after mocks are defined
import {
  EventService,
} from "../../src/lib/services/eventService";
import {
  LocalIntegrationService,
  LocalEvent,
} from "../../src/lib/services/localIntegrationService";
import { GoogleIntegrationService } from "../../src/lib/services/googleIntegrationService";
import { generateObject } from "ai";

describe("EventService", () => {
  // Fixed date for consistent testing
  const FIXED_DATE = new Date("2023-10-01T12:00:00.000Z");

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    jest.setSystemTime(FIXED_DATE);
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.useRealTimers();
  });

  describe("getAllTodayEvents", () => {
    it("returns only today's events within correct date range", async () => {
      const todayEvent: LocalEvent = {
        id: 1,
        userId: "user1",
        title: "Today Event",
        startTime: new Date("2023-10-01T10:00:00Z"),
        endTime: new Date("2023-10-01T11:00:00Z"),
        isAllDay: false,
        recurrence: "none",
        createdAt: new Date("2023-09-30T12:00:00Z"),
        updatedAt: new Date("2023-09-30T12:00:00Z"),
      };

      (LocalIntegrationService.getEvents as jest.Mock).mockResolvedValue([
        todayEvent,
      ]);
      (GoogleIntegrationService.hasValidIntegration as jest.Mock).mockResolvedValue(false);

      const result = await EventService.getAllTodayEvents("user1");

      expect(LocalIntegrationService.getEvents).toHaveBeenCalledWith(
        "user1",
        expect.objectContaining({
          startDate: expect.any(Date),
          endDate: expect.any(Date),
        }),
      );

      expect(result).toHaveLength(1);
      expect(result[0].title).toBe("Today Event");
      expect(result[0].origin).toBe("local");
    });

    it("returns empty array when no events exist for today", async () => {
      (LocalIntegrationService.getEvents as jest.Mock).mockResolvedValue([]);
      (GoogleIntegrationService.hasValidIntegration as jest.Mock).mockResolvedValue(false);

      const result = await EventService.getAllTodayEvents("user1");

      expect(result).toEqual([]);
    });

    it("throws error when fetching events fails", async () => {
      (LocalIntegrationService.getEvents as jest.Mock).mockRejectedValue(
        new Error("Database error"),
      );

      await expect(
        EventService.getAllTodayEvents("user1"),
      ).rejects.toThrow("Failed to fetch today's events");
    });
  });

  describe("createEventFromNaturalLanguage", () => {
    it("creates event from natural language", async () => {
      const mockObject = {
        title: "Test Event",
        description: "Test Description",
        location: "Test Location",
        date: "2023-10-01",
        startTime: "10:00",
        endTime: "11:00",
        isAllDay: false,
      };

      const mockLocalEvent = {
        id: 1,
        userId: "user1",
        title: "Test Event",
        description: "Test Description",
        location: "Test Location",
        startTime: new Date("2023-10-01T10:00:00Z"),
        endTime: new Date("2023-10-01T11:00:00Z"),
        isAllDay: false,
        recurrence: "none",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (generateObject as jest.Mock).mockResolvedValue({ object: mockObject });
      (LocalIntegrationService.createEvent as jest.Mock).mockResolvedValue(
        mockLocalEvent,
      );

      const result = await EventService.createEventFromNaturalLanguage(
        "user1",
        "Create a test event tomorrow at 10am",
      );

      expect(generateObject).toHaveBeenCalledWith({
        model: expect.any(Object),
        schema: expect.any(Object),
        prompt:
          'Parse the following natural language input into a calendar event: "Create a test event tomorrow at 10am"',
      });

      expect(LocalIntegrationService.createEvent).toHaveBeenCalledWith(
        "user1",
        {
          title: "Test Event",
          description: "Test Description",
          location: "Test Location",
          startTime: new Date("2023-10-01T10:00"),
          endTime: new Date("2023-10-01T11:00"),
          isAllDay: false,
        },
      );

      expect(result).toEqual(mockLocalEvent);
    });

    it("handles AI parsing errors", async () => {
      (generateObject as jest.Mock).mockRejectedValue(new Error("AI error"));

      await expect(
        EventService.createEventFromNaturalLanguage("user1", "invalid input"),
      ).rejects.toThrow("Failed to create event from natural language");
    });
  });

  describe("saveEvent", () => {
    it("creates a new local event", async () => {
      const mockLocalEvent = {
        id: 1,
        userId: "user1",
        title: "New Event",
        description: "Description",
        location: "Location",
        startTime: new Date("2023-10-01T10:00:00Z"),
        endTime: new Date("2023-10-01T11:00:00Z"),
        isAllDay: false,
        recurrence: "none",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (LocalIntegrationService.createEvent as jest.Mock).mockResolvedValue(
        mockLocalEvent,
      );

      const result = await EventService.saveEvent("user1", {
        title: "New Event",
        description: "Description",
        location: "Location",
        startTime: new Date("2023-10-01T10:00:00Z"),
        endTime: new Date("2023-10-01T11:00:00Z"),
        isAllDay: false,
      });

      expect(LocalIntegrationService.createEvent).toHaveBeenCalledWith(
        "user1",
        expect.objectContaining({
          title: "New Event",
          startTime: new Date("2023-10-01T10:00:00Z"),
        }),
      );

      expect(result).toEqual({
        id: "local_1",
        title: "New Event",
        description: "Description",
        location: "Location",
        startTime: new Date("2023-10-01T10:00:00Z"),
        endTime: new Date("2023-10-01T11:00:00Z"),
        isAllDay: false,
        recurrence: "none",
        origin: "local",
        originalId: 1,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      });
    });

    it("updates an existing local event", async () => {
      const mockUpdatedEvent = {
        id: 1,
        userId: "user1",
        title: "Updated Event",
        description: "Updated Description",
        location: "Updated Location",
        startTime: new Date("2023-10-01T12:00:00Z"),
        endTime: new Date("2023-10-01T13:00:00Z"),
        isAllDay: false,
        recurrence: "none",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (LocalIntegrationService.updateEvent as jest.Mock).mockResolvedValue(
        mockUpdatedEvent,
      );

      const result = await EventService.saveEvent(
        "user1",
        {
          title: "Updated Event",
          description: "Updated Description",
          location: "Updated Location",
          startTime: new Date("2023-10-01T12:00:00Z"),
          endTime: new Date("2023-10-01T13:00:00Z"),
          isAllDay: false,
        },
        { eventId: "local_1" },
      );

      expect(LocalIntegrationService.updateEvent).toHaveBeenCalledWith(
        1,
        "user1",
        expect.objectContaining({
          title: "Updated Event",
        }),
      );

      expect(result.origin).toBe("local");
      expect(result.id).toBe("local_1");
    });

    it("throws error for invalid event ID", async () => {
      await expect(
        EventService.saveEvent(
          "user1",
          { title: "Test" },
          { eventId: "invalid_id" },
        ),
      ).rejects.toThrow("Invalid event ID format");
    });
  });

  describe("deleteEvent", () => {
    it("deletes a local event", async () => {
      (LocalIntegrationService.deleteEvent as jest.Mock).mockResolvedValue(
        undefined,
      );

      await expect(
        EventService.deleteEvent("user1", "local_1"),
      ).resolves.toBeUndefined();

      expect(LocalIntegrationService.deleteEvent).toHaveBeenCalledWith(
        1,
        "user1",
      );
    });

    it("deletes a Google event", async () => {
      (GoogleIntegrationService.deleteCalendarEvent as jest.Mock).mockResolvedValue(
        undefined,
      );

      await expect(
        EventService.deleteEvent("user1", "google_abc123"),
      ).resolves.toBeUndefined();

      expect(GoogleIntegrationService.deleteCalendarEvent).toHaveBeenCalledWith(
        "user1",
        "abc123",
        undefined,
      );
    });

    it("throws error for invalid event ID format", async () => {
      await expect(
        EventService.deleteEvent("user1", "invalid"),
      ).rejects.toThrow("Failed to delete event");
    });

    it("throws error when local delete operation fails", async () => {
      (LocalIntegrationService.deleteEvent as jest.Mock).mockRejectedValue(
        new Error("Database error"),
      );

      await expect(
        EventService.deleteEvent("user1", "local_1"),
      ).rejects.toThrow("Failed to delete event");
    });

    it("throws error when Google delete operation fails", async () => {
      (GoogleIntegrationService.deleteCalendarEvent as jest.Mock).mockRejectedValue(
        new Error("Google API error"),
      );

      await expect(
        EventService.deleteEvent("user1", "google_abc123"),
      ).rejects.toThrow("Failed to delete event");
    });
  });

  describe("getAllEvents", () => {
    it("fetches local events when includeLocal is true", async () => {
      const mockLocalEvents: LocalEvent[] = [
        {
          id: 1,
          userId: "user1",
          title: "Local Event",
          startTime: new Date("2023-10-01T10:00:00Z"),
          endTime: new Date("2023-10-01T11:00:00Z"),
          isAllDay: false,
          recurrence: "none",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      (LocalIntegrationService.getEvents as jest.Mock).mockResolvedValue(
        mockLocalEvents,
      );
      (GoogleIntegrationService.hasValidIntegration as jest.Mock).mockResolvedValue(false);

      const result = await EventService.getAllEvents("user1", {
        includeGoogle: false,
        includeLocal: true,
      });

      expect(result).toHaveLength(1);
      expect(result[0].origin).toBe("local");
      expect(result[0].title).toBe("Local Event");
      expect(result[0].id).toBe("local_1");
    });

    it("fetches events from both local and Google sources", async () => {
      const mockLocalEvents: LocalEvent[] = [
        {
          id: 1,
          userId: "user1",
          title: "Local Event",
          startTime: new Date("2023-10-01T10:00:00Z"),
          endTime: new Date("2023-10-01T11:00:00Z"),
          isAllDay: false,
          recurrence: "none",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const mockGoogleEvents = [
        {
          id: "google123",
          summary: "Google Event",
          start: { dateTime: "2023-10-01T14:00:00Z" },
          end: { dateTime: "2023-10-01T15:00:00Z" },
        },
      ];

      (LocalIntegrationService.getEvents as jest.Mock).mockResolvedValue(
        mockLocalEvents,
      );
      (GoogleIntegrationService.hasValidIntegration as jest.Mock).mockResolvedValue(true);
      (GoogleIntegrationService.getCalendarEvents as jest.Mock).mockResolvedValue(
        mockGoogleEvents,
      );

      const result = await EventService.getAllEvents("user1", {
        includeLocal: true,
        includeGoogle: true,
      });

      expect(result).toHaveLength(2);
      expect(result.some((e) => e.origin === "local")).toBe(true);
      expect(result.some((e) => e.origin === "google")).toBe(true);
      expect(result.find((e) => e.origin === "google")?.title).toBe("Google Event");
    });

    it("handles Google integration errors gracefully", async () => {
      const mockLocalEvents: LocalEvent[] = [
        {
          id: 1,
          userId: "user1",
          title: "Local Event",
          startTime: new Date("2023-10-01T10:00:00Z"),
          endTime: new Date("2023-10-01T11:00:00Z"),
          isAllDay: false,
          recurrence: "none",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      (LocalIntegrationService.getEvents as jest.Mock).mockResolvedValue(
        mockLocalEvents,
      );
      (
        GoogleIntegrationService.hasValidIntegration as jest.Mock
      ).mockResolvedValue(true);
      (
        GoogleIntegrationService.getCalendarEvents as jest.Mock
      ).mockRejectedValue(new Error("Google API error"));

      const result = await EventService.getAllEvents("user1", {
        includeLocal: true,
        includeGoogle: true,
      });

      expect(result).toHaveLength(1);
      expect(result[0].origin).toBe("local");
    });

    it("returns empty array when no events exist", async () => {
      (LocalIntegrationService.getEvents as jest.Mock).mockResolvedValue([]);
      (GoogleIntegrationService.hasValidIntegration as jest.Mock).mockResolvedValue(false);

      const result = await EventService.getAllEvents("user1");

      expect(result).toEqual([]);
    });

    it("sorts events by start time", async () => {
      const mockLocalEvents: LocalEvent[] = [
        {
          id: 1,
          userId: "user1",
          title: "Later Event",
          startTime: new Date("2023-10-01T14:00:00Z"),
          endTime: new Date("2023-10-01T15:00:00Z"),
          isAllDay: false,
          recurrence: "none",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 2,
          userId: "user1",
          title: "Earlier Event",
          startTime: new Date("2023-10-01T10:00:00Z"),
          endTime: new Date("2023-10-01T11:00:00Z"),
          isAllDay: false,
          recurrence: "none",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      (LocalIntegrationService.getEvents as jest.Mock).mockResolvedValue(
        mockLocalEvents,
      );
      (GoogleIntegrationService.hasValidIntegration as jest.Mock).mockResolvedValue(false);

      const result = await EventService.getAllEvents("user1");

      expect(result[0].title).toBe("Earlier Event");
      expect(result[1].title).toBe("Later Event");
    });
  });

  describe("searchAllEvents", () => {
    it("searches events by title", async () => {
      const mockLocalEvents: LocalEvent[] = [
        {
          id: 1,
          userId: "user1",
          title: "Team Meeting",
          description: "Team meeting",
          startTime: new Date("2023-10-01T10:00:00Z"),
          endTime: new Date("2023-10-01T11:00:00Z"),
          isAllDay: false,
          recurrence: "none",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 2,
          userId: "user1",
          title: "Lunch Break",
          startTime: new Date("2023-10-01T12:00:00Z"),
          endTime: new Date("2023-10-01T13:00:00Z"),
          isAllDay: false,
          recurrence: "none",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      (LocalIntegrationService.getEvents as jest.Mock).mockResolvedValue(
        mockLocalEvents,
      );
      (GoogleIntegrationService.hasValidIntegration as jest.Mock).mockResolvedValue(false);

      const result = await EventService.searchAllEvents("user1", "meeting");

      expect(result).toHaveLength(1);
      expect(result[0].title).toBe("Team Meeting");
    });

    it("searches events by description", async () => {
      const mockLocalEvents: LocalEvent[] = [
        {
          id: 1,
          userId: "user1",
          title: "Event 1",
          description: "Discuss project timeline",
          startTime: new Date("2023-10-01T10:00:00Z"),
          endTime: new Date("2023-10-01T11:00:00Z"),
          isAllDay: false,
          recurrence: "none",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      (LocalIntegrationService.getEvents as jest.Mock).mockResolvedValue(
        mockLocalEvents,
      );
      (GoogleIntegrationService.hasValidIntegration as jest.Mock).mockResolvedValue(false);

      const result = await EventService.searchAllEvents("user1", "project");

      expect(result).toHaveLength(1);
      expect(result[0].description).toContain("project");
    });

    it("returns empty array when no matches found", async () => {
      const mockLocalEvents: LocalEvent[] = [
        {
          id: 1,
          userId: "user1",
          title: "Team Meeting",
          startTime: new Date("2023-10-01T10:00:00Z"),
          endTime: new Date("2023-10-01T11:00:00Z"),
          isAllDay: false,
          recurrence: "none",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      (LocalIntegrationService.getEvents as jest.Mock).mockResolvedValue(
        mockLocalEvents,
      );
      (GoogleIntegrationService.hasValidIntegration as jest.Mock).mockResolvedValue(false);

      const result = await EventService.searchAllEvents("user1", "nonexistent");

      expect(result).toEqual([]);
    });
  });

  describe("getEventStatistics", () => {
    it("returns comprehensive statistics", async () => {
      const mockLocalEvents: LocalEvent[] = [
        {
          id: 1,
          userId: "user1",
          title: "Today Event",
          startTime: new Date("2023-10-01T10:00:00Z"),
          endTime: new Date("2023-10-01T11:00:00Z"),
          isAllDay: false,
          recurrence: "none",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 2,
          userId: "user1",
          title: "Tomorrow Event",
          startTime: new Date("2023-10-02T10:00:00Z"),
          endTime: new Date("2023-10-02T11:00:00Z"),
          isAllDay: true,
          recurrence: "daily",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      (LocalIntegrationService.getEvents as jest.Mock).mockResolvedValue(
        mockLocalEvents,
      );
      (GoogleIntegrationService.hasValidIntegration as jest.Mock).mockResolvedValue(false);

      const stats = await EventService.getEventStatistics("user1");

      expect(stats.totalEvents).toBe(2);
      expect(stats.localEvents).toBe(2);
      expect(stats.googleEvents).toBe(0);
      expect(stats.todayEvents).toBeGreaterThanOrEqual(0);
      expect(stats.upcomingEvents).toBeGreaterThanOrEqual(0);
      expect(stats.allDayEvents).toBe(1);
      expect(stats.recurringEvents).toBe(1);
    });

    it("handles empty event list", async () => {
      (LocalIntegrationService.getEvents as jest.Mock).mockResolvedValue([]);
      (GoogleIntegrationService.hasValidIntegration as jest.Mock).mockResolvedValue(false);

      const stats = await EventService.getEventStatistics("user1");

      expect(stats.totalEvents).toBe(0);
      expect(stats.localEvents).toBe(0);
      expect(stats.googleEvents).toBe(0);
      expect(stats.todayEvents).toBe(0);
      expect(stats.upcomingEvents).toBe(0);
      expect(stats.allDayEvents).toBe(0);
      expect(stats.recurringEvents).toBe(0);
    });
  });
});
