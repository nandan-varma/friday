"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { EventModal } from "@/components/calendar/event-modal"
import type { UnifiedEvent } from "@/services/eventService"

interface NewEventButtonProps {
  onEventCreated?: (event: UnifiedEvent) => void
}

export function NewEventButton({ onEventCreated }: NewEventButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleEventSaved = (event: UnifiedEvent) => {
    onEventCreated?.(event)
    // The modal will close itself via onEventSaved callback
  }

  return (
    <>
      <Button onClick={() => setIsModalOpen(true)}>
        <Plus className="mr-2 h-4 w-4" /> New Event
      </Button>
      
      <EventModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onEventSaved={handleEventSaved}
        mode="create"
        defaultDate={new Date()}
        defaultHour={9}
      />
    </>
  )
}

// Skeleton component for loading state
export function NewEventButtonSkeleton() {
  return (
    <div className="h-10 w-28 bg-muted animate-pulse rounded-md" />
  )
}
