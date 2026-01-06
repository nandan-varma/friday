"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import type { Event, Calendar as CalendarType } from "@/db/schema/calendar";
import { format } from "date-fns";

interface EventDetailsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event: Event | null;
  calendar?: CalendarType;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function EventDetails({
  open,
  onOpenChange,
  event,
  calendar,
  onEdit,
  onDelete,
}: EventDetailsProps) {
  if (!event) return null;

  const startDate = new Date(event.start);
  const endDate = new Date(event.end);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-y-auto">
        <SheetHeader>
          <div className="flex items-start gap-3">
            <div
              className="mt-1 size-3 shrink-0 rounded-full"
              style={{ backgroundColor: event.color || calendar?.color || "#3b82f6" }}
            />
            <div className="flex-1">
              <SheetTitle>{event.title}</SheetTitle>
              {calendar && (
                <SheetDescription className="mt-1">{calendar.name}</SheetDescription>
              )}
            </div>
          </div>
        </SheetHeader>

        <div className="mt-6 space-y-4">
          {/* Date & Time */}
          <div>
            <div className="text-muted-foreground mb-1 text-xs font-medium">Date & Time</div>
            {event.allDay ? (
              <div className="flex items-center gap-2">
                <span>{format(startDate, "EEEE, MMMM d, yyyy")}</span>
                <Badge variant="outline">
                  All day
                </Badge>
              </div>
            ) : (
              <div className="space-y-1 text-sm">
                <div>
                  <span className="text-muted-foreground">Start:</span>{" "}
                  {format(startDate, "EEEE, MMMM d, yyyy 'at' h:mm a")}
                </div>
                <div>
                  <span className="text-muted-foreground">End:</span>{" "}
                  {format(endDate, "EEEE, MMMM d, yyyy 'at' h:mm a")}
                </div>
              </div>
            )}
          </div>

          {/* Location */}
          {event.location && (
            <div>
              <div className="text-muted-foreground mb-1 text-xs font-medium">Location</div>
              <div className="text-sm">📍 {event.location}</div>
            </div>
          )}

          {/* Video Conference */}
          {event.videoConferenceUrl && (
            <div>
              <div className="text-muted-foreground mb-1 text-xs font-medium">Video Conference</div>
              <a
                href={event.videoConferenceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline text-sm"
              >
                🎥 Join meeting
              </a>
            </div>
          )}

          {/* Description */}
          {event.description && (
            <div>
              <div className="text-muted-foreground mb-1 text-xs font-medium">Description</div>
              <div className="text-muted-foreground whitespace-pre-wrap text-sm">
                {event.description}
              </div>
            </div>
          )}

          {/* Status */}
          {event.status && event.status !== "confirmed" && (
            <div>
              <div className="text-muted-foreground mb-1 text-xs font-medium">Status</div>
              <Badge variant={event.status === "cancelled" ? "destructive" : "outline"}>
                {event.status}
              </Badge>
            </div>
          )}

          {/* Attendees */}
          {event.attendees && (
            <div>
              <div className="text-muted-foreground mb-1 text-xs font-medium">Attendees</div>
              <div className="text-sm">
                {JSON.parse(event.attendees).map((email: string, i: number) => (
                  <div key={i}>{email}</div>
                ))}
              </div>
            </div>
          )}

          {/* Recurrence */}
          {event.recurrence && (
            <div>
              <div className="text-muted-foreground mb-1 text-xs font-medium">Recurrence</div>
              <div className="text-sm">{event.recurrence}</div>
            </div>
          )}
        </div>

        <SheetFooter className="mt-6">
          <div className="flex w-full gap-2">
            {onDelete && (
              <Button variant="destructive" onClick={onDelete} className="flex-1">
                Delete
              </Button>
            )}
            {onEdit && (
              <Button onClick={onEdit} className="flex-1">
                Edit
              </Button>
            )}
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
