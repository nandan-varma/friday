"use client"

import { useState } from "react"
import { MonthView } from "./views/month-view"
import { WeekView } from "./views/week-view"
import { DayView } from "./views/day-view"
import { AgendaView } from "./views/agenda-view"
import { CalendarViewSkeleton as Skeleton } from "./views/skeletons"
import { type ViewType } from "./views/types"
import { type UnifiedEvent } from "@/services/eventService"

interface CalendarViewProps {
  events: UnifiedEvent[]
  view: ViewType
  onEventClick?: (event: UnifiedEvent) => void
  onCreateEvent?: (date: Date, hour?: number) => void
  timezone?: string
}

export function CalendarView({ 
  events, 
  view, 
  onEventClick,
  onCreateEvent,
  timezone 
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
    onCreateEvent,
    timezone
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
