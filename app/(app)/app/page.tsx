"use client"

import { useState, useMemo, useEffect } from "react"
import { CalendarHeader } from "@/components/app/calendar-header"
import { CalendarSidebar } from "@/components/app/calendar-sidebar"
import { CalendarGrid } from "@/components/app/calendar-grid"
import { EventDialog } from "@/components/app/event-dialog"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { Alert, AlertDescription } from "@/components/ui/alert"
import type { Calendar, CalendarEvent } from "@/types/calendar"
import {
  useGoogleIntegration,
  useGoogleCalendars,
  useGoogleEvents,
  useConnectGoogle,
  useCreateEvent,
  useUpdateEvent,
  useDeleteEvent,
  useUpdateSelectedCalendars,
} from "@/hooks/use-google-calendar"
import { toast } from "sonner"

// Color palette for calendars
const CALENDAR_COLORS = ["blue", "amber", "green", "pink", "purple", "red", "indigo", "cyan"] as const

export default function CalendarPage() {
  const [selectedDate, setSelectedDate] = useState(new Date(2026, 0, 6))
  const [viewMode, setViewMode] = useState<"day" | "week" | "month" | "agenda">("week")
  const [eventDialogOpen, setEventDialogOpen] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)
  const [dialogInitialData, setDialogInitialData] = useState<{
    start: Date
    end: Date
  } | null>(null)
  const [localCalendarStates, setLocalCalendarStates] = useState<Record<string, boolean>>({})

  // Fetch integration status
  const { data: integration, isLoading: integrationLoading } = useGoogleIntegration()

  // Fetch calendars
  const { data: googleCalendars, isLoading: calendarsLoading } = useGoogleCalendars()

  // Calculate date range for events based on view mode
  const eventDateRange = useMemo(() => {
    const start = new Date(selectedDate)
    const end = new Date(selectedDate)

    switch (viewMode) {
      case "day":
        start.setHours(0, 0, 0, 0)
        end.setHours(23, 59, 59, 999)
        break
      case "week":
        const dayOfWeek = start.getDay()
        start.setDate(start.getDate() - dayOfWeek)
        start.setHours(0, 0, 0, 0)
        end.setDate(start.getDate() + 6)
        end.setHours(23, 59, 59, 999)
        break
      case "month":
        start.setDate(1)
        start.setHours(0, 0, 0, 0)
        end.setMonth(end.getMonth() + 1)
        end.setDate(0)
        end.setHours(23, 59, 59, 999)
        break
      case "agenda":
        start.setHours(0, 0, 0, 0)
        end.setDate(end.getDate() + 30)
        end.setHours(23, 59, 59, 999)
        break
    }

    return { start, end }
  }, [selectedDate, viewMode])

  // Fetch events
  const { data: googleEvents, isLoading: eventsLoading } = useGoogleEvents({
    start: eventDateRange.start,
    end: eventDateRange.end,
  })

  // Mutations
  const connectGoogle = useConnectGoogle()
  const createEvent = useCreateEvent()
  const updateEvent = useUpdateEvent()
  const deleteEvent = useDeleteEvent()
  const updateSelectedCalendars = useUpdateSelectedCalendars()

  // Initialize local calendar states from integration data
  const initialStates = useMemo(() => {
    if (integration?.selectedCalendarIds && googleCalendars) {
      const states: Record<string, boolean> = {};
      googleCalendars.forEach((cal) => {
        states[cal.id] = integration.selectedCalendarIds?.includes(cal.id) ?? true;
      });
      return states;
    }
    return {};
  }, [integration?.selectedCalendarIds, googleCalendars]);

  useEffect(() => {
    setLocalCalendarStates(initialStates);
  }, [initialStates])

  // Transform Google calendars to our Calendar type
  const calendars: Calendar[] = useMemo(() => {
    if (!googleCalendars) return []
    return googleCalendars.map((cal, index) => ({
      id: cal.id,
      name: cal.summary || "Untitled Calendar",
      color: CALENDAR_COLORS[index % CALENDAR_COLORS.length],
      checked: localCalendarStates[cal.id] ?? true,
    }))
  }, [googleCalendars, localCalendarStates])

  // Transform Google events to our CalendarEvent type
  const events: CalendarEvent[] = useMemo(() => {
    if (!googleEvents) return []
    return googleEvents
      .map((event) => {
        const calendar = calendars.find((c) => c.id === event.calendarId)
        const startDate = event.start?.dateTime
          ? new Date(event.start.dateTime)
          : event.start?.date
            ? new Date(event.start.date)
            : new Date()
        const endDate = event.end?.dateTime
          ? new Date(event.end.dateTime)
          : event.end?.date
            ? new Date(event.end.date)
            : new Date()

        return {
          id: event.id,
          title: event.summary || "Untitled Event",
          description: event.description,
          start: startDate,
          end: endDate,
          calendarId: event.calendarId,
          color: calendar?.color || "blue",
          location: event.location,
          attendees: event.attendees?.map((a) => a.email),
          htmlLink: event.htmlLink,
        }
      })
      .filter(Boolean) as CalendarEvent[]
  }, [googleEvents, calendars])

  const handleToggleCalendar = (calendarId: string) => {
    setLocalCalendarStates((prev) => {
      const newStates = { ...prev, [calendarId]: !prev[calendarId] }

      // Update selected calendars in backend
      const selectedIds = Object.entries(newStates)
        .filter(([_, checked]) => checked)
        .map(([id]) => id)

      updateSelectedCalendars.mutate(selectedIds, {
        onError: (error) => {
          toast.error("Failed to update calendar selection")
          console.error(error)
        },
      })

      return newStates
    })
  }

  const handleCreateEvent = (start: Date, end: Date) => {
    setDialogInitialData({ start, end })
    setSelectedEvent(null)
    setEventDialogOpen(true)
  }

  const handleEditEvent = (event: CalendarEvent) => {
    setSelectedEvent(event)
    setDialogInitialData(null)
    setEventDialogOpen(true)
  }

  const handleSaveEvent = async (eventData: Partial<CalendarEvent>) => {
    if (selectedEvent) {
      // Update existing event
      updateEvent.mutate(
        {
          eventId: selectedEvent.id,
          calendarId: selectedEvent.calendarId,
          updates: {
            summary: eventData.title,
            description: eventData.description,
            location: eventData.location,
            start: eventData.start,
            end: eventData.end,
            attendees: eventData.attendees,
          },
        },
        {
          onSuccess: () => {
            toast.success("Event updated successfully")
            setEventDialogOpen(false)
          },
          onError: (error) => {
            toast.error("Failed to update event")
            console.error(error)
          },
        }
      )
    } else {
      // Create new event
      createEvent.mutate(
        {
          calendarId: eventData.calendarId || calendars[0]?.id || "primary",
          summary: eventData.title || "Untitled Event",
          description: eventData.description,
          location: eventData.location,
          start: eventData.start || new Date(),
          end: eventData.end || new Date(),
          attendees: eventData.attendees,
        },
        {
          onSuccess: () => {
            toast.success("Event created successfully")
            setEventDialogOpen(false)
          },
          onError: (error) => {
            toast.error("Failed to create event")
            console.error(error)
          },
        }
      )
    }
  }

  const handleDeleteEvent = (eventId: string) => {
    if (!selectedEvent) return

    deleteEvent.mutate(
      {
        eventId,
        calendarId: selectedEvent.calendarId,
      },
      {
        onSuccess: () => {
          toast.success("Event deleted successfully")
          setEventDialogOpen(false)
        },
        onError: (error) => {
          toast.error("Failed to delete event")
          console.error(error)
        },
      }
    )
  }

  const handleUpdateEvent = (eventId: string, updates: Partial<CalendarEvent>) => {
    const event = events.find((e) => e.id === eventId)
    if (!event) return

    updateEvent.mutate(
      {
        eventId,
        calendarId: event.calendarId,
        updates: {
          summary: updates.title,
          description: updates.description,
          location: updates.location,
          start: updates.start,
          end: updates.end,
          attendees: updates.attendees,
        },
      },
      {
        onError: (error) => {
          toast.error("Failed to update event")
          console.error(error)
        },
      }
    )
  }

  const visibleEvents = events.filter((event) => calendars.find((cal) => cal.id === event.calendarId)?.checked)

  // Loading state
  if (integrationLoading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Spinner className="size-8" />
          <p className="text-sm text-muted-foreground">Loading calendar...</p>
        </div>
      </div>
    )
  }

  // Not connected state
  if (!integration?.connected) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center bg-background">
        <div className="flex max-w-md flex-col items-center gap-6 text-center">
          <div className="flex flex-col gap-2">
            <h2 className="text-2xl font-semibold">Connect Your Google Calendar</h2>
            <p className="text-sm text-muted-foreground">
              To get started, connect your Google Calendar account to sync your events and calendars.
            </p>
          </div>
          <Button
            size="lg"
            onClick={() => connectGoogle.mutate()}
            disabled={connectGoogle.isPending}
          >
            {connectGoogle.isPending ? (
              <>
                <Spinner className="mr-2" />
                Connecting...
              </>
            ) : (
              "Connect Google Calendar"
            )}
          </Button>
          {connectGoogle.isError && (
            <Alert variant="destructive">
              <AlertDescription>
                Failed to connect Google Calendar. Please try again.
              </AlertDescription>
            </Alert>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-background">
      <CalendarSidebar
        calendars={calendars}
        onToggleCalendar={handleToggleCalendar}
        selectedDate={selectedDate}
        onDateSelect={setSelectedDate}
      />

      <div className="flex flex-1 flex-col overflow-hidden">
        <CalendarHeader
          selectedDate={selectedDate}
          onDateChange={setSelectedDate}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
        />

        {calendarsLoading || eventsLoading ? (
          <div className="flex flex-1 items-center justify-center">
            <div className="flex flex-col items-center gap-4">
              <Spinner className="size-8" />
              <p className="text-sm text-muted-foreground">Loading events...</p>
            </div>
          </div>
        ) : (
          <CalendarGrid
            events={visibleEvents}
            selectedDate={selectedDate}
            viewMode={viewMode}
            onCreateEvent={handleCreateEvent}
            onEditEvent={handleEditEvent}
            onUpdateEvent={handleUpdateEvent}
          />
        )}
      </div>

      <EventDialog
        open={eventDialogOpen}
        onOpenChange={setEventDialogOpen}
        event={selectedEvent}
        initialData={dialogInitialData}
        calendars={calendars}
        onSave={handleSaveEvent}
        onDelete={handleDeleteEvent}
      />
    </div>
  )
}
