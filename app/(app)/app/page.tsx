"use client";

import {
  addDays,
  endOfDay,
  endOfMonth,
  endOfWeek,
  startOfDay,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { ChatBubble } from "@/components/ai/chat-bubble";
import { CalendarGrid } from "@/components/app/calendar-grid";
import { CalendarHeader } from "@/components/app/calendar-header";
import { CalendarSidebar } from "@/components/app/calendar-sidebar";
import { EventDialog } from "@/components/app/event-dialog";
import {
  type RecurringEditScope,
  RecurringScopeDialog,
} from "@/components/app/recurring-scope-dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import {
  useConnectGoogle,
  useCreateEvent,
  useDeleteEvent,
  useGoogleCalendars,
  useGoogleEvents,
  useGoogleIntegration,
  useUpdateEvent,
  useUpdateSelectedCalendars,
} from "@/hooks/use-google-calendar";
import { type CalendarViewMode, shiftDate } from "@/lib/calendar-date-utils";
import type { Calendar, CalendarEvent } from "@/types/calendar";

// Color palette for calendars
const CALENDAR_COLORS = [
  "blue",
  "amber",
  "green",
  "pink",
  "purple",
  "red",
  "indigo",
  "cyan",
] as const;

type ApiEventUpdates = {
  summary?: string;
  description?: string;
  location?: string;
  start?: Date;
  end?: Date;
  attendees?: string[];
  allDay?: boolean;
};

export default function CalendarPage() {
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [viewMode, setViewMode] = useState<CalendarViewMode>("week");
  const [eventDialogOpen, setEventDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(
    null,
  );
  const [dialogInitialData, setDialogInitialData] = useState<{
    start: Date;
    end: Date;
    allDay?: boolean;
  } | null>(null);
  const [localCalendarStates, setLocalCalendarStates] = useState<
    Record<string, boolean>
  >({});
  // A drag/resize on a recurring instance needs the same this-event/all-events
  // choice as editing through the dialog - held here until the user answers.
  const [pendingGridUpdate, setPendingGridUpdate] = useState<{
    eventId: string;
    calendarId: string;
    apiUpdates: ApiEventUpdates;
    originalEvent: CalendarEvent;
    action: "move" | "resize";
  } | null>(null);
  // Bumped per-event so a cancelled scope prompt forces EventCard to remount
  // and re-derive its position from the (unchanged) source data, instead of
  // staying wherever the drag visually left it.
  const [eventResetTokens, setEventResetTokens] = useState<
    Record<string, number>
  >({});

  // Fetch integration status
  const { data: integration, isLoading: integrationLoading } =
    useGoogleIntegration();

  // Fetch calendars
  const { data: googleCalendars, isLoading: calendarsLoading } =
    useGoogleCalendars();

  // Calculate date range for events based on view mode
  const eventDateRange = useMemo(() => {
    switch (viewMode) {
      case "day":
        return { start: startOfDay(selectedDate), end: endOfDay(selectedDate) };
      case "week":
        return {
          start: startOfWeek(selectedDate),
          end: endOfWeek(selectedDate),
        };
      case "month":
        return {
          start: startOfMonth(selectedDate),
          end: endOfMonth(selectedDate),
        };
      case "agenda":
        return {
          start: startOfDay(selectedDate),
          end: endOfDay(addDays(selectedDate, 30)),
        };
    }
  }, [selectedDate, viewMode]);

  // Fetch events
  const { data: googleEvents, isLoading: eventsLoading } = useGoogleEvents({
    start: eventDateRange.start,
    end: eventDateRange.end,
  });

  // Mutations
  const connectGoogle = useConnectGoogle();
  const createEvent = useCreateEvent();
  const updateEvent = useUpdateEvent();
  const deleteEvent = useDeleteEvent();
  const updateSelectedCalendars = useUpdateSelectedCalendars();

  // Initialize local calendar states from integration data
  const initialStates = useMemo(() => {
    if (integration?.selectedCalendarIds && googleCalendars) {
      const states: Record<string, boolean> = {};
      googleCalendars.forEach((cal) => {
        states[cal.id] =
          integration.selectedCalendarIds?.includes(cal.id) ?? true;
      });
      return states;
    }
    return {};
  }, [integration?.selectedCalendarIds, googleCalendars]);

  useEffect(() => {
    setLocalCalendarStates(initialStates);
  }, [initialStates]);

  // Transform Google calendars to our Calendar type
  const calendars: Calendar[] = useMemo(() => {
    if (!googleCalendars) return [];
    return googleCalendars.map((cal, index) => ({
      id: cal.id,
      name: cal.summary || "Untitled Calendar",
      color: CALENDAR_COLORS[index % CALENDAR_COLORS.length],
      checked: localCalendarStates[cal.id] ?? true,
    }));
  }, [googleCalendars, localCalendarStates]);

  // Events are now already transformed in the API
  const events: CalendarEvent[] = googleEvents || [];

  const handleToggleCalendar = (calendarId: string) => {
    setLocalCalendarStates((prev) => {
      const newStates = { ...prev, [calendarId]: !prev[calendarId] };

      // Update selected calendars in backend
      const selectedIds = Object.entries(newStates)
        .filter(([_, checked]) => checked)
        .map(([id]) => id);

      updateSelectedCalendars.mutate(selectedIds, {
        onError: (_error) => {
          toast.error("Failed to update calendar selection");
        },
      });

      return newStates;
    });
  };

  // Arrow-key date navigation, ignored while typing in a field or a dialog is open.
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (eventDialogOpen) return;
      const target = e.target as HTMLElement;
      if (
        ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName) ||
        target.isContentEditable
      )
        return;

      if (e.key === "ArrowLeft") {
        setSelectedDate((prev) => shiftDate(prev, viewMode, -1));
      } else if (e.key === "ArrowRight") {
        setSelectedDate((prev) => shiftDate(prev, viewMode, 1));
      } else if (e.key === "t" || e.key === "T") {
        setSelectedDate(new Date());
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [viewMode, eventDialogOpen]);

  const handleCreateEvent = (
    start: Date,
    end: Date,
    options?: { allDay?: boolean },
  ) => {
    setDialogInitialData({ start, end, allDay: options?.allDay });
    setSelectedEvent(null);
    setEventDialogOpen(true);
  };

  const handleEditEvent = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setDialogInitialData(null);
    setEventDialogOpen(true);
  };

  const handleSaveEvent = async (
    eventData: Partial<CalendarEvent>,
    scope?: RecurringEditScope,
  ) => {
    if (selectedEvent) {
      // A "series" edit targets Google's recurringEventId (the master
      // event) instead of this one instance.
      const eventId =
        scope === "series" && selectedEvent.recurringEventId
          ? selectedEvent.recurringEventId
          : selectedEvent.id;

      updateEvent.mutate(
        {
          eventId,
          calendarId: selectedEvent.calendarId,
          updates: {
            summary: eventData.title,
            description: eventData.description,
            location: eventData.location,
            start: eventData.start,
            end: eventData.end,
            attendees: eventData.attendees,
            allDay: eventData.allDay,
          },
        },
        {
          onSuccess: () => {
            toast.success("Event updated successfully");
            setEventDialogOpen(false);
          },
          onError: (_error) => {
            toast.error("Failed to update event");
          },
        },
      );
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
          allDay: eventData.allDay,
        },
        {
          onSuccess: () => {
            toast.success("Event created successfully");
            setEventDialogOpen(false);
          },
          onError: (_error) => {
            toast.error("Failed to create event");
          },
        },
      );
    }
  };

  // Shared by the dialog's delete button and the keyboard Delete shortcut.
  // Deleting through Google is permanent, so undo re-creates the event from
  // a snapshot taken before the delete - it lands with a new event id.
  const deleteEventWithUndo = (event: CalendarEvent) => {
    deleteEvent.mutate(
      { eventId: event.id, calendarId: event.calendarId },
      {
        onSuccess: () => {
          toast("Event deleted", {
            action: {
              label: "Undo",
              onClick: () => {
                createEvent.mutate({
                  calendarId: event.calendarId,
                  summary: event.title,
                  description: event.description,
                  location: event.location,
                  start: event.start,
                  end: event.end,
                  attendees: event.attendees,
                  allDay: event.allDay,
                });
              },
            },
          });
        },
        onError: (_error) => {
          toast.error("Failed to delete event");
        },
      },
    );
  };

  const handleDeleteEvent = (eventId: string, scope?: RecurringEditScope) => {
    if (!selectedEvent) return;
    const targetId =
      scope === "series" && selectedEvent.recurringEventId
        ? selectedEvent.recurringEventId
        : eventId;
    deleteEventWithUndo({ ...selectedEvent, id: targetId });
    setEventDialogOpen(false);
  };

  // Keyboard Delete/Backspace on a focused event card - always targets just
  // that instance, skipping the recurring-series prompt for a quick action.
  const handleEventDelete = (event: CalendarEvent) => {
    deleteEventWithUndo(event);
  };

  // Actually persists a grid-driven update (drag/resize), with an undo
  // toast. `originalEvent` is the pre-update snapshot used to revert.
  const commitEventUpdate = (
    eventId: string,
    calendarId: string,
    apiUpdates: ApiEventUpdates,
    originalEvent: CalendarEvent,
  ) => {
    const isMove =
      apiUpdates.start !== undefined || apiUpdates.end !== undefined;

    updateEvent.mutate(
      { eventId, calendarId, updates: apiUpdates },
      {
        onSuccess: () => {
          if (isMove) {
            toast("Event updated", {
              action: {
                label: "Undo",
                onClick: () => {
                  updateEvent.mutate({
                    eventId,
                    calendarId,
                    updates: {
                      start: originalEvent.start,
                      end: originalEvent.end,
                      allDay: originalEvent.allDay,
                    },
                  });
                },
              },
            });
          }
        },
        onError: (_error) => {
          toast.error("Failed to update event");
        },
      },
    );
  };

  const handleUpdateEvent = (
    eventId: string,
    updates: Partial<CalendarEvent>,
  ) => {
    const event = events.find((e) => e.id === eventId);
    if (!event) return;

    // Only include fields that are actually being updated
    const apiUpdates: ApiEventUpdates = {};
    if (updates.title !== undefined) apiUpdates.summary = updates.title;
    if (updates.description !== undefined)
      apiUpdates.description = updates.description;
    if (updates.location !== undefined) apiUpdates.location = updates.location;
    if (updates.start !== undefined) apiUpdates.start = updates.start;
    if (updates.end !== undefined) apiUpdates.end = updates.end;
    if (updates.attendees !== undefined)
      apiUpdates.attendees = updates.attendees;
    if (updates.allDay !== undefined) apiUpdates.allDay = updates.allDay;

    if (event.recurringEventId) {
      const durationBefore = event.end.getTime() - event.start.getTime();
      const durationAfter =
        apiUpdates.start && apiUpdates.end
          ? apiUpdates.end.getTime() - apiUpdates.start.getTime()
          : durationBefore;
      setPendingGridUpdate({
        eventId,
        calendarId: event.calendarId,
        apiUpdates,
        originalEvent: event,
        action: durationAfter === durationBefore ? "move" : "resize",
      });
      return;
    }

    commitEventUpdate(eventId, event.calendarId, apiUpdates, event);
  };

  const handleGridScopeChoose = (scope: RecurringEditScope) => {
    if (!pendingGridUpdate) return;
    const { eventId, calendarId, apiUpdates, originalEvent } =
      pendingGridUpdate;
    const targetId =
      scope === "series" && originalEvent.recurringEventId
        ? originalEvent.recurringEventId
        : eventId;
    commitEventUpdate(targetId, calendarId, apiUpdates, originalEvent);
    setPendingGridUpdate(null);
  };

  const handleGridScopeCancel = () => {
    if (pendingGridUpdate) {
      const { eventId } = pendingGridUpdate;
      setEventResetTokens((prev) => ({
        ...prev,
        [eventId]: (prev[eventId] ?? 0) + 1,
      }));
    }
    setPendingGridUpdate(null);
  };

  const visibleEvents = events.filter(
    (event) => calendars.find((cal) => cal.id === event.calendarId)?.checked,
  );

  // Loading state
  if (integrationLoading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Spinner className="size-8" />
          <p className="text-sm text-muted-foreground">Loading calendar...</p>
        </div>
      </div>
    );
  }

  // Not connected state
  if (!integration?.connected) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center bg-background">
        <div className="flex max-w-md flex-col items-center gap-6 text-center">
          <div className="flex flex-col gap-2">
            <h2 className="text-2xl font-semibold">
              Connect Your Google Calendar
            </h2>
            <p className="text-sm text-muted-foreground">
              To get started, connect your Google Calendar account to sync your
              events and calendars.
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
    );
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
            onDeleteEvent={handleEventDelete}
            eventResetTokens={eventResetTokens}
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

      <RecurringScopeDialog
        open={!!pendingGridUpdate}
        action={pendingGridUpdate?.action ?? "move"}
        onOpenChange={(open) => !open && handleGridScopeCancel()}
        onChoose={handleGridScopeChoose}
      />

      {/* AI Chat Bubble */}
      <ChatBubble />
    </div>
  );
}
