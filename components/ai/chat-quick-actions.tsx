import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Github, Calendar } from "lucide-react"

interface QuickAction {
  icon: React.ComponentType<{ className?: string }>
  title: string
  description: string
  prompt: string
}

interface ChatQuickActionsProps {
  onActionClick: (prompt: string) => void
}

const quickActions: QuickAction[] = [
  {
    icon: Github,
    title: "GitHub Activity",
    description: "View commits, PRs, and issues",
    prompt: "Show me my GitHub activity today",
  },
  {
    icon: Calendar,
    title: "Today's Schedule",
    description: "See your calendar events",
    prompt: "What's on my calendar today?",
  },
  {
    icon: Github,
    title: "Daily Standup",
    description: "GitHub activity summary",
    prompt: "Generate my daily standup",
  },
  {
    icon: Github,
    title: "My Repositories",
    description: "Browse your GitHub repos",
    prompt: "List my repositories",
  },
]

export function ChatQuickActions({ onActionClick }: ChatQuickActionsProps) {
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-lg">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {quickActions.map((action, index) => {
          const Icon = action.icon
          return (
            <Button
              key={index}
              variant="outline"
              className="justify-start h-auto py-4 px-4 bg-transparent"
              onClick={() => onActionClick(action.prompt)}
            >
              <Icon className="mr-2 h-5 w-5" />
              <div className="text-left">
                <div className="font-semibold">{action.title}</div>
                <div className="text-xs text-muted-foreground">{action.description}</div>
              </div>
            </Button>
          )
        })}
      </CardContent>
    </Card>
  )
}
