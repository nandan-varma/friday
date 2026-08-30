"use client";

import { Repeat } from "lucide-react";
import type React from "react";
import type { CalendarEvent } from "@/types/calendar";

interface AllDayEventBarProps {
  event: CalendarEvent;
  onEdit: (event: CalendarEvent) => void;
  onDelete?: (event: CalendarEvent) => void;
  /** Enables horizontal drag-to-move across days via native HTML5 DnD. */
  draggable?: boolean;
  style?: React.CSSProperties;
}

const COLOR_CLASSES: Record<string, string> = {
  blue: "bg-blue-700 border-blue-900",
  amber: "bg-amber-700 border-amber-900",
  green: "bg-emerald-800 border-emerald-950",
  pink: "bg-fuchsia-800 border-fuchsia-950",
};

export function AllDayEventBar({
  event,
  onEdit,
  onDelete,
  draggable,
  style,
}: AllDayEventBarProps) {
  const isEditable = event.editable !== false;

  return (
    <div
      data-event
      role="button"
      tabIndex={0}
      aria-label={`${event.title}, all day`}
      draggable={draggable && isEditable}
      onDragStart={(e) => {
        e.dataTransfer.setData("text/plain", event.id);
        e.dataTransfer.effectAllowed = "move";
      }}
      className={`truncate border-l-4 px-1.5 py-0.5 text-xs font-medium text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring ${
        COLOR_CLASSES[event.color] || "bg-muted text-foreground border-border"
      } ${isEditable ? "cursor-pointer" : "cursor-default opacity-75"}`}
      style={style}
      onClick={() => onEdit(event)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onEdit(event);
        } else if (
          (e.key === "Delete" || e.key === "Backspace") &&
          isEditable &&
          onDelete
        ) {
          e.preventDefault();
          onDelete(event);
        }
      }}
    >
      <span className="inline-flex items-center gap-1">
        {event.recurringEventId && (
          <Repeat className="h-2.5 w-2.5 shrink-0 opacity-70" />
        )}
        <span className="truncate">{event.title}</span>
      </span>
    </div>
  );
}
