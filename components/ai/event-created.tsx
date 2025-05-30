import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckIcon, XIcon, CalendarPlusIcon, ClockIcon, MapPinIcon, ExternalLinkIcon } from "lucide-react";
import { format, isToday, isTomorrow } from "date-fns";

type Event = {
  id: number;
  title: string;
  description?: string;
  location?: string;
  startTime: string;
  endTime: string;
  isAllDay: boolean;
};

type EventCreatedProps = {
  success: boolean;
  event?: Event;
  error?: string;
};

export const EventCreated = ({ success, event, error }: EventCreatedProps) => {
  if (!success || error) {
    return (
      <Card className="border-destructive bg-destructive/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <XIcon className="h-5 w-5" />
            Failed to Create Event
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            {error || "An error occurred while creating the event."}
          </p>
          <Button variant="outline" size="sm" asChild>
            <a href="/events/new">Try Again</a>
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!event) {
    return (
      <Card className="border-destructive bg-destructive/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <XIcon className="h-5 w-5" />
            Event Creation Failed
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            No event data was returned.
          </p>
          <Button variant="outline" size="sm" asChild>
            <a href="/events/new">Try Again</a>
          </Button>
        </CardContent>
      </Card>
    );
  }

  const startDate = new Date(event.startTime);
  const endDate = new Date(event.endTime);
  
  const getDateLabel = (date: Date) => {
    if (isToday(date)) return "Today";
    if (isTomorrow(date)) return "Tomorrow";
    return format(date, "EEEE, MMM dd");
  };

  return (
    <Card className="">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className="rounded-full p-1">
            <CheckIcon className="h-4 w-4" />
          </div>
          Event Created Successfully!
        </CardTitle>
        <CardDescription>Your event has been added to your calendar</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="bg-card border rounded-lg p-4 space-y-4">
          <div className="space-y-2">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <CalendarPlusIcon className="h-5 w-5 text-primary" />
              {event.title}
            </h3>
            {event.description && (
              <p className="text-sm text-muted-foreground">{event.description}</p>
            )}
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <ClockIcon className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">
                {event.isAllDay ? (
                  `${getDateLabel(startDate)} (All Day)`
                ) : (
                  `${getDateLabel(startDate)} • ${format(startDate, "h:mm a")} - ${format(endDate, "h:mm a")}`
                )}
              </span>
            </div>
            
            {event.location && (
              <div className="flex items-center gap-2 text-sm">
                <MapPinIcon className="h-4 w-4 text-muted-foreground" />
                <span>{event.location}</span>
              </div>
            )}
            
            <div className="flex flex-wrap gap-2">
              {event.isAllDay && (
                <Badge variant="secondary">All Day</Badge>
              )}
              <Badge variant="outline">
                Created
              </Badge>
            </div>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Button asChild>
            <a href="/calendar" className="flex items-center gap-2">
              <CalendarPlusIcon className="h-4 w-4" />
              View Calendar
            </a>
          </Button>
          <Button variant="outline" asChild>
            <a href="/events/new" className="flex items-center gap-2">
              Create Another
            </a>
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <a href={`/events/${event.id}`} className="flex items-center gap-2">
              Edit Event <ExternalLinkIcon className="h-3 w-3" />
            </a>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
