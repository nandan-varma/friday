import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, ClockIcon, MapPinIcon } from "lucide-react";
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

type UpcomingEventsProps = {
  events: Event[];
  count: number;
  error?: string;
};

export const UpcomingEvents = ({ events, count, error }: UpcomingEventsProps) => {
  if (error) {
    return (
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="text-destructive">Error Loading Events</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{error}</p>
        </CardContent>
      </Card>
    );
  }

  if (events.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            Upcoming Events
          </CardTitle>
          <CardDescription>No upcoming events found</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            You have no upcoming events. Would you like me to help you create one?
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarIcon className="h-5 w-5" />
          Upcoming Events
        </CardTitle>
        <CardDescription>
          {count > events.length ? `Showing ${events.length} of ${count} events` : `${events.length} events`}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {events.map((event) => (
          <EventCard key={event.id} event={event} />
        ))}
      </CardContent>
    </Card>
  );
};

const EventCard = ({ event }: { event: Event }) => {
  const startDate = new Date(event.startTime);
  const endDate = new Date(event.endTime);
  
  return (
    <div className="border rounded-lg p-4 space-y-2">
      <div className="flex items-start justify-between">
        <h3 className="font-semibold text-lg">{event.title}</h3>
        {event.isAllDay && (
          <Badge variant="secondary" className="text-xs">
            All Day
          </Badge>
        )}
      </div>
      
      {event.description && (
        <p className="text-sm text-muted-foreground">{event.description}</p>
      )}
      
      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-1">
          <ClockIcon className="h-4 w-4" />
          {event.isAllDay ? (
            format(startDate, "MMM dd, yyyy")
          ) : (
            <>
              {format(startDate, "MMM dd, h:mm a")} - {format(endDate, "h:mm a")}
            </>
          )}
        </div>
        
        {event.location && (
          <div className="flex items-center gap-1">
            <MapPinIcon className="h-4 w-4" />
            {event.location}
          </div>
        )}
      </div>
    </div>
  );
};
