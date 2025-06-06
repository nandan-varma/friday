import { type UnifiedEvent } from "@/services/eventService"

export type ViewType = "day" | "week" | "month" | "agenda"

export interface CalendarViewProps {
  events: UnifiedEvent[]
  currentDate: Date
  onDateChange: (date: Date) => void
  onEventClick?: (event: UnifiedEvent) => void
  onCreateEvent?: (date: Date, hour?: number) => void
  timezone?: string
}
