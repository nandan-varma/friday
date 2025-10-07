import "server-only";

import { db } from "@/lib/db";
import { events, user } from "@/lib/db/schema";
import { eq, and, gte, lte } from "drizzle-orm";
import logger from "@/lib/logger";

export interface CreateEventData {
  title: string;
  description?: string | null;
  location?: string | null;
  startTime: Date;
  endTime: Date;
  isAllDay?: boolean;
  recurrence?: "none" | "daily" | "weekly" | "monthly" | "yearly";
}

export interface UpdateEventData {
  title?: string;
  description?: string | null;
  location?: string | null;
  startTime?: Date;
  endTime?: Date;
  isAllDay?: boolean;
  recurrence?: "none" | "daily" | "weekly" | "monthly" | "yearly";
}

export interface EventFilters {
  startDate?: string | Date;
  endDate?: string | Date;
  limit?: number;
  offset?: number;
}

export interface LocalEvent {
  id: number;
  userId: string;
  title: string;
  description?: string | null;
  location?: string | null;
  startTime: Date;
  endTime: Date;
  isAllDay: boolean;
  recurrence?: "none" | "daily" | "weekly" | "monthly" | "yearly";
  createdAt?: Date;
  updatedAt?: Date;
}

export class LocalIntegrationService {
  /**
   * Get all local events for a user with optional date filtering
   */
  static async getEvents(
    userId: string,
    filters?: EventFilters,
  ): Promise<LocalEvent[]> {
    try {
      const conditions = [eq(events.userId, userId)];

      if (filters?.startDate) {
        conditions.push(gte(events.startTime, new Date(filters.startDate)));
      }

      if (filters?.endDate) {
        conditions.push(lte(events.endTime, new Date(filters.endDate)));
      }

      const baseQuery = db
        .select()
        .from(events)
        .where(and(...conditions))
        .orderBy(events.startTime);

      const queryWithOffset = filters?.offset
        ? baseQuery.offset(filters.offset)
        : baseQuery;
      const finalQuery = filters?.limit
        ? queryWithOffset.limit(filters.limit)
        : queryWithOffset;

      const userEvents = await finalQuery;

      return userEvents as unknown as LocalEvent[];
    } catch (error) {
      logger.error({ err: error }, "Error fetching local events");
      throw new Error("Failed to fetch local events");
    }
  }

  /**
   * Get a single local event by ID for a specific user
   */
  static async getEventById(
    eventId: number,
    userId: string,
  ): Promise<LocalEvent> {
    try {
      const event = await db.query.events.findFirst({
        where: and(eq(events.id, eventId), eq(events.userId, userId)),
      });

      if (!event) {
        throw new Error("Event not found");
      }

      return event as unknown as LocalEvent;
    } catch (error) {
      logger.error({ err: error }, "Error fetching local event");
      throw new Error("Failed to fetch local event");
    }
  } /**
   * Create a new local event for a user
   */
  static async createEvent(
    userId: string,
    eventData: CreateEventData,
  ): Promise<LocalEvent> {
    try {
      // Validate that user exists
      const userExists = await db
        .select({ id: user.id })
        .from(user)
        .where(eq(user.id, userId))
        .limit(1);

      if (userExists.length === 0) {
        throw new Error("User not found");
      }

      const [newEvent] = await db
        .insert(events)
        .values({
          userId,
          title: eventData.title,
          description: eventData.description || null,
          location: eventData.location || null,
          startTime: new Date(eventData.startTime),
          endTime: new Date(eventData.endTime),
          isAllDay: eventData.isAllDay || false,
          recurrence: eventData.recurrence || "none",
        })
        .returning();

      return newEvent as unknown as LocalEvent;
    } catch (error) {
      logger.error({ err: error }, "Error creating local event");
      throw new Error("Failed to create local event");
    }
  } /**
   * Update an existing local event
   */
  static async updateEvent(
    eventId: number,
    userId: string,
    eventData: UpdateEventData,
  ): Promise<LocalEvent> {
    try {
      const updateData: Record<string, unknown> = {
        ...eventData,
        updatedAt: new Date(),
      };

      // Convert dates if provided
      if (eventData.startTime) {
        updateData.startTime = new Date(eventData.startTime);
      }
      if (eventData.endTime) {
        updateData.endTime = new Date(eventData.endTime);
      }

      const [updatedEvent] = await db
        .update(events)
        .set(updateData)
        .where(and(eq(events.id, eventId), eq(events.userId, userId)))
        .returning();

      if (!updatedEvent) {
        throw new Error("Event not found");
      }

      return updatedEvent as unknown as LocalEvent;
    } catch (error) {
      logger.error({ err: error }, "Error updating local event");
      throw new Error("Failed to update local event");
    }
  }
  /**
   * Delete a local event
   */
  static async deleteEvent(
    eventId: number,
    userId: string,
  ): Promise<LocalEvent> {
    try {
      const [deletedEvent] = await db
        .delete(events)
        .where(and(eq(events.id, eventId), eq(events.userId, userId)))
        .returning();

      if (!deletedEvent) {
        throw new Error("Event not found");
      }

      return deletedEvent as LocalEvent;
    } catch (error) {
      logger.error({ err: error }, "Error deleting local event");
      throw new Error("Failed to delete local event");
    }
  }

  /**
   * Get local events within a specific date range
   */
  static async getEventsInRange(
    userId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<LocalEvent[]> {
    try {
      return await this.getEvents(userId, { startDate, endDate });
    } catch (error) {
      logger.error({ err: error }, "Error fetching local events in range");
      throw new Error("Failed to fetch local events in date range");
    }
  }

  /**
   * Get today's local events for a user
   */
  static async getTodayEvents(userId: string): Promise<LocalEvent[]> {
    try {
      const today = new Date();
      const startOfDay = new Date(today.setHours(0, 0, 0, 0));
      const endOfDay = new Date(today.setHours(23, 59, 59, 999));

      return await this.getEventsInRange(userId, startOfDay, endOfDay);
    } catch (error) {
      logger.error({ err: error }, "Error fetching today's local events");
      throw new Error("Failed to fetch today's local events");
    }
  }

  /**
   * Get upcoming local events for a user (next N days)
   */
  static async getUpcomingEvents(
    userId: string,
    days: number = 7,
    limit?: number,
  ): Promise<LocalEvent[]> {
    try {
      const now = new Date();
      const futureDate = new Date();
      futureDate.setDate(now.getDate() + days);

      const conditions = [
        eq(events.userId, userId),
        gte(events.startTime, now),
        lte(events.startTime, futureDate),
      ];

      const query = db
        .select()
        .from(events)
        .where(and(...conditions))
        .orderBy(events.startTime);

      if (limit) {
        const result = await query.limit(limit);
        return result as LocalEvent[];
      }

      const result = await query;
      return result as LocalEvent[];
    } catch (error) {
      logger.error({ err: error }, "Error fetching upcoming local events");
      throw new Error("Failed to fetch upcoming local events");
    }
  }

  /**
   * Search local events by title, description, or location
   */
  static async searchEvents(
    userId: string,
    searchTerm: string,
    filters?: EventFilters,
  ): Promise<LocalEvent[]> {
    try {
      // Get all events for the user with filters
      const allEvents = await this.getEvents(userId, filters);

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
      logger.error({ err: error }, "Error searching local events");
      throw new Error("Failed to search local events");
    }
  }

  /**
   * Get local event statistics for a user
   */
  static async getEventStatistics(
    userId: string,
    filters?: EventFilters,
  ): Promise<{
    totalEvents: number;
    todayEvents: number;
    upcomingEvents: number;
    allDayEvents: number;
    recurringEvents: number;
  }> {
    try {
      const allEvents = await this.getEvents(userId, filters);
      const todayEvents = await this.getTodayEvents(userId);
      const upcomingEvents = await this.getUpcomingEvents(userId, 7);

      return {
        totalEvents: allEvents.length,
        todayEvents: todayEvents.length,
        upcomingEvents: upcomingEvents.length,
        allDayEvents: allEvents.filter((e) => e.isAllDay).length,
        recurringEvents: allEvents.filter(
          (e) => e.recurrence && e.recurrence !== "none",
        ).length,
      };
    } catch (error) {
      logger.error({ err: error }, "Error getting local event statistics");
      throw new Error("Failed to get local event statistics");
    }
  }

  /**
   * Check if user has any local events
   */
  static async hasEvents(userId: string): Promise<boolean> {
    try {
      const userEvents = await this.getEvents(userId);
      return userEvents.length > 0;
    } catch (error) {
      logger.error({ err: error }, "Error checking if user has local events");
      return false;
    }
  }

  /**
   * Get count of local events for a user
   */
  static async getEventCount(
    userId: string,
    filters?: EventFilters,
  ): Promise<number> {
    try {
      const userEvents = await this.getEvents(userId, filters);
      return userEvents.length;
    } catch (error) {
      logger.error({ err: error }, "Error getting local event count");
      throw new Error("Failed to get local event count");
    }
  }
}

export default LocalIntegrationService;
