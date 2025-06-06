import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, CalendarIcon, MessageSquare } from "lucide-react"
import Link from "next/link"
import { Suspense } from "react"
import { UpcomingEvents, UpcomingEventsSkeleton } from "@/components/dashboard/upcoming-events"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"

export default async function DashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers()
  })

  if (!session) {
    return (
      <div className="w-full max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Dashboard</h1>
        </div>
        <div className="text-center py-8">
          <p className="text-muted-foreground">Please log in to view your dashboard.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Welcome, {session.user.name || session.user.email}</h1>
        <Button>
            <Plus className="mr-2 h-4 w-4" /> New Event
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="pt-4 md:col-span-2">
          <CardContent>
            <Suspense fallback={<UpcomingEventsSkeleton />}>
              <UpcomingEvents />
            </Suspense>
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
                <Link href="/ai">
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
              <Button variant="outline" className="w-full justify-start">
                  <Plus className="mr-2 h-4 w-4" /> Create New Event
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
