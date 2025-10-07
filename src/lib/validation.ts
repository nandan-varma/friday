/**
 * Input validation and sanitization utilities
 */

import { z } from "zod";

// Event validation schemas
export const CreateEventSchema = z
  .object({
    title: z
      .string()
      .min(1, "Title is required")
      .max(200, "Title must be less than 200 characters")
      .trim(),
    description: z
      .string()
      .max(1000, "Description must be less than 1000 characters")
      .optional()
      .nullable()
      .transform((val) => val?.trim() || null),
    location: z
      .string()
      .max(500, "Location must be less than 500 characters")
      .optional()
      .nullable()
      .transform((val) => val?.trim() || null),
    startTime: z
      .string()
      .refine((val) => !isNaN(Date.parse(val)), "Invalid start time")
      .transform((val) => new Date(val)),
    endTime: z
      .string()
      .refine((val) => !isNaN(Date.parse(val)), "Invalid end time")
      .transform((val) => new Date(val)),
    isAllDay: z.boolean().default(false),
    recurrence: z
      .enum(["none", "daily", "weekly", "monthly", "yearly"])
      .default("none"),
  })
  .refine((data) => data.endTime > data.startTime, {
    message: "End time must be after start time",
    path: ["endTime"],
  });

export const UpdateEventSchema = CreateEventSchema.partial()
  .omit({ title: true })
  .extend({
    title: z
      .string()
      .min(1, "Title is required")
      .max(200, "Title must be less than 200 characters")
      .trim()
      .optional(),
  });

// Profile validation schemas
export const UpdateProfileSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be less than 100 characters")
    .trim()
    .optional(),
  email: z
    .string()
    .email("Invalid email format")
    .max(254, "Email must be less than 254 characters")
    .toLowerCase()
    .trim()
    .optional(),
});

// Settings validation schemas
export const UpdateSettingsSchema = z.object({
  timezone: z
    .string()
    .min(1, "Timezone is required")
    .max(50, "Timezone must be less than 50 characters")
    .optional(),
  notificationsEnabled: z.boolean().optional(),
  aiSuggestionsEnabled: z.boolean().optional(),
  reminderTime: z
    .number()
    .min(0, "Reminder time must be non-negative")
    .max(1440, "Reminder time must be less than 24 hours")
    .optional(),
});

// AI Chat validation
export const AIChatMessageSchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z
          .string()
          .min(1, "Message content is required")
          .max(10000, "Message too long") // Reasonable limit for AI chat
          .trim(),
      }),
    )
    .min(1, "At least one message required"),
});

// Sanitization functions
export function sanitizeString(input: string): string {
  return input
    .replace(/[<>]/g, "") // Remove potential HTML tags
    .replace(/javascript:/gi, "") // Remove javascript: protocol
    .replace(/on\w+=/gi, "") // Remove event handlers
    .trim();
}

export function sanitizeHtml(input: string): string {
  // Basic HTML sanitization - remove script tags and dangerous attributes
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, "")
    .replace(/on\w+="[^"]*"/gi, "")
    .replace(/javascript:[^"]*/gi, "");
}

// Validation helper functions
export function validateEventData(data: unknown) {
  return CreateEventSchema.safeParse(data);
}

export function validateEventUpdate(data: unknown) {
  return UpdateEventSchema.safeParse(data);
}

export function validateProfileUpdate(data: unknown) {
  return UpdateProfileSchema.safeParse(data);
}

export function validateSettingsUpdate(data: unknown) {
  return UpdateSettingsSchema.safeParse(data);
}

export function validateAIChat(data: unknown) {
  return AIChatMessageSchema.safeParse(data);
}

// Error handling for validation
export class ValidationError extends Error {
  constructor(
    message: string,
    public field?: string,
  ) {
    super(message);
    this.name = "ValidationError";
  }
}

export function handleValidationError(error: z.ZodError): ValidationError {
  const firstError = error.issues[0];
  return new ValidationError(firstError.message, firstError.path.join("."));
}
