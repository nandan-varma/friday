import type React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Github, Calendar, Send, Loader2 } from "lucide-react"

interface ChatInputProps {
  value: string
  onChange: (value: string) => void
  onSubmit: (e: React.FormEvent) => void
  disabled?: boolean
  isLoading?: boolean
  showTags?: boolean
}

export function ChatInput({
  value,
  onChange,
  onSubmit,
  disabled = false,
  isLoading = false,
  showTags = true,
}: ChatInputProps) {
  const insertTag = (tag: string) => {
    onChange(value + (value ? " " : "") + tag)
  }

  return (
    <div className="space-y-2">
      {showTags && (
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => insertTag("@github")}
            className="flex items-center gap-1"
            type="button"
          >
            <Github className="h-3 w-3" />
            GitHub
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => insertTag("@calendar")}
            className="flex items-center gap-1"
            type="button"
          >
            <Calendar className="h-3 w-3" />
            Calendar
          </Button>
        </div>
      )}
      <form onSubmit={onSubmit} className="flex gap-2">
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Ask about your GitHub activity or calendar..."
          disabled={disabled}
          className="flex-1"
        />
        <Button type="submit" disabled={disabled || !value.trim()}>
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        </Button>
      </form>
    </div>
  )
}
