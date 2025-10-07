import {
  sanitizeErrorMessage,
  createErrorResponse,
  createSuccessResponse,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
} from "../../src/lib/error";

describe("Error Utilities", () => {
  describe("sanitizeErrorMessage", () => {
    it("should sanitize ValidationError", () => {
      const error = new ValidationError("Invalid input", "title");
      const result = sanitizeErrorMessage(error);

      expect(result).toEqual({
        message: "Invalid input",
        code: "VALIDATION_ERROR",
        field: "title",
      });
    });

    it("should categorize authentication errors", () => {
      const error = new Error("User not authenticated");
      const result = sanitizeErrorMessage(error);

      expect(result).toEqual({
        message: "Authentication failed",
        code: "AUTHENTICATION_ERROR",
      });
    });

    it("should categorize authorization errors", () => {
      const error = new Error("Access denied");
      const result = sanitizeErrorMessage(error);

      expect(result).toEqual({
        message: "Access denied",
        code: "AUTHORIZATION_ERROR",
      });
    });

    it("should categorize not found errors", () => {
      const error = new Error("User not found");
      const result = sanitizeErrorMessage(error);

      expect(result).toEqual({
        message: "Resource not found",
        code: "NOT_FOUND",
      });
    });

    it("should categorize database errors", () => {
      const error = new Error("Database connection failed");
      const result = sanitizeErrorMessage(error);

      expect(result).toEqual({
        message: "Database operation failed",
        code: "DATABASE_ERROR",
      });
    });

    it("should redact sensitive information", () => {
      const error = new Error("Invalid password token");
      const result = sanitizeErrorMessage(error);

      expect(result).toEqual({
        message: "An internal error occurred",
        code: "INTERNAL_ERROR",
      });
    });

    it("should return generic message for unknown errors", () => {
      const error = new Error("Some random error");
      const result = sanitizeErrorMessage(error);

      expect(result).toEqual({
        message: "Some random error",
        code: "INTERNAL_ERROR",
      });
    });

    it("should handle non-Error objects", () => {
      const error = "String error";
      const result = sanitizeErrorMessage(error);

      expect(result).toEqual({
        message: "An unexpected error occurred",
        code: "INTERNAL_ERROR",
      });
    });
  });

  describe("createErrorResponse", () => {
    it("should create error response with default status", () => {
      const error = new Error("Test error");
      const response = createErrorResponse(error);

      expect(response.status).toBe(500);
      expect(response.headers.get("Content-Type")).toBe("application/json");
    });

    it("should create error response with custom status", () => {
      const error = new Error("Test error");
      const response = createErrorResponse(error, 400);

      expect(response.status).toBe(400);
    });
  });

  describe("createSuccessResponse", () => {
    it("should create success response", () => {
      const data = { success: true };
      const response = createSuccessResponse(data);

      expect(response.status).toBe(200);
      expect(response.headers.get("Content-Type")).toBe("application/json");
    });

    it("should create success response with custom status", () => {
      const data = { created: true };
      const response = createSuccessResponse(data, 201);

      expect(response.status).toBe(201);
    });
  });

  describe("Custom Error Classes", () => {
    it("ValidationError should have field property", () => {
      const error = new ValidationError("Invalid", "email");

      expect(error.message).toBe("Invalid");
      expect(error.field).toBe("email");
      expect(error.name).toBe("ValidationError");
    });

    it("AuthenticationError should have default message", () => {
      const error = new AuthenticationError();

      expect(error.message).toBe("Authentication required");
      expect(error.name).toBe("AuthenticationError");
    });

    it("AuthorizationError should have default message", () => {
      const error = new AuthorizationError();

      expect(error.message).toBe("Access denied");
      expect(error.name).toBe("AuthorizationError");
    });

    it("NotFoundError should format message", () => {
      const error = new NotFoundError("User");

      expect(error.message).toBe("User not found");
      expect(error.name).toBe("NotFoundError");
    });
  });
});
