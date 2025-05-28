"use client"

import type React from "react"

import { useState } from "react"
import { formatDistanceToNow } from "date-fns"
import { Bell, Calendar, Clock, X } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

type Notification = {
  id: string
  type: "reminder" | "suggestion" | "conflict"
  title: string
  description: string
  eventId?: number
  timestamp: Date
  read: boolean
}

// Mock notifications - in a real app, these would come from an API
const mockNotifications: Notification[] = [
  {
    id: "1",
    type: "reminder",
    title: "Team Meeting in 30 minutes",
    description: "Your team meeting is scheduled to start at 10:00 AM",
    eventId: 1,
    timestamp: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
    read: false,
  },
  {
    id: "2",
    type: "suggestion",
    title: "AI Suggestion: Schedule follow-up",
    description: "Based on your last meeting, consider scheduling a follow-up with John next week",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    read: false,
  },
  {
    id: "3",
    type: "conflict",
    title: "Schedule Conflict Detected",
    description: "You have overlapping events on Friday at 2:00 PM",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
    read: true,
  },
]

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState(mockNotifications)
  const [filter, setFilter] = useState<"all" | "unread">("all")

  const filteredNotifications = notifications.filter((notification) => filter === "all" || !notification.read)

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((notification) => (notification.id === id ? { ...notification, read: true } : notification)),
    )
  }

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((notification) => ({ ...notification, read: true })))
  }

  const deleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((notification) => notification.id !== id))
  }

  const getNotificationIcon = (type: Notification["type"]) => {
    switch (type) {
      case "reminder":
        return <Clock className="h-4 w-4" />
      case "suggestion":
        return <Bell className="h-4 w-4" />
      case "conflict":
        return <Calendar className="h-4 w-4" />
    }
  }

  const getNotificationColor = (type: Notification["type"]) => {
    switch (type) {
      case "reminder":
        return "default"
      case "suggestion":
        return "secondary"
      case "conflict":
        return "destructive"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Notifications</h1>
        <Button variant="outline" onClick={markAllAsRead}>
          Mark all as read
        </Button>
      </div>

      <Tabs defaultValue="all" onValueChange={(value) => setFilter(value as any)}>
        <TabsList>
          <TabsTrigger value="all">All ({notifications.length})</TabsTrigger>
          <TabsTrigger value="unread">Unread ({notifications.filter((n) => !n.read).length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          <NotificationList
            notifications={filteredNotifications}
            onMarkAsRead={markAsRead}
            onDelete={deleteNotification}
            getIcon={getNotificationIcon}
            getColor={getNotificationColor}
          />
        </TabsContent>

        <TabsContent value="unread" className="mt-6">
          <NotificationList
            notifications={filteredNotifications}
            onMarkAsRead={markAsRead}
            onDelete={deleteNotification}
            getIcon={getNotificationIcon}
            getColor={getNotificationColor}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}

function NotificationList({
  notifications,
  onMarkAsRead,
  onDelete,
  getIcon,
  getColor,
}: {
  notifications: Notification[]
  onMarkAsRead: (id: string) => void
  onDelete: (id: string) => void
  getIcon: (type: Notification["type"]) => React.ReactNode
  getColor: (type: Notification["type"]) => string
}) {
  if (notifications.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Bell className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No notifications</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {notifications.map((notification) => (
        <Card key={notification.id} className={notification.read ? "opacity-60" : ""}>
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <Badge variant={getColor(notification.type) as any}>{getIcon(notification.type)}</Badge>
                <div className="space-y-1">
                  <CardTitle className="text-base">{notification.title}</CardTitle>
                  <CardDescription>{notification.description}</CardDescription>
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(notification.timestamp, {
                      addSuffix: true,
                    })}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {!notification.read && (
                  <Button variant="ghost" size="sm" onClick={() => onMarkAsRead(notification.id)}>
                    Mark as read
                  </Button>
                )}
                <Button variant="ghost" size="icon" onClick={() => onDelete(notification.id)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>
      ))}
    </div>
  )
}
