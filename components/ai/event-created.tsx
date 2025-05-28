import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckIcon, XIcon, CalendarPlusIcon } from "lucide-react";
import { format } from "date-fns";

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
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <XIcon className="h-5 w-5" />
            Failed to Create Event
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {error || "An error occurred while creating the event."}
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!event) {
    return (
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <XIcon className="h-5 w-5" />
            Event Creation Failed
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            No event data was returned.
          </p>
        </CardContent>
      </Card>
    );
  }

  const startDate = new Date(event.startTime);
  const endDate = new Date(event.endTime);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckIcon className="h-5 w-5" />
          Event Created Successfully!
        </CardTitle>
        <CardDescription>Your event has been added to your calendar</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div>
            <h3 className="font-semibold text-lg">{event.title}</h3>
            {event.description && (
              <p className="text-sm text-muted-foreground mt-1">{event.description}</p>
            )}
          </div>
          
          <div className="flex flex-wrap gap-2 text-sm">
            <Badge variant="outline" className="flex items-center gap-1">
              <CalendarPlusIcon className="h-3 w-3" />
              {event.isAllDay ? (
                format(startDate, "MMM dd, yyyy")
              ) : (
                <>
                  {format(startDate, "MMM dd, h:mm a")} - {format(endDate, "h:mm a")}
                </>
              )}
            </Badge>
            
            {event.location && (
              <Badge variant="outline">{event.location}</Badge>
            )}
            
            {event.isAllDay && (
              <Badge variant="secondary">All Day</Badge>
            )}
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button asChild size="sm">
            <a href="/calendar">View Calendar</a>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <a href="/events/new">Create Another Event</a>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
