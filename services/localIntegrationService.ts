"use server"
import { db } from "@/lib/db"
import { events } from "@/lib/db/schema/calendar"
import { eq, and, gte, lte } from "drizzle-orm"

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

export interface LocalEvent {
    id: number
    userId: string
    title: string
    description?: string | null
    location?: string | null
    startTime: Date
    endTime: Date
    isAllDay: boolean
    recurrence?: "none" | "daily" | "weekly" | "monthly" | "yearly"
    createdAt?: Date
    updatedAt?: Date
}

export class LocalIntegrationService {    /**
     * Get all local events for a user with optional date filtering
     */
    static async getEvents(userId: string, filters?: EventFilters): Promise<LocalEvent[]> {
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

            return userEvents as unknown as LocalEvent[]
        } catch (error) {
            console.error("Error fetching local events:", error)
            throw new Error("Failed to fetch local events")
        }
    }    /**
     * Get a single local event by ID for a specific user
     */
    static async getEventById(eventId: number, userId: string): Promise<LocalEvent> {
        try {
            const event = await db.query.events.findFirst({
                where: and(eq(events.id, eventId), eq(events.userId, userId)),
            })

            if (!event) {
                throw new Error("Event not found")
            }

            return event as unknown as LocalEvent
        } catch (error) {
            console.error("Error fetching local event:", error)
            throw error
        }
    }    /**
     * Create a new local event for a user
     */
    static async createEvent(userId: string, eventData: CreateEventData): Promise<LocalEvent> {
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

            return newEvent as unknown as LocalEvent
        } catch (error) {
            console.error("Error creating local event:", error)
            throw new Error("Failed to create local event")
        }
    }    /**
     * Update an existing local event
     */
    static async updateEvent(eventId: number, userId: string, eventData: UpdateEventData): Promise<LocalEvent> {
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

            return updatedEvent as unknown as LocalEvent
        } catch (error) {
            console.error("Error updating local event:", error)
            throw error
        }
    }    /**
     * Delete a local event
     */
    static async deleteEvent(eventId: number, userId: string): Promise<LocalEvent> {
        try {
            const [deletedEvent] = await db
                .delete(events)
                .where(and(eq(events.id, eventId), eq(events.userId, userId)))
                .returning()

            if (!deletedEvent) {
                throw new Error("Event not found")
            }

            return deletedEvent as LocalEvent
        } catch (error) {
            console.error("Error deleting local event:", error)
            throw error
        }
    }

    /**
     * Get local events within a specific date range
     */
    static async getEventsInRange(userId: string, startDate: Date, endDate: Date): Promise<LocalEvent[]> {
        try {
            return await this.getEvents(userId, { startDate, endDate })
        } catch (error) {
            console.error("Error fetching local events in range:", error)
            throw new Error("Failed to fetch local events in date range")
        }
    }

    /**
     * Get today's local events for a user
     */
    static async getTodayEvents(userId: string): Promise<LocalEvent[]> {
        try {
            const today = new Date()
            const startOfDay = new Date(today.setHours(0, 0, 0, 0))
            const endOfDay = new Date(today.setHours(23, 59, 59, 999))

            return await this.getEventsInRange(userId, startOfDay, endOfDay)
        } catch (error) {
            console.error("Error fetching today's local events:", error)
            throw new Error("Failed to fetch today's local events")
        }
    }

    /**
     * Get upcoming local events for a user (next N days)
     */
    static async getUpcomingEvents(userId: string, days: number = 7, limit?: number): Promise<LocalEvent[]> {
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
                const result = await query.limit(limit)
                return result as LocalEvent[]
            }

            const result = await query
            return result as LocalEvent[]
        } catch (error) {
            console.error("Error fetching upcoming local events:", error)
            throw new Error("Failed to fetch upcoming local events")
        }
    }

    /**
     * Search local events by title, description, or location
     */
    static async searchEvents(userId: string, searchTerm: string, filters?: EventFilters): Promise<LocalEvent[]> {
        try {
            // Get all events for the user with filters
            const allEvents = await this.getEvents(userId, filters)
            
            const searchLower = searchTerm.toLowerCase()
            
            return allEvents.filter(event => 
                event.title.toLowerCase().includes(searchLower) ||
                (event.description && event.description.toLowerCase().includes(searchLower)) ||
                (event.location && event.location.toLowerCase().includes(searchLower))
            )
        } catch (error) {
            console.error("Error searching local events:", error)
            throw new Error("Failed to search local events")
        }
    }

    /**
     * Get local event statistics for a user
     */
    static async getEventStatistics(userId: string, filters?: EventFilters): Promise<{
        totalEvents: number
        todayEvents: number
        upcomingEvents: number
        allDayEvents: number
        recurringEvents: number
    }> {
        try {
            const allEvents = await this.getEvents(userId, filters)
            const todayEvents = await this.getTodayEvents(userId)
            const upcomingEvents = await this.getUpcomingEvents(userId, 7)

            return {
                totalEvents: allEvents.length,
                todayEvents: todayEvents.length,
                upcomingEvents: upcomingEvents.length,
                allDayEvents: allEvents.filter(e => e.isAllDay).length,
                recurringEvents: allEvents.filter(e => e.recurrence && e.recurrence !== "none").length,
            }
        } catch (error) {
            console.error("Error getting local event statistics:", error)
            throw new Error("Failed to get local event statistics")
        }
    }

    /**
     * Check if user has any local events
     */
    static async hasEvents(userId: string): Promise<boolean> {
        try {
            const events = await this.getEvents(userId)
            return events.length > 0
        } catch (error) {
            console.error("Error checking if user has local events:", error)
            return false
        }
    }

    /**
     * Get count of local events for a user
     */
    static async getEventCount(userId: string, filters?: EventFilters): Promise<number> {
        try {
            const events = await this.getEvents(userId, filters)
            return events.length
        } catch (error) {
            console.error("Error getting local event count:", error)
            throw new Error("Failed to get local event count")
        }
    }
}

export default LocalIntegrationService
