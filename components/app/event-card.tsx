"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import type { CalendarEvent } from "@/types/calendar"
import { GripVertical } from "lucide-react"

interface EventCardProps {
  event: CalendarEvent
  hourHeight: number
  onEdit: (event: CalendarEvent) => void
  onUpdate: (eventId: string, updates: Partial<CalendarEvent>) => void
}

export function EventCard({ event, hourHeight, onEdit, onUpdate }: EventCardProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [isResizing, setIsResizing] = useState<"top" | "bottom" | null>(null)
  const [position, setPosition] = useState({ top: 0, height: 0 })
  const cardRef = useRef<HTMLDivElement>(null)
  const dragStartRef = useRef({ y: 0, originalTop: 0, originalHeight: 0 })
  const hasDraggedRef = useRef(false)

  useEffect(() => {
    const startMinutes = event.start.getHours() * 60 + event.start.getMinutes()
    const endMinutes = event.end.getHours() * 60 + event.end.getMinutes()
    const top = (startMinutes / 60) * hourHeight
    const height = ((endMinutes - startMinutes) / 60) * hourHeight

    setPosition({ top, height: Math.max(height, 20) })
  }, [event.start, event.end, hourHeight])

  const handleMouseDown = (e: React.MouseEvent, type: "drag" | "resize-top" | "resize-bottom") => {
    // Prevent dragging/resizing if event is not editable
    if (event.editable === false) {
      return
    }
    e.stopPropagation()
    hasDraggedRef.current = false

    dragStartRef.current = {
      y: e.clientY,
      originalTop: position.top,
      originalHeight: position.height,
    }

    if (type === "drag") {
      setIsDragging(true)
    } else if (type === "resize-top") {
      setIsResizing("top")
    } else {
      setIsResizing("bottom")
    }

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaY = moveEvent.clientY - dragStartRef.current.y
      const snapInterval = (15 / 60) * hourHeight

      if (Math.abs(deltaY) > 3) {
        hasDraggedRef.current = true
      }

      if (type === "drag") {
        const newTop = dragStartRef.current.originalTop + deltaY
        const snappedTop = Math.round(newTop / snapInterval) * snapInterval
        setPosition((prev) => ({ ...prev, top: Math.max(0, snappedTop) }))
      } else if (type === "resize-top") {
        const newTop = dragStartRef.current.originalTop + deltaY
        const newHeight = dragStartRef.current.originalHeight - deltaY
        const snappedTop = Math.round(newTop / snapInterval) * snapInterval
        const snappedHeight = Math.round(newHeight / snapInterval) * snapInterval

        if (snappedHeight >= 20) {
          setPosition({ top: snappedTop, height: snappedHeight })
        }
      } else if (type === "resize-bottom") {
        const newHeight = dragStartRef.current.originalHeight + deltaY
        const snappedHeight = Math.round(newHeight / snapInterval) * snapInterval
        setPosition((prev) => ({ ...prev, height: Math.max(20, snappedHeight) }))
      }
    }

    const handleMouseUp = () => {
      if ((isDragging || isResizing) && hasDraggedRef.current) {
        const startMinutes = (position.top / hourHeight) * 60
        const durationMinutes = (position.height / hourHeight) * 60

        const newStart = new Date(event.start)
        newStart.setHours(Math.floor(startMinutes / 60), Math.round(startMinutes % 60), 0, 0)

        const newEnd = new Date(newStart)
        newEnd.setMinutes(newEnd.getMinutes() + durationMinutes)

        onUpdate(event.id, { start: newStart, end: newEnd })
      }

      setIsDragging(false)
      setIsResizing(null)
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
    }

    document.addEventListener("mousemove", handleMouseMove)
    document.addEventListener("mouseup", handleMouseUp)
  }

  const formatTime = (date: Date) => {
    const hours = date.getHours()
    const minutes = date.getMinutes()
    const ampm = hours >= 12 ? "PM" : "AM"
    const displayHours = hours % 12 || 12
    return `${displayHours}:${minutes.toString().padStart(2, "0")}${ampm}`
  }


  const colorClasses = {
    blue: "bg-blue-600/90 hover:bg-blue-600 border-blue-700",
    amber: "bg-amber-500/90 hover:bg-amber-500 border-amber-600",
    green: "bg-green-600/90 hover:bg-green-600 border-green-700",
    pink: "bg-pink-600/90 hover:bg-pink-600 border-pink-700",
  }

  // Fallback for transparent or missing color
  const needsFallbackBg = !event.color || event.color === "transparent" || event.color === "rgba(0,0,0,0)" || event.color === "#0000" || event.color === "#00000000"

  return (
    <div
      ref={cardRef}
      data-event
      className={`group absolute left-1 right-1 overflow-hidden rounded-md border-l-4 px-2 py-1 text-sm shadow-md transition-all ${event.editable === false ? 'cursor-default opacity-75' : 'cursor-pointer'} ${
        colorClasses[event.color as keyof typeof colorClasses] || (needsFallbackBg ? "bg-gray-200 text-foreground border-gray-300" : "text-white")
      } ${isDragging || isResizing ? "opacity-90 scale-[1.02] shadow-lg z-50" : event.editable !== false ? "hover:scale-[1.01] hover:shadow-lg z-10" : "z-10"}`}
      style={{
        top: `${position.top}px`,
        height: `${position.height}px`,
        backgroundColor: needsFallbackBg ? "#e5e7eb" : undefined,
        color: needsFallbackBg ? "#111827" : undefined,
        borderColor: needsFallbackBg ? "#d1d5db" : undefined,
      }}
      onClick={(e) => {
        if (!hasDraggedRef.current) {
          onEdit(event)
        }
      }}
    >
      {event.editable !== false && (
        <div
          className="absolute inset-x-0 top-0 h-2 cursor-ns-resize opacity-0 group-hover:opacity-100 transition-opacity"
          onMouseDown={(e) => handleMouseDown(e, "resize-top")}
        />
      )}

      <div className={`flex items-start gap-1 ${event.editable !== false ? 'cursor-move' : 'cursor-default'}`} onMouseDown={(e) => handleMouseDown(e, "drag")}>
        {event.editable !== false && <GripVertical className="h-3 w-3 opacity-0 group-hover:opacity-70 shrink-0 mt-0.5" />}
        <div className="flex-1 min-w-0">
          <div className="truncate font-medium leading-tight">{event.title}</div>
          <div className="text-xs opacity-90">
            {formatTime(event.start)} - {formatTime(event.end)}
          </div>
          {event.description && position.height > 50 && (
            <div className="mt-0.5 text-xs opacity-80 truncate">{event.description}</div>
          )}
        </div>
      </div>

      {event.editable !== false && (
        <div
          className="absolute inset-x-0 bottom-0 h-2 cursor-ns-resize opacity-0 group-hover:opacity-100 transition-opacity"
          onMouseDown={(e) => handleMouseDown(e, "resize-bottom")}
        />
      )}
    </div>
  )
}
