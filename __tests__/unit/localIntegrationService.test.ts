import {
  LocalIntegrationService,
  CreateEventData,
  UpdateEventData,
  EventFilters,
} from "../../src/lib/services/localIntegrationService";

// Mock drizzle-orm functions first
jest.mock("drizzle-orm", () => ({
  eq: jest.fn(),
  and: jest.fn(),
  gte: jest.fn(),
  lte: jest.fn(),
  relations: jest.fn(),
}));

// Mock the database with proper chaining
jest.mock("../../src/lib/db", () => ({
  db: {
    select: jest.fn(() => ({
      from: jest.fn(() => ({
        where: jest.fn(() => ({
          orderBy: jest.fn(() => ({
            limit: jest.fn(() => ({
              offset: jest.fn(),
            })),
            offset: jest.fn(() => ({
              limit: jest.fn(),
            })),
          })),
          limit: jest.fn(() => ({
            offset: jest.fn(),
          })),
        })),
        orderBy: jest.fn(() => ({
          limit: jest.fn(() => ({
            offset: jest.fn(),
          })),
          offset: jest.fn(() => ({
            limit: jest.fn(),
          })),
        })),
        limit: jest.fn(() => ({
          offset: jest.fn(),
        })),
      })),
    })),
    insert: jest.fn(() => ({
      values: jest.fn(() => ({
        returning: jest.fn(),
      })),
    })),
    update: jest.fn(() => ({
      set: jest.fn(() => ({
        where: jest.fn(() => ({
          returning: jest.fn(),
        })),
      })),
    })),
    delete: jest.fn(() => ({
      where: jest.fn(() => ({
        returning: jest.fn(),
      })),
    })),
    query: {
      events: {
        findFirst: jest.fn(),
      },
    },
  },
}));

import { db } from "../../src/lib/db";
import { eq, and, gte, lte } from "drizzle-orm";

describe("LocalIntegrationService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getEvents", () => {
    it("should fetch events for a user without filters", async () => {
      const mockEvents = [
        {
          id: 1,
          userId: "user1",
          title: "Test Event",
          description: "Test Description",
          location: "Test Location",
          startTime: new Date("2023-10-01T10:00:00Z"),
          endTime: new Date("2023-10-01T11:00:00Z"),
          isAllDay: false,
          recurrence: "none" as const,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      // Mock the query chain
      const mockOrderBy = jest.fn().mockResolvedValue(mockEvents);
      const mockWhere = jest.fn().mockReturnValue({ orderBy: mockOrderBy });
      const mockFrom = jest.fn().mockReturnValue({ where: mockWhere });
      (db.select as jest.Mock).mockReturnValue({ from: mockFrom });

      (eq as jest.Mock).mockReturnValue("user_condition");
      (and as jest.Mock).mockReturnValue("where_condition");

      const result = await LocalIntegrationService.getEvents("user1");

      expect(db.select).toHaveBeenCalled();
      expect(result).toEqual(mockEvents);
    });

    it("should apply date filters correctly", async () => {
      const filters: EventFilters = {
        startDate: "2023-10-01",
        endDate: "2023-10-31",
      };

      // Mock the query chain
      const mockOrderBy = jest.fn().mockResolvedValue([]);
      const mockWhere = jest.fn().mockReturnValue({ orderBy: mockOrderBy });
      const mockFrom = jest.fn().mockReturnValue({ where: mockWhere });
      (db.select as jest.Mock).mockReturnValue({ from: mockFrom });

      (eq as jest.Mock).mockReturnValue("user_condition");
      (gte as jest.Mock).mockReturnValue("start_condition");
      (lte as jest.Mock).mockReturnValue("end_condition");
      (and as jest.Mock).mockReturnValue("where_condition");

      await LocalIntegrationService.getEvents("user1", filters);

      expect(gte).toHaveBeenCalledWith(
        expect.any(Object),
        new Date("2023-10-01"),
      );
      expect(lte).toHaveBeenCalledWith(
        expect.any(Object),
        new Date("2023-10-31"),
      );
    });

    it("should apply limit and offset correctly", async () => {
      const filters: EventFilters = {
        limit: 10,
        offset: 5,
      };

      // Mock the query chain
      const mockLimit = jest.fn().mockResolvedValue([]);
      const mockOffset = jest.fn().mockReturnValue({ limit: mockLimit });
      const mockOrderBy = jest.fn().mockReturnValue({ offset: mockOffset });
      const mockWhere = jest.fn().mockReturnValue({ orderBy: mockOrderBy });
      const mockFrom = jest.fn().mockReturnValue({ where: mockWhere });
      (db.select as jest.Mock).mockReturnValue({ from: mockFrom });

      (eq as jest.Mock).mockReturnValue("user_condition");
      (and as jest.Mock).mockReturnValue("where_condition");

      await LocalIntegrationService.getEvents("user1", filters);

      expect(mockOffset).toHaveBeenCalledWith(5);
    });

    it("should throw error on database failure", async () => {
      // Mock the query chain to throw error
      const mockOrderBy = jest
        .fn()
        .mockRejectedValue(new Error("Database error"));
      const mockWhere = jest.fn().mockReturnValue({ orderBy: mockOrderBy });
      const mockFrom = jest.fn().mockReturnValue({ where: mockWhere });
      (db.select as jest.Mock).mockReturnValue({ from: mockFrom });

      await expect(LocalIntegrationService.getEvents("user1")).rejects.toThrow(
        "Failed to fetch local events",
      );
    });
  });

  describe("getEventById", () => {
    it("should return event when found", async () => {
      const mockEvent = {
        id: 1,
        userId: "user1",
        title: "Test Event",
        description: "Test Description",
        location: "Test Location",
        startTime: new Date("2023-10-01T10:00:00Z"),
        endTime: new Date("2023-10-01T11:00:00Z"),
        isAllDay: false,
        recurrence: "none" as const,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (db.query.events.findFirst as jest.Mock).mockResolvedValue(mockEvent);
      (and as jest.Mock).mockReturnValue("where_condition");

      const result = await LocalIntegrationService.getEventById(1, "user1");

      expect(db.query.events.findFirst).toHaveBeenCalledWith({
        where: "where_condition",
      });
      expect(result).toEqual(mockEvent);
    });

    it("should throw error when event not found", async () => {
      (db.query.events.findFirst as jest.Mock).mockResolvedValue(null);

      await expect(
        LocalIntegrationService.getEventById(1, "user1"),
      ).rejects.toThrow("Failed to fetch local event");
    });
  });

  describe("createEvent", () => {
    it("should create event successfully when user exists", async () => {
      const eventData: CreateEventData = {
        title: "New Event",
        description: "Event Description",
        location: "Event Location",
        startTime: new Date("2023-10-01T10:00:00Z"),
        endTime: new Date("2023-10-01T11:00:00Z"),
        isAllDay: false,
        recurrence: "none" as const,
      };

      const mockUser = [{ id: "user1" }];
      const mockNewEvent = {
        id: 1,
        userId: "user1",
        ...eventData,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Mock user check query
      const mockUserLimit = jest.fn().mockResolvedValue(mockUser);
      const mockUserWhere = jest.fn().mockReturnValue({ limit: mockUserLimit });
      const mockUserFrom = jest.fn().mockReturnValue({ where: mockUserWhere });
      (db.select as jest.Mock).mockReturnValueOnce({ from: mockUserFrom });

      // Mock insert query
      const mockInsertReturning = jest.fn().mockResolvedValue([mockNewEvent]);
      const mockInsertValues = jest
        .fn()
        .mockReturnValue({ returning: mockInsertReturning });
      (db.insert as jest.Mock).mockReturnValue({ values: mockInsertValues });

      const result = await LocalIntegrationService.createEvent(
        "user1",
        eventData,
      );

      expect(db.select).toHaveBeenCalled(); // Check user exists
      expect(db.insert).toHaveBeenCalled();
      expect(result).toEqual(mockNewEvent);
    });

    it("should throw error when user does not exist", async () => {
      const eventData: CreateEventData = {
        title: "New Event",
        startTime: new Date("2023-10-01T10:00:00Z"),
        endTime: new Date("2023-10-01T11:00:00Z"),
      };

      // Mock user check to return no user
      const mockUserLimit = jest.fn().mockResolvedValue([]);
      const mockUserWhere = jest.fn().mockReturnValue({ limit: mockUserLimit });
      const mockUserFrom = jest.fn().mockReturnValue({ where: mockUserWhere });
      (db.select as jest.Mock).mockReturnValue({ from: mockUserFrom });

      await expect(
        LocalIntegrationService.createEvent("user1", eventData),
      ).rejects.toThrow("Failed to create local event");
    });

    it("should handle database errors during creation", async () => {
      const eventData: CreateEventData = {
        title: "New Event",
        startTime: new Date("2023-10-01T10:00:00Z"),
        endTime: new Date("2023-10-01T11:00:00Z"),
      };

      // Mock user check to succeed
      const mockUserLimit = jest.fn().mockResolvedValue([{ id: "user1" }]);
      const mockUserWhere = jest.fn().mockReturnValue({ limit: mockUserLimit });
      const mockUserFrom = jest.fn().mockReturnValue({ where: mockUserWhere });
      (db.select as jest.Mock).mockReturnValueOnce({ from: mockUserFrom });

      // Mock insert to throw error
      (db.insert as jest.Mock).mockImplementation(() => {
        throw new Error("Database error");
      });

      await expect(
        LocalIntegrationService.createEvent("user1", eventData),
      ).rejects.toThrow("Failed to create local event");
    });
  });

  describe("updateEvent", () => {
    it("should update event successfully", async () => {
      const updateData: UpdateEventData = {
        title: "Updated Event",
        description: "Updated Description",
      };

      const mockUpdatedEvent = {
        id: 1,
        userId: "user1",
        title: "Updated Event",
        description: "Updated Description",
        location: "Test Location",
        startTime: new Date("2023-10-01T10:00:00Z"),
        endTime: new Date("2023-10-01T11:00:00Z"),
        isAllDay: false,
        recurrence: "none" as const,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Mock update chain
      const mockReturning = jest.fn().mockResolvedValue([mockUpdatedEvent]);
      const mockWhere = jest.fn().mockReturnValue({ returning: mockReturning });
      const mockSet = jest.fn().mockReturnValue({ where: mockWhere });
      (db.update as jest.Mock).mockReturnValue({ set: mockSet });

      (and as jest.Mock).mockReturnValue("where_condition");

      const result = await LocalIntegrationService.updateEvent(
        1,
        "user1",
        updateData,
      );

      expect(db.update).toHaveBeenCalled();
      expect(result).toEqual(mockUpdatedEvent);
    });

    it("should throw error when event not found", async () => {
      const updateData: UpdateEventData = {
        title: "Updated Event",
      };

      // Mock update chain to return no event
      const mockReturning = jest.fn().mockResolvedValue([]);
      const mockWhere = jest.fn().mockReturnValue({ returning: mockReturning });
      const mockSet = jest.fn().mockReturnValue({ where: mockWhere });
      (db.update as jest.Mock).mockReturnValue({ set: mockSet });

      await expect(
        LocalIntegrationService.updateEvent(1, "user1", updateData),
      ).rejects.toThrow("Failed to update local event");
    });
  });

  describe("deleteEvent", () => {
    it("should delete event successfully", async () => {
      const mockDeletedEvent = {
        id: 1,
        userId: "user1",
        title: "Deleted Event",
        description: "Deleted Description",
        location: "Test Location",
        startTime: new Date("2023-10-01T10:00:00Z"),
        endTime: new Date("2023-10-01T11:00:00Z"),
        isAllDay: false,
        recurrence: "none" as const,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Mock delete chain
      const mockReturning = jest.fn().mockResolvedValue([mockDeletedEvent]);
      const mockWhere = jest.fn().mockReturnValue({ returning: mockReturning });
      (db.delete as jest.Mock).mockReturnValue({ where: mockWhere });

      (and as jest.Mock).mockReturnValue("where_condition");

      const result = await LocalIntegrationService.deleteEvent(1, "user1");

      expect(db.delete).toHaveBeenCalled();
      expect(result).toEqual(mockDeletedEvent);
    });

    it("should throw error when event not found", async () => {
      // Mock delete chain to return no event
      const mockReturning = jest.fn().mockResolvedValue([]);
      const mockWhere = jest.fn().mockReturnValue({ returning: mockReturning });
      (db.delete as jest.Mock).mockReturnValue({ where: mockWhere });

      await expect(
        LocalIntegrationService.deleteEvent(1, "user1"),
      ).rejects.toThrow("Failed to delete local event");
    });
  });

  describe("getEventsInRange", () => {
    it("should call getEvents with correct date range", async () => {
      const startDate = new Date("2023-10-01");
      const endDate = new Date("2023-10-31");

      const spy = jest
        .spyOn(LocalIntegrationService, "getEvents")
        .mockResolvedValue([]);

      await LocalIntegrationService.getEventsInRange(
        "user1",
        startDate,
        endDate,
      );

      expect(spy).toHaveBeenCalledWith("user1", { startDate, endDate });
    });
  });

  describe("getTodayEvents", () => {
    it("should call getEventsInRange with today's date range", async () => {
      const spy = jest
        .spyOn(LocalIntegrationService, "getEventsInRange")
        .mockResolvedValue([]);

      await LocalIntegrationService.getTodayEvents("user1");

      expect(spy).toHaveBeenCalledWith(
        "user1",
        expect.any(Date),
        expect.any(Date),
      );
    });
  });

  describe("getUpcomingEvents", () => {
    it("should fetch upcoming events with default parameters", async () => {
      const mockEvents = [
        {
          id: 1,
          userId: "user1",
          title: "Upcoming Event",
          startTime: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
          endTime: new Date(Date.now() + 25 * 60 * 60 * 1000),
          isAllDay: false,
          recurrence: "none" as const,
        },
      ];

      // Mock select chain
      const mockOrderBy = jest.fn().mockResolvedValue(mockEvents);
      const mockWhere = jest.fn().mockReturnValue({ orderBy: mockOrderBy });
      const mockFrom = jest.fn().mockReturnValue({ where: mockWhere });
      (db.select as jest.Mock).mockReturnValue({ from: mockFrom });

      (eq as jest.Mock).mockReturnValue("user_condition");
      (gte as jest.Mock).mockReturnValue("gte_condition");
      (lte as jest.Mock).mockReturnValue("lte_condition");
      (and as jest.Mock).mockReturnValue("where_condition");

      const result = await LocalIntegrationService.getUpcomingEvents("user1");

      expect(result).toEqual(mockEvents);
    });

    it("should apply limit when specified", async () => {
      const mockEvents = [
        {
          id: 1,
          userId: "user1",
          title: "Upcoming Event",
          startTime: new Date(Date.now() + 24 * 60 * 60 * 1000),
          endTime: new Date(Date.now() + 25 * 60 * 60 * 1000),
          isAllDay: false,
          recurrence: "none" as const,
        },
      ];

      // Mock select chain with limit
      const mockLimit = jest.fn().mockResolvedValue(mockEvents);
      const mockOrderBy = jest.fn().mockReturnValue({ limit: mockLimit });
      const mockWhere = jest.fn().mockReturnValue({ orderBy: mockOrderBy });
      const mockFrom = jest.fn().mockReturnValue({ where: mockWhere });
      (db.select as jest.Mock).mockReturnValue({ from: mockFrom });

      const result = await LocalIntegrationService.getUpcomingEvents(
        "user1",
        7,
        5,
      );

      expect(mockLimit).toHaveBeenCalledWith(5);
      expect(result).toEqual(mockEvents);
    });
  });

  describe("searchEvents", () => {
    it("should filter events by search term", async () => {
      const mockEvents = [
        {
          id: 1,
          userId: "user1",
          title: "Meeting with John",
          description: "Discuss project",
          location: "Office",
          startTime: new Date("2023-10-01T10:00:00Z"),
          endTime: new Date("2023-10-01T11:00:00Z"),
          isAllDay: false,
          recurrence: "none" as const,
        },
        {
          id: 2,
          userId: "user1",
          title: "Lunch with Sarah",
          description: "Restaurant discussion",
          location: "Downtown",
          startTime: new Date("2023-10-02T12:00:00Z"),
          endTime: new Date("2023-10-02T13:00:00Z"),
          isAllDay: false,
          recurrence: "none" as const,
        },
      ];

      const spy = jest
        .spyOn(LocalIntegrationService, "getEvents")
        .mockResolvedValue(mockEvents);

      const result = await LocalIntegrationService.searchEvents(
        "user1",
        "john",
      );

      expect(spy).toHaveBeenCalledWith("user1", undefined);
      expect(result).toHaveLength(1);
      expect(result[0].title).toBe("Meeting with John");
    });

    it("should search in title, description, and location", async () => {
      const mockEvents = [
        {
          id: 1,
          userId: "user1",
          title: "Meeting",
          description: "Discuss project with John",
          location: "Office",
          startTime: new Date("2023-10-01T10:00:00Z"),
          endTime: new Date("2023-10-01T11:00:00Z"),
          isAllDay: false,
          recurrence: "none" as const,
        },
        {
          id: 2,
          userId: "user1",
          title: "Lunch",
          description: "Restaurant",
          location: "Downtown with John",
          startTime: new Date("2023-10-02T12:00:00Z"),
          endTime: new Date("2023-10-02T13:00:00Z"),
          isAllDay: false,
          recurrence: "none" as const,
        },
      ];

      jest
        .spyOn(LocalIntegrationService, "getEvents")
        .mockResolvedValue(mockEvents);

      const result = await LocalIntegrationService.searchEvents(
        "user1",
        "john",
      );

      expect(result).toHaveLength(2);
    });
  });

  describe("getEventStatistics", () => {
    it("should return correct statistics", async () => {
      const mockEvents = [
        {
          id: 1,
          userId: "user1",
          title: "Today Event",
          startTime: new Date(), // Today
          endTime: new Date(Date.now() + 60 * 60 * 1000),
          isAllDay: false,
          recurrence: "none" as const,
        },
        {
          id: 2,
          userId: "user1",
          title: "All Day Event",
          startTime: new Date(Date.now() + 24 * 60 * 60 * 1000),
          endTime: new Date(Date.now() + 25 * 60 * 60 * 1000),
          isAllDay: true,
          recurrence: "none" as const,
        },
        {
          id: 3,
          userId: "user1",
          title: "Recurring Event",
          startTime: new Date(Date.now() + 48 * 60 * 60 * 1000),
          endTime: new Date(Date.now() + 49 * 60 * 60 * 1000),
          isAllDay: false,
          recurrence: "weekly" as const,
        },
      ];

      jest
        .spyOn(LocalIntegrationService, "getEvents")
        .mockResolvedValue(mockEvents);
      jest
        .spyOn(LocalIntegrationService, "getTodayEvents")
        .mockResolvedValue([mockEvents[0]]);
      jest
        .spyOn(LocalIntegrationService, "getUpcomingEvents")
        .mockResolvedValue([mockEvents[1], mockEvents[2]]);

      const result = await LocalIntegrationService.getEventStatistics("user1");

      expect(result).toEqual({
        totalEvents: 3,
        todayEvents: 1,
        upcomingEvents: 2,
        allDayEvents: 1,
        recurringEvents: 1,
      });
    });
  });

  describe("hasEvents", () => {
    it("should return true when user has events", async () => {
      const mockEvents = [
        {
          id: 1,
          userId: "user1",
          title: "Test Event",
          startTime: new Date(),
          endTime: new Date(Date.now() + 60 * 60 * 1000),
          isAllDay: false,
          recurrence: "none" as const,
        },
      ];

      jest
        .spyOn(LocalIntegrationService, "getEvents")
        .mockResolvedValue(mockEvents);

      const result = await LocalIntegrationService.hasEvents("user1");

      expect(result).toBe(true);
    });

    it("should return false when user has no events", async () => {
      jest.spyOn(LocalIntegrationService, "getEvents").mockResolvedValue([]);

      const result = await LocalIntegrationService.hasEvents("user1");

      expect(result).toBe(false);
    });

    it("should return false on error", async () => {
      jest
        .spyOn(LocalIntegrationService, "getEvents")
        .mockRejectedValue(new Error("Database error"));

      const result = await LocalIntegrationService.hasEvents("user1");

      expect(result).toBe(false);
    });
  });

  describe("getEventCount", () => {
    it("should return correct event count", async () => {
      const mockEvents = [
        {
          id: 1,
          userId: "user1",
          title: "Event 1",
          startTime: new Date(),
          endTime: new Date(),
          isAllDay: false,
          recurrence: "none" as const,
        },
        {
          id: 2,
          userId: "user1",
          title: "Event 2",
          startTime: new Date(),
          endTime: new Date(),
          isAllDay: false,
          recurrence: "none" as const,
        },
      ];

      jest
        .spyOn(LocalIntegrationService, "getEvents")
        .mockResolvedValue(mockEvents);

      const result = await LocalIntegrationService.getEventCount("user1");

      expect(result).toBe(2);
    });

    it("should apply filters when provided", async () => {
      const filters: EventFilters = { startDate: "2023-10-01" };
      const mockEvents = [
        {
          id: 1,
          userId: "user1",
          title: "Event 1",
          startTime: new Date(),
          endTime: new Date(),
          isAllDay: false,
          recurrence: "none" as const,
        },
      ];

      const spy = jest
        .spyOn(LocalIntegrationService, "getEvents")
        .mockResolvedValue(mockEvents);

      await LocalIntegrationService.getEventCount("user1", filters);

      expect(spy).toHaveBeenCalledWith("user1", filters);
    });
  });
});
