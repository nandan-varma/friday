import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CalendarIcon, MessageSquare, Plus } from "lucide-react"
import Link from "next/link"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          {children}
        </div>

        <div className="space-y-6">
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