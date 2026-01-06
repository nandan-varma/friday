"use client";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { ColorPicker } from "@/components/app/shared/color-picker";
import { TimePicker } from "@/components/app/shared/time-picker";
import type { Event, Calendar as CalendarType } from "@/db/schema/calendar";
import { format } from "date-fns";
import { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface EventDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event?: Event;
  calendars: CalendarType[];
  defaultDate?: Date;
  onSave: (event: Partial<Event>) => Promise<void>;
  onDelete?: (eventId: string) => Promise<void>;
}

export function EventDialog({
  open,
  onOpenChange,
  event,
  calendars,
  defaultDate,
  onSave,
  onDelete,
}: EventDialogProps) {
  const [title, setTitle] = useState(event?.title || "");
  const [description, setDescription] = useState(event?.description || "");
  const [location, setLocation] = useState(event?.location || "");
  const [videoConferenceUrl, setVideoConferenceUrl] = useState(event?.videoConferenceUrl || "");
  const [startDate, setStartDate] = useState<Date>(
    event?.start ? new Date(event.start) : defaultDate || new Date()
  );
  const [startTime, setStartTime] = useState(
    event?.start ? format(new Date(event.start), "HH:mm") : "09:00"
  );
  const [endDate, setEndDate] = useState<Date>(
    event?.end ? new Date(event.end) : defaultDate || new Date()
  );
  const [endTime, setEndTime] = useState(
    event?.end ? format(new Date(event.end), "HH:mm") : "10:00"
  );
  const [allDay, setAllDay] = useState(event?.allDay || false);
  const [calendarId, setCalendarId] = useState(event?.calendarId || calendars[0]?.id || "");
  const [color, setColor] = useState(event?.color || "");
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    if (!title.trim()) return;

    setIsLoading(true);
    try {
      const [startHour, startMinute] = startTime.split(":").map(Number);
      const [endHour, endMinute] = endTime.split(":").map(Number);

      const start = new Date(startDate);
      if (!allDay) {
        start.setHours(startHour, startMinute, 0, 0);
      } else {
        start.setHours(0, 0, 0, 0);
      }

      const end = new Date(endDate);
      if (!allDay) {
        end.setHours(endHour, endMinute, 0, 0);
      } else {
        end.setHours(23, 59, 59, 999);
      }

      await onSave({
        id: event?.id,
        title,
        description: description || null,
        location: location || null,
        videoConferenceUrl: videoConferenceUrl || null,
        start,
        end,
        allDay,
        calendarId,
        color: color || null,
        userId: event?.userId || "",
      });

      onOpenChange(false);
    } catch (error) {
      console.error("Failed to save event:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!event?.id || !onDelete) return;

    setIsLoading(true);
    try {
      await onDelete(event.id);
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to delete event:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{event ? "Edit Event" : "Create Event"}</DialogTitle>
          <DialogDescription>
            {event ? "Make changes to your event" : "Add a new event to your calendar"}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* Title */}
          <Field>
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Event title"
            />
          </Field>

          {/* Calendar Selection */}
          <Field>
            <Label>Calendar</Label>
            <Select value={calendarId} onValueChange={(val) => val && setCalendarId(val)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {calendars.map((cal) => (
                  <SelectItem key={cal.id} value={cal.id}>
                    <div className="flex items-center gap-2">
                      <div
                        className="size-3 rounded-full"
                        style={{ backgroundColor: cal.color }}
                      />
                      {cal.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          {/* All Day Toggle */}
          <div className="flex items-center justify-between">
            <Label htmlFor="all-day">All day event</Label>
            <Switch id="all-day" checked={allDay} onCheckedChange={setAllDay} />
          </div>

          {/* Start Date & Time */}
          <div className="grid gap-2 sm:grid-cols-2">
            <Field>
              <Label>Start Date</Label>
              <Popover>
                <PopoverTrigger className="flex h-8 w-full items-center justify-start gap-1.5 rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm transition-colors hover:bg-muted/50 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50">
                  {format(startDate, "MMM d, yyyy")}
                </PopoverTrigger>
                <PopoverContent>
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={(date) => date && setStartDate(date)}
                  />
                </PopoverContent>
              </Popover>
            </Field>
            {!allDay && (
              <Field>
                <Label>Start Time</Label>
                <TimePicker value={startTime} onChange={setStartTime} />
              </Field>
            )}
          </div>

          {/* End Date & Time */}
          <div className="grid gap-2 sm:grid-cols-2">
            <Field>
              <Label>End Date</Label>
              <Popover>
                <PopoverTrigger className="flex h-8 w-full items-center justify-start gap-1.5 rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm transition-colors hover:bg-muted/50 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50">
                  {format(endDate, "MMM d, yyyy")}
                </PopoverTrigger>
                <PopoverContent>
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={(date) => date && setEndDate(date)}
                  />
                </PopoverContent>
              </Popover>
            </Field>
            {!allDay && (
              <Field>
                <Label>End Time</Label>
                <TimePicker value={endTime} onChange={setEndTime} />
              </Field>
            )}
          </div>

          {/* Location */}
          <Field>
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Add location"
            />
          </Field>

          {/* Video Conference */}
          <Field>
            <Label htmlFor="video">Video Conference URL</Label>
            <Input
              id="video"
              type="url"
              value={videoConferenceUrl}
              onChange={(e) => setVideoConferenceUrl(e.target.value)}
              placeholder="https://meet.google.com/..."
            />
          </Field>

          {/* Description */}
          <Field>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add description"
              rows={3}
            />
          </Field>

          {/* Color */}
          <Field>
            <Label>Event Color (Optional)</Label>
            <ColorPicker value={color} onChange={setColor} />
          </Field>
        </div>

        <DialogFooter className="flex-row justify-between gap-2">
          {event && onDelete && (
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isLoading}
            >
              Delete
            </Button>
          )}
          <div className="ml-auto flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isLoading || !title.trim()}>
              {isLoading ? "Saving..." : event ? "Save Changes" : "Create Event"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
