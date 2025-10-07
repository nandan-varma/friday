/* eslint-disable @typescript-eslint/no-explicit-any */
import { GoogleIntegrationService } from "../../src/lib/services/googleIntegrationService";

// Mock googleapis
jest.mock("googleapis", () => ({
  google: {
    auth: {
      OAuth2: jest.fn(),
    },
    calendar: jest.fn(() => ({
      calendarList: {
        list: jest.fn(),
      },
      events: {
        list: jest.fn(),
        insert: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    })),
  },
}));

// Mock google-auth-library
jest.mock("google-auth-library", () => ({
  OAuth2Client: jest.fn().mockImplementation(() => ({
    generateAuthUrl: jest.fn(),
    getToken: jest.fn(),
    setCredentials: jest.fn(),
    refreshAccessToken: jest.fn(),
  })),
}));

// Mock database
jest.mock("../../src/lib/db", () => ({
  db: {
    transaction: jest.fn(),
    select: jest.fn(() => ({
      from: jest.fn(() => ({
        where: jest.fn(() => ({
          limit: jest.fn(),
        })),
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
      where: jest.fn(),
    })),
  },
}));

// Mock drizzle-orm functions
jest.mock("drizzle-orm", () => ({
  eq: jest.fn(),
  and: jest.fn(),
  relations: jest.fn(),
}));

import { google } from "googleapis";
import { db } from "../../src/lib/db";

describe("GoogleIntegrationService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getAuthUrl", () => {
    it("should generate authorization URL with correct parameters", async () => {
      const mockOAuth2Client = {
        generateAuthUrl: jest
          .fn()
          .mockReturnValue(
            "https://accounts.google.com/oauth/authorize?client_id=test",
          ),
      };

      (google.auth.OAuth2 as any).mockImplementation(() => mockOAuth2Client);

      const result = await GoogleIntegrationService.getAuthUrl();

      expect(google.auth.OAuth2).toHaveBeenCalledWith(
        "test-client-id",
        "test-client-secret",
        "http://localhost:3000/api/auth/google/callback",
      );
      expect(mockOAuth2Client.generateAuthUrl).toHaveBeenCalledWith({
        access_type: "offline",
        scope: [
          "https://www.googleapis.com/auth/calendar.readonly",
          "https://www.googleapis.com/auth/calendar.events",
        ],
        prompt: "consent",
        state: expect.any(String),
      });
      expect(result).toHaveProperty("url");
      expect(result).toHaveProperty("state");
      expect(typeof result.state).toBe("string");
    });

    it("should throw error when credentials are invalid", async () => {
      // Mock env to return invalid credentials
      jest.doMock("../../src/lib/env", () => ({
        GOOGLE_CREDENTIALS: "invalid-json",
      }));

      await expect(GoogleIntegrationService.getAuthUrl()).rejects.toThrow(
        "Invalid GOOGLE_CREDENTIALS: must be valid JSON",
      );
    });
  });

  describe("exchangeCodeForTokens", () => {
    it("should exchange authorization code for tokens and save to database", async () => {
      const mockOAuth2Client = {
        getToken: jest.fn().mockResolvedValue({
          tokens: {
            access_token: "test-access-token",
            refresh_token: "test-refresh-token",
            expiry_date: Date.now() + 3600000,
          },
        }),
      };

      (google.auth.OAuth2 as any).mockImplementation(() => mockOAuth2Client);

      // Mock database transaction
      const mockTransaction = jest.fn().mockImplementation(async (callback) => {
        // Mock no existing integration
        const mockSelect = jest.fn(() => ({
          from: jest.fn(() => ({
            where: jest.fn(() => ({
              limit: jest.fn().mockResolvedValue([]),
            })),
          })),
        }));

        const mockInsert = jest.fn(() => ({
          values: jest.fn(() => ({
            returning: jest.fn().mockResolvedValue([
              {
                id: 1,
                userId: "user1",
                accessToken: "test-access-token",
                refreshToken: "test-refresh-token",
                expiresAt: new Date(Date.now() + 3600000),
              },
            ]),
          })),
        }));

        (db.select as any).mockImplementation(mockSelect);
        (db.insert as any).mockImplementation(mockInsert);

        return await callback({ select: mockSelect, insert: mockInsert });
      });

      (db.transaction as any).mockImplementation(mockTransaction);

      const result = await GoogleIntegrationService.exchangeCodeForTokens(
        "auth-code",
        "user1",
      );

      expect(mockOAuth2Client.getToken).toHaveBeenCalledWith("auth-code");
      expect(db.transaction).toHaveBeenCalled();
      expect(result).toEqual({
        id: 1,
        userId: "user1",
        accessToken: "test-access-token",
        refreshToken: "test-refresh-token",
        expiresAt: expect.any(Date),
      });
    });

    it("should update existing integration when one exists", async () => {
      const mockOAuth2Client = {
        getToken: jest.fn().mockResolvedValue({
          tokens: {
            access_token: "new-access-token",
            refresh_token: "new-refresh-token",
            expiry_date: Date.now() + 3600000,
          },
        }),
      };

      (google.auth.OAuth2 as any).mockImplementation(() => mockOAuth2Client);

      // Mock database transaction
      const mockTransaction = jest.fn().mockImplementation(async (callback) => {
        // Mock existing integration
        const mockSelect = jest.fn(() => ({
          from: jest.fn(() => ({
            where: jest.fn(() => ({
              limit: jest.fn().mockResolvedValue([
                {
                  id: 1,
                  userId: "user1",
                  accessToken: "old-token",
                },
              ]),
            })),
          })),
        }));

        const mockUpdate = jest.fn(() => ({
          set: jest.fn(() => ({
            where: jest.fn(() => ({
              returning: jest.fn().mockResolvedValue([
                {
                  id: 1,
                  userId: "user1",
                  accessToken: "new-access-token",
                  refreshToken: "new-refresh-token",
                  expiresAt: new Date(Date.now() + 3600000),
                },
              ]),
            })),
          })),
        }));

        (db.select as any).mockImplementation(mockSelect);
        (db.update as any).mockImplementation(mockUpdate);

        return await callback({ select: mockSelect, update: mockUpdate });
      });

      (db.transaction as any).mockImplementation(mockTransaction);

      const result = await GoogleIntegrationService.exchangeCodeForTokens(
        "auth-code",
        "user1",
      );

      expect(result.accessToken).toBe("new-access-token");
    });

    it("should throw error when no access token received", async () => {
      const mockOAuth2Client = {
        getToken: jest.fn().mockResolvedValue({
          tokens: {
            refresh_token: "test-refresh-token",
            // No access_token
          },
        }),
      };

      (google.auth.OAuth2 as any).mockImplementation(() => mockOAuth2Client);

      await expect(
        GoogleIntegrationService.exchangeCodeForTokens("auth-code", "user1"),
      ).rejects.toThrow("No access token received from Google");
    });
  });

  describe("getUserIntegration", () => {
    it("should return integration when found", async () => {
      const mockIntegration = {
        id: 1,
        userId: "user1",
        accessToken: "test-token",
        refreshToken: "refresh-token",
        expiresAt: new Date(),
      };

      const mockSelect = jest.fn(() => ({
        from: jest.fn(() => ({
          where: jest.fn(() => ({
            limit: jest.fn().mockResolvedValue([mockIntegration]),
          })),
        })),
      }));

      (db.select as any).mockImplementation(mockSelect);

      const result = await GoogleIntegrationService.getUserIntegration("user1");

      expect(result).toEqual(mockIntegration);
    });

    it("should return null when no integration found", async () => {
      const mockSelect = jest.fn(() => ({
        from: jest.fn(() => ({
          where: jest.fn(() => ({
            limit: jest.fn().mockResolvedValue([]),
          })),
        })),
      }));

      (db.select as any).mockImplementation(mockSelect);

      const result = await GoogleIntegrationService.getUserIntegration("user1");

      expect(result).toBeNull();
    });
  });

  describe("createAuthenticatedClient", () => {
    it("should return null when no integration exists", async () => {
      const mockSelect = jest.fn(() => ({
        from: jest.fn(() => ({
          where: jest.fn(() => ({
            limit: jest.fn().mockResolvedValue([]),
          })),
        })),
      }));

      (db.select as any).mockImplementation(mockSelect);

      const result =
        await GoogleIntegrationService.createAuthenticatedClient("user1");

      expect(result).toBeNull();
    });

    it("should return null when integration has no access token", async () => {
      const mockSelect = jest.fn(() => ({
        from: jest.fn(() => ({
          where: jest.fn(() => ({
            limit: jest.fn().mockResolvedValue([
              {
                id: 1,
                userId: "user1",
                accessToken: null,
                refreshToken: "refresh-token",
                expiresAt: new Date(),
              },
            ]),
          })),
        })),
      }));

      (db.select as any).mockImplementation(mockSelect);

      const result =
        await GoogleIntegrationService.createAuthenticatedClient("user1");

      expect(result).toBeNull();
    });

    it("should create authenticated client with valid integration", async () => {
      const mockIntegration = {
        id: 1,
        userId: "user1",
        accessToken: "test-token",
        refreshToken: "refresh-token",
        expiresAt: new Date(Date.now() + 3600000), // Future date
      };

      const mockOAuth2Client = {
        setCredentials: jest.fn(),
      };

      const mockSelect = jest.fn(() => ({
        from: jest.fn(() => ({
          where: jest.fn(() => ({
            limit: jest.fn().mockResolvedValue([mockIntegration]),
          })),
        })),
      }));

      (db.select as any).mockImplementation(mockSelect);
      (google.auth.OAuth2 as any).mockImplementation(() => mockOAuth2Client);

      const result =
        await GoogleIntegrationService.createAuthenticatedClient("user1");

      expect(result).toBe(mockOAuth2Client);
      expect(mockOAuth2Client.setCredentials).toHaveBeenCalledWith({
        access_token: "test-token",
        refresh_token: "refresh-token",
        expiry_date: mockIntegration.expiresAt.getTime(),
      });
    });

    it("should refresh token when expired", async () => {
      const mockIntegration = {
        id: 1,
        userId: "user1",
        accessToken: "expired-token",
        refreshToken: "refresh-token",
        expiresAt: new Date(Date.now() - 1000), // Past date
      };

      const mockOAuth2Client = {
        setCredentials: jest.fn(),
        refreshAccessToken: jest.fn().mockResolvedValue({
          credentials: {
            access_token: "new-token",
            refresh_token: "refresh-token",
            expiry_date: Date.now() + 3600000,
          },
        }),
      };

      const mockSelect = jest.fn(() => ({
        from: jest.fn(() => ({
          where: jest.fn(() => ({
            limit: jest.fn().mockResolvedValue([mockIntegration]),
          })),
        })),
      }));

      const mockUpdate = jest.fn(() => ({
        set: jest.fn(() => ({
          where: jest.fn(() => ({
            returning: jest.fn(),
          })),
        })),
      }));

      (db.select as any).mockImplementation(mockSelect);
      (db.update as any).mockImplementation(mockUpdate);
      (google.auth.OAuth2 as any).mockImplementation(() => mockOAuth2Client);

      await GoogleIntegrationService.createAuthenticatedClient("user1");

      expect(mockOAuth2Client.refreshAccessToken).toHaveBeenCalled();
      expect(db.update).toHaveBeenCalled();
    });
  });

  describe("hasValidIntegration", () => {
    it("should return true when integration is valid", async () => {
      const mockOAuth2Client = {};
      const mockCalendarList = {
        list: jest.fn().mockResolvedValue({ data: { items: [] } }),
      };
      const mockCalendar = { calendarList: mockCalendarList };

      // Mock createAuthenticatedClient to return a client
      jest
        .spyOn(GoogleIntegrationService, "createAuthenticatedClient")
        .mockResolvedValue(mockOAuth2Client as any);
      (google.calendar as jest.Mock).mockReturnValue(mockCalendar);

      const result =
        await GoogleIntegrationService.hasValidIntegration("user1");

      expect(result).toBe(true);
      expect(mockCalendarList.list).toHaveBeenCalledWith({ maxResults: 1 });
    });

    it("should return false when no client available", async () => {
      jest
        .spyOn(GoogleIntegrationService, "createAuthenticatedClient")
        .mockResolvedValue(null);

      const result =
        await GoogleIntegrationService.hasValidIntegration("user1");

      expect(result).toBe(false);
    });

    it("should return false when API call fails", async () => {
      const mockOAuth2Client = {};
      const mockCalendarList = {
        list: jest.fn().mockRejectedValue(new Error("API Error")),
      };
      const mockCalendar = { calendarList: mockCalendarList };

      jest
        .spyOn(GoogleIntegrationService, "createAuthenticatedClient")
        .mockResolvedValue(mockOAuth2Client as any);
      (google.calendar as jest.Mock).mockReturnValue(mockCalendar);

      const result =
        await GoogleIntegrationService.hasValidIntegration("user1");

      expect(result).toBe(false);
    });
  });

  describe("getCalendarEvents", () => {
    it("should fetch calendar events with default options", async () => {
      const mockOAuth2Client = {};
      const mockEvents = {
        list: jest
          .fn()
          .mockResolvedValue({ data: { items: [{ id: "event1" }] } }),
      };
      const mockCalendar = { events: mockEvents };

      jest
        .spyOn(GoogleIntegrationService, "createAuthenticatedClient")
        .mockResolvedValue(mockOAuth2Client as any);
      (google.calendar as jest.Mock).mockReturnValue(mockCalendar);

      const result = await GoogleIntegrationService.getCalendarEvents("user1");

      expect(result).toEqual([{ id: "event1" }]);
      expect(mockEvents.list).toHaveBeenCalledWith({
        calendarId: "primary",
        timeMin: expect.any(String),
        timeMax: undefined,
        maxResults: 50,
        singleEvents: true,
        orderBy: "startTime",
      });
    });

    it("should apply custom options", async () => {
      const mockOAuth2Client = {};
      const mockEvents = {
        list: jest.fn().mockResolvedValue({ data: { items: [] } }),
      };
      const mockCalendar = { events: mockEvents };

      jest
        .spyOn(GoogleIntegrationService, "createAuthenticatedClient")
        .mockResolvedValue(mockOAuth2Client as any);
      (google.calendar as jest.Mock).mockReturnValue(mockCalendar);

      const options = {
        maxResults: 10,
        timeMin: new Date("2023-01-01"),
        timeMax: new Date("2023-12-31"),
        calendarId: "test-calendar-id",
      };

      await GoogleIntegrationService.getCalendarEvents("user1", options);

      expect(mockEvents.list).toHaveBeenCalledWith({
        calendarId: "test-calendar-id",
        timeMin: "2023-01-01T00:00:00.000Z",
        timeMax: "2023-12-31T00:00:00.000Z",
        maxResults: 10,
        singleEvents: true,
        orderBy: "startTime",
      });
    });

    it("should throw error when no authenticated client", async () => {
      jest
        .spyOn(GoogleIntegrationService, "createAuthenticatedClient")
        .mockResolvedValue(null);

      await expect(
        GoogleIntegrationService.getCalendarEvents("user1"),
      ).rejects.toThrow("Google Calendar not connected or invalid credentials");
    });
  });

  describe("createCalendarEvent", () => {
    it("should create calendar event successfully", async () => {
      const mockOAuth2Client = {};
      const mockEvent = { id: "new-event-id", summary: "Test Event" };
      const mockEvents = {
        insert: jest.fn().mockResolvedValue({ data: mockEvent }),
      };
      const mockCalendar = { events: mockEvents };

      jest
        .spyOn(GoogleIntegrationService, "createAuthenticatedClient")
        .mockResolvedValue(mockOAuth2Client as any);
      (google.calendar as jest.Mock).mockReturnValue(mockCalendar);

      const eventData = {
        summary: "Test Event",
        start: { dateTime: "2023-01-01T10:00:00Z" },
      };

      const result = await GoogleIntegrationService.createCalendarEvent(
        "user1",
        eventData,
      );

      expect(result).toEqual(mockEvent);
      expect(mockEvents.insert).toHaveBeenCalledWith({
        calendarId: "primary",
        requestBody: eventData,
      });
    });

    it("should use custom calendar ID", async () => {
      const mockOAuth2Client = {};
      const mockEvents = { insert: jest.fn().mockResolvedValue({ data: {} }) };
      const mockCalendar = { events: mockEvents };

      jest
        .spyOn(GoogleIntegrationService, "createAuthenticatedClient")
        .mockResolvedValue(mockOAuth2Client as any);
      (google.calendar as jest.Mock).mockReturnValue(mockCalendar);

      await GoogleIntegrationService.createCalendarEvent(
        "user1",
        {},
        "custom-calendar",
      );

      expect(mockEvents.insert).toHaveBeenCalledWith({
        calendarId: "custom-calendar",
        requestBody: {},
      });
    });
  });

  describe("updateCalendarEvent", () => {
    it("should update calendar event successfully", async () => {
      const mockOAuth2Client = {};
      const mockEvent = { id: "event-id", summary: "Updated Event" };
      const mockEvents = {
        update: jest.fn().mockResolvedValue({ data: mockEvent }),
      };
      const mockCalendar = { events: mockEvents };

      jest
        .spyOn(GoogleIntegrationService, "createAuthenticatedClient")
        .mockResolvedValue(mockOAuth2Client as any);
      (google.calendar as jest.Mock).mockReturnValue(mockCalendar);

      const eventData = { summary: "Updated Event" };

      const result = await GoogleIntegrationService.updateCalendarEvent(
        "user1",
        "event-id",
        eventData,
      );

      expect(result).toEqual(mockEvent);
      expect(mockEvents.update).toHaveBeenCalledWith({
        calendarId: "primary",
        eventId: "event-id",
        requestBody: eventData,
      });
    });

    it("should handle API errors with detailed information", async () => {
      const mockOAuth2Client = {};
      const mockError = {
        response: {
          data: {
            error: { message: "Event not found" },
          },
        },
      };
      const mockEvents = { update: jest.fn().mockRejectedValue(mockError) };
      const mockCalendar = { events: mockEvents };

      jest
        .spyOn(GoogleIntegrationService, "createAuthenticatedClient")
        .mockResolvedValue(mockOAuth2Client as any);
      (google.calendar as jest.Mock).mockReturnValue(mockCalendar);

      await expect(
        GoogleIntegrationService.updateCalendarEvent("user1", "event-id", {}),
      ).rejects.toThrow("Google Calendar API error: Event not found");
    });
  });

  describe("deleteCalendarEvent", () => {
    it("should delete calendar event successfully", async () => {
      const mockOAuth2Client = {};
      const mockEvents = { delete: jest.fn().mockResolvedValue({}) };
      const mockCalendar = { events: mockEvents };

      jest
        .spyOn(GoogleIntegrationService, "createAuthenticatedClient")
        .mockResolvedValue(mockOAuth2Client as any);
      (google.calendar as jest.Mock).mockReturnValue(mockCalendar);

      await GoogleIntegrationService.deleteCalendarEvent("user1", "event-id");

      expect(mockEvents.delete).toHaveBeenCalledWith({
        calendarId: "primary",
        eventId: "event-id",
      });
    });
  });

  describe("getCalendarList", () => {
    it("should fetch calendar list successfully", async () => {
      const mockOAuth2Client = {};
      const mockCalendars = [{ id: "calendar1", summary: "Primary" }];
      const mockCalendarList = {
        list: jest.fn().mockResolvedValue({ data: { items: mockCalendars } }),
      };
      const mockCalendar = { calendarList: mockCalendarList };

      jest
        .spyOn(GoogleIntegrationService, "createAuthenticatedClient")
        .mockResolvedValue(mockOAuth2Client as any);
      (google.calendar as jest.Mock).mockReturnValue(mockCalendar);

      const result = await GoogleIntegrationService.getCalendarList("user1");

      expect(result).toEqual(mockCalendars);
    });
  });

  describe("disconnectIntegration", () => {
    it("should delete integration from database", async () => {
      const mockDelete = jest.fn(() => ({
        where: jest.fn(),
      }));

      (db.delete as any).mockImplementation(mockDelete);

      await GoogleIntegrationService.disconnectIntegration("user1");

      expect(db.delete).toHaveBeenCalled();
      expect(mockDelete().where).toHaveBeenCalled();
    });
  });
});
