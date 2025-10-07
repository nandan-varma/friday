"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { createEvent, updateEvent } from "@/lib/actions";

interface EventFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  initialData?: {
    id?: string;
    title?: string;
    description?: string;
    location?: string;
    startTime?: Date;
    endTime?: Date;
    isAllDay?: boolean;
    recurrence?: string;
  };
  selectedDate?: Date;
}

export function EventForm({
  isOpen,
  onClose,
  onSave,
  initialData,
  selectedDate,
}: EventFormProps) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location: "",
    startDate: selectedDate || new Date(),
    startTime: "09:00",
    endDate: selectedDate || new Date(),
    endTime: "10:00",
    isAllDay: false,
    recurrence: "none",
  });

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (initialData) {
      const startDate = initialData.startTime
        ? new Date(initialData.startTime)
        : selectedDate || new Date();
      const endDate = initialData.endTime
        ? new Date(initialData.endTime)
        : selectedDate || new Date();

      setFormData({
        title: initialData.title || "",
        description: initialData.description || "",
        location: initialData.location || "",
        startDate,
        startTime: initialData.startTime
          ? format(new Date(initialData.startTime), "HH:mm")
          : "09:00",
        endDate,
        endTime: initialData.endTime
          ? format(new Date(initialData.endTime), "HH:mm")
          : "10:00",
        isAllDay: initialData.isAllDay || false,
        recurrence: initialData.recurrence || "none",
      });
    } else if (selectedDate) {
      setFormData((prev) => ({
        ...prev,
        startDate: selectedDate,
        endDate: selectedDate,
      }));
    }
  }, [initialData, selectedDate]);

  // Update hidden inputs when formData changes
  useEffect(() => {
    const form = document.querySelector("form[action]") as HTMLFormElement;
    if (form) {
      const startDateInput = form.querySelector(
        'input[name="startDate"]',
      ) as HTMLInputElement;
      const endDateInput = form.querySelector(
        'input[name="endDate"]',
      ) as HTMLInputElement;
      const startTimeInput = form.querySelector(
        'input[name="startTime"]',
      ) as HTMLInputElement;
      const endTimeInput = form.querySelector(
        'input[name="endTime"]',
      ) as HTMLInputElement;
      const recurrenceInput = form.querySelector(
        'input[name="recurrence"]',
      ) as HTMLInputElement;

      if (startDateInput)
        startDateInput.value = formData.startDate.toISOString();
      if (endDateInput) endDateInput.value = formData.endDate.toISOString();
      if (startTimeInput) startTimeInput.value = formData.startTime;
      if (endTimeInput) endTimeInput.value = formData.endTime;
      if (recurrenceInput) recurrenceInput.value = formData.recurrence;
    }
  }, [formData]);

  const handleSubmit = async (formData: FormData) => {
    if (!formData.get("title")?.toString().trim()) {
      toast({
        title: "Error",
        description: "Please enter an event title",
        variant: "destructive",
      });
      return;
    }

    try {
      setSaving(true);

      // Add calculated fields to formData
      let startTime: Date;
      let endTime: Date;

      if (formData.get("isAllDay") === "true") {
        startTime = new Date(formData.get("startDate") as string);
        startTime.setHours(0, 0, 0, 0);
        endTime = new Date(formData.get("endDate") as string);
        endTime.setHours(23, 59, 59, 999);
      } else {
        const startTimeStr = formData.get("startTime") as string;
        const endTimeStr = formData.get("endTime") as string;
        const [startHour, startMinute] = startTimeStr.split(":").map(Number);
        const [endHour, endMinute] = endTimeStr.split(":").map(Number);

        startTime = new Date(formData.get("startDate") as string);
        startTime.setHours(startHour, startMinute, 0, 0);

        endTime = new Date(formData.get("endDate") as string);
        endTime.setHours(endHour, endMinute, 0, 0);
      }

      formData.set("startTime", startTime.toISOString());
      formData.set("endTime", endTime.toISOString());

      if (initialData?.id) {
        formData.set("eventId", initialData.id);
        await updateEvent(formData);
        toast({
          title: "Success",
          description: "Event updated successfully",
        });
      } else {
        await createEvent(formData);
        toast({
          title: "Success",
          description: "Event created successfully",
        });
      }

      onSave();
      onClose();
    } catch (error) {
      console.error("Error saving event:", error);
      toast({
        title: "Error",
        description: "Failed to save event",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const timeOptions = [];
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 15) {
      const timeString = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
      timeOptions.push(timeString);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {initialData?.id ? "Edit Event" : "Create New Event"}
          </DialogTitle>
          <DialogDescription>
            {initialData?.id
              ? "Update the event details below."
              : "Fill in the details to create a new event."}
          </DialogDescription>
        </DialogHeader>

        <form action={handleSubmit} className="space-y-6 py-4">
          {/* Hidden inputs for form data */}
          <input type="hidden" name="title" value={formData.title} />
          <input
            type="hidden"
            name="description"
            value={formData.description}
          />
          <input type="hidden" name="location" value={formData.location} />
          <input
            type="hidden"
            name="startDate"
            value={formData.startDate.toISOString()}
          />
          <input
            type="hidden"
            name="endDate"
            value={formData.endDate.toISOString()}
          />
          <input type="hidden" name="startTime" value={formData.startTime} />
          <input type="hidden" name="endTime" value={formData.endTime} />
          <input
            type="hidden"
            name="isAllDay"
            value={formData.isAllDay.toString()}
          />
          <input type="hidden" name="recurrence" value={formData.recurrence} />

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Event Title *</Label>
            <Input
              id="title"
              name="title"
              value={formData.title}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, title: e.target.value }))
              }
              placeholder="Enter event title"
              required
            />
          </div>

          {/* All Day Toggle */}
          <div className="flex items-center space-x-2">
            <Switch
              id="all-day"
              name="isAllDay"
              checked={formData.isAllDay}
              onCheckedChange={(checked) =>
                setFormData((prev) => ({ ...prev, isAllDay: checked }))
              }
            />
            <Label htmlFor="all-day">All day event</Label>
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Start Date */}
            <div className="space-y-2">
              <Label>Start Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.startDate && "text-muted-foreground",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.startDate
                      ? format(formData.startDate, "PPP")
                      : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.startDate}
                    onSelect={(date) =>
                      date &&
                      setFormData((prev) => ({ ...prev, startDate: date }))
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* End Date */}
            <div className="space-y-2">
              <Label>End Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.endDate && "text-muted-foreground",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.endDate
                      ? format(formData.endDate, "PPP")
                      : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.endDate}
                    onSelect={(date) =>
                      date &&
                      setFormData((prev) => ({ ...prev, endDate: date }))
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Time Selection (only if not all day) */}
          {!formData.isAllDay && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start Time</Label>
                <Select
                  value={formData.startTime}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, startTime: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="max-h-[200px]">
                    {timeOptions.map((time) => (
                      <SelectItem key={time} value={time}>
                        {time}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>End Time</Label>
                <Select
                  value={formData.endTime}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, endTime: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="max-h-[200px]">
                    {timeOptions.map((time) => (
                      <SelectItem key={time} value={time}>
                        {time}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* Location */}
          <div className="space-y-2">
            <Label htmlFor="location" className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Location
            </Label>
            <Input
              id="location"
              name="location"
              value={formData.location}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, location: e.target.value }))
              }
              placeholder="Enter event location"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              placeholder="Enter event description"
              rows={3}
            />
          </div>

          {/* Recurrence */}
          <div className="space-y-2">
            <Label>Repeat</Label>
            <Select
              value={formData.recurrence}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, recurrence: value }))
              }
              name="recurrence"
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Does not repeat</SelectItem>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="yearly">Yearly</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving
                ? "Saving..."
                : initialData?.id
                  ? "Update Event"
                  : "Create Event"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
