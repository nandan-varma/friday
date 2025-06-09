'use client'

import { CalendarView } from "@/components/calendar/calendar-view"
import { Skeleton } from "@/components/ui/skeleton"
import { UnifiedEvent } from "@/services/eventService"

interface UpcomingEventsClientProps {
  initialEvents: UnifiedEvent[]
  userId: string
}

export function UpcomingEventsClient({ initialEvents }: UpcomingEventsClientProps) {
  // You can still use TanStack Query for future updates if needed
  // const { data: upcomingEvents } = useQuery({
  //   queryKey: ['upcoming-events', userId],
  //   initialData: initialEvents,
  //   staleTime: 5 * 60 * 1000,
  // })

  return <CalendarView events={initialEvents} view="agenda" />
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