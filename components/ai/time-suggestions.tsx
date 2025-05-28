import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ClockIcon, CalendarIcon } from "lucide-react";
import { format } from "date-fns";

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
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="text-destructive">Error Finding Available Times</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{error}</p>
        </CardContent>
      </Card>
    );
  }

  if (suggestions.length === 0) {
    return (
      <Card>
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
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Try adjusting the duration or selecting a different date.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ClockIcon className="h-5 w-5" />
          Suggested Time Slots
        </CardTitle>
        <CardDescription>
          Available {duration}-minute slots
          {preferredDate && ` for ${format(new Date(preferredDate), "MMM dd, yyyy")}`}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {suggestions.map((slot, index) => (
          <TimeSlotCard key={index} slot={slot} duration={duration} />
        ))}
        
        <div className="pt-4">
          <Button asChild size="sm">
            <a href="/events/new">Create Event</a>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

const TimeSlotCard = ({ slot, duration }: { slot: TimeSlot; duration: number }) => {
  const startDate = new Date(slot.startTime);
  const endDate = new Date(slot.endTime);
  
  const getScoreColor = (score: number) => {
    if (score >= 0.8) return "bg-green-100 text-green-800 border-green-200";
    if (score >= 0.6) return "bg-yellow-100 text-yellow-800 border-yellow-200";
    return "bg-red-100 text-red-800 border-red-200";
  };
  
  const getScoreLabel = (score: number) => {
    if (score >= 0.8) return "Great";
    if (score >= 0.6) return "Good";
    return "Okay";
  };

  return (
    <div className="border rounded-lg p-4 flex items-center justify-between hover:bg-muted/50 transition-colors">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <CalendarIcon className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">
            {format(startDate, "h:mm a")} - {format(endDate, "h:mm a")}
          </span>
          <Badge 
            variant="outline" 
            className={getScoreColor(slot.score)}
          >
            {getScoreLabel(slot.score)}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          {format(startDate, "EEEE, MMM dd")} • {duration} minutes
        </p>
      </div>
      
      <Button 
        size="sm" 
        variant="outline"
        onClick={() => {
          // You can implement a function to pre-fill the event form with this time
          const url = `/events/new?start=${slot.startTime}&end=${slot.endTime}`;
          window.open(url, '_blank');
        }}
      >
        Select
      </Button>
    </div>
  );
};
