"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { UnifiedEvent } from "@/lib/services/eventService";

const CalendarView = dynamic(
  () =>
    import("@/components/calendar/calendar-view").then((mod) => ({
      default: mod.CalendarView,
    })),
  {
    loading: () => <div className="space-y-4">Loading calendar...</div>,
  },
);

const EventForm = dynamic(
  () =>
    import("@/components/event/event-form").then((mod) => ({
      default: mod.EventForm,
    })),
  {
    ssr: false,
  },
);

interface DashboardClientProps {
  initialEvents: UnifiedEvent[];
}

export function DashboardClient({ initialEvents }: DashboardClientProps) {
  const router = useRouter();
  const [events] = useState<UnifiedEvent[]>(initialEvents);
  const [eventFormOpen, setEventFormOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<
    UnifiedEvent | undefined
  >();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();

  // Refresh events by revalidating the server component
  const refreshEvents = () => {
    router.refresh();
  };

  const handleEventClick = (event: UnifiedEvent) => {
    setSelectedEvent(event);
    setEventFormOpen(true);
  };

  const handleCreateEvent = (date?: Date) => {
    setSelectedEvent(undefined);
    setSelectedDate(date);
    setEventFormOpen(true);
  };

  const handleEventSave = async () => {
    await refreshEvents(); // Refresh events after save
    setEventFormOpen(false);
    setSelectedEvent(undefined);
    setSelectedDate(undefined);
  };

  const handleEventFormClose = () => {
    setEventFormOpen(false);
    setSelectedEvent(undefined);
    setSelectedDate(undefined);
  };

  return (
    <>
      <div className="space-y-6">
        <CalendarView
          events={events}
          onEventClick={handleEventClick}
          onCreateEvent={handleCreateEvent}
        />
      </div>

      <EventForm
        isOpen={eventFormOpen}
        onClose={handleEventFormClose}
        onSave={handleEventSave}
        initialData={
          selectedEvent
            ? {
                id: selectedEvent.id,
                title: selectedEvent.title,
                description: selectedEvent.description || "",
                location: selectedEvent.location || "",
                startTime: new Date(selectedEvent.startTime),
                endTime: new Date(selectedEvent.endTime),
                isAllDay: selectedEvent.isAllDay,
                recurrence: selectedEvent.recurrence || "none",
              }
            : undefined
        }
        selectedDate={selectedDate}
      />
    </>
  );
}
