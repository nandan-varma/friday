import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckIcon, XIcon, CalendarPlusIcon, ClockIcon, MapPinIcon, AlertCircleIcon, ExternalLinkIcon } from "lucide-react";
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

type MultipleEventsCreatedProps = {
  success: boolean;
  events: Event[];
  errors?: string[];
  totalAttempted: number;
};

export const MultipleEventsCreated = ({ 
  success, 
  events, 
  errors = [], 
  totalAttempted 
}: MultipleEventsCreatedProps) => {
  const successCount = events.length;
  const errorCount = errors.length;
  const hasErrors = errorCount > 0;
  const hasSuccess = successCount > 0;

  const getDateLabel = (date: Date) => {
    if (isToday(date)) return "Today";
    if (isTomorrow(date)) return "Tomorrow";
    return format(date, "EEEE, MMM dd");
  };

  if (!hasSuccess && hasErrors) {
    // All failed
    return (
      <Card className="border-destructive bg-destructive/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <XIcon className="h-5 w-5" />
            Failed to Create Events
          </CardTitle>
          <CardDescription>
            Unable to create any of the {totalAttempted} requested events
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            {errors.map((error, index) => (
              <div key={index} className="text-sm text-muted-foreground bg-muted rounded p-2">
                • {error}
              </div>
            ))}
          </div>
          <Button variant="outline" size="sm" asChild>
            <a href="/events/new">Try Creating Events Manually</a>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={hasErrors ? "border-yellow-200 bg-yellow-50/50" : "border-green-200 bg-green-50/50"}>
      <CardHeader>
        <CardTitle className={`flex items-center gap-2 ${hasErrors ? 'text-yellow-700' : 'text-green-700'}`}>
          <div className={`rounded-full p-1 ${hasErrors ? 'bg-yellow-100' : 'bg-green-100'}`}>
            <CheckIcon className="h-4 w-4" />
          </div>
          {hasErrors ? 'Events Partially Created' : 'Events Created Successfully!'}
        </CardTitle>
        <CardDescription>
          {hasErrors 
            ? `${successCount} of ${totalAttempted} events created successfully`
            : `All ${successCount} events have been added to your calendar`
          }
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Success Section */}
        {hasSuccess && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Badge className="bg-green-100 text-green-800 border-green-200">
                {successCount} Created
              </Badge>
              <span className="text-sm text-muted-foreground">Successfully created events</span>
            </div>
            
            <div className="space-y-3">
              {events.map((event) => {
                const startDate = new Date(event.startTime);
                const endDate = new Date(event.endTime);
                
                return (
                  <div key={event.id} className="bg-card border rounded-lg p-4">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <h4 className="font-semibold flex items-center gap-2">
                            <CalendarPlusIcon className="h-4 w-4 text-primary" />
                            {event.title}
                          </h4>
                          {event.description && (
                            <p className="text-sm text-muted-foreground">{event.description}</p>
                          )}
                        </div>
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          Created
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <ClockIcon className="h-4 w-4" />
                          {event.isAllDay ? (
                            `${getDateLabel(startDate)} (All Day)`
                          ) : (
                            `${getDateLabel(startDate)} • ${format(startDate, "h:mm a")} - ${format(endDate, "h:mm a")}`
                          )}
                        </div>
                        
                        {event.location && (
                          <div className="flex items-center gap-1">
                            <MapPinIcon className="h-4 w-4" />
                            <span className="truncate max-w-32">{event.location}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Error Section */}
        {hasErrors && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Badge variant="destructive" className="bg-red-100 text-red-800 border-red-200">
                {errorCount} Failed
              </Badge>
              <span className="text-sm text-muted-foreground">Events that couldn't be created</span>
            </div>
            
            <div className="space-y-2">
              {errors.map((error, index) => (
                <div key={index} className="bg-red-50 border border-red-200 rounded p-3">
                  <div className="flex items-start gap-2">
                    <AlertCircleIcon className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        <div className="flex flex-wrap gap-2 pt-4 border-t">
          <Button asChild>
            <a href="/calendar" className="flex items-center gap-2">
              <CalendarPlusIcon className="h-4 w-4" />
              View Calendar
            </a>
          </Button>
          <Button variant="outline" asChild>
            <a href="/events/new">Create More Events</a>
          </Button>
          {hasErrors && (
            <Button variant="ghost" size="sm" asChild>
              <a href="/events/new" className="flex items-center gap-2">
                Retry Failed Events <ExternalLinkIcon className="h-3 w-3" />
              </a>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

// Loading skeleton component
export const MultipleEventsCreatedSkeleton = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className="rounded-full bg-muted p-1">
            <Skeleton className="h-4 w-4" />
          </div>
          <Skeleton className="h-6 w-48" />
        </CardTitle>
        <Skeleton className="h-4 w-64" />
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-4 w-40" />
          </div>
          
          <div className="space-y-3">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="border rounded-lg p-4">
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1 flex-1">
                      <Skeleton className="h-5 w-3/4" />
                      <Skeleton className="h-4 w-full" />
                    </div>
                    <Skeleton className="h-6 w-16" />
                  </div>
                  <div className="flex items-center gap-4">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="flex gap-2 pt-4 border-t">
          <Skeleton className="h-9 w-28" />
          <Skeleton className="h-9 w-32" />
        </div>
      </CardContent>
    </Card>
  );
};
