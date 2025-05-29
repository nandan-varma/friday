import { Suspense } from "react"
import { getUserFromCookie } from "@/lib/auth"
import { CalendarDataProvider } from "@/components/calendar/calendar-data-provider"
import { CalendarPageSkeleton } from "@/components/calendar/calendar-page-skeleton"
import { CalendarErrorBoundary } from "@/components/calendar/calendar-error-boundary"

export default async function CalendarPage() {
  const user = await getUserFromCookie()

  if (!user) {
    return (
      <div className="w-full max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Calendar</h1>
        </div>
        <div className="text-center py-8">
          <p className="text-muted-foreground">Please log in to view your calendar.</p>
        </div>
      </div>
    )
  }

  return (
    <CalendarErrorBoundary>
      <Suspense fallback={<CalendarPageSkeleton />}>
        <CalendarDataProvider userId={user.id} />
      </Suspense>
    </CalendarErrorBoundary>
  )
}
