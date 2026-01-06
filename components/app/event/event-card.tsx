"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Event } from "@/db/schema/calendar";
import { format } from "date-fns";

interface EventCardProps {
  event: Event & { calendarColor?: string };
  onClick?: () => void;
  variant?: "grid" | "list";
  className?: string;
}

export function EventCard({ event, onClick, variant = "grid", className }: EventCardProps) {
  const startTime = format(new Date(event.start), event.allDay ? "MMM d" : "h:mm a");
  const endTime = format(new Date(event.end), event.allDay ? "MMM d" : "h:mm a");
  const color = event.color || event.calendarColor || "#3b82f6";

  if (variant === "list") {
    return (
      <button
        onClick={onClick}
        className={cn(
          "flex w-full items-start gap-3 rounded-lg border p-3 text-left transition-colors hover:bg-muted",
          className
        )}
        style={{ borderLeftWidth: "4px", borderLeftColor: color }}
      >
        <div className="flex flex-col gap-0.5">
          <div className="font-medium">{event.title}</div>
          {event.description && (
            <div className="text-muted-foreground text-xs line-clamp-1">{event.description}</div>
          )}
          <div className="text-muted-foreground mt-1 flex flex-wrap items-center gap-2 text-xs">
            {event.allDay ? (
              <Badge variant="outline">
                All day
              </Badge>
            ) : (
              <span>
                {startTime} - {endTime}
              </span>
            )}
            {event.location && <span>📍 {event.location}</span>}
            {event.videoConferenceUrl && <span>🎥 Video call</span>}
          </div>
        </div>
      </button>
    );
  }

  // Grid variant - compact for calendar cells
  return (
    <button
      onClick={onClick}
      className={cn(
        "mb-1 w-full rounded px-1.5 py-0.5 text-left text-xs transition-opacity hover:opacity-80",
        className
      )}
      style={{
        backgroundColor: color,
        color: getContrastColor(color),
      }}
    >
      <div className="truncate font-medium">
        {!event.allDay && <span className="mr-1">{format(new Date(event.start), "h:mm")}</span>}
        {event.title}
      </div>
    </button>
  );
}

// Helper to determine if text should be light or dark based on background color
function getContrastColor(hexColor: string): string {
  const hex = hexColor.replace("#", "");
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5 ? "#000000" : "#ffffff";
}
