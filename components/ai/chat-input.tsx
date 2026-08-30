import { Loader2, Send } from "lucide-react";
import type React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  disabled?: boolean;
  isLoading?: boolean;
}

export function ChatInput({
  value,
  onChange,
  onSubmit,
  disabled = false,
  isLoading = false,
}: ChatInputProps) {
  return (
    <form onSubmit={onSubmit} className="flex gap-2">
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Ask about your calendar..."
        disabled={disabled}
        className="flex-1"
      />
      <Button type="submit" disabled={disabled || !value.trim()}>
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Send className="h-4 w-4" />
        )}
      </Button>
    </form>
  );
}
