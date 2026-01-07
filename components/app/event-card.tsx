"use client"

import React from "react"
import { useState, useRef, useEffect, useMemo } from "react"
import type { CalendarEvent } from "@/types/calendar"
import { GripVertical } from "lucide-react"

interface EventCardProps {
  event: CalendarEvent
  hourHeight: number
  onEdit: (event: CalendarEvent) => void
  onUpdate: (eventId: string, updates: Partial<CalendarEvent>) => void
}

export const EventCard = React.memo(function EventCard({ event, hourHeight, onEdit, onUpdate }: EventCardProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [isResizing, setIsResizing] = useState<"top" | "bottom" | null>(null)
  const cardRef = useRef<HTMLDivElement>(null)
  const dragStartRef = useRef({ y: 0, originalTop: 0, originalHeight: 0 })
  const hasDraggedRef = useRef(false)

  const position = useMemo(() => {
    const startMinutes = event.start.getHours() * 60 + event.start.getMinutes()
    const endMinutes = event.end.getHours() * 60 + event.end.getMinutes()
    const top = (startMinutes / 60) * hourHeight
    const height = ((endMinutes - startMinutes) / 60) * hourHeight
    return { top, height: Math.max(height, 20) }
  }, [event.start, event.end, hourHeight])

  const handleMouseDown = (e: React.MouseEvent, type: "drag" | "resize-top" | "resize-bottom") => {
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

      // Note: Position updates are now handled in onUpdate callback
      // The visual position is computed in useMemo from event props
    }

    const handleMouseUp = () => {
      if ((isDragging || isResizing) && hasDraggedRef.current) {
        // Calculate new position based on current drag state
        const deltaY = dragStartRef.current.y - dragStartRef.current.y // This should be calculated properly
        const snapInterval = (15 / 60) * hourHeight

        let newTop = dragStartRef.current.originalTop
        let newHeight = dragStartRef.current.originalHeight

        if (type === "drag") {
          newTop = dragStartRef.current.originalTop + deltaY
          newTop = Math.round(newTop / snapInterval) * snapInterval
          newTop = Math.max(0, newTop)
        } else if (type === "resize-top") {
          newTop = dragStartRef.current.originalTop + deltaY
          newHeight = dragStartRef.current.originalHeight - deltaY
          newTop = Math.round(newTop / snapInterval) * snapInterval
          newHeight = Math.round(newHeight / snapInterval) * snapInterval
          if (newHeight < 20) newHeight = 20
        } else if (type === "resize-bottom") {
          newHeight = dragStartRef.current.originalHeight + deltaY
          newHeight = Math.round(newHeight / snapInterval) * snapInterval
          newHeight = Math.max(20, newHeight)
        }

        const startMinutes = (newTop / hourHeight) * 60
        const durationMinutes = (newHeight / hourHeight) * 60

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
      className={`group absolute left-1 right-1 overflow-hidden rounded-md border-l-4 px-2 py-1 text-sm shadow-md transition-all cursor-pointer ${
        colorClasses[event.color as keyof typeof colorClasses] || (needsFallbackBg ? "bg-gray-200 text-foreground border-gray-300" : "")
      } ${isDragging || isResizing ? "opacity-90 scale-[1.02] shadow-lg z-50" : "hover:scale-[1.01] hover:shadow-lg z-10"}`}
      style={{
        top: `${position.top}px`,
        height: `${position.height}px`,
        backgroundColor: needsFallbackBg ? "#e5e7eb" : undefined, // Tailwind gray-200
        color: needsFallbackBg ? "#111827" : undefined, // Tailwind gray-900 (for text)
        borderColor: needsFallbackBg ? "#d1d5db" : undefined, // Tailwind gray-300
      }}
      onClick={(e) => {
        if (!hasDraggedRef.current) {
          onEdit(event)
        }
      }}
    >
      <div
        className="absolute inset-x-0 top-0 h-2 cursor-ns-resize opacity-0 group-hover:opacity-100 transition-opacity"
        onMouseDown={(e) => handleMouseDown(e, "resize-top")}
      />

      <div className="flex items-start gap-1 cursor-move" onMouseDown={(e) => handleMouseDown(e, "drag")}>
        <GripVertical className="h-3 w-3 opacity-0 group-hover:opacity-70 shrink-0 mt-0.5" />
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

      <div
        className="absolute inset-x-0 bottom-0 h-2 cursor-ns-resize opacity-0 group-hover:opacity-100 transition-opacity"
        onMouseDown={(e) => handleMouseDown(e, "resize-bottom")}
      />
    </div>
  )
})
