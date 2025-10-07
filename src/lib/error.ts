/**
 * Error handling utilities for consistent error responses
 */

import logger from "@/lib/logger";

export interface SafeError {
  message: string;
  code?: string;
  field?: string;
}

// List of sensitive patterns that should be redacted from error messages
const SENSITIVE_PATTERNS = [
  /password/i,
  /token/i,
  /secret/i,
  /key/i,
  /auth/i,
  /credential/i,
  /database/i,
  /connection/i,
  /sql/i,
  /env/i,
  /config/i,
  /private/i,
  /internal/i,
];

// Generic error messages for different error types
const GENERIC_MESSAGES = {
  VALIDATION_ERROR: "Invalid input data provided",
  AUTHENTICATION_ERROR: "Authentication failed",
  AUTHORIZATION_ERROR: "Access denied",
  NOT_FOUND: "Resource not found",
  CONFLICT: "Resource conflict",
  RATE_LIMITED: "Too many requests",
  EXTERNAL_SERVICE_ERROR: "External service temporarily unavailable",
  DATABASE_ERROR: "Database operation failed",
  INTERNAL_ERROR: "An internal error occurred",
} as const;

export function sanitizeErrorMessage(error: unknown): SafeError {
  let message = "An unexpected error occurred";
  let code = "INTERNAL_ERROR";
  let field: string | undefined;

  if (error instanceof Error) {
    // Check if it's a custom validation error
    if ("field" in error) {
      code = "VALIDATION_ERROR";
      field = (error as { field?: string }).field;
      message = error.message;
    } else {
      // Categorize the error based on its message
      const errorMessage = error.message.toLowerCase();

      if (
        errorMessage.includes("unauthorized") ||
        errorMessage.includes("not authenticated")
      ) {
        code = "AUTHENTICATION_ERROR";
        message = GENERIC_MESSAGES.AUTHENTICATION_ERROR;
      } else if (
        errorMessage.includes("forbidden") ||
        errorMessage.includes("access denied")
      ) {
        code = "AUTHORIZATION_ERROR";
        message = GENERIC_MESSAGES.AUTHORIZATION_ERROR;
      } else if (errorMessage.includes("not found")) {
        code = "NOT_FOUND";
        message = GENERIC_MESSAGES.NOT_FOUND;
      } else if (
        errorMessage.includes("conflict") ||
        errorMessage.includes("already exists")
      ) {
        code = "CONFLICT";
        message = GENERIC_MESSAGES.CONFLICT;
      } else if (
        errorMessage.includes("rate limit") ||
        errorMessage.includes("too many")
      ) {
        code = "RATE_LIMITED";
        message = GENERIC_MESSAGES.RATE_LIMITED;
      } else if (
        errorMessage.includes("google") ||
        errorMessage.includes("external")
      ) {
        code = "EXTERNAL_SERVICE_ERROR";
        message = GENERIC_MESSAGES.EXTERNAL_SERVICE_ERROR;
      } else if (
        errorMessage.includes("database") ||
        errorMessage.includes("sql")
      ) {
        code = "DATABASE_ERROR";
        message = GENERIC_MESSAGES.DATABASE_ERROR;
      } else {
        // For unknown errors, check if they contain sensitive information
        const containsSensitive = SENSITIVE_PATTERNS.some((pattern) =>
          pattern.test(error.message),
        );

        if (containsSensitive) {
          message = GENERIC_MESSAGES.INTERNAL_ERROR;
        } else {
          message = error.message;
        }
      }
    }
  }

  return { message, code, field };
}

export function createErrorResponse(
  error: unknown,
  statusCode: number = 500,
): Response {
  const safeError = sanitizeErrorMessage(error);

  // Don't log sensitive errors in production
  if (process.env.NODE_ENV !== "production") {
    logger.error({ err: error }, "Error details");
  }

  return new Response(JSON.stringify(safeError), {
    status: statusCode,
    headers: {
      "Content-Type": "application/json",
    },
  });
}

export function createSuccessResponse(
  data: unknown,
  statusCode: number = 200,
): Response {
  return new Response(JSON.stringify(data), {
    status: statusCode,
    headers: {
      "Content-Type": "application/json",
    },
  });
}

// Custom error classes
export class ValidationError extends Error {
  constructor(
    message: string,
    public field?: string,
  ) {
    super(message);
    this.name = "ValidationError";
  }
}

export class AuthenticationError extends Error {
  constructor(message: string = "Authentication required") {
    super(message);
    this.name = "AuthenticationError";
  }
}

export class AuthorizationError extends Error {
  constructor(message: string = "Access denied") {
    super(message);
    this.name = "AuthorizationError";
  }
}

export class NotFoundError extends Error {
  constructor(resource: string = "Resource") {
    super(`${resource} not found`);
    this.name = "NotFoundError";
  }
}
