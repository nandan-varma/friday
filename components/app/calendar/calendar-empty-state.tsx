"use client";

import { Empty, EmptyMedia, EmptyTitle, EmptyDescription } from "@/components/ui/empty";
import { Button } from "@/components/ui/button";

interface CalendarEmptyStateProps {
  onCreateEvent: () => void;
}

export function CalendarEmptyState({ onCreateEvent }: CalendarEmptyStateProps) {
  return (
    <div className="flex h-full items-center justify-center p-8">
      <Empty>
        <EmptyMedia>📅</EmptyMedia>
        <EmptyTitle>No events yet</EmptyTitle>
        <EmptyDescription>
          Get started by creating your first event on the calendar
        </EmptyDescription>
        <Button onClick={onCreateEvent} className="mt-4">
          Create Event
        </Button>
      </Empty>
    </div>
  );
}
 