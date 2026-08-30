import { Calendar, CalendarClock, CalendarPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface QuickAction {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  prompt: string;
}

interface ChatQuickActionsProps {
  onActionClick: (prompt: string) => void;
}

const quickActions: QuickAction[] = [
  {
    icon: Calendar,
    title: "Today's Schedule",
    description: "See what's on your calendar today",
    prompt: "What's on my calendar today?",
  },
  {
    icon: CalendarClock,
    title: "This Week",
    description: "See upcoming events this week",
    prompt: "What's on my calendar this week?",
  },
  {
    icon: CalendarPlus,
    title: "Schedule a Meeting",
    description: "Create a new calendar event",
    prompt: "Help me schedule a meeting",
  },
];

export function ChatQuickActions({ onActionClick }: ChatQuickActionsProps) {
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-lg">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {quickActions.map((action, index) => {
          const Icon = action.icon;
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
                <div className="text-xs text-muted-foreground">
                  {action.description}
                </div>
              </div>
            </Button>
          );
        })}
      </CardContent>
    </Card>
  );
}
