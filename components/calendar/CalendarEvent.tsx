"use client";

import { CalendarEvent } from "@/lib/types";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface CalendarEventProps {
  event: CalendarEvent;
  onDragStart: (event: CalendarEvent) => void;
}

export function CalendarEventComponent({ event, onDragStart }: CalendarEventProps) {
  return (
    <div
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData("text/plain", event.id);
        onDragStart(event);
      }}
      className={cn(
        "text-xs bg-primary/10 rounded p-1 truncate cursor-move",
        "hover:bg-primary/20 active:bg-primary/30 transition-colors",
        "touch-action-none select-none"
      )}
    >
      <div className="font-medium">{format(event.start, "HH:mm")} - {event.title}</div>
    </div>
  );
}