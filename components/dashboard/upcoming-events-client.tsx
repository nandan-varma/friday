'use client'

import { CalendarView } from "@/components/calendar/calendar-view"
import { Skeleton } from "@/components/ui/skeleton"
import { UnifiedEvent } from "@/services/eventService"
import { useQuery } from '@tanstack/react-query'

interface UpcomingEventsClientProps {
  userId: string
}

export function UpcomingEventsClient({ userId }: UpcomingEventsClientProps) {
  const { data: events, isLoading, isPending, error } = useQuery({
    queryKey: ['upcomingEvents', userId],
    queryFn: () => fetchUpcomingEvents(5),
  })

  if (isLoading || isPending) {
    return <UpcomingEventsSkeleton />
  }

  if (error) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        Failed to load upcoming events
      </div>
    )
  }

  return <CalendarView events={events} view="agenda" />
}

export function UpcomingEventsSkeleton() {
  
  return (
    <div className="space-y-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center space-x-4 p-3 border rounded-lg">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
          <Skeleton className="h-8 w-16" />
        </div>
      ))}
    </div>
  )
}