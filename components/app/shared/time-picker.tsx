"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface TimePickerProps {
  value?: string; // Format: "HH:MM" (24-hour)
  onChange?: (value: string) => void;
  className?: string;
}

export function TimePicker({ value, onChange, className }: TimePickerProps) {
  const hours = value?.split(":")[0] || "12";
  const minutes = value?.split(":")[1] || "00";

  const handleHourChange = (newHour: string | null) => {
    if (newHour) onChange?.(`${newHour}:${minutes}`);
  };

  const handleMinuteChange = (newMinute: string | null) => {
    if (newMinute) onChange?.(`${hours}:${newMinute}`);
  };

  // Generate hours (00-23)
  const hourOptions = Array.from({ length: 24 }, (_, i) => {
    const hour = i.toString().padStart(2, "0");
    return { value: hour, label: hour };
  });

  // Generate minutes (00, 15, 30, 45)
  const minuteOptions = ["00", "15", "30", "45"].map((m) => ({
    value: m,
    label: m,
  }));

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Select value={hours} onValueChange={handleHourChange}>
        <SelectTrigger className="w-[70px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {hourOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <span className="text-muted-foreground">:</span>
      <Select value={minutes} onValueChange={handleMinuteChange}>
        <SelectTrigger className="w-[70px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {minuteOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
