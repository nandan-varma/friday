"use client"

import { Skeleton } from "@/components/ui/skeleton"
import { MonthViewSkeleton } from './month-view'
import { WeekViewSkeleton } from './week-view'
import { DayViewSkeleton } from './day-view'
import { AgendaViewSkeleton } from './agenda-view'
import { ViewType } from './types'

export function CalendarHeaderSkeleton() {
  return (
    <div className="flex items-center justify-between gap-2 mb-6">
      <Skeleton className="h-8 w-48" />
      <div className="flex items-center gap-1">
        <Skeleton className="h-8 w-8" />
        <Skeleton className="h-8 w-16" />
        <Skeleton className="h-8 w-8" />
      </div>
    </div>
  )
}

export function CalendarViewSkeleton({ view }: { view: ViewType }) {
  switch (view) {
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
