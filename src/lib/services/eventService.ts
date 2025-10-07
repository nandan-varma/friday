import "server-only";

import { openai } from "@ai-sdk/openai";
import { generateObject } from "ai";
import { z } from "zod";
import {
  GoogleIntegrationService,
  GoogleCalendarEvent,
} from "./googleIntegrationService";
import {
  LocalIntegrationService,
  CreateEventData,
  UpdateEventData,
  EventFilters,
  LocalEvent,
} from "./localIntegrationService";
import logger from "../logger";

export type EventOrigin = "local" | "google";

export interface UnifiedEvent {
  id: string;
  title: string;
  description?: string | null;
  location?: string | null;
  startTime: Date;
  endTime: Date;
  isAllDay: boolean;
  recurrence?: "none" | "daily" | "weekly" | "monthly" | "yearly";
  origin: EventOrigin;
  originalId?: string | number; // Store the original ID from source
  googleEventId?: string; // For Google events
  attendees?: Array<{
    email?: string;
    displayName?: string;
    responseStatus?: string;
  }>;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CombinedEventFilters extends EventFilters {
  includeLocal?: boolean;
  includeGoogle?: boolean;
  calendarId?: string; // For Google Calendar filtering
}

export class EventService {
  /**
   * Validate event ID format
   */
  private static validateEventId(eventId: string): {
    type: "local" | "google";
    id: string | number;
  } {
    if (eventId.startsWith("local_")) {
      const localIdStr = eventId.replace("local_", "");
      const localId = parseInt(localIdStr, 10);
      if (isNaN(localId) || localId <= 0) {
        throw new Error("Invalid local event ID format");
      }
      return { type: "local", id: localId };
    } else if (eventId.startsWith("google_")) {
      const googleId = eventId.replace("google_", "");
      if (!googleId || googleId.trim() === "") {
        throw new Error("Invalid Google event ID format");
      }
      return { type: "google", id: googleId };
    } else {
      throw new Error("Invalid event ID format");
    }
  }

  // ============================================
  // AI-POWERED EVENT CREATION
  // ============================================

  /**
   * Create event from natural language input
   */
  static async createEventFromNaturalLanguage(userId: string, input: string) {
    try {
      const { object } = await generateObject({
        model: openai("gpt-4o-mini"),
        schema: z.object({
          title: z.string().describe("The title of the event"),
          description: z
            .string()
            .optional()
            .describe("A description of the event"),
          location: z.string().optional().describe("The location of the event"),
          date: z
            .string()
            .describe("The date of the event in YYYY-MM-DD format"), // YYYY-MM-DD format
          startTime: z
            .string()
            .describe("The start time of the event in HH:MM format"), // HH:MM format
          endTime: z
            .string()
            .describe("The end time of the event in HH:MM format"), // HH:MM format
          isAllDay: z.boolean().describe("Whether the event is all day"),
        }),
        prompt: `Parse the following natural language input into a calendar event: "${input}"`,
      });

      return await LocalIntegrationService.createEvent(userId, {
        title: object.title,
        description: object.description,
        location: object.location,
        startTime: new Date(`${object.date}T${object.startTime}`),
        endTime: new Date(`${object.date}T${object.endTime}`),
        isAllDay: object.isAllDay,
      });
    } catch (error) {
      logger.error(
        { err: error },
        "Error creating event from natural language",
      );
      throw new Error("Failed to create event from natural language");
    }
  }

  // ============================================
  // UNIFIED EVENT FORMATTING
  // ============================================

  /**
   * Format local database event to unified event format
   */
  private static async formatLocalEvent(
    event: LocalEvent,
  ): Promise<UnifiedEvent> {
    return {
      id: `local_${event.id}`,
      title: event.title,
      description: event.description,
      location: event.location,
      startTime: new Date(event.startTime),
      endTime: new Date(event.endTime),
      isAllDay: event.isAllDay || false,
      recurrence: event.recurrence || "none",
      origin: "local" as EventOrigin,
      originalId: event.id,
      createdAt: event.createdAt ? new Date(event.createdAt) : undefined,
      updatedAt: event.updatedAt ? new Date(event.updatedAt) : undefined,
    };
  }

  /**
   * Format Google Calendar event to unified event format
   */
  private static async formatGoogleEvent(
    event: GoogleCalendarEvent,
  ): Promise<UnifiedEvent> {
    const startTime = event.start?.dateTime
      ? new Date(event.start.dateTime)
      : event.start?.date
        ? new Date(event.start.date)
        : new Date();

    const isAllDay = !event.start?.dateTime && !!event.start?.date;

    const endTime = event.end?.dateTime
      ? new Date(event.end.dateTime)
      : event.end?.date
        ? new Date(event.end.date)
        : isAllDay
          ? new Date(startTime.getTime() + 24 * 60 * 60 * 1000) // Default 1 day for all-day events
          : new Date(startTime.getTime() + 60 * 60 * 1000); // Default 1 hour

    return {
      id: `google_${event.id}`,
      title: event.summary || "Untitled Event",
      description: event.description,
      location: event.location,
      startTime,
      endTime,
      isAllDay,
      origin: "google" as EventOrigin,
      originalId: event.id,
      googleEventId: event.id,
      attendees: event.attendees,
    };
  }

  // ============================================
  // COMPREHENSIVE EVENT OPERATIONS (Local + Google)
  // ============================================

  /**
   * Get all events from both local and Google Calendar with unified format
   */
  static async getAllEvents(
    userId: string,
    filters?: CombinedEventFilters,
  ): Promise<UnifiedEvent[]> {
    try {
      const includeLocal = filters?.includeLocal !== false;
      const includeGoogle = filters?.includeGoogle !== false;
      const allEvents: UnifiedEvent[] = [];

      // Fetch local events if enabled
      if (includeLocal) {
        const localEvents = await LocalIntegrationService.getEvents(
          userId,
          filters,
        );
        const formattedLocalEvents = await Promise.all(
          localEvents.map((event) => this.formatLocalEvent(event)),
        );
        allEvents.push(...formattedLocalEvents);
      }

      // Fetch Google Calendar events if enabled
      if (includeGoogle) {
        try {
          const hasIntegration =
            await GoogleIntegrationService.hasValidIntegration(userId);
          if (hasIntegration) {
            const googleOptions: {
              maxResults?: number;
              timeMin?: Date;
              timeMax?: Date;
              calendarId?: string;
            } = {};
            if (filters?.startDate)
              googleOptions.timeMin = new Date(filters.startDate);
            if (filters?.endDate)
              googleOptions.timeMax = new Date(filters.endDate);
            if (filters?.calendarId)
              googleOptions.calendarId = filters.calendarId;

            const googleEvents =
              await GoogleIntegrationService.getCalendarEvents(
                userId,
                googleOptions,
              );
            const formattedGoogleEvents = await Promise.all(
              googleEvents.map((event) => this.formatGoogleEvent(event)),
            );
            allEvents.push(...formattedGoogleEvents);
          }
        } catch (googleError) {
          logger.warn(
            { err: googleError },
            "Error fetching Google Calendar events",
          );
          // Continue without Google events instead of failing entirely
        }
      }

      // Sort all events by start time
      allEvents.sort((a, b) => a.startTime.getTime() - b.startTime.getTime());

      return allEvents;
    } catch (error) {
      logger.error({ err: error }, "Error fetching all events");
      throw new Error("Failed to fetch events");
    }
  }

  /**
   * Get today's events from both local and Google Calendar
   */
  static async getAllTodayEvents(
    userId: string,
    filters?: Pick<
      CombinedEventFilters,
      "includeLocal" | "includeGoogle" | "calendarId"
    >,
  ): Promise<UnifiedEvent[]> {
    try {
      const today = new Date();
      const startOfDay = new Date(today.setHours(0, 0, 0, 0));
      const endOfDay = new Date(today.setHours(23, 59, 59, 999));

      return await this.getAllEvents(userId, {
        ...filters,
        startDate: startOfDay,
        endDate: endOfDay,
      });
    } catch (error) {
      logger.error({ err: error }, "Error fetching today's events");
      throw new Error("Failed to fetch today's events");
    }
  }

  /**
   * Get upcoming events from both local and Google Calendar
   */
  static async getAllUpcomingEvents(
    userId: string,
    days: number = 7,
    limit?: number,
    offset?: number,
    filters?: Pick<
      CombinedEventFilters,
      "includeLocal" | "includeGoogle" | "calendarId"
    >,
  ): Promise<UnifiedEvent[]> {
    try {
      const now = new Date();
      const futureDate = new Date();
      futureDate.setDate(now.getDate() + days);

      const events = await this.getAllEvents(userId, {
        ...filters,
        startDate: now,
        endDate: futureDate,
      });

      // Apply offset and limit if specified
      let result = events;
      if (offset) {
        result = result.slice(offset);
      }
      if (limit) {
        result = result.slice(0, limit);
      }
      return result;
    } catch (error) {
      logger.error({ err: error }, "Error fetching upcoming events");
      throw new Error("Failed to fetch upcoming events");
    }
  }

  /**
   * Get events in a specific date range from both local and Google Calendar
   */
  static async getAllEventsInRange(
    userId: string,
    startDate: Date,
    endDate: Date,
    filters?: Pick<
      CombinedEventFilters,
      "includeLocal" | "includeGoogle" | "calendarId"
    >,
  ): Promise<UnifiedEvent[]> {
    try {
      return await this.getAllEvents(userId, {
        ...filters,
        startDate,
        endDate,
      });
    } catch (error) {
      logger.error({ err: error }, "Error fetching events in range");
      throw new Error("Failed to fetch events in date range");
    }
  }

  /**
   * Get events by origin type only
   */
  static async getEventsByOrigin(
    userId: string,
    origin: EventOrigin,
    filters?: EventFilters,
  ): Promise<UnifiedEvent[]> {
    try {
      if (origin === "local") {
        const localEvents = await LocalIntegrationService.getEvents(
          userId,
          filters,
        );
        return await Promise.all(
          localEvents.map((event) => this.formatLocalEvent(event)),
        );
      } else if (origin === "google") {
        const hasIntegration =
          await GoogleIntegrationService.hasValidIntegration(userId);
        if (!hasIntegration) {
          return [];
        }

        const googleOptions: {
          maxResults?: number;
          timeMin?: Date;
          timeMax?: Date;
          calendarId?: string;
        } = {};
        if (filters?.startDate)
          googleOptions.timeMin = new Date(filters.startDate);
        if (filters?.endDate) googleOptions.timeMax = new Date(filters.endDate);

        const googleEvents = await GoogleIntegrationService.getCalendarEvents(
          userId,
          googleOptions,
        );
        return await Promise.all(
          googleEvents.map((event) => this.formatGoogleEvent(event)),
        );
      }

      return [];
    } catch (error) {
      logger.error({ err: error }, `Error fetching ${origin} events`);
      throw new Error(`Failed to fetch ${origin} events`);
    }
  }

  /**
   * Search events across both local and Google Calendar
   */
  static async searchAllEvents(
    userId: string,
    searchTerm: string,
    filters?: CombinedEventFilters,
  ): Promise<UnifiedEvent[]> {
    try {
      const allEvents = await this.getAllEvents(userId, filters);

      const searchLower = searchTerm.toLowerCase();

      return allEvents.filter(
        (event) =>
          event.title.toLowerCase().includes(searchLower) ||
          (event.description &&
            event.description.toLowerCase().includes(searchLower)) ||
          (event.location &&
            event.location.toLowerCase().includes(searchLower)),
      );
    } catch (error) {
      logger.error({ err: error }, "Error searching events");
      throw new Error("Failed to search events");
    }
  }

  /**
   * Get event statistics across both calendars
   */
  static async getEventStatistics(
    userId: string,
    filters?: CombinedEventFilters,
  ): Promise<{
    totalEvents: number;
    localEvents: number;
    googleEvents: number;
    todayEvents: number;
    upcomingEvents: number;
    allDayEvents: number;
    recurringEvents: number;
  }> {
    try {
      const allEvents = await this.getAllEvents(userId, filters);
      const todayEvents = await this.getAllTodayEvents(userId, filters);
      const upcomingEvents = await this.getAllUpcomingEvents(
        userId,
        7,
        undefined,
        undefined,
        filters,
      );

      return {
        totalEvents: allEvents.length,
        localEvents: allEvents.filter((e) => e.origin === "local").length,
        googleEvents: allEvents.filter((e) => e.origin === "google").length,
        todayEvents: todayEvents.length,
        upcomingEvents: upcomingEvents.length,
        allDayEvents: allEvents.filter((e) => e.isAllDay).length,
        recurringEvents: allEvents.filter(
          (e) => e.recurrence && e.recurrence !== "none",
        ).length,
      };
    } catch (error) {
      logger.error({ err: error }, "Error getting event statistics");
      throw new Error("Failed to get event statistics");
    }
  }

  // ============================================
  // INTEGRATION STATUS METHODS
  // ============================================

  /**
   * Check if user has valid Google Calendar integration
   */
  static async hasGoogleIntegration(userId: string): Promise<boolean> {
    return GoogleIntegrationService.hasValidIntegration(userId);
  }

  /**
   * Get comprehensive integration status
   */
  static async getIntegrationStatus(userId: string): Promise<{
    hasLocalEvents: boolean;
    hasGoogleIntegration: boolean;
    totalIntegrations: number;
  }> {
    try {
      const [hasLocalEvents, hasGoogleIntegration] = await Promise.all([
        LocalIntegrationService.hasEvents(userId),
        GoogleIntegrationService.hasValidIntegration(userId),
      ]);

      return {
        hasLocalEvents,
        hasGoogleIntegration,
        totalIntegrations:
          (hasLocalEvents ? 1 : 0) + (hasGoogleIntegration ? 1 : 0),
      };
    } catch (error) {
      logger.error({ err: error }, "Error getting integration status");
      throw new Error("Failed to get integration status");
    }
  }

  // ============================================
  // UNIFIED EVENT SAVE/DELETE OPERATIONS
  // ============================================

  /**
   * Save an event (create or update) with unified handling
   */
  static async saveEvent(
    userId: string,
    eventData: CreateEventData | UpdateEventData,
    options?: {
      eventId?: string;
      preferredOrigin?: EventOrigin;
      calendarId?: string;
    },
  ): Promise<UnifiedEvent> {
    try {
      const { eventId, preferredOrigin = "local", calendarId } = options || {};

      if (eventId) {
        // Update existing event
        if (eventId.startsWith("local_")) {
          // Update existing local event
          const localId = parseInt(eventId.replace("local_", ""));
          const updatedEvent = await LocalIntegrationService.updateEvent(
            localId,
            userId,
            eventData as UpdateEventData,
          );
          return this.formatLocalEvent(updatedEvent);
        } else if (eventId.startsWith("google_")) {
          // Update existing Google event
          const googleId = eventId.replace("google_", "");

          // Validate that we have a valid Google event ID
          if (!googleId || googleId.trim() === "") {
            throw new Error("Invalid Google event ID");
          }

          const googleEventData: Record<string, unknown> = {};

          if (eventData.title !== undefined) {
            googleEventData.summary = eventData.title;
          }
          if (eventData.startTime !== undefined) {
            const isAllDay = eventData.isAllDay || false;
            googleEventData.start = isAllDay
              ? { date: eventData.startTime.toISOString().split("T")[0] }
              : { dateTime: eventData.startTime.toISOString() };
          }
          if (eventData.endTime !== undefined) {
            const isAllDay = eventData.isAllDay || false;
            googleEventData.end = isAllDay
              ? { date: eventData.endTime.toISOString().split("T")[0] }
              : { dateTime: eventData.endTime.toISOString() };
          }

          // Handle recurrence - Google Calendar expects RRULE format
          if (eventData.recurrence && eventData.recurrence !== "none") {
            googleEventData.recurrence = [
              `RRULE:FREQ=${eventData.recurrence.toUpperCase()}`,
            ];
          }

          // Only include optional fields if they have values
          if (
            eventData.description !== null &&
            eventData.description !== undefined &&
            eventData.description.trim() !== ""
          ) {
            googleEventData.description = eventData.description;
          }
          if (
            eventData.location !== null &&
            eventData.location !== undefined &&
            eventData.location.trim() !== ""
          ) {
            googleEventData.location = eventData.location;
          }

          logger.info(
            { googleId, googleEventData, calendarId },
            "Updating Google event",
          );

          const updatedEvent =
            await GoogleIntegrationService.updateCalendarEvent(
              userId,
              googleId,
              googleEventData,
              calendarId,
            );
          return this.formatGoogleEvent(updatedEvent);
        } else {
          throw new Error("Invalid event ID format");
        }
      } else {
        // Create new event
        if (
          preferredOrigin === "google" &&
          (await this.hasGoogleIntegration(userId))
        ) {
          const googleEventData: Record<string, unknown> = {
            summary: (eventData as CreateEventData).title,
            start: (eventData as CreateEventData).isAllDay
              ? {
                  date: (eventData as CreateEventData).startTime
                    .toISOString()
                    .split("T")[0],
                }
              : {
                  dateTime: (
                    eventData as CreateEventData
                  ).startTime.toISOString(),
                },
            end: (eventData as CreateEventData).isAllDay
              ? {
                  date: (eventData as CreateEventData).endTime
                    .toISOString()
                    .split("T")[0],
                }
              : {
                  dateTime: (
                    eventData as CreateEventData
                  ).endTime.toISOString(),
                },
          };

          // Handle recurrence - Google Calendar expects RRULE format
          if (eventData.recurrence && eventData.recurrence !== "none") {
            googleEventData.recurrence = [
              `RRULE:FREQ=${eventData.recurrence.toUpperCase()}`,
            ];
          }

          // Only include optional fields if they have values
          if (
            eventData.description !== null &&
            eventData.description !== undefined &&
            eventData.description.trim() !== ""
          ) {
            googleEventData.description = eventData.description;
          }
          if (
            eventData.location !== null &&
            eventData.location !== undefined &&
            eventData.location.trim() !== ""
          ) {
            googleEventData.location = eventData.location;
          }

          logger.info({ googleEventData, calendarId }, "Creating Google event");

          const createdEvent =
            await GoogleIntegrationService.createCalendarEvent(
              userId,
              googleEventData,
              calendarId,
            );
          return this.formatGoogleEvent(createdEvent);
        } else {
          const createdEvent = await LocalIntegrationService.createEvent(
            userId,
            eventData as CreateEventData,
          );
          return this.formatLocalEvent(createdEvent);
        }
      }
    } catch (error) {
      logger.error({ err: error, eventData, options }, "Error saving event");
      throw new Error(
        `Failed to save event: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  /**
   * Delete an event with unified handling
   */
  static async deleteEvent(
    userId: string,
    eventId: string,
    calendarId?: string,
  ): Promise<void> {
    try {
      const { type, id } = this.validateEventId(eventId);

      if (type === "local") {
        await LocalIntegrationService.deleteEvent(id as number, userId);
      } else if (type === "google") {
        await GoogleIntegrationService.deleteCalendarEvent(
          userId,
          id as string,
          calendarId,
        );
      }
    } catch (error) {
      logger.error({ err: error }, "Error deleting event");
      throw new Error("Failed to delete event");
    }
  }
}

export default EventService;
