import { NextRequest } from "next/server";
import { PUT, DELETE } from "../../src/app/api/events/[eventId]/route";
import { EventService } from "../../src/lib/eventService";

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
    saveEvent: jest.fn(),
    deleteEvent: jest.fn(),
  },
}));

const mockAuth = require("../../src/lib/auth");
const mockEventService = EventService as jest.Mocked<typeof EventService>;

describe("/api/events/[eventId]", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("PUT /api/events/[eventId]", () => {
    it("should return 401 when user is not authenticated", async () => {
      mockAuth.auth.api.getSession.mockResolvedValue(null);

      const request = new NextRequest(
        "http://localhost:3000/api/events/event-1",
        {
          method: "PUT",
          body: JSON.stringify({
            title: "Updated Event",
          }),
        },
      );
      const response = await PUT(request, {
        params: Promise.resolve({ eventId: "event-1" }),
      });

      expect(response.status).toBe(401);
      expect(await response.json()).toEqual({ error: "Unauthorized" });
    });

    it("should update an event successfully", async () => {
      const mockUser = { id: "user-123" };
      const mockEvent = {
        id: "event-1",
        title: "Updated Event",
        description: "Updated Description",
        location: "Updated Location",
        startTime: new Date("2024-01-01T10:00:00Z"),
        endTime: new Date("2024-01-01T11:00:00Z"),
        isAllDay: false,
        recurrence: "none" as const,
        origin: "local" as const,
      };

      mockAuth.auth.api.getSession.mockResolvedValue({ user: mockUser });
      mockEventService.saveEvent.mockResolvedValue(mockEvent);

      const request = new NextRequest(
        "http://localhost:3000/api/events/event-1",
        {
          method: "PUT",
          body: JSON.stringify({
            title: "Updated Event",
            description: "Updated Description",
            location: "Updated Location",
            startTime: "2024-01-01T10:00:00Z",
            endTime: "2024-01-01T11:00:00Z",
            isAllDay: false,
            recurrence: "none",
          }),
        },
      );
      const response = await PUT(request, {
        params: Promise.resolve({ eventId: "event-1" }),
      });

      expect(response.status).toBe(200);
      expect(await response.json()).toEqual({ event: mockEvent });
      expect(mockEventService.saveEvent).toHaveBeenCalledWith(
        "user-123",
        {
          title: "Updated Event",
          description: "Updated Description",
          location: "Updated Location",
          startTime: new Date("2024-01-01T10:00:00Z"),
          endTime: new Date("2024-01-01T11:00:00Z"),
          isAllDay: false,
          recurrence: "none",
        },
        { eventId: "event-1" },
      );
    });

    it("should handle partial updates", async () => {
      const mockUser = { id: "user-123" };
      const mockEvent = {
        id: "event-1",
        title: "Updated Title Only",
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

      const request = new NextRequest(
        "http://localhost:3000/api/events/event-1",
        {
          method: "PUT",
          body: JSON.stringify({
            title: "Updated Title Only",
          }),
        },
      );
      const response = await PUT(request, {
        params: Promise.resolve({ eventId: "event-1" }),
      });

      expect(response.status).toBe(200);
      expect(mockEventService.saveEvent).toHaveBeenCalledWith(
        "user-123",
        {
          title: "Updated Title Only",
        },
        { eventId: "event-1" },
      );
    });

    it("should return 500 on service error", async () => {
      const mockUser = { id: "user-123" };

      mockAuth.auth.api.getSession.mockResolvedValue({ user: mockUser });
      mockEventService.saveEvent.mockRejectedValue(new Error("Database error"));

      const request = new NextRequest(
        "http://localhost:3000/api/events/event-1",
        {
          method: "PUT",
          body: JSON.stringify({
            title: "Updated Event",
          }),
        },
      );
      const response = await PUT(request, {
        params: Promise.resolve({ eventId: "event-1" }),
      });

      expect(response.status).toBe(500);
      expect(await response.json()).toEqual({
        error: "Failed to update event",
      });
    });
  });

  describe("DELETE /api/events/[eventId]", () => {
    it("should return 401 when user is not authenticated", async () => {
      mockAuth.auth.api.getSession.mockResolvedValue(null);

      const request = new NextRequest(
        "http://localhost:3000/api/events/event-1",
        {
          method: "DELETE",
        },
      );
      const response = await DELETE(request, {
        params: Promise.resolve({ eventId: "event-1" }),
      });

      expect(response.status).toBe(401);
      expect(await response.json()).toEqual({ error: "Unauthorized" });
    });

    it("should delete an event successfully", async () => {
      const mockUser = { id: "user-123" };

      mockAuth.auth.api.getSession.mockResolvedValue({ user: mockUser });
      mockEventService.deleteEvent.mockResolvedValue(undefined);

      const request = new NextRequest(
        "http://localhost:3000/api/events/event-1",
        {
          method: "DELETE",
        },
      );
      const response = await DELETE(request, {
        params: Promise.resolve({ eventId: "event-1" }),
      });

      expect(response.status).toBe(200);
      expect(await response.json()).toEqual({ success: true });
      expect(mockEventService.deleteEvent).toHaveBeenCalledWith(
        "user-123",
        "event-1",
      );
    });

    it("should return 500 on service error", async () => {
      const mockUser = { id: "user-123" };

      mockAuth.auth.api.getSession.mockResolvedValue({ user: mockUser });
      mockEventService.deleteEvent.mockRejectedValue(
        new Error("Database error"),
      );

      const request = new NextRequest(
        "http://localhost:3000/api/events/event-1",
        {
          method: "DELETE",
        },
      );
      const response = await DELETE(request, {
        params: Promise.resolve({ eventId: "event-1" }),
      });

      expect(response.status).toBe(500);
      expect(await response.json()).toEqual({
        error: "Failed to delete event",
      });
    });
  });
});
