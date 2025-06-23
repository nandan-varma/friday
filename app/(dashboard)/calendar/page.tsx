import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import EventService from "@/services/eventService"
import { getuserSettings } from "@/services/profileService"
import { CalendarClientPage } from "./calendar"
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from '@tanstack/react-query'
import { getSession } from "@/lib/auth"


export default async function CalendarPage() {

  const queryClient = new QueryClient()

  await queryClient.prefetchQuery({
    queryKey: ['session'],
    queryFn: getSession,
  })

  const session = await auth.api.getSession({
    headers: await headers()
  })



  if (!session) {
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

  const userEvents = await EventService.getAllEvents(session.user.id)
  const userSettings = await getuserSettings(session.user.id);

  return (
    <CalendarClientPage events={userEvents} timezone={userSettings?.timezone ? userSettings?.timezone : undefined} />
  )
}
