import { db } from "@/lib/db"
import { events } from "@/lib/db/schema"
import { openai } from "@ai-sdk/openai"
import { generateObject } from "ai"
import { eq, and, gte, lte } from "drizzle-orm"
import { z } from "zod"

export interface CreateEventData {
    title: string
    description?: string | null
    location?: string | null
    startTime: Date
    endTime: Date
    isAllDay?: boolean
    recurrence?: "none" | "daily" | "weekly" | "monthly" | "yearly"
}

export interface UpdateEventData {
    title?: string
    description?: string | null
    location?: string | null
    startTime?: Date
    endTime?: Date
    isAllDay?: boolean
    recurrence?: "none" | "daily" | "weekly" | "monthly" | "yearly"
}

export interface EventFilters {
    startDate?: string | Date
    endDate?: string | Date
}

export class EventService {
    /**
     * Get all events for a user with optional date filtering
     */
    static async getEvents(userId: number, filters?: EventFilters) {
        try {
            const conditions = [eq(events.userId, userId)]

            if (filters?.startDate) {
                conditions.push(gte(events.startTime, new Date(filters.startDate)))
            }

            if (filters?.endDate) {
                conditions.push(lte(events.endTime, new Date(filters.endDate)))
            }

            const userEvents = await db
                .select()
                .from(events)
                .where(and(...conditions))
                .orderBy(events.startTime)

            return userEvents
        } catch (error) {
            console.error("Error fetching events:", error)
            throw new Error("Failed to fetch events")
        }
    }

    /**
     * Get a single event by ID for a specific user
     */
    static async getEventById(eventId: number, userId: number) {
        try {
            const event = await db.query.events.findFirst({
                where: and(eq(events.id, eventId), eq(events.userId, userId)),
            })

            if (!event) {
                throw new Error("Event not found")
            }

            return event
        } catch (error) {
            console.error("Error fetching event:", error)
            throw error
        }
    }

    /**
     * Create a new event for a user
     */
    static async createEvent(userId: number, eventData: CreateEventData) {
        try {
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
                .returning()

            return newEvent
        } catch (error) {
            console.error("Error creating event:", error)
            throw new Error("Failed to create event")
        }
    }

    /**
     * Update an existing event
     */
    static async updateEvent(eventId: number, userId: number, eventData: UpdateEventData) {
        try {
            const updateData: any = {
                ...eventData,
                updatedAt: new Date(),
            }

            // Convert dates if provided
            if (eventData.startTime) {
                updateData.startTime = new Date(eventData.startTime)
            }
            if (eventData.endTime) {
                updateData.endTime = new Date(eventData.endTime)
            }

            const [updatedEvent] = await db
                .update(events)
                .set(updateData)
                .where(and(eq(events.id, eventId), eq(events.userId, userId)))
                .returning()

            if (!updatedEvent) {
                throw new Error("Event not found")
            }

            return updatedEvent
        } catch (error) {
            console.error("Error updating event:", error)
            throw error
        }
    }

    /**
     * Delete an event
     */
    static async deleteEvent(eventId: number, userId: number) {
        try {
            const [deletedEvent] = await db
                .delete(events)
                .where(and(eq(events.id, eventId), eq(events.userId, userId)))
                .returning()

            if (!deletedEvent) {
                throw new Error("Event not found")
            }

            return deletedEvent
        } catch (error) {
            console.error("Error deleting event:", error)
            throw error
        }
    }

    /**
     * Get events within a specific date range
     */
    static async getEventsInRange(userId: number, startDate: Date, endDate: Date) {
        try {
            return await this.getEvents(userId, { startDate, endDate })
        } catch (error) {
            console.error("Error fetching events in range:", error)
            throw new Error("Failed to fetch events in date range")
        }
    }

    /**
     * Get today's events for a user
     */
    static async getTodayEvents(userId: number) {
        try {
            const today = new Date()
            const startOfDay = new Date(today.setHours(0, 0, 0, 0))
            const endOfDay = new Date(today.setHours(23, 59, 59, 999))

            return await this.getEventsInRange(userId, startOfDay, endOfDay)
        } catch (error) {
            console.error("Error fetching today's events:", error)
            throw new Error("Failed to fetch today's events")
        }
    }

    /**
     * Get upcoming events for a user (next 7 days)
     */
    static async getUpcomingEvents(userId: number, days: number = 7, limit?: number) {
        try {
            const now = new Date()
            const futureDate = new Date()
            futureDate.setDate(now.getDate() + days)

            const conditions = [
                eq(events.userId, userId),
                gte(events.startTime, now),
                lte(events.startTime, futureDate)
            ]

            const query = db
                .select()
                .from(events)
                .where(and(...conditions))
                .orderBy(events.startTime)

            if (limit) {
                return await query.limit(limit)
            }

            return await query
        } catch (error) {
            console.error("Error fetching upcoming events:", error)
            throw new Error("Failed to fetch upcoming events")
        }
    }

    /**
     * Create event from natural language input
     */
    static async createEventFromNaturalLanguage(userId: number, input: string) {
        try {
            const { object } = await generateObject({
                model: openai('gpt-4-turbo'),
                schema: z.object({
                    title: z.string().describe("The title of the event"),
                    description: z.string().optional().describe("A description of the event"),
                    location: z.string().optional().describe("The location of the event"),
                    date: z.string().describe("The date of the event in YYYY-MM-DD format"), // YYYY-MM-DD format
                    startTime: z.string().describe("The start time of the event in HH:MM format"), // HH:MM format
                    endTime: z.string().describe("The end time of the event in HH:MM format"), // HH:MM format
                    isAllDay: z.boolean().describe("Whether the event is all day"),
                }),
                prompt: `Parse the following natural language input into a calendar event: "${input}"`,
            })

            return await this.createEvent(userId, {
                title: object.title,
                description: object.description,
                location: object.location,
                startTime: new Date(`${object.date}T${object.startTime}`),
                endTime: new Date(`${object.date}T${object.endTime}`),
                isAllDay: object.isAllDay,
            })

        } catch (error) {
            console.error("Error creating event from natural language:", error)
            throw new Error("Failed to create event from natural language")
        }
    }
}

export default EventService