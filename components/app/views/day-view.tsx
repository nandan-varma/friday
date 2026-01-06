"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import type { CalendarEvent } from "@/app/(app)/app/page"
import { EventCard } from "@/components/app/event-card"

interface DayViewProps {
  events: CalendarEvent[]
  selectedDate: Date
  onCreateEvent: (start: Date, end: Date) => void
  onEditEvent: (event: CalendarEvent) => void
  onUpdateEvent: (eventId: string, updates: Partial<CalendarEvent>) => void
}

const HOURS = Array.from({ length: 24 }, (_, i) => i)
const HOUR_HEIGHT = 60

export function DayView({ events, selectedDate, onCreateEvent, onEditEvent, onUpdateEvent }: DayViewProps) {
  const gridRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState<{ y: number } | null>(null)
  const [dragCurrent, setDragCurrent] = useState<{ y: number } | null>(null)
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 60000)
    return () => clearInterval(timer)
  }, [])

  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest("[data-event]")) return

    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
    const y = e.clientY - rect.top
    setDragStart({ y })
    setIsDragging(true)
    setDragCurrent({ y })
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !dragStart) return
    const rect = gridRef.current?.getBoundingClientRect()
    if (!rect) return
    const y = e.clientY - rect.top
    setDragCurrent({ y })
  }

  const handleMouseUp = (e: React.MouseEvent) => {
    if (!isDragging || !dragStart) return

    const rect = gridRef.current?.getBoundingClientRect()
    if (!rect) return

    const endY = e.clientY - rect.top
    const startMinutes = Math.round((dragStart.y / HOUR_HEIGHT) * 60)
    const endMinutes = Math.round((endY / HOUR_HEIGHT) * 60)

    const startHour = Math.floor(Math.min(startMinutes, endMinutes) / 60)
    const startMin = Math.round((Math.min(startMinutes, endMinutes) % 60) / 15) * 15
    const endHour = Math.floor(Math.max(startMinutes, endMinutes) / 60)
    const endMin = Math.round((Math.max(startMinutes, endMinutes) % 60) / 15) * 15

    const startDate = new Date(selectedDate)
    startDate.setHours(startHour, startMin, 0, 0)

    const endDate = new Date(selectedDate)
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

    const snappedStartMinutes = Math.round(((startY / HOUR_HEIGHT) * 60) / 15) * 15
    const snappedEndMinutes = Math.round(((endY / HOUR_HEIGHT) * 60) / 15) * 15
    const snappedStartY = (snappedStartMinutes / 60) * HOUR_HEIGHT
    const snappedHeight = ((snappedEndMinutes - snappedStartMinutes) / 60) * HOUR_HEIGHT

    return {
      top: snappedStartY,
      height: Math.max(snappedHeight, HOUR_HEIGHT / 4), // Minimum 15 minutes
    }
  }

  const dragPreview = getDragPreview()

  const getCurrentTimePosition = () => {
    const minutes = currentTime.getHours() * 60 + currentTime.getMinutes()
    return (minutes / 60) * HOUR_HEIGHT
  }

  const isToday = () => {
    const today = new Date()
    return (
      selectedDate.getDate() === today.getDate() &&
      selectedDate.getMonth() === today.getMonth() &&
      selectedDate.getFullYear() === today.getFullYear()
    )
  }

  const dayEvents = events.filter((event) => {
    const eventDate = new Date(event.start)
    return (
      eventDate.getDate() === selectedDate.getDate() &&
      eventDate.getMonth() === selectedDate.getMonth() &&
      eventDate.getFullYear() === selectedDate.getFullYear()
    )
  })

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="flex border-b border-border bg-background">
        <div className="w-16 border-r border-border" />
        <div className={`flex-1 flex flex-col items-center justify-center py-2 ${isToday() ? "bg-blue-600/10" : ""}`}>
          <span className="text-xs font-medium text-muted-foreground uppercase">
            {selectedDate.toLocaleDateString("en-US", { weekday: "long" })}
          </span>
          <span
            className={`mt-1 flex h-12 w-12 items-center justify-center rounded-full text-3xl ${
              isToday() ? "bg-blue-600 text-white" : "text-foreground"
            }`}
          >
            {selectedDate.getDate()}
          </span>
        </div>
      </div>

      <div className="relative flex-1 overflow-auto" ref={gridRef} onMouseMove={handleMouseMove}>
        <div className="flex">
          <div className="sticky left-0 z-10 w-16 bg-background">
            {HOURS.map((hour) => (
              <div key={hour} className="flex h-[60px] items-start justify-end border-b border-border pr-2 pt-1">
                <span className="text-xs text-muted-foreground">
                  {hour === 0 ? "12 AM" : hour < 12 ? `${hour} AM` : hour === 12 ? "12 PM" : `${hour - 12} PM`}
                </span>
              </div>
            ))}
          </div>

          <div
            className={`relative flex-1 border-r border-border ${isToday() ? "bg-blue-600/5" : ""}`}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
          >
            {HOURS.map((hour) => (
              <div
                key={hour}
                className="h-[60px] border-b border-border hover:bg-accent/50 cursor-crosshair transition-colors"
              />
            ))}

            {dayEvents.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                hourHeight={HOUR_HEIGHT}
                onEdit={onEditEvent}
                onUpdate={onUpdateEvent}
              />
            ))}

            {dragPreview && (
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

            {isToday() && (
              <div
                className="absolute left-0 right-0 z-20 flex items-center"
                style={{ top: `${getCurrentTimePosition()}px` }}
              >
                <div className="h-3 w-3 rounded-full bg-red-600" />
                <div className="h-0.5 flex-1 bg-red-600" />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
