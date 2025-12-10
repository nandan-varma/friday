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

  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast({
        title: "Error",
        description: "Please enter an event title",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);

      // Combine date and time
      const [startHours, startMinutes] = formData.startTime.split(":");
      const startDateTime = new Date(formData.startDate);
      startDateTime.setHours(
        parseInt(startHours),
        parseInt(startMinutes),
        0,
        0,
      );

      const [endHours, endMinutes] = formData.endTime.split(":");
      const endDateTime = new Date(formData.endDate);
      endDateTime.setHours(parseInt(endHours), parseInt(endMinutes), 0, 0);

      const submitData = new FormData();
      submitData.set("title", formData.title);
      submitData.set("description", formData.description);
      submitData.set("location", formData.location);
      submitData.set("startTime", startDateTime.toISOString());
      submitData.set("endTime", endDateTime.toISOString());
      submitData.set("isAllDay", formData.isAllDay.toString());
      submitData.set("recurrence", formData.recurrence);

      if (initialData?.id) {
        submitData.set("eventId", initialData.id);
        await updateEvent(submitData);
        toast({
          title: "Success",
          description: "Event updated successfully",
        });
      } else {
        await createEvent(submitData);
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
      setIsSubmitting(false);
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
      <DialogContent className="sm:max-w-[600px]">
        <div>
          <DialogHeader>
            <DialogTitle>
              {initialData ? "Edit Event" : "Create New Event"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="Event title"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Event description"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
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
                        : "Pick start date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={formData.startDate}
                      onSelect={(date) =>
                        date && setFormData({ ...formData, startDate: date })
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label htmlFor="startTime">Start Time</Label>
                <Select
                  value={formData.startTime}
                  onValueChange={(value) =>
                    setFormData({ ...formData, startTime: value })
                  }
                  disabled={formData.isAllDay}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select time" />
                  </SelectTrigger>
                  <SelectContent>
                    {timeOptions.map((time) => (
                      <SelectItem key={time} value={time}>
                        {time}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
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
                        : "Pick end date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={formData.endDate}
                      onSelect={(date) =>
                        date && setFormData({ ...formData, endDate: date })
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label htmlFor="endTime">End Time</Label>
                <Select
                  value={formData.endTime}
                  onValueChange={(value) =>
                    setFormData({ ...formData, endTime: value })
                  }
                  disabled={formData.isAllDay}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select time" />
                  </SelectTrigger>
                  <SelectContent>
                    {timeOptions.map((time) => (
                      <SelectItem key={time} value={time}>
                        {time}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) =>
                    setFormData({ ...formData, location: e.target.value })
                  }
                  placeholder="Event location"
                  className="pl-9"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="isAllDay"
                checked={formData.isAllDay}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, isAllDay: checked })
                }
              />
              <Label htmlFor="isAllDay">All day event</Label>
            </div>

            <div className="space-y-2">
              <Label htmlFor="recurrence">Recurrence</Label>
              <Select
                value={formData.recurrence}
                onValueChange={(value) =>
                  setFormData({ ...formData, recurrence: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select recurrence" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting
                  ? "Saving..."
                  : initialData
                    ? "Update Event"
                    : "Create Event"}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
