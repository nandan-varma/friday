import {
  CreateEventSchema,
  UpdateEventSchema,
  UpdateProfileSchema,
  UpdateSettingsSchema,
  AIChatMessageSchema,
  sanitizeString,
  sanitizeHtml,
  validateEventData,
  validateEventUpdate,
  validateProfileUpdate,
  validateSettingsUpdate,
  validateAIChat,
  ValidationError,
  handleValidationError,
} from "../../src/lib/validation";

describe("Validation Schemas", () => {
  describe("CreateEventSchema", () => {
    it("validates a correct event", () => {
      const data = {
        title: "Test Event",
        description: "Test Description",
        location: "Test Location",
        startTime: "2024-01-01T10:00:00Z",
        endTime: "2024-01-01T11:00:00Z",
        isAllDay: false,
        recurrence: "none" as const,
      };

      const result = CreateEventSchema.safeParse(data);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.title).toBe("Test Event");
        expect(result.data.startTime).toBeInstanceOf(Date);
        expect(result.data.endTime).toBeInstanceOf(Date);
      }
    });

    it("requires title", () => {
      const data = {
        startTime: "2024-01-01T10:00:00Z",
        endTime: "2024-01-01T11:00:00Z",
      };

      const result = CreateEventSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it("validates end time after start time", () => {
      const data = {
        title: "Test Event",
        startTime: "2024-01-01T11:00:00Z",
        endTime: "2024-01-01T10:00:00Z",
      };

      const result = CreateEventSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it("sanitizes strings", () => {
      const data = {
        title: "  Test Event  ",
        description: "  Test Description  ",
        location: "  Test Location  ",
        startTime: "2024-01-01T10:00:00Z",
        endTime: "2024-01-01T11:00:00Z",
      };

      const result = CreateEventSchema.safeParse(data);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.title).toBe("Test Event");
        expect(result.data.description).toBe("Test Description");
        expect(result.data.location).toBe("Test Location");
      }
    });
  });

  describe("UpdateEventSchema", () => {
    it("allows partial updates", () => {
      const data = {
        title: "Updated Title",
      };

      const result = UpdateEventSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it("validates when all fields provided", () => {
      const data = {
        title: "Updated Event",
        description: "Updated Description",
        location: "Updated Location",
        startTime: "2024-01-01T10:00:00Z",
        endTime: "2024-01-01T11:00:00Z",
        isAllDay: true,
        recurrence: "daily" as const,
      };

      const result = UpdateEventSchema.safeParse(data);
      expect(result.success).toBe(true);
    });
  });

  describe("UpdateProfileSchema", () => {
    it("validates correct profile data", () => {
      const data = {
        name: "John Doe",
        email: "john@example.com",
      };

      const result = UpdateProfileSchema.safeParse(data);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.email).toBe("john@example.com");
      }
    });

    it("validates email format", () => {
      const data = {
        email: "invalid-email",
      };

      const result = UpdateProfileSchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });

  describe("UpdateSettingsSchema", () => {
    it("validates correct settings", () => {
      const data = {
        timezone: "America/New_York",
        notificationsEnabled: true,
        aiSuggestionsEnabled: false,
        reminderTime: 30,
      };

      const result = UpdateSettingsSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it("validates reminder time range", () => {
      const data = {
        reminderTime: 1500, // > 1440
      };

      const result = UpdateSettingsSchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });

  describe("AIChatMessageSchema", () => {
    it("validates correct messages", () => {
      const data = {
        messages: [
          { role: "user", content: "Hello" },
          { role: "assistant", content: "Hi there" },
        ],
      };

      const result = AIChatMessageSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it("requires at least one message", () => {
      const data = {
        messages: [],
      };

      const result = AIChatMessageSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it("validates message content length", () => {
      const longContent = "a".repeat(10001);
      const data = {
        messages: [{ role: "user", content: longContent }],
      };

      const result = AIChatMessageSchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });

  describe("sanitizeString", () => {
    it("removes HTML tags", () => {
      expect(sanitizeString("<script>alert('xss')</script>")).toBe(
        "alert('xss')",
      );
    });

    it("removes javascript protocol", () => {
      expect(sanitizeString("javascript:alert('xss')")).toBe("alert('xss')");
    });

    it("removes event handlers", () => {
      expect(sanitizeString("onclick=alert('xss')")).toBe("alert('xss')");
    });

    it("trims whitespace", () => {
      expect(sanitizeString("  test  ")).toBe("test");
    });
  });

  describe("sanitizeHtml", () => {
    it("removes script tags", () => {
      expect(sanitizeHtml("<script>alert('xss')</script>")).toBe("");
    });

    it("removes iframe tags", () => {
      expect(sanitizeHtml("<iframe src='evil.com'></iframe>")).toBe("");
    });

    it("removes event handlers", () => {
      expect(sanitizeHtml("<div onclick=\"alert('xss')\">test</div>")).toBe(
        "<div >test</div>",
      );
    });
  });

  describe("Validation helper functions", () => {
    it("validateEventData works", () => {
      const result = validateEventData({
        title: "Test",
        startTime: "2024-01-01T10:00:00Z",
        endTime: "2024-01-01T11:00:00Z",
      });
      expect(result.success).toBe(true);
    });

    it("validateEventUpdate works", () => {
      const result = validateEventUpdate({ title: "Updated" });
      expect(result.success).toBe(true);
    });

    it("validateProfileUpdate works", () => {
      const result = validateProfileUpdate({ name: "John" });
      expect(result.success).toBe(true);
    });

    it("validateSettingsUpdate works", () => {
      const result = validateSettingsUpdate({ timezone: "UTC" });
      expect(result.success).toBe(true);
    });

    it("validateAIChat works", () => {
      const result = validateAIChat({
        messages: [{ role: "user", content: "Hello" }],
      });
      expect(result.success).toBe(true);
    });
  });

  describe("ValidationError", () => {
    it("creates error with message and field", () => {
      const error = new ValidationError("Test error", "title");
      expect(error.message).toBe("Test error");
      expect(error.field).toBe("title");
      expect(error.name).toBe("ValidationError");
    });
  });

  describe("handleValidationError", () => {
    it("converts ZodError to ValidationError", () => {
      const zodError = CreateEventSchema.safeParse({});
      if (!zodError.success) {
        const validationError = handleValidationError(zodError.error);
        expect(validationError).toBeInstanceOf(ValidationError);
        expect(validationError.field).toBeDefined();
      }
    });
  });
});
