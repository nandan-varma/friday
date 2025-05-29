import { db } from "@/lib/db"
import { events } from "@/lib/db/schema"
import { openai } from "@ai-sdk/openai"
import { generateObject } from "ai"
import { eq, and, gte, lte } from "drizzle-orm"
import { z } from "zod"
import { GoogleIntegrationService, GoogleCalendarEvent } from "./googleIntegrationService"

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

export type EventOrigin = "local" | "google"

export interface UnifiedEvent {
    id: string
    title: string
    description?: string | null
    location?: string | null
    startTime: Date
    endTime: Date
    isAllDay: boolean
    recurrence?: "none" | "daily" | "weekly" | "monthly" | "yearly"
    origin: EventOrigin
    originalId?: string | number // Store the original ID from source
    googleEventId?: string // For Google events
    attendees?: Array<{
        email?: string
        displayName?: string
        responseStatus?: string
    }>
    createdAt?: Date
    updatedAt?: Date
}

export interface CombinedEventFilters extends EventFilters {
    includeLocal?: boolean
    includeGoogle?: boolean
    calendarId?: string // For Google Calendar filtering
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

    /**
     * Format local database event to unified event format
     */
    private static formatLocalEvent(event: any): UnifiedEvent {
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
        }
    }

    /**
     * Format Google Calendar event to unified event format
     */
    private static formatGoogleEvent(event: GoogleCalendarEvent): UnifiedEvent {
        const startTime = event.start?.dateTime 
            ? new Date(event.start.dateTime)
            : event.start?.date 
                ? new Date(event.start.date)
                : new Date()

        const endTime = event.end?.dateTime 
            ? new Date(event.end.dateTime)
            : event.end?.date 
                ? new Date(event.end.date)
                : new Date(startTime.getTime() + 60 * 60 * 1000) // Default 1 hour

        const isAllDay = !event.start?.dateTime && !!event.start?.date

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
        }
    }

    /**
     * Get all events from both local and Google Calendar with unified format
     */
    static async getAllEvents(
        userId: number, 
        filters?: CombinedEventFilters
    ): Promise<UnifiedEvent[]> {
        try {
            const includeLocal = filters?.includeLocal !== false
            const includeGoogle = filters?.includeGoogle !== false
            const allEvents: UnifiedEvent[] = []

            // Fetch local events if enabled
            if (includeLocal) {
                const localEvents = await this.getEvents(userId, filters)
                const formattedLocalEvents = localEvents.map(event => this.formatLocalEvent(event))
                allEvents.push(...formattedLocalEvents)
            }

            // Fetch Google Calendar events if enabled
            if (includeGoogle) {
                try {
                    const hasIntegration = await GoogleIntegrationService.hasValidIntegration(userId)
                    if (hasIntegration) {
                        const googleOptions: any = {}
                        if (filters?.startDate) googleOptions.timeMin = new Date(filters.startDate)
                        if (filters?.endDate) googleOptions.timeMax = new Date(filters.endDate)
                        if (filters?.calendarId) googleOptions.calendarId = filters.calendarId

                        const googleEvents = await GoogleIntegrationService.getCalendarEvents(userId, googleOptions)
                        const formattedGoogleEvents = googleEvents.map(event => this.formatGoogleEvent(event))
                        allEvents.push(...formattedGoogleEvents)
                    }
                } catch (googleError) {
                    console.warn("Error fetching Google Calendar events:", googleError)
                    // Continue without Google events instead of failing entirely
                }
            }

            // Sort all events by start time
            allEvents.sort((a, b) => a.startTime.getTime() - b.startTime.getTime())

            return allEvents
        } catch (error) {
            console.error("Error fetching all events:", error)
            throw new Error("Failed to fetch events")
        }
    }

    /**
     * Get today's events from both local and Google Calendar
     */
    static async getAllTodayEvents(
        userId: number,
        filters?: Pick<CombinedEventFilters, 'includeLocal' | 'includeGoogle' | 'calendarId'>
    ): Promise<UnifiedEvent[]> {
        try {
            const today = new Date()
            const startOfDay = new Date(today.setHours(0, 0, 0, 0))
            const endOfDay = new Date(today.setHours(23, 59, 59, 999))

            return await this.getAllEvents(userId, {
                ...filters,
                startDate: startOfDay,
                endDate: endOfDay,
            })
        } catch (error) {
            console.error("Error fetching today's events:", error)
            throw new Error("Failed to fetch today's events")
        }
    }

    /**
     * Get upcoming events from both local and Google Calendar
     */
    static async getAllUpcomingEvents(
        userId: number,
        days: number = 7,
        limit?: number,
        filters?: Pick<CombinedEventFilters, 'includeLocal' | 'includeGoogle' | 'calendarId'>
    ): Promise<UnifiedEvent[]> {
        try {
            const now = new Date()
            const futureDate = new Date()
            futureDate.setDate(now.getDate() + days)

            const events = await this.getAllEvents(userId, {
                ...filters,
                startDate: now,
                endDate: futureDate,
            })

            // Apply limit if specified
            return limit ? events.slice(0, limit) : events
        } catch (error) {
            console.error("Error fetching upcoming events:", error)
            throw new Error("Failed to fetch upcoming events")
        }
    }

    /**
     * Get events in a specific date range from both local and Google Calendar
     */
    static async getAllEventsInRange(
        userId: number,
        startDate: Date,
        endDate: Date,
        filters?: Pick<CombinedEventFilters, 'includeLocal' | 'includeGoogle' | 'calendarId'>
    ): Promise<UnifiedEvent[]> {
        try {
            return await this.getAllEvents(userId, {
                ...filters,
                startDate,
                endDate,
            })
        } catch (error) {
            console.error("Error fetching events in range:", error)
            throw new Error("Failed to fetch events in date range")
        }
    }

    /**
     * Get events by origin type only
     */
    static async getEventsByOrigin(
        userId: number,
        origin: EventOrigin,
        filters?: EventFilters
    ): Promise<UnifiedEvent[]> {
        try {
            if (origin === "local") {
                const localEvents = await this.getEvents(userId, filters)
                return localEvents.map(event => this.formatLocalEvent(event))
            } else if (origin === "google") {
                const hasIntegration = await GoogleIntegrationService.hasValidIntegration(userId)
                if (!hasIntegration) {
                    return []
                }

                const googleOptions: any = {}
                if (filters?.startDate) googleOptions.timeMin = new Date(filters.startDate)
                if (filters?.endDate) googleOptions.timeMax = new Date(filters.endDate)

                const googleEvents = await GoogleIntegrationService.getCalendarEvents(userId, googleOptions)
                return googleEvents.map(event => this.formatGoogleEvent(event))
            }

            return []
        } catch (error) {
            console.error(`Error fetching ${origin} events:`, error)
            throw new Error(`Failed to fetch ${origin} events`)
        }
    }

    /**
     * Search events across both local and Google Calendar
     */
    static async searchAllEvents(
        userId: number,
        searchTerm: string,
        filters?: CombinedEventFilters
    ): Promise<UnifiedEvent[]> {
        try {
            const allEvents = await this.getAllEvents(userId, filters)
            
            const searchLower = searchTerm.toLowerCase()
            
            return allEvents.filter(event => 
                event.title.toLowerCase().includes(searchLower) ||
                (event.description && event.description.toLowerCase().includes(searchLower)) ||
                (event.location && event.location.toLowerCase().includes(searchLower))
            )
        } catch (error) {
            console.error("Error searching events:", error)
            throw new Error("Failed to search events")
        }
    }

    /**
     * Get event statistics across both calendars
     */
    static async getEventStatistics(
        userId: number,
        filters?: CombinedEventFilters
    ): Promise<{
        totalEvents: number
        localEvents: number
        googleEvents: number
        todayEvents: number
        upcomingEvents: number
        allDayEvents: number
        recurringEvents: number
    }> {
        try {
            const allEvents = await this.getAllEvents(userId, filters)
            const todayEvents = await this.getAllTodayEvents(userId, filters)
            const upcomingEvents = await this.getAllUpcomingEvents(userId, 7, undefined, filters)

            return {
                totalEvents: allEvents.length,
                localEvents: allEvents.filter(e => e.origin === "local").length,
                googleEvents: allEvents.filter(e => e.origin === "google").length,
                todayEvents: todayEvents.length,
                upcomingEvents: upcomingEvents.length,
                allDayEvents: allEvents.filter(e => e.isAllDay).length,
                recurringEvents: allEvents.filter(e => e.recurrence && e.recurrence !== "none").length,
            }
        } catch (error) {
            console.error("Error getting event statistics:", error)
            throw new Error("Failed to get event statistics")
        }
    }
}

export default EventService