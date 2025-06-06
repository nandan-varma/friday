import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { UpcomingEventsSkeleton } from "@/components/dashboard/upcoming-events"

export default function DashboardLoadingPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Welcome, <Skeleton className="h-6 w-[200px] inline-block" /></h1>
        <Button disabled>
            <Plus className="mr-2 h-4 w-4" /> New Event
        </Button>
      </div>

      <Card className="pt-4">
        <CardContent>
          <UpcomingEventsSkeleton />
        </CardContent>
      </Card>
    </div>
  )
}
