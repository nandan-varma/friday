/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-require-imports */
import { POST } from "../../src/app/api/chat/route";

// Mock Response
global.Response = class MockResponse {
  status: number;
  body: string;

  constructor(body: string, options?: { status?: number }) {
    this.body = body;
    this.status = options?.status || 200;
  }

  text() {
    return Promise.resolve(this.body);
  }
} as any;

// Mock the AI SDK
jest.mock("ai", () => ({
  streamText: jest.fn(),
  convertToModelMessages: jest.fn((messages) => {
    return messages.map((message: any) => {
      if (message.parts) {
        // UIMessage format
        const content = message.parts
          .filter(
            (part: { type: string; text: string }) => part.type === "text",
          )
          .map((part: { type: string; text: string }) => part.text)
          .join("\n");
        return {
          role: message.role,
          content,
        };
      } else {
        // Already in simple format
        return message;
      }
    });
  }),
  stepCountIs: jest.fn(() => "mock-stop-condition"),
}));

jest.mock("@ai-sdk/openai", () => ({
  openai: jest.fn(() => "mock-model"),
}));

// Mock dependencies
jest.mock("../../src/lib/auth", () => ({
  auth: {
    api: {
      getSession: jest.fn(),
    },
  },
}));

jest.mock("../../src/lib/services/eventService", () => ({
  default: {
    getAllUpcomingEvents: jest.fn(),
    getAllTodayEvents: jest.fn(),
    createEventFromNaturalLanguage: jest.fn(),
    searchAllEvents: jest.fn(),
    getEventStatistics: jest.fn(),
  },
}));

jest.mock("next/headers", () => ({
  headers: jest.fn(),
}));

const mockAuth = require("../../src/lib/auth") as any;
const mockStreamText = require("ai").streamText as jest.Mock;
const mockHeaders = require("next/headers").headers as jest.Mock;

describe("/api/chat", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockHeaders.mockResolvedValue(new Headers());
  });

  describe("POST /api/chat", () => {
    it("should return 400 for invalid JSON", async () => {
      const request = {
        json: () => Promise.reject(new Error("Invalid JSON")),
      } as any;

      const response = await POST(request);
      expect(response.status).toBe(400);
      expect(await response.text()).toBe("Invalid JSON");
    });

    it("should return 400 when messages is not an array", async () => {
      const request = {
        json: () => Promise.resolve({ messages: "not an array" }),
      } as any;

      const response = await POST(request);
      expect(response.status).toBe(400);
      expect(await response.text()).toBe("Messages must be an array");
    });

    it("should return 400 when messages array is empty", async () => {
      const request = {
        json: () => Promise.resolve({ messages: [] }),
      } as any;

      const response = await POST(request);
      expect(response.status).toBe(400);
      expect(await response.text()).toBe("Messages array cannot be empty");
    });

    it("should return 400 when messages array is too large", async () => {
      const messages = Array(51).fill({
        role: "user",
        content: "test",
      });

      const request = {
        json: () => Promise.resolve({ messages }),
      } as any;

      const response = await POST(request);
      expect(response.status).toBe(400);
      expect(await response.text()).toBe("Too many messages");
    });

    it("should return 400 for invalid message format", async () => {
      const request = {
        json: () => Promise.resolve({ messages: ["invalid message"] }),
      } as any;

      const response = await POST(request);
      expect(response.status).toBe(400);
      expect(await response.text()).toBe("Invalid message format");
    });

    it("should return 400 for invalid message role", async () => {
      const request = {
        json: () =>
          Promise.resolve({
            messages: [{ role: "invalid", content: "test" }],
          }),
      } as any;

      const response = await POST(request);
      expect(response.status).toBe(400);
      expect(await response.text()).toBe("Invalid message role");
    });

    it("should return 400 for missing message content", async () => {
      const request = {
        json: () =>
          Promise.resolve({
            messages: [{ role: "user" }],
          }),
      } as any;

      const response = await POST(request);
      expect(response.status).toBe(400);
      expect(await response.text()).toBe("Invalid message content");
    });

    it("should return 400 for message content too long", async () => {
      const longContent = "a".repeat(10001);
      const request = {
        json: () =>
          Promise.resolve({
            messages: [{ role: "user", content: longContent }],
          }),
      } as any;

      const response = await POST(request);
      expect(response.status).toBe(400);
      expect(await response.text()).toBe("Message content too long");
    });

    it("should return 401 when user is not authenticated", async () => {
      mockAuth.api.getSession.mockResolvedValue(null);

      const request = {
        json: () =>
          Promise.resolve({
            messages: [{ role: "user", content: "Hello" }],
          }),
      } as any;

      const response = await POST(request);
      expect(response.status).toBe(401);
      expect(await response.text()).toBe("User not authenticated");
    });

    it("should process UIMessage format correctly", async () => {
      const mockUser = { id: "user-123", name: "Test User" };
      mockAuth.auth.api.getSession.mockResolvedValue({ user: mockUser });

      const mockStreamResult = {
        toUIMessageStreamResponse: jest
          .fn()
          .mockReturnValue(new Response("stream response", { status: 200 })),
      };
      mockStreamText.mockReturnValue(mockStreamResult);

      const request = {
        json: () =>
          Promise.resolve({
            messages: [
              {
                role: "user",
                parts: [{ type: "text", text: "Hello" }],
              },
            ],
          }),
      } as any;

      const response = await POST(request);
      expect(response.status).toBe(200);
      expect(mockStreamText).toHaveBeenCalledWith({
        model: "mock-model",
        system: expect.stringContaining(
          "You are a helpful AI calendar assistant",
        ),
        messages: [{ role: "user", content: "Hello" }],
        tools: expect.objectContaining({
          getUpcomingEvents: expect.any(Object),
          createEvent: expect.any(Object),
        }),
        stopWhen: "mock-stop-condition",
      });
    });

    it("should process simple message format correctly", async () => {
      const mockUser = { id: "user-123", name: "Test User" };
      mockAuth.auth.api.getSession.mockResolvedValue({ user: mockUser });

      const mockStreamResult = {
        toUIMessageStreamResponse: jest
          .fn()
          .mockReturnValue(new Response("stream response", { status: 200 })),
      };
      mockStreamText.mockReturnValue(mockStreamResult);

      const request = {
        json: () =>
          Promise.resolve({
            messages: [{ role: "user", content: "Hello" }],
          }),
      } as any;

      const response = await POST(request);
      expect(response.status).toBe(200);
      expect(mockStreamText).toHaveBeenCalledWith({
        model: "mock-model",
        system: expect.stringContaining(
          "You are a helpful AI calendar assistant",
        ),
        messages: [{ role: "user", content: "Hello" }],
        tools: expect.objectContaining({
          getUpcomingEvents: expect.any(Object),
          createEvent: expect.any(Object),
        }),
        stopWhen: "mock-stop-condition",
      });
    });

    it("should include user context in system message", async () => {
      const mockUser = {
        id: "user-123",
        name: "Test User",
        email: "test@example.com",
      };
      mockAuth.auth.api.getSession.mockResolvedValue({ user: mockUser });

      const mockStreamResult = {
        toUIMessageStreamResponse: jest
          .fn()
          .mockReturnValue(new Response("stream response", { status: 200 })),
      };
      mockStreamText.mockReturnValue(mockStreamResult);

      const request = {
        json: () =>
          Promise.resolve({
            messages: [{ role: "user", content: "Hello" }],
          }),
      } as any;

      await POST(request);
      expect(mockStreamText).toHaveBeenCalledWith({
        model: "mock-model",
        system: expect.stringContaining("Current user: Test User"),
        messages: [{ role: "user", content: "Hello" }],
        tools: expect.objectContaining({
          getUpcomingEvents: expect.any(Object),
          createEvent: expect.any(Object),
        }),
        stopWhen: "mock-stop-condition",
      });
    });
  });
});
