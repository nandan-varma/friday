import { EventService } from "../../src/lib/eventService";
import { LocalIntegrationService } from "../../src/lib/localIntegrationService";

// Mock the integration services
jest.mock("../../src/lib/localIntegrationService", () => ({
  LocalIntegrationService: {
    createEvent: jest.fn(),
    getEvents: jest.fn(),
    updateEvent: jest.fn(),
    deleteEvent: jest.fn(),
  },
}));

jest.mock("../../src/lib/googleIntegrationService", () => ({
  GoogleIntegrationService: {
    getCalendarEvents: jest.fn(),
  },
}));

// Mock AI SDK
jest.mock("ai", () => ({
  generateObject: jest.fn(),
}));

import { generateObject } from "ai";

describe("EventService", () => {
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
  });
});
