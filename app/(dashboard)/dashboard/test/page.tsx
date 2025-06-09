import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
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
      <div className="space-y-6">
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

      <Card className="pt-4">
        <CardContent>
          <Suspense fallback={<UpcomingEventsSkeleton />}>
            <UpcomingEvents />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  )
}
