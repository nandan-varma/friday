"use client"

import type React from "react"
import { useEffect, useMemo, useState } from "react"
import { addDays, differenceInCalendarDays, endOfDay, isSameDay, isSameMonth, set, startOfDay, startOfMonth, startOfWeek } from "date-fns"
import type { CalendarEvent } from "@/types/calendar"
import { Repeat } from "lucide-react"
import { formatEventTime, formatWeekdayShort } from "@/lib/calendar-format"

interface MonthViewProps {
  events: CalendarEvent[]
  selectedDate: Date
  onCreateEvent: (start: Date, end: Date, options?: { allDay?: boolean }) => void
  onEditEvent: (event: CalendarEvent) => void
  onUpdateEvent: (eventId: string, updates: Partial<CalendarEvent>) => void
  onDeleteEvent: (event: CalendarEvent) => void
}

const WEEKDAY_HEADERS = Array.from({ length: 7 }, (_, i) => addDays(startOfWeek(new Date()), i))

const COLOR_CLASSES: Record<string, string> = {
  blue: "bg-blue-700",
  amber: "bg-amber-700",
  green: "bg-emerald-800",
  pink: "bg-fuchsia-800",
}

export function MonthView({ events, selectedDate, onCreateEvent, onEditEvent, onUpdateEvent, onDeleteEvent }: MonthViewProps) {
  const [rangeSelection, setRangeSelection] = useState<{ start: Date; current: Date } | null>(null)

  const days = useMemo(() => {
    const gridStart = startOfWeek(startOfMonth(selectedDate))
    return Array.from({ length: 42 }, (_, i) => addDays(gridStart, i))
  }, [selectedDate])

  const isToday = (date: Date) => isSameDay(date, new Date())
  const isCurrentMonth = (date: Date) => isSameMonth(date, selectedDate)

  const getEventsForDay = (date: Date) => {
    return events.filter((event) => (event.allDay ? event.start <= date && event.end >= date : isSameDay(event.start, date)))
  }

  const finishSelection = () => {
    setRangeSelection((selection) => {
      if (!selection) return null
      const rangeStart = selection.start <= selection.current ? selection.start : selection.current
      const rangeEnd = selection.start <= selection.current ? selection.current : selection.start

      if (isSameDay(rangeStart, rangeEnd)) {
        onCreateEvent(set(rangeStart, { hours: 9, minutes: 0 }), set(rangeStart, { hours: 10, minutes: 0 }))
      } else {
        onCreateEvent(startOfDay(rangeStart), endOfDay(rangeEnd), { allDay: true })
      }
      return null
    })
  }

  useEffect(() => {
    if (!rangeSelection) return
    document.addEventListener("mouseup", finishSelection)
    return () => document.removeEventListener("mouseup", finishSelection)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [!!rangeSelection])

  const isInSelection = (date: Date) => {
    if (!rangeSelection) return false
    const rangeStart = rangeSelection.start <= rangeSelection.current ? rangeSelection.start : rangeSelection.current
    const rangeEnd = rangeSelection.start <= rangeSelection.current ? rangeSelection.current : rangeSelection.start
    return date >= startOfDay(rangeStart) && date <= startOfDay(rangeEnd)
  }

  const handleDrop = (e: React.DragEvent, day: Date) => {
    e.preventDefault()
    const eventId = e.dataTransfer.getData("text/plain")
    const event = events.find((ev) => ev.id === eventId)
    if (!event) return

    const deltaDays = differenceInCalendarDays(day, event.start)
    if (deltaDays === 0) return
    onUpdateEvent(event.id, { start: addDays(event.start, deltaDays), end: addDays(event.end, deltaDays) })
  }

  return (
    <div className={`flex flex-1 flex-col overflow-hidden ${rangeSelection ? "select-none" : ""}`}>
      <div className="grid grid-cols-7 border-b border-border bg-background">
        {WEEKDAY_HEADERS.map((day, i) => (
          <div key={i} className="border-r border-border py-3 text-center text-xs font-medium text-muted-foreground">
            {formatWeekdayShort(day)}
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
                } ${isToday(day) ? "bg-accent/40" : ""} ${isInSelection(day) ? "bg-accent/60 ring-1 ring-inset ring-foreground/30" : ""}`}
                onMouseDown={() => setRangeSelection({ start: day, current: day })}
                onMouseEnter={(e) => {
                  if (rangeSelection && e.buttons === 1) {
                    setRangeSelection((prev) => (prev ? { ...prev, current: day } : prev))
                  }
                }}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => handleDrop(e, day)}
              >
                <div
                  className={`mb-1 flex h-7 w-7 items-center justify-center border text-sm ${
                    isToday(day)
                      ? "bg-foreground text-background border-foreground font-semibold"
                      : isCurrentMonth(day)
                        ? "border-transparent text-foreground"
                        : "border-transparent text-muted-foreground"
                  }`}
                >
                  {day.getDate()}
                </div>

                <div className="space-y-1">
                  {dayEvents.slice(0, 3).map((event) => (
                    <div
                      key={event.id}
                      role="button"
                      tabIndex={0}
                      draggable={event.editable !== false}
                      onDragStart={(e) => {
                        e.dataTransfer.setData("text/plain", event.id)
                        e.dataTransfer.effectAllowed = "move"
                      }}
                      className={`flex items-center gap-1 truncate px-1.5 py-0.5 text-xs font-mono text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring ${
                        COLOR_CLASSES[event.color] ?? "bg-muted text-foreground"
                      }`}
                      onMouseDown={(e) => e.stopPropagation()}
                      onClick={(e) => {
                        e.stopPropagation()
                        onEditEvent(event)
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault()
                          onEditEvent(event)
                        } else if ((e.key === "Delete" || e.key === "Backspace") && event.editable !== false) {
                          e.preventDefault()
                          onDeleteEvent(event)
                        }
                      }}
                    >
                      {event.recurringEventId && <Repeat className="h-2.5 w-2.5 shrink-0 opacity-80" />}
                      {!event.allDay && <span className="shrink-0">{formatEventTime(event.start)}</span>}
                      <span className="truncate">{event.title}</span>
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
