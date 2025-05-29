export type CalendarEvent = {
  id: string
  title: string
  startTime: string
  endTime: string
  isAllDay: boolean
  description?: string | null
  location?: string | null
  source?: 'local' | 'google'
}

export type ViewType = "day" | "week" | "month" | "agenda"

export interface CalendarViewProps {
  events: CalendarEvent[]
  currentDate: Date
  onDateChange: (date: Date) => void
  onEventClick?: (event: CalendarEvent) => void
  onCreateEvent?: (date: Date, hour?: number) => void
}
