"use client"
import type { CalendarEvent } from "@/app/(app)/app/page"
import { WeekView } from "@/components/app/views/week-view"
import { DayView } from "@/components/app/views/day-view"
import { MonthView } from "@/components/app/views/month-view"
import { AgendaView } from "@/components/app/views/agenda-view"

interface CalendarGridProps {
  events: CalendarEvent[]
  selectedDate: Date
  viewMode: "day" | "week" | "month" | "agenda"
  onCreateEvent: (start: Date, end: Date) => void
  onEditEvent: (event: CalendarEvent) => void
  onUpdateEvent: (eventId: string, updates: Partial<CalendarEvent>) => void
}

export function CalendarGrid({
  events,
  selectedDate,
  viewMode,
  onCreateEvent,
  onEditEvent,
  onUpdateEvent,
}: CalendarGridProps) {
  const viewProps = {
    events,
    selectedDate,
    onCreateEvent,
    onEditEvent,
    onUpdateEvent,
  }

  switch (viewMode) {
    case "day":
      return <DayView {...viewProps} />
    case "week":
      return <WeekView {...viewProps} />
    case "month":
      return <MonthView {...viewProps} />
    case "agenda":
      return <AgendaView {...viewProps} />
    default:
      return <WeekView {...viewProps} />
  }
}
