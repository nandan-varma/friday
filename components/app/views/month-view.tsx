"use client"
import type { CalendarEvent } from "@/types/calendar"

interface MonthViewProps {
  events: CalendarEvent[]
  selectedDate: Date
  onCreateEvent: (start: Date, end: Date) => void
  onEditEvent: (event: CalendarEvent) => void
  onUpdateEvent: (eventId: string, updates: Partial<CalendarEvent>) => void
}

export function MonthView({ events, selectedDate, onCreateEvent, onEditEvent }: MonthViewProps) {
  const getDaysInMonth = () => {
    const year = selectedDate.getFullYear()
    const month = selectedDate.getMonth()

    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const startDate = new Date(firstDay)
    startDate.setDate(startDate.getDate() - firstDay.getDay())

    const days: Date[] = []
    const current = new Date(startDate)

    for (let i = 0; i < 42; i++) {
      days.push(new Date(current))
      current.setDate(current.getDate() + 1)
    }

    return days
  }

  const days = getDaysInMonth()
  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

  const isToday = (date: Date) => {
    const today = new Date()
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    )
  }

  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === selectedDate.getMonth()
  }

  const getEventsForDay = (date: Date) => {
    return events.filter((event) => {
      const eventDate = new Date(event.start)
      return (
        eventDate.getDate() === date.getDate() &&
        eventDate.getMonth() === date.getMonth() &&
        eventDate.getFullYear() === date.getFullYear()
      )
    })
  }

  const handleDayClick = (date: Date) => {
    const start = new Date(date)
    start.setHours(9, 0, 0, 0)
    const end = new Date(date)
    end.setHours(10, 0, 0, 0)
    onCreateEvent(start, end)
  }

  const colorClasses = {
    blue: "bg-blue-600/90 hover:bg-blue-600",
    amber: "bg-amber-500/90 hover:bg-amber-500",
    green: "bg-green-600/90 hover:bg-green-600",
    pink: "bg-pink-600/90 hover:bg-pink-600",
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="grid grid-cols-7 border-b border-border bg-background">
        {weekDays.map((day) => (
          <div key={day} className="border-r border-border py-3 text-center text-xs font-medium text-muted-foreground">
            {day}
          </div>
        ))}
      </div>

      <div className="flex-1 overflow-auto">
        <div className="grid grid-cols-7 grid-rows-6 h-full">
          {days.map((day, index) => {
            const dayEvents = getEventsForDay(day)
            return (
              <div
                key={index}
                className={`min-h-[100px] border-r border-b border-border p-2 cursor-pointer hover:bg-accent/30 transition-colors ${
                  !isCurrentMonth(day) ? "bg-muted/20" : ""
                } ${isToday(day) ? "bg-blue-600/5" : ""}`}
                onClick={() => handleDayClick(day)}
              >
                <div
                  className={`mb-1 flex h-7 w-7 items-center justify-center rounded-full text-sm ${
                    isToday(day)
                      ? "bg-blue-600 text-white font-semibold"
                      : isCurrentMonth(day)
                        ? "text-foreground"
                        : "text-muted-foreground"
                  }`}
                >
                  {day.getDate()}
                </div>

                <div className="space-y-1">
                  {dayEvents.slice(0, 3).map((event) => (
                    <div
                      key={event.id}
                      className={`truncate rounded px-1.5 py-0.5 text-xs text-white ${
                        colorClasses[event.color as keyof typeof colorClasses]
                      }`}
                      onClick={(e) => {
                        e.stopPropagation()
                        onEditEvent(event)
                      }}
                    >
                      {event.start.getHours()}:{event.start.getMinutes().toString().padStart(2, "0")} {event.title}
                    </div>
                  ))}
                  {dayEvents.length > 3 && (
                    <div className="text-xs text-muted-foreground px-1.5">+{dayEvents.length - 3} more</div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
