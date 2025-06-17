"use client"

import { useState, useTransition, useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { format, addHours, isBefore, isAfter } from "date-fns"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { 
  Calendar as CalendarIcon, 
  Clock, 
  MapPin, 
  Repeat, 
  Save, 
  Trash2, 
  X,
  Loader2,
  AlertCircle
} from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { type UnifiedEvent } from "@/services/eventService"
import { saveEvent, deleteEvent } from "@/app/(dashboard)/calendar/actions"

// Form validation schema
const eventFormSchema = z.object({
  title: z.string().min(1, "Event title is required"),
  description: z.string().optional(),
  location: z.string().optional(),
  startDate: z.date({
    required_error: "Start date is required",
  }),
  startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format"),
  endDate: z.date({
    required_error: "End date is required", 
  }),
  endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format"),
  isAllDay: z.boolean(),
  recurrence: z.enum(["none", "daily", "weekly", "monthly", "yearly"]),
}).refine((data) => {
  if (data.isAllDay) return true
  
  const startDateTime = new Date(data.startDate)
  const [startHour, startMinute] = data.startTime.split(":").map(Number)
  startDateTime.setHours(startHour, startMinute, 0, 0)
  
  const endDateTime = new Date(data.endDate) 
  const [endHour, endMinute] = data.endTime.split(":").map(Number)
  endDateTime.setHours(endHour, endMinute, 0, 0)
  
  return isBefore(startDateTime, endDateTime)
}, {
  message: "End time must be after start time",
  path: ["endTime"]
})

type EventFormData = z.infer<typeof eventFormSchema>

interface EventModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  event?: UnifiedEvent | null
  selectedDate?: Date | null
  selectedHour?: number
  defaultDate?: Date
  defaultHour?: number
  timezone?: string
  onEventSaved?: (event: UnifiedEvent) => void
  onEventDeleted?: (eventId: string) => void
  mode?: "create" | "edit"
}

export function EventModal({
  open,
  onOpenChange,
  event,
  selectedDate,
  selectedHour,
  defaultDate,
  defaultHour,
  timezone,
  onEventSaved,
  onEventDeleted,
  mode = event ? "edit" : "create"
}: EventModalProps) {
  const [isPending, startTransition] = useTransition()
  const [isDeleting, setIsDeleting] = useState(false)

  const form = useForm<EventFormData>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: {
      title: "",
      description: "",
      location: "",
      startDate: selectedDate || defaultDate || new Date(),
      startTime: (selectedHour ?? defaultHour) !== undefined ? `${(selectedHour ?? defaultHour).toString().padStart(2, "0")}:00` : "09:00",
      endDate: selectedDate || defaultDate || new Date(),
      endTime: (selectedHour ?? defaultHour) !== undefined ? `${((selectedHour ?? defaultHour) + 1).toString().padStart(2, "0")}:00` : "10:00",
      isAllDay: false,
      recurrence: "none",
    },
  })

  // Watch isAllDay to adjust form behavior
  const isAllDay = form.watch("isAllDay")

  // Load event data when editing
  useEffect(() => {
    if (event && mode === "edit") {
      form.reset({
        title: event.title,
        description: event.description || "",
        location: event.location || "",
        startDate: event.startTime,
        startTime: event.isAllDay ? "09:00" : format(event.startTime, "HH:mm"),
        endDate: event.endTime,
        endTime: event.isAllDay ? "10:00" : format(event.endTime, "HH:mm"),
        isAllDay: event.isAllDay,
        recurrence: event.recurrence || "none",
      })
    }
  }, [event, mode, form])

  // Reset form when modal opens for creation
  useEffect(() => {
    if (open && mode === "create") {
      const hour = selectedHour ?? defaultHour
      const startDate = selectedDate || defaultDate || new Date()
      const endDate = selectedDate || defaultDate || new Date()
      
      form.reset({
        title: "",
        description: "",
        location: "",
        startDate,
        startTime: hour !== undefined ? `${hour.toString().padStart(2, "0")}:00` : "09:00",
        endDate,
        endTime: hour !== undefined ? `${(hour + 1).toString().padStart(2, "0")}:00` : "10:00",
        isAllDay: false,
        recurrence: "none",
      })
    }
  }, [open, mode, selectedDate, defaultDate, selectedHour, defaultHour, form])

  const onSubmit = async (data: EventFormData) => {
    startTransition(async () => {
      try {
        // Create the event data
        const eventData = {
          title: data.title,
          description: data.description || null,
          location: data.location || null,
          isAllDay: data.isAllDay,
          recurrence: data.recurrence,
        }

        let startTime: Date
        let endTime: Date

        if (data.isAllDay) {
          startTime = new Date(data.startDate)
          startTime.setHours(0, 0, 0, 0)
          
          endTime = new Date(data.endDate)
          endTime.setHours(23, 59, 59, 999)
        } else {
          const [startHour, startMinute] = data.startTime.split(":").map(Number)
          startTime = new Date(data.startDate)
          startTime.setHours(startHour, startMinute, 0, 0)
          
          const [endHour, endMinute] = data.endTime.split(":").map(Number)
          endTime = new Date(data.endDate)
          endTime.setHours(endHour, endMinute, 0, 0)
        }

        const fullEventData = {
          ...eventData,
          startTime,
          endTime,
        }

        // Call the server action to save the event
        const result = await saveEvent(fullEventData, {
          eventId: event?.id,
          preferredOrigin: event?.origin || "local"
        })

        if (result.success) {
          toast.success(mode === "create" ? "Event created successfully" : "Event updated successfully")
          onEventSaved?.(result.data.event)
          onOpenChange(false)
        } else {
          throw new Error(result.error)
        }
      } catch (error) {
        console.error("Error saving event:", error)
        toast.error("Failed to save event. Please try again.")
      }
    })
  }

  const handleDelete = async () => {
    if (!event) return
    
    setIsDeleting(true)
    try {
      // Call the server action to delete the event
      const result = await deleteEvent(event.id)
      
      if (result.success) {
        toast.success("Event deleted successfully")
        onEventDeleted?.(event.id)
        onOpenChange(false)
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      console.error("Error deleting event:", error)
      toast.error("Failed to delete event. Please try again.")
    } finally {
      setIsDeleting(false)
    }
  }

  const timeOptions = Array.from({ length: 24 * 4 }, (_, i) => {
    const hour = Math.floor(i / 4)
    const minute = (i % 4) * 15
    const time = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`
    return { value: time, label: format(new Date().setHours(hour, minute), "h:mm a") }
  })

  const recurrenceOptions = [
    { value: "none", label: "Does not repeat" },
    { value: "daily", label: "Daily" },
    { value: "weekly", label: "Weekly" },
    { value: "monthly", label: "Monthly" },
    { value: "yearly", label: "Yearly" },
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            {mode === "create" ? "Create New Event" : "Edit Event"}
          </DialogTitle>
          <DialogDescription>
            {mode === "create" 
              ? "Add a new event to your calendar" 
              : "Make changes to your event details"
            }
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Event Title */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Event Title *</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Enter event title..." 
                      {...field} 
                      disabled={isPending}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* All Day Toggle */}
            <FormField
              control={form.control}
              name="isAllDay"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">All Day Event</FormLabel>
                    <FormDescription>
                      This event lasts the entire day
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={isPending}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {/* Date and Time Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Start Date & Time */}
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Start Date *</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                "pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                              disabled={isPending}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) => isBefore(date, new Date()) && !isAfter(date, new Date().setHours(0, 0, 0, 0))}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {!isAllDay && (
                  <FormField
                    control={form.control}
                    name="startTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Start Time *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isPending}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select time" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="max-h-60">
                            {timeOptions.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>

              {/* End Date & Time */}
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="endDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>End Date *</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                "pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                              disabled={isPending}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) => isBefore(date, form.getValues("startDate"))}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {!isAllDay && (
                  <FormField
                    control={form.control}
                    name="endTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>End Time *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isPending}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select time" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="max-h-60">
                            {timeOptions.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>
            </div>

            <Separator />

            {/* Location */}
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Location
                  </FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Add location..." 
                      {...field} 
                      disabled={isPending}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Add event description..." 
                      className="resize-none"
                      rows={3}
                      {...field} 
                      disabled={isPending}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {/* Recurrence */}
            <FormField
              control={form.control}
              name="recurrence"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Repeat className="h-4 w-4" />
                    Repeat
                  </FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isPending}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {recurrenceOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />

            {/* Event Origin Badge */}
            {event && (
              <div className="flex items-center gap-2">
                <Badge variant={event.origin === "google" ? "secondary" : "default"}>
                  {event.origin === "google" ? "Google Calendar" : "Local Event"}
                </Badge>
                {event.createdAt && (
                  <span className="text-sm text-muted-foreground">
                    Created {format(event.createdAt, "PPP")}
                  </span>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col-reverse sm:flex-row gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isPending || isDeleting}
                className="flex-1 sm:flex-none"
              >
                Cancel
              </Button>
              
              {mode === "edit" && event && (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={isPending || isDeleting}
                  className="flex-1 sm:flex-none"
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </>
                  )}
                </Button>
              )}
              
              <Button 
                type="submit" 
                disabled={isPending || isDeleting}
                className="flex-1 sm:flex-none"
              >
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {mode === "create" ? "Creating..." : "Saving..."}
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    {mode === "create" ? "Create Event" : "Save Changes"}
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

// Skeleton component for loading state
export function EventModalSkeleton() {
  return (
    <div className="max-w-2xl space-y-6 p-6">
      {/* Header */}
      <div className="space-y-2">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-4 w-64" />
      </div>

      {/* Title */}
      <div className="space-y-2">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-10 w-full" />
      </div>

      {/* All Day Toggle */}
      <div className="flex items-center justify-between p-4 border rounded-lg">
        <div className="space-y-1">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-32" />
        </div>
        <Skeleton className="h-6 w-11 rounded-full" />
      </div>

      {/* Date and Time */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-4">
          <div className="space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
        <div className="space-y-4">
          <div className="space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
      </div>

      {/* Location */}
      <div className="space-y-2">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-10 w-full" />
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-20 w-full" />
      </div>

      {/* Recurrence */}
      <div className="space-y-2">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-10 w-full" />
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <Skeleton className="h-10 w-20" />
        <Skeleton className="h-10 w-20" />
        <Skeleton className="h-10 w-28" />
      </div>
    </div>
  )
}