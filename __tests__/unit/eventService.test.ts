/* eslint-disable @typescript-eslint/no-explicit-any */

// Mock the integration services
jest.mock("../../src/lib/services/localIntegrationService", () => ({
  LocalIntegrationService: {
    createEvent: jest.fn(),
    getEvents: jest.fn(),
    updateEvent: jest.fn(),
    deleteEvent: jest.fn(),
  },
}));

jest.mock("../../src/lib/services/googleIntegrationService", () => ({
  GoogleIntegrationService: {
    getCalendarEvents: jest.fn(),
    hasValidIntegration: jest.fn(),
  },
}));

// Mock AI SDK
jest.mock("ai", () => ({
  generateObject: jest.fn(),
}));

import { EventService } from "../../src/lib/services/eventService";
import { LocalIntegrationService } from "../../src/lib/services/localIntegrationService";
import { GoogleIntegrationService } from "../../src/lib/services/googleIntegrationService";
import { generateObject } from "ai";

describe("EventService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  describe("getAllTodayEvents", () => {
    it("calls getAllEvents with today's date range", async () => {
      const mockGetAllEvents = jest
        .spyOn(EventService as any, "getAllEvents")
        .mockResolvedValue([]);

      const result = await EventService.getAllTodayEvents("user1");

      expect(mockGetAllEvents).toHaveBeenCalledWith(
        "user1",
        expect.objectContaining({
          startDate: expect.any(Date),
          endDate: expect.any(Date),
        }),
      );

      expect(result).toEqual([]);
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

    it("throws error for invalid event ID", async () => {
      await expect(
        EventService.deleteEvent("user1", "invalid"),
      ).rejects.toThrow("Failed to delete event");
    });
  });

  describe("getAllEvents", () => {
    it("fetches events from both local and Google sources", async () => {
      const mockLocalEvents = [
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
          start: { dateTime: "2023-10-01T12:00:00Z" },
          end: { dateTime: "2023-10-01T13:00:00Z" },
        },
      ];

      (LocalIntegrationService.getEvents as jest.Mock).mockResolvedValue(
        mockLocalEvents,
      );

      const result = await EventService.getAllEvents("user1", {
        includeGoogle: false,
      });

      expect(result).toHaveLength(1);
      expect(result[0].origin).toBe("local");
      expect(result[0].title).toBe("Local Event");
    });

    it("handles Google integration errors gracefully", async () => {
      const mockLocalEvents = [
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

      const result = await EventService.getAllEvents("user1");

      expect(result).toHaveLength(1);
      expect(result[0].origin).toBe("local");
    });
  });

  describe("searchAllEvents", () => {
    it("searches events by title", async () => {
      const mockEvents = [
        {
          id: "local_1",
          title: "Meeting",
          description: "Team meeting",
          location: "Office",
          startTime: new Date(),
          endTime: new Date(),
          isAllDay: false,
          origin: "local" as const,
        },
        {
          id: "local_2",
          title: "Conference",
          description: "Tech conference",
          location: "Hotel",
          startTime: new Date(),
          endTime: new Date(),
          isAllDay: false,
          origin: "local" as const,
        },
      ];

      jest.spyOn(EventService, "getAllEvents").mockResolvedValue(mockEvents);

      const result = await EventService.searchAllEvents("user1", "meeting");

      expect(result).toHaveLength(1);
      expect(result[0].title).toBe("Meeting");
    });
  });

  describe("getEventStatistics", () => {
    it("returns comprehensive statistics", async () => {
      const mockEvents: any[] = [
        {
          id: "local_1",
          title: "Today Event",
          startTime: new Date(),
          endTime: new Date(),
          isAllDay: false,
          recurrence: "none" as const,
          origin: "local" as const,
        },
        {
          id: "google_1",
          title: "Google Event",
          startTime: new Date(Date.now() + 24 * 60 * 60 * 1000), // tomorrow
          endTime: new Date(Date.now() + 24 * 60 * 60 * 1000 + 60 * 60 * 1000),
          isAllDay: true,
          recurrence: "daily" as const,
          origin: "google" as const,
        },
      ];

      jest.spyOn(EventService, "getAllEvents").mockResolvedValue(mockEvents);
      jest
        .spyOn(EventService, "getAllTodayEvents")
        .mockResolvedValue([mockEvents[0]]);
      jest
        .spyOn(EventService, "getAllUpcomingEvents")
        .mockResolvedValue(mockEvents);

      const stats = await EventService.getEventStatistics("user1");

      expect(stats.totalEvents).toBe(2);
      expect(stats.localEvents).toBe(1);
      expect(stats.googleEvents).toBe(1);
      expect(stats.todayEvents).toBe(1);
      expect(stats.upcomingEvents).toBe(2);
      expect(stats.allDayEvents).toBe(1);
      expect(stats.recurringEvents).toBe(1);
    });
  });
});
