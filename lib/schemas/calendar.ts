import { z } from "zod";

const dateTime = z
  .string()
  .refine((value) => !Number.isNaN(Date.parse(value)), "Invalid ISO date");

const calendarEventFields = z.object({
  calendarId: z.string().min(1),
  summary: z.string().trim().min(1).max(500),
  description: z.string().trim().max(10_000).optional(),
  location: z.string().trim().max(1_000).optional(),
  start: dateTime,
  end: dateTime,
  attendees: z.array(z.string().email()).max(200).default([]),
  allDay: z.boolean().optional(),
  timeZone: z.string().optional(),
});

export const calendarEventInputSchema = calendarEventFields.superRefine(
  ({ start, end }, context) => {
    if (new Date(end) <= new Date(start)) {
      context.addIssue({
        code: "custom",
        path: ["end"],
        message: "End must be after start",
      });
    }
  },
);

export const calendarEventUpdateSchema = calendarEventFields
  .omit({ calendarId: true, summary: true, attendees: true })
  .extend({
    summary: z.string().trim().min(1).max(500).optional(),
    attendees: z.array(z.string().email()).max(200).optional(),
  })
  .partial()
  .superRefine(({ start, end }, context) => {
    if ((start === undefined) !== (end === undefined)) {
      context.addIssue({
        code: "custom",
        path: ["start"],
        message: "Start and end must be updated together",
      });
    }
    if (start && end && new Date(end) <= new Date(start)) {
      context.addIssue({
        code: "custom",
        path: ["end"],
        message: "End must be after start",
      });
    }
  })
  .refine((updates) => Object.keys(updates).length > 0, {
    message: "At least one event field must be updated",
  });

export const calendarSelectionSchema = z.object({
  calendarIds: z.array(z.string().min(1)).max(100),
});

export const eventMutationSchema = z.object({
  eventId: z.string().min(1),
  calendarId: z.string().min(1),
});

export const calendarEventResponseSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().optional(),
  start: dateTime,
  end: dateTime,
  calendarId: z.string(),
  color: z.string(),
  location: z.string().optional(),
  attendees: z.array(z.string()).optional(),
  htmlLink: z.string().optional(),
  editable: z.boolean().optional(),
  allDay: z.boolean().optional(),
  recurringEventId: z.string().optional(),
});

export type CalendarEventResponse = z.infer<typeof calendarEventResponseSchema>;
