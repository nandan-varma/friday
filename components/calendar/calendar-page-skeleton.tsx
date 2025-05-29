import { MonthViewSkeleton } from "@/components/calendar/views/month-view"
import { WeekViewSkeleton } from "@/components/calendar/views/week-view"
import { DayViewSkeleton } from "@/components/calendar/views/day-view"
import { AgendaViewSkeleton } from "@/components/calendar/views/agenda-view"
import { ViewType } from "@/components/calendar/views/types"

interface CalendarPageSkeletonProps {
  preferredView?: ViewType
}

export function CalendarPageSkeleton({ preferredView = "month" }: CalendarPageSkeletonProps) {
  const renderViewSkeleton = () => {
    switch (preferredView) {
      case "month":
        return <MonthViewSkeleton />
      case "week":
        return <WeekViewSkeleton />
      case "day":
        return <DayViewSkeleton />
      case "agenda":
        return <AgendaViewSkeleton />
      default:
        return <MonthViewSkeleton />
    }
  }

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 p-4 md:p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Calendar</h1>
      </div>
      
      {renderViewSkeleton()}
    </div>
  )
}
