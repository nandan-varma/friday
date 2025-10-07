"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  Clock,
  MapPin,
  CheckCircle,
  XCircle,
  Loader2,
  Plus,
} from "lucide-react";

export interface EventData {
  id: string;
  title: string;
  description?: string;
  location?: string;
  startTime: string;
  endTime: string;
  isAllDay?: boolean;
}

interface UpcomingEventsProps {
  events: EventData[];
  count: number;
  onEventClick?: (event: EventData) => void;
}

export function UpcomingEvents({
  events,
  count,
  onEventClick,
}: UpcomingEventsProps) {
  if (count === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-8">
          <Calendar className="w-12 h-12 text-muted-foreground mb-4" />
          <p className="text-lg font-medium text-muted-foreground">
            No upcoming events
          </p>
          <p className="text-sm text-muted-foreground">
            Your calendar is free!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card data-testid="upcoming-events">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Upcoming Events: {count}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {events.map((event) => (
            <div
              key={event.id}
              data-testid={`event-${event.id}`}
              className="p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
              onClick={() => onEventClick?.(event)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-medium text-sm mb-2">{event.title}</h4>
                  {event.description && (
                    <p className="text-sm text-muted-foreground mb-2">
                      {event.description}
                    </p>
                  )}
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(event.startTime).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {event.isAllDay
                        ? "All day"
                        : `${new Date(event.startTime).toLocaleTimeString(
                            "en-US",
                            {
                              hour: "numeric",
                              minute: "2-digit",
                              hour12: true,
                            },
                          )} - ${new Date(event.endTime).toLocaleTimeString(
                            "en-US",
                            {
                              hour: "numeric",
                              minute: "2-digit",
                              hour12: true,
                            },
                          )}`}
                    </div>
                    {event.location && (
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {event.location}
                      </div>
                    )}
                  </div>
                </div>
                <Badge variant="secondary" className="text-xs">
                  {event.isAllDay ? "All Day" : "Event"}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

interface EventCreatedProps {
  event: EventData;
  onEventClick?: (event: EventData) => void;
}

export function EventCreated({ event, onEventClick }: EventCreatedProps) {
  return (
    <Card
      data-testid="event-created"
      className="border-green-200 bg-green-50/50"
    >
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-green-700">
          <CheckCircle className="w-5 h-5" />
          Event Created: {event.title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div
          data-testid="created-event-click"
          className="p-4 border border-green-200 rounded-lg bg-white cursor-pointer hover:bg-green-50/50 transition-colors"
          onClick={() => onEventClick?.(event)}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h4 className="font-medium text-sm mb-2">{event.title}</h4>
              {event.description && (
                <p className="text-sm text-muted-foreground mb-2">
                  {event.description}
                </p>
              )}
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {new Date(event.startTime).toLocaleDateString()}
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {event.isAllDay
                    ? "All day"
                    : `${new Date(event.startTime).toLocaleTimeString("en-US", {
                        hour: "numeric",
                        minute: "2-digit",
                        hour12: true,
                      })} - ${new Date(event.endTime).toLocaleTimeString(
                        "en-US",
                        {
                          hour: "numeric",
                          minute: "2-digit",
                          hour12: true,
                        },
                      )}`}
                </div>
                {event.location && (
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {event.location}
                  </div>
                )}
              </div>
            </div>
            <Badge
              variant="secondary"
              className="text-xs bg-green-100 text-green-700"
            >
              Created
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface TimeSuggestion {
  startTime: string;
  endTime: string;
  score: number;
}

interface TimeSuggestionsProps {
  suggestions: TimeSuggestion[];
  preferredDate: string;
  duration: number;
  onSuggestionClick?: (suggestion: TimeSuggestion) => void;
}

export function TimeSuggestions({
  suggestions,
  preferredDate,
  duration,
  onSuggestionClick,
}: TimeSuggestionsProps) {
  if (suggestions.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-8">
          <Clock className="w-12 h-12 text-muted-foreground mb-4" />
          <p className="text-lg font-medium text-muted-foreground">
            No time suggestions available
          </p>
          <p className="text-sm text-muted-foreground">
            Try a different date or duration
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Time Suggestions ({duration} min)
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Available slots for {new Date(preferredDate).toLocaleDateString()}
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {suggestions.map((suggestion, index) => (
            <div
              key={index}
              className="p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
              onClick={() => onSuggestionClick?.(suggestion)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <Clock className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">
                      {new Date(suggestion.startTime).toLocaleTimeString(
                        "en-US",
                        {
                          hour: "numeric",
                          minute: "2-digit",
                          hour12: true,
                        },
                      )}{" "}
                      -{" "}
                      {new Date(suggestion.endTime).toLocaleTimeString(
                        "en-US",
                        {
                          hour: "numeric",
                          minute: "2-digit",
                          hour12: true,
                        },
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {duration} minutes • Score:{" "}
                      {Math.round(suggestion.score * 100)}%
                    </p>
                  </div>
                </div>
                <Button size="sm" variant="outline" className="gap-2">
                  <Plus className="w-3 h-3" />
                  Select
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

interface ToolLoadingProps {
  toolName: string;
}

export function ToolLoading({ toolName }: ToolLoadingProps) {
  return (
    <Card
      data-testid={`tool-loading-${toolName}`}
      className="border-blue-200 bg-blue-50/50"
    >
      <CardContent className="flex items-center gap-3 py-6">
        <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
        <div>
          <p className="font-medium text-sm text-blue-900">
            Loading {toolName}...
          </p>
          <p className="text-xs text-blue-700">Processing your request</p>
        </div>
      </CardContent>
    </Card>
  );
}

interface ToolErrorProps {
  toolName: string;
  error: string;
}

export function ToolError({ toolName, error }: ToolErrorProps) {
  const displayName = toolName
    .replace(/([A-Z])/g, " $1")
    .toLowerCase()
    .trim();

  return (
    <Card
      data-testid={`tool-error-${toolName}`}
      className="border-red-200 bg-red-50/50"
    >
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-red-700">
          <XCircle className="w-5 h-5" />
          {displayName.charAt(0).toUpperCase() + displayName.slice(1)} Failed
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-red-700">{error}</p>
      </CardContent>
    </Card>
  );
}
