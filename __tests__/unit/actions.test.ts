/* eslint-disable @typescript-eslint/no-require-imports, @typescript-eslint/no-explicit-any */
import {
  createEvent,
  updateEvent,
  deleteEvent,
  updateProfile,
  updateSettings,
  getProfileData,
  getUserProfileData,
  getUserSettingsData,
  getGoogleIntegration,
  connectGoogleCalendar,
  disconnectGoogleCalendar,
  logout,
} from "../../src/lib/actions";

// Mock dependencies
jest.mock("../../src/lib/auth", () => ({
  auth: {
    api: {
      getSession: jest.fn(),
      signOut: jest.fn(),
    },
  },
}));

jest.mock("../../src/lib/services/eventService", () => ({
  EventService: {
    saveEvent: jest.fn(),
    deleteEvent: jest.fn(),
  },
}));

jest.mock("../../src/lib/services/profileService", () => ({
  getUserProfile: jest.fn(),
  updateUserProfile: jest.fn(),
  getUserSettings: jest.fn(),
  updateUserSettings: jest.fn(),
}));

jest.mock("../../src/lib/services/googleIntegrationService", () => ({
  GoogleIntegrationService: {
    getAuthUrl: jest.fn(),
    disconnectIntegration: jest.fn(),
    getUserIntegration: jest.fn(),
  },
}));

jest.mock("next/cache", () => ({
  revalidatePath: jest.fn(),
}));

jest.mock("next/navigation", () => ({
  redirect: jest.fn(),
}));

jest.mock("next/headers", () => ({
  headers: jest.fn(() => new Headers()),
}));

const mockAuth = require("../../src/lib/auth") as any;
const mockEventService = require("../../src/lib/services/eventService") as any;
const mockProfileService =
  require("../../src/lib/services/profileService") as any;
const mockGoogleService =
  require("../../src/lib/services/googleIntegrationService") as any;
const mockCache = require("next/cache") as any;
const mockNavigation = require("next/navigation") as any;

describe("Actions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("createEvent", () => {
    it("should create event successfully", async () => {
      const mockUser = { id: "user-123" };
      const mockFormData = new FormData();
      mockFormData.append("title", "Test Event");
      mockFormData.append("startTime", "2024-01-01T10:00:00Z");
      mockFormData.append("endTime", "2024-01-01T11:00:00Z");

      mockAuth.auth.api.getSession.mockResolvedValue({ user: mockUser });
      mockEventService.EventService.saveEvent.mockResolvedValue({});

      await expect(createEvent(mockFormData)).resolves.toBeUndefined();

      expect(mockEventService.EventService.saveEvent).toHaveBeenCalledWith(
        "user-123",
        expect.objectContaining({
          title: "Test Event",
          startTime: new Date("2024-01-01T10:00:00Z"),
          endTime: new Date("2024-01-01T11:00:00Z"),
          isAllDay: false,
          recurrence: "none",
        }),
      );
      expect(mockCache.revalidatePath).toHaveBeenCalledWith("/dashboard");
    });

    it("should throw error when user not authenticated", async () => {
      const mockFormData = new FormData();
      mockFormData.append("title", "Test Event");
      mockFormData.append("startTime", "2024-01-01T10:00:00Z");
      mockFormData.append("endTime", "2024-01-01T11:00:00Z");

      mockAuth.auth.api.getSession.mockResolvedValue(null);

      await expect(createEvent(mockFormData)).rejects.toThrow("Unauthorized");
    });

    it("should throw error when title is missing", async () => {
      const mockUser = { id: "user-123" };
      const mockFormData = new FormData();
      mockFormData.append("startTime", "2024-01-01T10:00:00Z");
      mockFormData.append("endTime", "2024-01-01T11:00:00Z");

      mockAuth.auth.api.getSession.mockResolvedValue({ user: mockUser });

      await expect(createEvent(mockFormData)).rejects.toThrow(
        "Title is required",
      );
    });

    it("should handle validation error", async () => {
      const mockUser = { id: "user-123" };
      const mockFormData = new FormData();
      mockFormData.append("title", "Test Event");
      mockFormData.append("startTime", "2024-01-01T11:00:00Z");
      mockFormData.append("endTime", "2024-01-01T10:00:00Z");

      mockAuth.auth.api.getSession.mockResolvedValue({ user: mockUser });

      await expect(createEvent(mockFormData)).rejects.toThrow(
        "End time must be after start time",
      );
    });
  });

  describe("updateEvent", () => {
    it("should update event successfully", async () => {
      const mockUser = { id: "user-123" };
      const mockFormData = new FormData();
      mockFormData.append("eventId", "event-1");
      mockFormData.append("title", "Updated Event");
      mockFormData.append("startTime", "2024-01-01T10:00:00Z");
      mockFormData.append("endTime", "2024-01-01T11:00:00Z");

      mockAuth.auth.api.getSession.mockResolvedValue({ user: mockUser });
      mockEventService.EventService.saveEvent.mockResolvedValue({});

      await expect(updateEvent(mockFormData)).resolves.toBeUndefined();

      expect(mockEventService.EventService.saveEvent).toHaveBeenCalled();
      expect(mockCache.revalidatePath).toHaveBeenCalledWith("/dashboard");
    });

    it("should throw error when eventId is missing", async () => {
      const mockUser = { id: "user-123" };
      const mockFormData = new FormData();
      mockFormData.append("title", "Updated Event");
      mockFormData.append("startTime", "2024-01-01T10:00:00Z");
      mockFormData.append("endTime", "2024-01-01T11:00:00Z");

      mockAuth.auth.api.getSession.mockResolvedValue({ user: mockUser });

      await expect(updateEvent(mockFormData)).rejects.toThrow(
        "Event ID is required",
      );
    });
  });

  describe("deleteEvent", () => {
    it("should delete event successfully", async () => {
      const mockUser = { id: "user-123" };
      const mockFormData = new FormData();
      mockFormData.append("eventId", "event-1");

      mockAuth.auth.api.getSession.mockResolvedValue({ user: mockUser });
      mockEventService.EventService.deleteEvent.mockResolvedValue(undefined);

      await expect(deleteEvent(mockFormData)).resolves.toBeUndefined();

      expect(mockEventService.EventService.deleteEvent).toHaveBeenCalledWith(
        "user-123",
        "event-1",
      );
      expect(mockCache.revalidatePath).toHaveBeenCalledWith("/dashboard");
    });
  });

  describe("updateProfile", () => {
    it("should update profile successfully", async () => {
      const mockUser = { id: "user-123" };
      const mockFormData = new FormData();
      mockFormData.append("name", "John Doe");
      mockFormData.append("email", "john@example.com");

      mockAuth.auth.api.getSession.mockResolvedValue({ user: mockUser });
      mockProfileService.updateUserProfile.mockResolvedValue(undefined);

      await expect(updateProfile(mockFormData)).resolves.toBeUndefined();

      expect(mockProfileService.updateUserProfile).toHaveBeenCalledWith(
        "user-123",
        {
          name: "John Doe",
          email: "john@example.com",
        },
      );
      expect(mockCache.revalidatePath).toHaveBeenCalledWith("/dashboard");
    });

    it("should validate name length", async () => {
      const mockUser = { id: "user-123" };
      const mockFormData = new FormData();
      mockFormData.append("name", "A");

      mockAuth.auth.api.getSession.mockResolvedValue({ user: mockUser });

      await expect(updateProfile(mockFormData)).rejects.toThrow(
        "Name must be at least 2 characters long",
      );
    });
  });

  describe("updateSettings", () => {
    it("should update settings successfully", async () => {
      const mockUser = { id: "user-123" };
      const mockFormData = new FormData();
      mockFormData.append("timezone", "UTC");
      mockFormData.append("notificationsEnabled", "true");
      mockFormData.append("reminderTime", "30");

      mockAuth.auth.api.getSession.mockResolvedValue({ user: mockUser });
      mockProfileService.updateUserSettings.mockResolvedValue(undefined);

      await expect(updateSettings(mockFormData)).resolves.toBeUndefined();

      expect(mockProfileService.updateUserSettings).toHaveBeenCalledWith(
        "user-123",
        {
          timezone: "UTC",
          notificationsEnabled: true,
          aiSuggestionsEnabled: false,
          reminderTime: 30,
        },
      );
    });
  });

  describe("getProfileData", () => {
    it("should return profile data", async () => {
      const mockUser = { id: "user-123" };
      const mockProfile = { name: "John" };
      const mockSettings = { timezone: "UTC" };
      const mockIntegration = { connected: true };

      mockAuth.auth.api.getSession.mockResolvedValue({ user: mockUser });
      mockProfileService.getUserProfile.mockResolvedValue(mockProfile);
      mockProfileService.getUserSettings.mockResolvedValue(mockSettings);
      mockGoogleService.GoogleIntegrationService.getUserIntegration.mockResolvedValue(
        mockIntegration,
      );

      const result = await getProfileData();

      expect(result).toEqual({
        profile: mockProfile,
        settings: mockSettings,
        googleIntegration: mockIntegration,
      });
    });
  });

  describe("getUserProfileData", () => {
    it("should return user profile", async () => {
      const mockUser = { id: "user-123" };
      const mockProfile = { name: "John" };

      mockAuth.auth.api.getSession.mockResolvedValue({ user: mockUser });
      mockProfileService.getUserProfile.mockResolvedValue(mockProfile);

      const result = await getUserProfileData();

      expect(result).toBe(mockProfile);
    });

    it("should return null when not authenticated", async () => {
      mockAuth.auth.api.getSession.mockResolvedValue(null);

      const result = await getUserProfileData();

      expect(result).toBeNull();
    });
  });

  describe("getUserSettingsData", () => {
    it("should return user settings", async () => {
      const mockUser = { id: "user-123" };
      const mockSettings = { timezone: "UTC" };

      mockAuth.auth.api.getSession.mockResolvedValue({ user: mockUser });
      mockProfileService.getUserSettings.mockResolvedValue(mockSettings);

      const result = await getUserSettingsData();

      expect(result).toBe(mockSettings);
    });
  });

  describe("getGoogleIntegration", () => {
    it("should return Google integration", async () => {
      const mockUser = { id: "user-123" };
      const mockIntegration = { connected: true };

      mockAuth.auth.api.getSession.mockResolvedValue({ user: mockUser });
      mockGoogleService.GoogleIntegrationService.getUserIntegration.mockResolvedValue(
        mockIntegration,
      );

      const result = await getGoogleIntegration();

      expect(result).toBe(mockIntegration);
    });
  });

  describe("connectGoogleCalendar", () => {
    it("should redirect to auth URL", async () => {
      const mockUrl = "https://accounts.google.com/oauth/authorize";
      mockGoogleService.GoogleIntegrationService.getAuthUrl.mockResolvedValue({
        url: mockUrl,
      });

      await connectGoogleCalendar();

      expect(mockNavigation.redirect).toHaveBeenCalledWith(mockUrl);
    });
  });

  describe("disconnectGoogleCalendar", () => {
    it("should disconnect integration", async () => {
      const mockUser = { id: "user-123" };

      mockAuth.auth.api.getSession.mockResolvedValue({ user: mockUser });
      mockGoogleService.GoogleIntegrationService.disconnectIntegration.mockResolvedValue(
        undefined,
      );

      await expect(disconnectGoogleCalendar()).resolves.toBeUndefined();

      expect(
        mockGoogleService.GoogleIntegrationService.disconnectIntegration,
      ).toHaveBeenCalledWith("user-123");
      expect(mockCache.revalidatePath).toHaveBeenCalledWith("/dashboard");
    });
  });

  describe("logout", () => {
    it("should sign out user", async () => {
      mockAuth.auth.api.signOut.mockResolvedValue(undefined);

      await expect(logout()).resolves.toBeUndefined();

      expect(mockAuth.auth.api.signOut).toHaveBeenCalled();
    });
  });
});
