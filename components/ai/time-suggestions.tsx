import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ClockIcon, CalendarIcon, StarIcon, AlertCircleIcon, PlusIcon } from "lucide-react";
import { format, isToday, isTomorrow, isThisWeek } from "date-fns";

type TimeSlot = {
  startTime: string;
  endTime: string;
  score: number;
};

type TimeSuggestionsProps = {
  suggestions: TimeSlot[];
  preferredDate?: string;
  duration: number;
  error?: string;
};

export const TimeSuggestions = ({ suggestions, preferredDate, duration, error }: TimeSuggestionsProps) => {
  if (error) {
    return (
      <Card className="border-destructive bg-destructive/5">
        <CardHeader>
          <CardTitle className="text-destructive flex items-center gap-2">
            <AlertCircleIcon className="h-5 w-5" />
            Error Finding Available Times
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

  if (suggestions.length === 0) {
    return (
      <Card className="border-dashed">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClockIcon className="h-5 w-5" />
            No Available Times Found
          </CardTitle>
          <CardDescription>
            No free time slots found for {duration} minutes
            {preferredDate && ` on ${format(new Date(preferredDate), "MMM dd, yyyy")}`}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="text-center space-y-4">
            <p className="text-sm text-muted-foreground">
              Try adjusting the duration or selecting a different date.
            </p>
            <div className="flex gap-2 justify-center">
              <Button size="sm" asChild>
                <a href="/events/new">Create Event Anyway</a>
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

  // Sort suggestions by score (best first)
  const sortedSuggestions = [...suggestions].sort((a, b) => b.score - a.score);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ClockIcon className="h-5 w-5" />
          Suggested Time Slots
        </CardTitle>
        <CardDescription>
          {suggestions.length} available {duration}-minute slots
          {preferredDate && ` for ${format(new Date(preferredDate), "MMM dd, yyyy")}`}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {sortedSuggestions.map((slot, index) => (
          <TimeSlotCard 
            key={index} 
            slot={slot} 
            duration={duration} 
            rank={index + 1}
            isRecommended={index === 0 && slot.score >= 0.8}
          />
        ))}
        
        <div className="pt-4 border-t">
          <div className="flex gap-2">
            <Button asChild>
              <a href="/events/new" className="flex items-center gap-2">
                <PlusIcon className="h-4 w-4" />
                Create Event
              </a>
            </Button>
            <Button variant="outline" asChild>
              <a href="/calendar">View Calendar</a>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const TimeSlotCard = ({ 
  slot, 
  duration, 
  rank, 
  isRecommended 
}: { 
  slot: TimeSlot; 
  duration: number; 
  rank?: number;
  isRecommended?: boolean;
}) => {
  const startDate = new Date(slot.startTime);
  const endDate = new Date(slot.endTime);
  
  const getScoreColor = (score: number) => {
    if (score >= 0.8) return "bg-green-100 text-green-800 border-green-200";
    if (score >= 0.6) return "bg-yellow-100 text-yellow-800 border-yellow-200";
    return "bg-orange-100 text-orange-800 border-orange-200";
  };
  
  const getScoreLabel = (score: number) => {
    if (score >= 0.8) return "Excellent";
    if (score >= 0.6) return "Good";
    return "Fair";
  };

  const getDateLabel = (date: Date) => {
    if (isToday(date)) return "Today";
    if (isTomorrow(date)) return "Tomorrow";
    if (isThisWeek(date)) return format(date, "EEEE");
    return format(date, "MMM dd");
  };

  return (
    <div className={`border rounded-lg p-4 hover:bg-muted/50 transition-all group ${
      isRecommended ? 'border-primary bg-primary/5' : ''
    }`}>
      <div className="flex items-center justify-between">
        <div className="space-y-2 flex-1">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <CalendarIcon className="h-4 w-4 text-muted-foreground" />
              <span className="font-semibold">
                {format(startDate, "h:mm a")} - {format(endDate, "h:mm a")}
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <Badge 
                variant="outline" 
                className={getScoreColor(slot.score)}
              >
                {getScoreLabel(slot.score)}
              </Badge>
              
              {isRecommended && (
                <Badge className="bg-primary text-primary-foreground flex items-center gap-1">
                  <StarIcon className="h-3 w-3" />
                  Recommended
                </Badge>
              )}
              
              {rank && rank <= 3 && !isRecommended && (
                <Badge variant="secondary">#{rank}</Badge>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>{getDateLabel(startDate)}</span>
            <span>•</span>
            <span>{duration} minutes</span>
            <span>•</span>
            <span>{Math.round(slot.score * 100)}% match</span>
          </div>
        </div>
        
        <Button 
          size="sm" 
          variant={isRecommended ? "default" : "outline"}
          className="ml-4 opacity-70 group-hover:opacity-100 transition-opacity"
          onClick={() => {
            const url = `/events/new?start=${slot.startTime}&end=${slot.endTime}`;
            window.open(url, '_blank');
          }}
        >
          {isRecommended ? 'Select Best' : 'Select'}
        </Button>
      </div>
    </div>
  );
};

// Loading skeleton component
export const TimeSuggestionsSkeleton = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ClockIcon className="h-5 w-5" />
          <Skeleton className="h-6 w-40" />
        </CardTitle>
        <Skeleton className="h-4 w-56" />
      </CardHeader>
      <CardContent className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="border rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-6 w-16" />
                </div>
                <div className="flex items-center gap-4">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-12" />
                </div>
              </div>
              <Skeleton className="h-8 w-16" />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
