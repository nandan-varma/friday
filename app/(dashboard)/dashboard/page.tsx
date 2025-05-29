import { getUserFromCookie } from "@/lib/auth"
import { EventService } from "@/services/eventService"
import { CalendarView } from "@/components/calendar/calendar-view"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, CalendarIcon, MessageSquare } from "lucide-react"
import Link from "next/link"

export default async function DashboardPage() {
  const user = await getUserFromCookie()

  if (!user) {
    return null
  }

  // Get upcoming events
  const upcomingEvents = await EventService.getAllUpcomingEvents(user.id, 5)

  // Format events for the calendar component
  const formattedEvents = upcomingEvents.map((event) => ({
    id: event.id.toString(),
    title: event.title,
    startTime: event.startTime.toISOString(),
    endTime: event.endTime.toISOString(),
    isAllDay: event.isAllDay ?? false,
  }))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Welcome, {user.name || user.email}</h1>
        <Button asChild>
          <Link href="/events/new">
            <Plus className="mr-2 h-4 w-4" /> New Event
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Upcoming Events</CardTitle>
            <CardDescription>Your schedule for the next few days</CardDescription>
          </CardHeader>
          <CardContent>
            <CalendarView events={formattedEvents} view="agenda" />
          </CardContent>
        </Card>

        <div className="space-y-6">          
          <Card>
            <CardHeader>
              <CardTitle>AI Assistant</CardTitle>
              <CardDescription>Get help with your schedule</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="mb-4">Ask me to schedule meetings, find free time, or manage your calendar.</p>
              <Button asChild className="w-full">
                <Link href="/ai-assistant">
                  <MessageSquare className="mr-2 h-4 w-4" /> Open Assistant
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" asChild className="w-full justify-start">
                <Link href="/calendar">
                  <CalendarIcon className="mr-2 h-4 w-4" /> View Full Calendar
                </Link>
              </Button>
              <Button variant="outline" asChild className="w-full justify-start">
                <Link href="/events/new">
                  <Plus className="mr-2 h-4 w-4" /> Create New Event
                </Link>
              </Button>
              <Button variant="outline" asChild className="w-full justify-start">
                <Link href="/integrations">
                  <CalendarIcon className="mr-2 h-4 w-4" /> Manage Integrations
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
