"use client"

import type React from "react"
import { useRef } from "react"
import type { CalendarEvent } from "@/types/calendar"
import { GripVertical, Repeat } from "lucide-react"
import { useEventDragResize } from "@/hooks/use-event-drag-resize"
import { formatEventTime } from "@/lib/calendar-format"

interface EventCardProps {
  event: CalendarEvent
  hourHeight: number
  onEdit: (event: CalendarEvent) => void
  onUpdate: (eventId: string, updates: Partial<CalendarEvent>) => void
  onDelete?: (event: CalendarEvent) => void
  /**
   * Given a pointer's clientX, returns the calendar date of the day column
   * under it. Passed by multi-column views (WeekView) so a drag can also
   * move the event to a different day; omitted by single-column views
   * (DayView), where a move can only ever change the time.
   */
  getDateAtX?: (clientX: number) => Date | null
  /** Horizontal slot for side-by-side overlapping events, as percentages of the column width. Defaults to full width. */
  layout?: { left: number; width: number }
}

const COLOR_CLASSES: Record<string, string> = {
  blue: "bg-blue-700 border-blue-900",
  amber: "bg-amber-700 border-amber-900",
  green: "bg-emerald-800 border-emerald-950",
  pink: "bg-fuchsia-800 border-fuchsia-950",
}

export function EventCard({ event, hourHeight, onEdit, onUpdate, onDelete, getDateAtX, layout }: EventCardProps) {
  const isEditable = event.editable !== false
  const hasDraggedRef = useRef(false)

  const { position, activeHandle, handlePointerDown } = useEventDragResize({
    start: event.start,
    end: event.end,
    hourHeight,
    editable: isEditable,
    getDateAtX,
    onCommit: (start, end) => {
      hasDraggedRef.current = true
      onUpdate(event.id, { start, end })
    },
  })

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault()
      onEdit(event)
    } else if ((e.key === "Delete" || e.key === "Backspace") && isEditable && onDelete) {
      e.preventDefault()
      onDelete(event)
    }
  }

  // Fallback for transparent or missing color
  const needsFallbackBg = !event.color || event.color === "transparent" || event.color === "rgba(0,0,0,0)" || event.color === "#0000" || event.color === "#00000000"

  return (
    <div
      data-event
      role="button"
      tabIndex={0}
      aria-label={`${event.title}, ${formatEventTime(event.start)} to ${formatEventTime(event.end)}`}
      className={`group absolute overflow-hidden border-l-4 px-2 py-1 text-sm transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring ${isEditable ? "cursor-pointer" : "cursor-default opacity-75"} ${
        COLOR_CLASSES[event.color] || (needsFallbackBg ? "bg-muted text-foreground border-border" : "text-white")
      } ${activeHandle ? "opacity-80 z-50" : "z-10"}`}
      style={{
        top: `${position.top}px`,
        height: `${position.height}px`,
        // Expand to full width while actively dragging/resizing so the
        // event being manipulated isn't squeezed into a narrow column.
        left: `calc(${activeHandle ? 0 : (layout?.left ?? 0)}% + 2px)`,
        width: `calc(${activeHandle ? 100 : (layout?.width ?? 100)}% - 4px)`,
        backgroundColor: needsFallbackBg ? "var(--muted)" : undefined,
        color: needsFallbackBg ? "var(--foreground)" : undefined,
        borderColor: needsFallbackBg ? "var(--border)" : undefined,
      }}
      onClick={() => {
        if (!hasDraggedRef.current) onEdit(event)
        hasDraggedRef.current = false
      }}
      onKeyDown={handleKeyDown}
    >
      {isEditable && (
        <div
          className="absolute inset-x-0 top-0 h-2 cursor-ns-resize opacity-0 group-hover:opacity-100 transition-opacity"
          onMouseDown={(e) => handlePointerDown(e, "resize-start")}
        />
      )}

      <div className={`flex items-start gap-1 ${isEditable ? "cursor-move" : "cursor-default"}`} onMouseDown={(e) => handlePointerDown(e, "move")}>
        {isEditable && <GripVertical className="h-3 w-3 opacity-0 group-hover:opacity-70 shrink-0 mt-0.5" />}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1 truncate font-medium leading-tight">
            {event.recurringEventId && <Repeat className="h-3 w-3 shrink-0 opacity-70" />}
            <span className="truncate">{event.title}</span>
          </div>
          <div className="text-xs opacity-90">
            {formatEventTime(event.start)} - {formatEventTime(event.end)}
          </div>
          {event.description && position.height > 50 && (
            <div className="mt-0.5 text-xs opacity-80 truncate">{event.description}</div>
          )}
        </div>
      </div>

      {isEditable && (
        <div
          className="absolute inset-x-0 bottom-0 h-2 cursor-ns-resize opacity-0 group-hover:opacity-100 transition-opacity"
          onMouseDown={(e) => handlePointerDown(e, "resize-end")}
        />
      )}
    </div>
  )
}
