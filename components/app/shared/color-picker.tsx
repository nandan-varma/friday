"use client";

import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

const PRESET_COLORS = [
  { name: "Blue", value: "#3b82f6" },
  { name: "Red", value: "#ef4444" },
  { name: "Green", value: "#22c55e" },
  { name: "Yellow", value: "#eab308" },
  { name: "Purple", value: "#a855f7" },
  { name: "Pink", value: "#ec4899" },
  { name: "Indigo", value: "#6366f1" },
  { name: "Teal", value: "#14b8a6" },
  { name: "Orange", value: "#f97316" },
  { name: "Cyan", value: "#06b6d4" },
  { name: "Lime", value: "#84cc16" },
  { name: "Amber", value: "#f59e0b" },
];

interface ColorPickerProps {
  value?: string;
  onChange?: (value: string) => void;
  className?: string;
}

export function ColorPicker({ value = "#3b82f6", onChange, className }: ColorPickerProps) {
  return (
    <Popover>
      <PopoverTrigger
        className={cn(
          "flex h-8 w-full items-center justify-start gap-2 rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm transition-colors hover:bg-muted/50 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50",
          className
        )}
      >
        <div
          className="size-4 rounded-sm border"
          style={{ backgroundColor: value }}
        />
        <span className="flex-1 text-left">{value}</span>
      </PopoverTrigger>
      <PopoverContent className="w-64">
        <div className="grid grid-cols-6 gap-2">
          {PRESET_COLORS.map((color) => (
            <button
              key={color.value}
              type="button"
              className={cn(
                "size-10 rounded-md border-2 transition-all hover:scale-110",
                value === color.value ? "border-foreground ring-2 ring-offset-2" : "border-transparent"
              )}
              style={{ backgroundColor: color.value }}
              onClick={() => onChange?.(color.value)}
              title={color.name}
            />
          ))}
        </div>
        <div className="mt-4">
          <label className="mb-2 block text-xs font-medium">Custom Color</label>
          <div className="flex gap-2">
            <input
              type="color"
              value={value}
              onChange={(e) => onChange?.(e.target.value)}
              className="h-9 w-full cursor-pointer rounded-md border"
            />
            <input
              type="text"
              value={value}
              onChange={(e) => onChange?.(e.target.value)}
              className="h-9 flex-1 rounded-md border px-2 text-sm"
              placeholder="#000000"
            />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
