/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-require-imports */
import { NextRequest } from "next/server";
import { GET, POST } from "../../src/app/api/events/route";
import { EventService } from "../../src/lib/services/eventService";

// Mock NextRequest cookies
jest.mock("next/server", () => ({
  NextRequest: class MockNextRequest {
    url: string;
    method: string;
    headers: Headers;
    cookies = {
      get: jest.fn(),
      getAll: jest.fn(),
      set: jest.fn(),
      delete: jest.fn(),
    };

    private _body: any;

    constructor(input: string | URL, init?: RequestInit) {
      this.url = typeof input === "string" ? input : input.toString();
      this.method = init?.method || "GET";
      this.headers = new Headers(init?.headers);
      this._body = init?.body ? JSON.parse(init.body as string) : {};
    }

    json() {
      return Promise.resolve(this._body);
    }
  },
  NextResponse: {
    json: (data: any, options?: { status?: number }) => ({
      status: options?.status || 200,
      json: () => Promise.resolve(data),
    }),
  },
}));

// Mock dependencies
jest.mock("../../src/lib/auth", () => ({
  auth: {
    api: {
      getSession: jest.fn(),
    },
  },
}));

jest.mock("../../src/lib/eventService", () => ({
  EventService: {
    getAllUpcomingEvents: jest.fn(),
    getAllEvents: jest.fn(),
    saveEvent: jest.fn(),
  },
}));

const mockAuth = require("../../src/lib/auth");
const mockEventService = EventService as jest.Mocked<typeof EventService>;

describe("/api/events", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /api/events", () => {
    it("should return 401 when user is not authenticated", async () => {
      mockAuth.auth.api.getSession.mockResolvedValue(null);

      const request = new Request("http://localhost:3000/api/events") as any;
      const response = await GET(request);

      expect(response.status).toBe(401);
      expect(await response.json()).toEqual({ error: "Unauthorized" });
    });

    it("should return upcoming events when type=upcoming", async () => {
      const mockUser = { id: "user-123" };
      const mockEvents = [
        {
          id: "event-1",
          title: "Test Event",
          startTime: new Date(),
          endTime: new Date(),
          isAllDay: false,
          origin: "local" as const,
        },
      ];

      mockAuth.auth.api.getSession.mockResolvedValue({ user: mockUser });
      mockEventService.getAllUpcomingEvents.mockResolvedValue(mockEvents);

      const request = new NextRequest(
        "http://localhost:3000/api/events?type=upcoming&days=7",
      );
      const response = await GET(request);

      expect(response.status).toBe(200);
      expect(await response.json()).toEqual({ events: mockEvents });
      expect(mockEventService.getAllUpcomingEvents).toHaveBeenCalledWith(
        "user-123",
        7,
        undefined,
        undefined,
        undefined,
      );
    });

    it("should return all events when no type specified", async () => {
      const mockUser = { id: "user-123" };
      const mockEvents = [
        {
          id: "event-1",
          title: "Test Event",
          startTime: new Date(),
          endTime: new Date(),
          isAllDay: false,
          origin: "local" as const,
        },
      ];

      mockAuth.auth.api.getSession.mockResolvedValue({ user: mockUser });
      mockEventService.getAllEvents.mockResolvedValue(mockEvents);

      const request = new NextRequest("http://localhost:3000/api/events");
      const response = await GET(request);

      expect(response.status).toBe(200);
      expect(await response.json()).toEqual({ events: mockEvents });
      expect(mockEventService.getAllEvents).toHaveBeenCalledWith(
        "user-123",
        undefined,
      );
    });

    it("should handle date filters", async () => {
      const mockUser = { id: "user-123" };
      const mockEvents: any[] = [];

      mockAuth.auth.api.getSession.mockResolvedValue({ user: mockUser });
      mockEventService.getAllEvents.mockResolvedValue(mockEvents);

      const startDate = "2024-01-01";
      const endDate = "2024-01-31";
      const request = new NextRequest(
        `http://localhost:3000/api/events?startDate=${startDate}&endDate=${endDate}`,
      );
      const response = await GET(request);

      expect(response.status).toBe(200);
      expect(mockEventService.getAllEvents).toHaveBeenCalledWith("user-123", {
        startDate: new Date(startDate),
        endDate: new Date(endDate),
      });
    });

    it("should return 500 on service error", async () => {
      const mockUser = { id: "user-123" };

      mockAuth.auth.api.getSession.mockResolvedValue({ user: mockUser });
      mockEventService.getAllEvents.mockRejectedValue(
        new Error("Database error"),
      );

      const request = new NextRequest("http://localhost:3000/api/events");
      const response = await GET(request);

      expect(response.status).toBe(500);
      expect(await response.json()).toEqual({
        error: "Failed to fetch events",
      });
    });
  });

  describe("POST /api/events", () => {
    it("should return 401 when user is not authenticated", async () => {
      mockAuth.auth.api.getSession.mockResolvedValue(null);

      const request = new NextRequest("http://localhost:3000/api/events", {
        method: "POST",
        body: JSON.stringify({
          title: "Test Event",
          startTime: "2024-01-01T10:00:00Z",
          endTime: "2024-01-01T11:00:00Z",
        }),
      });
      const response = await POST(request);

      expect(response.status).toBe(401);
      expect(await response.json()).toEqual({ error: "Unauthorized" });
    });

    it("should return 400 when required fields are missing", async () => {
      const mockUser = { id: "user-123" };

      mockAuth.auth.api.getSession.mockResolvedValue({ user: mockUser });

      const request = new NextRequest("http://localhost:3000/api/events", {
        method: "POST",
        body: JSON.stringify({
          title: "Test Event",
          // missing startTime and endTime
        }),
      });
      const response = await POST(request);

      expect(response.status).toBe(400);
      expect(await response.json()).toEqual({
        error: "Missing required fields",
      });
    });

    it("should create an event successfully", async () => {
      const mockUser = { id: "user-123" };
      const mockEvent = {
        id: "event-1",
        title: "Test Event",
        description: "Test Description",
        location: "Test Location",
        startTime: new Date("2024-01-01T10:00:00Z"),
        endTime: new Date("2024-01-01T11:00:00Z"),
        isAllDay: false,
        recurrence: "none" as const,
        origin: "local" as const,
      } as const;

      mockAuth.auth.api.getSession.mockResolvedValue({ user: mockUser });
      mockEventService.saveEvent.mockResolvedValue(mockEvent);

      const request = new NextRequest("http://localhost:3000/api/events", {
        method: "POST",
        body: JSON.stringify({
          title: "Test Event",
          description: "Test Description",
          location: "Test Location",
          startTime: "2024-01-01T10:00:00Z",
          endTime: "2024-01-01T11:00:00Z",
          isAllDay: false,
          recurrence: "none" as const,
        }),
      });
      const response = await POST(request);

      expect(response.status).toBe(201);
      expect(await response.json()).toEqual({ event: mockEvent });
      expect(mockEventService.saveEvent).toHaveBeenCalledWith("user-123", {
        title: "Test Event",
        description: "Test Description",
        location: "Test Location",
        startTime: new Date("2024-01-01T10:00:00Z"),
        endTime: new Date("2024-01-01T11:00:00Z"),
        isAllDay: false,
        recurrence: "none",
      });
    });

    it("should handle optional fields", async () => {
      const mockUser = { id: "user-123" };
      const mockEvent = {
        id: "event-1",
        title: "Test Event",
        description: null,
        location: null,
        startTime: new Date("2024-01-01T10:00:00Z"),
        endTime: new Date("2024-01-01T11:00:00Z"),
        isAllDay: false,
        recurrence: "none" as const,
        origin: "local" as const,
      };

      mockAuth.auth.api.getSession.mockResolvedValue({ user: mockUser });
      mockEventService.saveEvent.mockResolvedValue(mockEvent);

      const request = new NextRequest("http://localhost:3000/api/events", {
        method: "POST",
        body: JSON.stringify({
          title: "Test Event",
          startTime: "2024-01-01T10:00:00Z",
          endTime: "2024-01-01T11:00:00Z",
          // no description, location, isAllDay, recurrence
        }),
      });
      const response = await POST(request);

      expect(response.status).toBe(201);
      expect(mockEventService.saveEvent).toHaveBeenCalledWith("user-123", {
        title: "Test Event",
        description: null,
        location: null,
        startTime: new Date("2024-01-01T10:00:00Z"),
        endTime: new Date("2024-01-01T11:00:00Z"),
        isAllDay: false,
        recurrence: "none",
      });
    });

    it("should return 500 on service error", async () => {
      const mockUser = { id: "user-123" };

      mockAuth.auth.api.getSession.mockResolvedValue({ user: mockUser });
      mockEventService.saveEvent.mockRejectedValue(new Error("Database error"));

      const request = new NextRequest("http://localhost:3000/api/events", {
        method: "POST",
        body: JSON.stringify({
          title: "Test Event",
          startTime: "2024-01-01T10:00:00Z",
          endTime: "2024-01-01T11:00:00Z",
        }),
      });
      const response = await POST(request);

      expect(response.status).toBe(500);
      expect(await response.json()).toEqual({
        error: "Failed to create event",
      });
    });
  });
});
