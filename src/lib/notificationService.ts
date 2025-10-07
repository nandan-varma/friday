import 'server-only'

import { db } from "@/lib/db"
import { notifications } from "@/lib/db/schema"
import { eq, and, lt, isNull } from "drizzle-orm"
import { getUserSettings } from "./profileService"

export interface NotificationData {
  userId: string
  title: string
  message: string
  type: 'event_reminder' | 'event_update' | 'system'
  eventId?: string
  scheduledFor?: Date
}

export interface Notification {
  id: number
  userId: string
  title: string
  message: string
  type: string
  eventId?: string | null
  scheduledFor?: Date | null
  sentAt?: Date | null
  readAt?: Date | null
  createdAt: Date
  updatedAt: Date
}

export class NotificationService {
  /**
   * Create a new notification
   */
  static async createNotification(data: NotificationData): Promise<Notification> {
    try {
      const [notification] = await db
        .insert(notifications)
        .values({
          userId: data.userId,
          title: data.title,
          message: data.message,
          type: data.type,
          eventId: data.eventId || null,
          scheduledFor: data.scheduledFor || null,
        })
        .returning()

      return notification as Notification
    } catch (error) {
      console.error("Error creating notification:", error)
      throw new Error("Failed to create notification")
    }
  }

  /**
   * Get notifications for a user
   */
  static async getUserNotifications(
    userId: string,
    options?: {
      unreadOnly?: boolean
      limit?: number
      offset?: number
    }
  ): Promise<Notification[]> {
    try {
      const conditions = [eq(notifications.userId, userId)]

      if (options?.unreadOnly) {
        conditions.push(isNull(notifications.readAt))
      }

      const query = db
        .select()
        .from(notifications)
        .where(and(...conditions))
        .orderBy(notifications.createdAt)
        .limit(options?.limit || 50)
        .offset(options?.offset || 0)

      const userNotifications = await query
      return userNotifications as Notification[]
    } catch (error) {
      console.error("Error fetching user notifications:", error)
      throw new Error("Failed to fetch user notifications")
    }
  }

  /**
   * Mark notification as read
   */
  static async markAsRead(notificationId: number, userId: string): Promise<void> {
    try {
      await db
        .update(notifications)
        .set({
          readAt: new Date(),
          updatedAt: new Date(),
        })
        .where(and(eq(notifications.id, notificationId), eq(notifications.userId, userId)))
    } catch (error) {
      console.error("Error marking notification as read:", error)
      throw new Error("Failed to mark notification as read")
    }
  }

  /**
   * Mark all notifications as read for a user
   */
  static async markAllAsRead(userId: string): Promise<void> {
    try {
      await db
        .update(notifications)
        .set({
          readAt: new Date(),
          updatedAt: new Date(),
        })
        .where(and(eq(notifications.userId, userId), isNull(notifications.readAt)))
    } catch (error) {
      console.error("Error marking all notifications as read:", error)
      throw new Error("Failed to mark all notifications as read")
    }
  }

  /**
   * Delete a notification
   */
  static async deleteNotification(notificationId: number, userId: string): Promise<void> {
    try {
      await db
        .delete(notifications)
        .where(and(eq(notifications.id, notificationId), eq(notifications.userId, userId)))
    } catch (error) {
      console.error("Error deleting notification:", error)
      throw new Error("Failed to delete notification")
    }
  }

  /**
   * Create event reminder notification
   */
  static async createEventReminder(
    userId: string,
    eventId: string,
    eventTitle: string,
    reminderTime: Date
  ): Promise<Notification> {
    try {
      const userSettings = await getUserSettings(userId)
      if (!userSettings?.notificationsEnabled) {
        throw new Error("Notifications are disabled for this user")
      }

      return await this.createNotification({
        userId,
        title: "Event Reminder",
        message: `Reminder: ${eventTitle}`,
        type: "event_reminder",
        eventId,
        scheduledFor: reminderTime,
      })
    } catch (error) {
      console.error("Error creating event reminder:", error)
      throw new Error("Failed to create event reminder")
    }
  }

  /**
   * Create event update notification
   */
  static async createEventUpdateNotification(
    userId: string,
    eventId: string,
    eventTitle: string,
    updateType: string
  ): Promise<Notification> {
    try {
      const userSettings = await getUserSettings(userId)
      if (!userSettings?.notificationsEnabled) {
        throw new Error("Notifications are disabled for this user")
      }

      return await this.createNotification({
        userId,
        title: "Event Updated",
        message: `${eventTitle} has been ${updateType}`,
        type: "event_update",
        eventId,
      })
    } catch (error) {
      console.error("Error creating event update notification:", error)
      throw new Error("Failed to create event update notification")
    }
  }

  /**
   * Get pending notifications that should be sent
   */
  static async getPendingNotifications(): Promise<Notification[]> {
    try {
      const now = new Date()
      const pendingNotifications = await db
        .select()
        .from(notifications)
        .where(
          and(
            isNull(notifications.sentAt),
            lt(notifications.scheduledFor, now)
          )
        )
        .orderBy(notifications.scheduledFor)

      return pendingNotifications as Notification[]
    } catch (error) {
      console.error("Error fetching pending notifications:", error)
      throw new Error("Failed to fetch pending notifications")
    }
  }

  /**
   * Mark notification as sent
   */
  static async markAsSent(notificationId: number): Promise<void> {
    try {
      await db
        .update(notifications)
        .set({
          sentAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(notifications.id, notificationId))
    } catch (error) {
      console.error("Error marking notification as sent:", error)
      throw new Error("Failed to mark notification as sent")
    }
  }

  /**
   * Get notification statistics for a user
   */
  static async getNotificationStats(userId: string): Promise<{
    total: number
    unread: number
    sent: number
  }> {
    try {
      const allNotifications = await this.getUserNotifications(userId)
      const unreadNotifications = await this.getUserNotifications(userId, { unreadOnly: true })

      const sentCount = allNotifications.filter(n => n.sentAt).length

      return {
        total: allNotifications.length,
        unread: unreadNotifications.length,
        sent: sentCount,
      }
    } catch (error) {
      console.error("Error getting notification stats:", error)
      throw new Error("Failed to get notification stats")
    }
  }
}

export default NotificationService
