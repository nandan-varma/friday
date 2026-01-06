"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import type { CalendarEvent } from "@/types/calendar"
import { EventCard } from "@/components/app/event-card"

interface WeekViewProps {
  events: CalendarEvent[]
  selectedDate: Date
  onCreateEvent: (start: Date, end: Date) => void
  onEditEvent: (event: CalendarEvent) => void
  onUpdateEvent: (eventId: string, updates: Partial<CalendarEvent>) => void
}

const HOURS = Array.from({ length: 24 }, (_, i) => i)
const HOUR_HEIGHT = 60

export function WeekView({ events, selectedDate, onCreateEvent, onEditEvent, onUpdateEvent }: WeekViewProps) {
  const gridRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState<{ x: number; y: number; dayIndex: number } | null>(null)
  const [dragCurrent, setDragCurrent] = useState<{ y: number } | null>(null)
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 60000)
    return () => clearInterval(timer)
  }, [])

  const getWeekDays = () => {
    const start = new Date(selectedDate)
    const day = start.getDay()
    const diff = start.getDate() - day
    const sunday = new Date(start.setDate(diff))

    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(sunday)
      date.setDate(sunday.getDate() + i)
      return date
    })
  }

  const weekDays = getWeekDays()

  const handleMouseDown = (e: React.MouseEvent, dayIndex: number) => {
    if ((e.target as HTMLElement).closest("[data-event]")) return

    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
    const y = e.clientY - rect.top
    setDragStart({ x: e.clientX, y, dayIndex })
    setIsDragging(true)
    setDragCurrent({ y })
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !dragStart || !gridRef.current) return
    const gridBody = gridRef.current.children[1] as HTMLElement
    const rect = gridBody?.getBoundingClientRect()
    if (!rect) return
    const y = e.clientY - rect.top
    setDragCurrent({ y })
  }

  const handleMouseUp = (e: React.MouseEvent) => {
    if (!isDragging || !dragStart || !gridRef.current) return

    const gridBody = gridRef.current.children[1] as HTMLElement
    const rect = gridBody?.getBoundingClientRect()
    if (!rect) return

    const endY = e.clientY - rect.top
    const startMinutes = Math.round((dragStart.y / HOUR_HEIGHT) * 60)
    const endMinutes = Math.round((endY / HOUR_HEIGHT) * 60)

    const startHour = Math.floor(Math.min(startMinutes, endMinutes) / 60)
    const startMin = Math.round((Math.min(startMinutes, endMinutes) % 60) / 15) * 15
    const endHour = Math.floor(Math.max(startMinutes, endMinutes) / 60)
    const endMin = Math.round((Math.max(startMinutes, endMinutes) % 60) / 15) * 15

    const startDate = new Date(weekDays[dragStart.dayIndex])
    startDate.setHours(startHour, startMin, 0, 0)

    const endDate = new Date(weekDays[dragStart.dayIndex])
    endDate.setHours(endHour, endMin, 0, 0)

    if (endDate > startDate) {
      onCreateEvent(startDate, endDate)
    }

    setIsDragging(false)
    setDragStart(null)
    setDragCurrent(null)
  }

  const getDragPreview = () => {
    if (!isDragging || !dragStart || !dragCurrent) return null

    const startY = Math.min(dragStart.y, dragCurrent.y)
    const endY = Math.max(dragStart.y, dragCurrent.y)
    const height = endY - startY

    const snappedStartMinutes = Math.round(((startY / HOUR_HEIGHT) * 60) / 15) * 15
    const snappedEndMinutes = Math.round(((endY / HOUR_HEIGHT) * 60) / 15) * 15
    const snappedStartY = (snappedStartMinutes / 60) * HOUR_HEIGHT
    const snappedHeight = ((snappedEndMinutes - snappedStartMinutes) / 60) * HOUR_HEIGHT

    return {
      top: snappedStartY,
      height: Math.max(snappedHeight, HOUR_HEIGHT / 4),
      dayIndex: dragStart.dayIndex,
    }
  }

  const dragPreview = getDragPreview()

  const getCurrentTimePosition = () => {
    const minutes = currentTime.getHours() * 60 + currentTime.getMinutes()
    return (minutes / 60) * HOUR_HEIGHT
  }

  const isCurrentDay = (date: Date) => {
    const today = new Date()
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    )
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="relative flex-1 overflow-auto" ref={gridRef} onMouseMove={handleMouseMove}>
        <div className="sticky top-0 z-30 grid grid-cols-[4rem_repeat(7,1fr)] border-b border-border bg-background">
          <div className="w-16 border-r border-border sticky left-0 z-40 bg-background" />
          {weekDays.map((day, i) => (
            <div
              key={i}
              className={`flex flex-col items-center justify-center py-2 border-r border-border ${
                isCurrentDay(day) ? "bg-blue-600/10" : ""
              }`}
            >
              <span className="text-xs font-medium text-muted-foreground uppercase">
                {day.toLocaleDateString("en-US", { weekday: "short" })}
              </span>
              <span
                className={`mt-1 flex h-10 w-10 items-center justify-center rounded-full text-2xl ${
                  isCurrentDay(day) ? "bg-blue-600 text-white" : "text-foreground"
                }`}
              >
                {day.getDate()}
              </span>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-[4rem_repeat(7,1fr)]">
          <div className="sticky left-0 z-10 bg-background border-r border-border">
            {HOURS.map((hour) => (
              <div key={hour} className="flex h-[60px] items-start justify-end border-b border-border pr-2 pt-1">
                <span className="text-xs text-muted-foreground">
                  {hour === 0 ? "12 AM" : hour < 12 ? `${hour} AM` : hour === 12 ? "12 PM" : `${hour - 12} PM`}
                </span>
              </div>
            ))}
          </div>

          {weekDays.map((day, dayIndex) => (
            <div
              key={dayIndex}
              className={`relative border-r border-border ${isCurrentDay(day) ? "bg-blue-600/5" : ""}`}
              onMouseDown={(e) => handleMouseDown(e, dayIndex)}
              onMouseUp={handleMouseUp}
            >
              {HOURS.map((hour) => (
                <div
                  key={hour}
                  className="h-[60px] border-b border-border hover:bg-accent/50 cursor-crosshair transition-colors"
                />
              ))}

              {events
                .filter((event) => {
                  const eventDate = new Date(event.start)
                  return (
                    eventDate.getDate() === day.getDate() &&
                    eventDate.getMonth() === day.getMonth() &&
                    eventDate.getFullYear() === day.getFullYear()
                  )
                })
                .map((event) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    hourHeight={HOUR_HEIGHT}
                    onEdit={onEditEvent}
                    onUpdate={onUpdateEvent}
                  />
                ))}

              {dragPreview && dragPreview.dayIndex === dayIndex && (
                <div
                  className="absolute left-1 right-1 z-10 rounded-md border-2 border-dashed border-blue-500 bg-blue-500/10 pointer-events-none"
                  style={{
                    top: `${dragPreview.top}px`,
                    height: `${dragPreview.height}px`,
                  }}
                >
                  <div className="p-2 text-xs text-blue-600 font-medium">New Event</div>
                </div>
              )}

              {isCurrentDay(day) && (
                <div
                  className="absolute left-0 right-0 z-20 flex items-center"
                  style={{ top: `${getCurrentTimePosition()}px` }}
                >
                  <div className="h-3 w-3 rounded-full bg-red-600" />
                  <div className="h-0.5 flex-1 bg-red-600" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
