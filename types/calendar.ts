// Calendar types for the application

export interface Calendar {
  id: string
  name: string
  color: string
  checked: boolean
}

export interface CalendarEvent {
  id: string
  title: string
  description?: string
  start: Date
  end: Date
  calendarId: string
  color: string
}
