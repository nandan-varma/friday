import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CalendarIcon, ClockIcon, MapPinIcon, ArrowRightIcon, AlertCircleIcon } from "lucide-react";
import { format, isToday, isTomorrow, isThisWeek } from "date-fns";

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
      <Card className="border-destructive bg-destructive/5">
        <CardHeader>
          <CardTitle className="text-destructive flex items-center gap-2">
            <AlertCircleIcon className="h-5 w-5" />
            Error Loading Events
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">{error}</p>
          <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (events.length === 0) {
    return (
      <Card className="border-dashed">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            Upcoming Events
          </CardTitle>
          <CardDescription>No upcoming events found</CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="text-center space-y-4">
            <p className="text-sm text-muted-foreground">
              You have no upcoming events. Would you like me to help you create one?
            </p>
            <div className="flex gap-2 justify-center">
              <Button size="sm" asChild>
                <a href="/events/new">Create Event</a>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <a href="/calendar">View Calendar</a>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            Upcoming Events
          </div>
          <Button variant="ghost" size="sm" asChild>
            <a href="/calendar" className="flex items-center gap-1">
              View All <ArrowRightIcon className="h-3 w-3" />
            </a>
          </Button>
        </CardTitle>
        <CardDescription>
          {count > events.length ? `Showing ${events.length} of ${count} events` : `${events.length} events`}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
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
  
  const getDateLabel = (date: Date) => {
    if (isToday(date)) return "Today";
    if (isTomorrow(date)) return "Tomorrow";
    if (isThisWeek(date)) return format(date, "EEEE");
    return format(date, "MMM dd");
  };
  
  return (
    <div className="border rounded-lg p-4 space-y-3 hover:bg-muted/50 transition-colors group">
      <div className="flex items-start justify-between">
        <div className="space-y-1 flex-1">
          <h3 className="font-semibold text-base group-hover:text-primary transition-colors">
            {event.title}
          </h3>          {event.description && (
            <p className="text-sm text-muted-foreground overflow-hidden text-ellipsis line-clamp-2">{event.description}</p>
          )}
        </div>
        
        <div className="flex items-center gap-2 ml-4">
          {event.isAllDay && (
            <Badge variant="secondary" className="text-xs">
              All Day
            </Badge>
          )}
          <Badge variant="outline" className="text-xs">
            {getDateLabel(startDate)}
          </Badge>
        </div>
      </div>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <ClockIcon className="h-4 w-4" />
            {event.isAllDay ? (
              getDateLabel(startDate)
            ) : (
              <span>
                {format(startDate, "h:mm a")} - {format(endDate, "h:mm a")}
              </span>
            )}
          </div>
          
          {event.location && (            <div className="flex items-center gap-1">
              <MapPinIcon className="h-4 w-4" />
              <span className="truncate max-w-32">{event.location}</span>
            </div>
          )}
        </div>
        
        <Button 
          variant="ghost" 
          size="sm" 
          asChild
          className="opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <a href={`/events/${event.id}`}>View</a>
        </Button>
      </div>
    </div>
  );
};

// Loading skeleton component
export const UpcomingEventsSkeleton = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarIcon className="h-5 w-5" />
          <Skeleton className="h-6 w-32" />
        </CardTitle>
        <Skeleton className="h-4 w-48" />
      </CardHeader>
      <CardContent className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="border rounded-lg p-4 space-y-3">
            <div className="flex items-start justify-between">
              <div className="space-y-2 flex-1">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-full" />
              </div>
              <Skeleton className="h-6 w-16" />
            </div>
            <div className="flex items-center gap-4">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-20" />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
