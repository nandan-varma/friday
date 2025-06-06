import { Suspense } from "react"
import { CalendarDataProvider } from "@/components/calendar/calendar-data-provider"
import { CalendarPageSkeleton } from "@/components/calendar/calendar-page-skeleton"
import { CalendarErrorBoundary } from "@/components/calendar/calendar-error-boundary"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"

export default async function CalendarPage() {

  return (
    <CalendarPageSkeleton />
  )
}
