/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-require-imports */
import { POST } from "../../src/app/api/auth/google/callback/route";

// Mock NextRequest and NextResponse
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
      this.method = init?.method || "POST";
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

jest.mock("../../src/lib/logger", () => {
  const mockLogger = {
    error: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  };
  return { __esModule: true, default: mockLogger };
});

jest.mock("../../src/lib/services/googleIntegrationService", () => ({
  GoogleIntegrationService: {
    exchangeCodeForTokens: jest.fn(),
  },
}));

const mockAuth = require("../../src/lib/auth") as any;
const mockGoogleIntegrationService =
  require("../../src/lib/services/googleIntegrationService") as any;
const { NextRequest } = require("next/server");

describe("/api/auth/google/callback", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("POST", () => {
    it("should exchange code for tokens successfully", async () => {
      // Mock authenticated session
      mockAuth.auth.api.getSession.mockResolvedValue({
        user: {
          id: "user-123",
          email: "test@example.com",
        },
      });

      // Mock successful token exchange
      mockGoogleIntegrationService.GoogleIntegrationService.exchangeCodeForTokens.mockResolvedValue(
        {
          id: 1,
          userId: "user-123",
          accessToken: "mock-access-token",
          refreshToken: "mock-refresh-token",
          expiresAt: new Date(),
        },
      );

      // Create request with authorization code
      const request = new NextRequest(
        "http://localhost:3000/api/auth/google/callback",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            code: "mock-auth-code",
            state: "mock-state",
          }),
        },
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({ success: true });
      expect(
        mockGoogleIntegrationService.GoogleIntegrationService
          .exchangeCodeForTokens,
      ).toHaveBeenCalledWith("mock-auth-code", "user-123");
    });

    it("should return 401 if user is not authenticated", async () => {
      // Mock no session
      mockAuth.auth.api.getSession.mockResolvedValue(null);

      const request = new NextRequest(
        "http://localhost:3000/api/auth/google/callback",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            code: "mock-auth-code",
            state: "mock-state",
          }),
        },
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data).toEqual({ error: "Unauthorized" });
      expect(
        mockGoogleIntegrationService.GoogleIntegrationService
          .exchangeCodeForTokens,
      ).not.toHaveBeenCalled();
    });

    it("should return 400 if authorization code is missing", async () => {
      // Mock authenticated session
      mockAuth.auth.api.getSession.mockResolvedValue({
        user: {
          id: "user-123",
          email: "test@example.com",
        },
      });

      const request = new NextRequest(
        "http://localhost:3000/api/auth/google/callback",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            state: "mock-state",
          }),
        },
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toEqual({ error: "Missing authorization code" });
      expect(
        mockGoogleIntegrationService.GoogleIntegrationService
          .exchangeCodeForTokens,
      ).not.toHaveBeenCalled();
    });

    it("should return 500 if token exchange fails", async () => {
      // Mock authenticated session
      mockAuth.auth.api.getSession.mockResolvedValue({
        user: {
          id: "user-123",
          email: "test@example.com",
        },
      });

      // Mock failed token exchange
      mockGoogleIntegrationService.GoogleIntegrationService.exchangeCodeForTokens.mockRejectedValue(
        new Error("Failed to exchange code for tokens"),
      );

      const request = new NextRequest(
        "http://localhost:3000/api/auth/google/callback",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            code: "mock-auth-code",
            state: "mock-state",
          }),
        },
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({ error: "Failed to connect Google Calendar" });
    });

    it("should handle malformed request body", async () => {
      // Mock authenticated session
      mockAuth.auth.api.getSession.mockResolvedValue({
        user: {
          id: "user-123",
          email: "test@example.com",
        },
      });

      // Create a request with empty body - this will result in empty object from JSON.parse
      const request = new NextRequest(
        "http://localhost:3000/api/auth/google/callback",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({}),
        },
      );

      const response = await POST(request);
      const data = await response.json();

      // Should fail validation since code is missing
      expect(response.status).toBe(400);
      expect(data).toEqual({ error: "Missing authorization code" });
      expect(
        mockGoogleIntegrationService.GoogleIntegrationService
          .exchangeCodeForTokens,
      ).not.toHaveBeenCalled();
    });
  });
});
