"use client"

import { useMemo, useRef, useState, useEffect } from "react"
import { isSameDay } from "date-fns"
import type { CalendarEvent } from "@/types/calendar"
import { EventCard } from "@/components/app/event-card"
import { AllDayEventBar } from "@/components/app/all-day-event-bar"
import { useTimeGridCreate } from "@/hooks/use-time-grid-create"
import { layoutOverlappingEvents } from "@/lib/calendar-layout"
import { formatHourLabel, formatWeekdayLong } from "@/lib/calendar-format"

interface DayViewProps {
  events: CalendarEvent[]
  selectedDate: Date
  onCreateEvent: (start: Date, end: Date) => void
  onEditEvent: (event: CalendarEvent) => void
  onUpdateEvent: (eventId: string, updates: Partial<CalendarEvent>) => void
  onDeleteEvent: (event: CalendarEvent) => void
  /** Bumped per-event to force a visual reset after a cancelled recurring-scope prompt. */
  eventResetTokens?: Record<string, number>
}

const HOURS = Array.from({ length: 24 }, (_, i) => i)
const HOUR_HEIGHT = 60

export function DayView({ events, selectedDate, onCreateEvent, onEditEvent, onUpdateEvent, onDeleteEvent, eventResetTokens }: DayViewProps) {
  const gridBodyRef = useRef<HTMLDivElement>(null)
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000)
    return () => clearInterval(timer)
  }, [])

  const columns = useMemo(() => [selectedDate], [selectedDate])

  const {
    preview: dragPreview,
    handleMouseDown: handleCreateMouseDown,
    cancel: cancelCreateDrag,
  } = useTimeGridCreate({
    hourHeight: HOUR_HEIGHT,
    columns,
    containerRef: gridBodyRef,
    onCreate: onCreateEvent,
  })

  useEffect(() => {
    if (!dragPreview) return
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") cancelCreateDrag()
    }
    document.addEventListener("keydown", handleEscape)
    return () => document.removeEventListener("keydown", handleEscape)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [!!dragPreview, cancelCreateDrag])

  const getCurrentTimePosition = () => {
    const minutes = currentTime.getHours() * 60 + currentTime.getMinutes()
    return (minutes / 60) * HOUR_HEIGHT
  }

  const isToday = isSameDay(selectedDate, new Date())

  const dayEvents = events.filter((event) => !event.allDay && isSameDay(event.start, selectedDate))
  const allDayEvents = events.filter((event) => event.allDay && event.start <= selectedDate && event.end >= selectedDate)
  const dayEventsLayout = layoutOverlappingEvents(dayEvents)

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="flex border-b border-border bg-background">
        <div className="w-16 border-r border-border" />
        <div className="flex-1 flex flex-col items-center justify-center py-2">
          <span className="text-xs font-mono text-muted-foreground uppercase">{formatWeekdayLong(selectedDate)}</span>
          <span
            className={`mt-1 flex h-12 w-12 items-center justify-center border text-3xl ${
              isToday ? "bg-foreground text-background border-foreground" : "border-transparent text-foreground"
            }`}
          >
            {selectedDate.getDate()}
          </span>
        </div>
      </div>

      {allDayEvents.length > 0 && (
        <div className="border-b border-border bg-background">
          {allDayEvents.map((event) => (
            <div key={event.id} className="flex" style={{ height: 22 }}>
              <div className="w-16 border-r border-border" />
              <div className="flex-1 border-r border-border">
                <AllDayEventBar event={event} onEdit={onEditEvent} onDelete={onDeleteEvent} />
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="relative flex-1 overflow-auto">
        <div className="flex" ref={gridBodyRef}>
          <div className="sticky left-0 z-10 w-16 bg-background">
            {HOURS.map((hour) => (
              <div key={hour} className="flex h-[60px] items-start justify-end border-b border-border pr-2 pt-1">
                <span className="text-xs text-muted-foreground">{formatHourLabel(hour)}</span>
              </div>
            ))}
          </div>

          <div
            className={`relative flex-1 border-r border-border ${isToday ? "bg-accent/40" : ""}`}
            onMouseDown={(e) => handleCreateMouseDown(e, 0)}
          >
            {HOURS.map((hour) => (
              <div
                key={hour}
                className="h-[60px] border-b border-border hover:bg-accent/50 cursor-crosshair transition-colors"
              />
            ))}

            {dayEvents.map((event) => (
              <EventCard
                key={`${event.id}:${eventResetTokens?.[event.id] ?? 0}`}
                event={event}
                hourHeight={HOUR_HEIGHT}
                onEdit={onEditEvent}
                onUpdate={onUpdateEvent}
                onDelete={onDeleteEvent}
                layout={dayEventsLayout.get(event.id)}
              />
            ))}

            {dragPreview && (
              <div
                className="absolute left-1 right-1 z-10 border-2 border-dashed border-foreground bg-foreground/5 pointer-events-none"
                style={{
                  top: `${dragPreview.top}px`,
                  height: `${dragPreview.height}px`,
                }}
              >
                <div className="p-2 text-xs text-foreground font-mono">New Event</div>
              </div>
            )}

            {isToday && (
              <div
                className="absolute left-0 right-0 z-20 flex items-center"
                style={{ top: `${getCurrentTimePosition()}px` }}
              >
                <div className="h-2 w-2 bg-foreground" />
                <div className="h-px flex-1 bg-foreground" />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
