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
      <Card className="border-destructive bg-destructive/5 w-full max-w-full">
        <CardHeader className="pb-3">
          <CardTitle className="text-destructive flex items-center gap-2 text-base">
            <AlertCircleIcon className="h-4 w-4 shrink-0" />
            <span className="truncate">Error Finding Available Times</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <p className="text-sm text-muted-foreground mb-3">{error}</p>
          <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (suggestions.length === 0) {
    return (
      <Card className="border-dashed w-full max-w-full">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <ClockIcon className="h-4 w-4 shrink-0" />
            <span className="truncate">No Available Times Found</span>
          </CardTitle>
          <CardDescription className="text-sm">
            No free time slots found for {duration} minutes
            {preferredDate && ` on ${format(new Date(preferredDate), "MMM dd, yyyy")}`}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="text-center space-y-3">
            <p className="text-sm text-muted-foreground">
              Try adjusting the duration or selecting a different date.
            </p>
            <div className="flex flex-col sm:flex-row gap-2 justify-center">
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
    <Card className="w-full max-w-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <ClockIcon className="h-4 w-4 shrink-0" />
          <span className="truncate">Suggested Time Slots</span>
        </CardTitle>
        <CardDescription className="text-sm">
          {suggestions.length} available {duration}-min slots
          {preferredDate && (
            <span className="block sm:inline">
              <span className="hidden sm:inline"> for </span>
              <span className="sm:hidden">on </span>
              {format(new Date(preferredDate), "MMM dd, yyyy")}
            </span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2 pt-0">
        {sortedSuggestions.map((slot, index) => (
          <TimeSlotCard 
            key={index} 
            slot={slot} 
            duration={duration} 
            rank={index + 1}
            isRecommended={index === 0 && slot.score >= 0.8}
          />
        ))}
        
        <div className="pt-3 border-t">
          <div className="flex flex-col sm:flex-row gap-2">
            <Button size="sm" className="flex-1" asChild>
              <a href="/events/new" className="flex items-center justify-center gap-2">
                <PlusIcon className="h-3 w-3" />
                Create Event
              </a>
            </Button>
            <Button variant="outline" size="sm" className="flex-1" asChild>
              <a href="/calendar" className="flex items-center justify-center">
                View Calendar
              </a>
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
    if (score >= 0.8) return "";
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
    <div className={`border rounded-lg p-3 hover:bg-muted/50 transition-all group w-full ${
      isRecommended ? 'border-primary bg-primary/5' : ''
    }`}>
      <div className="flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <CalendarIcon className="h-4 w-4 text-muted-foreground shrink-0" />
            <span className="font-semibold text-sm truncate">
              {format(startDate, "h:mm a")} - {format(endDate, "h:mm a")}
            </span>
          </div>
          
          <div className="flex items-center gap-1 flex-wrap">
            <Badge 
              variant="outline" 
              className={`text-xs ${getScoreColor(slot.score)}`}
            >
              {getScoreLabel(slot.score)}
            </Badge>
            
            {isRecommended && (
              <Badge className="bg-primary text-primary-foreground flex items-center gap-1 text-xs">
                <StarIcon className="h-3 w-3" />
                Best
              </Badge>
            )}
            
            {rank && rank <= 3 && !isRecommended && (
              <Badge variant="secondary" className="text-xs">#{rank}</Badge>
            )}
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-1 text-xs text-muted-foreground flex-wrap">
            <span className="whitespace-nowrap">{getDateLabel(startDate)}</span>
            <span className="hidden sm:inline">•</span>
            <span className="whitespace-nowrap">{duration} min</span>
            <span className="hidden sm:inline">•</span>
            <span className="whitespace-nowrap">{Math.round(slot.score * 100)}% match</span>
          </div>
          
          <Button 
            size="sm" 
            variant={isRecommended ? "default" : "outline"}
            className="text-xs h-7 px-3 whitespace-nowrap"
            onClick={() => {
              const url = `/events/new?start=${slot.startTime}&end=${slot.endTime}`;
              window.open(url, '_blank');
            }}
          >
            {isRecommended ? 'Select Best' : 'Select'}
          </Button>
        </div>
      </div>
    </div>
  );
};

// Loading skeleton component
export const TimeSuggestionsSkeleton = () => {
  return (
    <Card className="w-full max-w-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <ClockIcon className="h-4 w-4" />
          <Skeleton className="h-5 w-32" />
        </CardTitle>
        <Skeleton className="h-4 w-48" />
      </CardHeader>
      <CardContent className="space-y-2 pt-0">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="border rounded-lg p-3">
            <div className="flex flex-col gap-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-24" />
                </div>
                <div className="flex items-center gap-1">
                  <Skeleton className="h-5 w-12" />
                  <Skeleton className="h-5 w-8" />
                </div>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-1">
                  <Skeleton className="h-3 w-12" />
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-3 w-10" />
                </div>
                <Skeleton className="h-7 w-14" />
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
