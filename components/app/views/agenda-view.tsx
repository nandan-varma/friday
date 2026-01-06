"use client"
import type { CalendarEvent } from "@/app/(app)/app/page"
import { Calendar, Clock } from "lucide-react"

interface AgendaViewProps {
  events: CalendarEvent[]
  selectedDate: Date
  onCreateEvent: (start: Date, end: Date) => void
  onEditEvent: (event: CalendarEvent) => void
  onUpdateEvent: (eventId: string, updates: Partial<CalendarEvent>) => void
}

export function AgendaView({ events, selectedDate, onEditEvent }: AgendaViewProps) {
  const getUpcomingEvents = () => {
    const now = new Date()
    return events.filter((event) => event.start >= now).sort((a, b) => a.start.getTime() - b.start.getTime())
  }

  const groupEventsByDate = (events: CalendarEvent[]) => {
    const grouped: { [key: string]: CalendarEvent[] } = {}

    events.forEach((event) => {
      const dateKey = event.start.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })
      if (!grouped[dateKey]) {
        grouped[dateKey] = []
      }
      grouped[dateKey].push(event)
    })

    return grouped
  }

  const upcomingEvents = getUpcomingEvents()
  const groupedEvents = groupEventsByDate(upcomingEvents)

  const formatTime = (date: Date) => {
    const hours = date.getHours()
    const minutes = date.getMinutes()
    const ampm = hours >= 12 ? "PM" : "AM"
    const displayHours = hours % 12 || 12
    return `${displayHours}:${minutes.toString().padStart(2, "0")} ${ampm}`
  }

  const getDuration = (start: Date, end: Date) => {
    const diff = end.getTime() - start.getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

    if (hours > 0) {
      return `${hours}h ${minutes}m`
    }
    return `${minutes}m`
  }

  const colorClasses = {
    blue: "bg-blue-600/10 border-blue-600/30 text-blue-600",
    amber: "bg-amber-500/10 border-amber-500/30 text-amber-600",
    green: "bg-green-600/10 border-green-600/30 text-green-600",
    pink: "bg-pink-600/10 border-pink-600/30 text-pink-600",
  }

  if (upcomingEvents.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="text-center">
          <Calendar className="mx-auto h-16 w-16 text-muted-foreground/50" />
          <h3 className="mt-4 text-lg font-medium text-foreground">No upcoming events</h3>
          <p className="mt-2 text-sm text-muted-foreground">Create an event to get started</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-auto p-6">
      <div className="mx-auto max-w-3xl space-y-6">
        {Object.entries(groupedEvents).map(([dateKey, dateEvents]) => (
          <div key={dateKey}>
            <h2 className="mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wide">{dateKey}</h2>
            <div className="space-y-3">
              {dateEvents.map((event) => (
                <div
                  key={event.id}
                  className={`rounded-lg border-l-4 p-4 cursor-pointer hover:shadow-md transition-all ${
                    colorClasses[event.color as keyof typeof colorClasses]
                  } bg-card border border-border hover:border-${event.color}-600/50`}
                  onClick={() => onEditEvent(event)}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-foreground">{event.title}</h3>
                      {event.description && <p className="mt-1 text-sm text-muted-foreground">{event.description}</p>}

                      <div className="mt-3 flex flex-wrap gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                          <Clock className="h-4 w-4" />
                          <span>
                            {formatTime(event.start)} - {formatTime(event.end)}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Calendar className="h-4 w-4" />
                          <span>{getDuration(event.start, event.end)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
