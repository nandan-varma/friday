"use client"

import { useState } from "react"
import { 
  MonthView, 
  WeekView, 
  DayView, 
  AgendaView,
  type CalendarEvent,
  type ViewType,
  CalendarViewSkeleton as Skeleton
} from "./views"

export type { CalendarEvent } from "./views"

interface CalendarViewProps {
  events: CalendarEvent[]
  view: ViewType
  onEventClick?: (event: CalendarEvent) => void
  onCreateEvent?: (date: Date, hour?: number) => void
}

export function CalendarView({ 
  events, 
  view, 
  onEventClick,
  onCreateEvent 
}: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date())

  const handleDateChange = (date: Date) => {
    setCurrentDate(date)
  }

  const viewProps = {
    events,
    currentDate,
    onDateChange: handleDateChange,
    onEventClick,
    onCreateEvent
  }

  switch (view) {
    case "month":
      return <MonthView {...viewProps} />
    case "week":
      return <WeekView {...viewProps} />
    case "day":
      return <DayView {...viewProps} />
    case "agenda":
      return <AgendaView {...viewProps} />
    default:
      return <MonthView {...viewProps} />
  }
}

// Skeleton component for loading state
export function CalendarViewSkeleton({ view }: { view: ViewType }) {
  return <Skeleton view={view} />
}
