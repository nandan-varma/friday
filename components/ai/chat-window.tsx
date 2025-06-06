"use client"

import { useRef, useEffect, useCallback, Suspense } from "react"
import { Bot, Send, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useChat, type Message } from '@ai-sdk/react'
import { type ToolInvocation } from 'ai'
import { cn } from "@/lib/utils"
import { UpcomingEvents } from "@/components/ai/upcoming-events"
import { EventCreated } from "@/components/ai/event-created"
import { TimeSuggestions } from "@/components/ai/time-suggestions"
import { MultipleEventsCreated } from "@/components/ai/multiple-events-created"
import { MarkdownRenderer } from "@/components/ui/markdown"

// Skeleton component for loading state
const ChatWindowSkeleton = () => {
  return (
    <Card className="flex-1 overflow-hidden flex flex-col h-full">
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {/* Assistant message skeleton */}
          <div className="flex items-start gap-3 rounded-lg p-4 bg-muted/50">
            <Skeleton className="size-8 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          </div>
          
          {/* User message skeleton */}
          <div className="flex items-start gap-3 rounded-lg p-4 ml-auto bg-primary/10 max-w-[85%] flex-row-reverse">
            <Skeleton className="size-8 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-full" />
            </div>
          </div>
          
          {/* Another assistant message skeleton */}
          <div className="flex items-start gap-3 rounded-lg p-4 bg-muted/50">
            <Skeleton className="size-8 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-4/5" />
              <Skeleton className="h-4 w-3/5" />
            </div>
          </div>
        </div>
      </ScrollArea>

      <div className="border-t p-4 bg-muted/30">
        <div className="flex gap-2">
          <Skeleton className="flex-1 h-10" />
          <Skeleton className="size-10" />
        </div>
        <div className="mt-2 flex flex-wrap gap-1">
          <Skeleton className="h-4 w-8" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-4 w-20" />
        </div>
      </div>
    </Card>
  )
}

export interface ChatWindowProps {
  /** API endpoint for chat requests */
  apiEndpoint?: string
  /** Maximum number of steps for tool execution */
  maxSteps?: number
  /** Initial messages to display */
  initialMessages?: Message[]
  /** Placeholder text for input */
  placeholder?: string
  /** Quick action suggestions */
  suggestions?: Array<{
    label: string
    value: string
  }>
  /** Custom tool invocation renderer */
  customToolRenderer?: (toolInvocation: ToolInvocation) => React.ReactNode | null
  /** Loading state */
  isLoading?: boolean
  /** Height of the chat window */
  height?: string
  /** Additional className for the container */
  className?: string
}

export default function ChatWindow({
  apiEndpoint = '/api/chat',
  maxSteps = 5,
  initialMessages = [
    {
      id: '1',
      role: 'assistant',
      content: "Hello! I'm your AI calendar assistant. I can help you with:\n\n• **View Events** - Show your upcoming calendar events\n• **Create Single Events** - Schedule new meetings or appointments\n• **Create Multiple Events** - Batch create several events at once\n• **Find Available Times** - Suggest optimal time slots for new events\n\nWhat would you like to do today?",
    },
  ],
  placeholder = "Ask me about your calendar, create single/multiple events, or find available times...",
  suggestions = [
    { label: "Show events", value: "Show me my upcoming events" },
    { label: "Create meeting", value: "Create a meeting tomorrow at 2pm for 1 hour" },
    { label: "Multiple events", value: "Create multiple events: team standup daily at 9am for this week, and a project review on Friday at 3pm" },
    { label: "Find times", value: "Find available time slots for a 30-minute meeting this week" },
  ],
  customToolRenderer,
  height = "h-[calc(100vh-8rem)]",
  className,
}: ChatWindowProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: apiEndpoint,
    maxSteps,
    initialMessages,
  })

  // Scroll to bottom when messages change
  useEffect(() => {
    const timer = setTimeout(() => {
      // Find the ScrollArea viewport and scroll to bottom
      const scrollArea = messagesEndRef.current?.closest('[data-radix-scroll-area-viewport]')
      if (scrollArea) {
        scrollArea.scrollTop = scrollArea.scrollHeight
      } else {
        // Fallback to normal scroll
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
      }
    }, 100)
    return () => clearTimeout(timer)
  }, [messages, isLoading])

  const renderToolInvocation = (toolInvocation: ToolInvocation) => {
    // Use custom renderer if provided
    if (customToolRenderer) {
      const customResult = customToolRenderer(toolInvocation)
      if (customResult !== null) {
        return customResult
      }
    }

    const { toolName, toolCallId, state } = toolInvocation

    if (state === 'result') {
      if (toolName === 'getUpcomingEvents') {
        const { result } = toolInvocation
        return (
          <div key={toolCallId} className="mt-3">
            <UpcomingEvents {...result} />
          </div>
        )
      } else if (toolName === 'createEvent') {
        const { result } = toolInvocation
        return (
          <div key={toolCallId} className="mt-3">
            <EventCreated {...result} />
          </div>
        )
      } else if (toolName === 'createMultipleEvents') {
        const { result } = toolInvocation
        return (
          <div key={toolCallId} className="mt-3">
            <MultipleEventsCreated {...result} />
          </div>
        )
      } else if (toolName === 'suggestEventTime') {
        const { result } = toolInvocation
        return (
          <div key={toolCallId} className="mt-3">
            <TimeSuggestions {...result} />
          </div>
        )
      }
    } else {
      // Show loading state
      return (
        <div key={toolCallId} className="mt-3">
          <Card className="p-4 bg-muted/30 border-dashed">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-primary border-t-transparent"></div>
                <div className="absolute inset-0 rounded-full h-5 w-5 border-2 border-primary/20"></div>
              </div>
              <div className="space-y-1">
                <span className="text-sm font-medium text-foreground">
                  {toolName === 'getUpcomingEvents' ? 'Loading your events...' :
                   toolName === 'createEvent' ? 'Creating event...' :
                   toolName === 'createMultipleEvents' ? 'Creating multiple events...' :
                   toolName === 'suggestEventTime' ? 'Finding available times...' : 
                   'Processing...'}
                </span>
                <p className="text-xs text-muted-foreground">
                  {toolName === 'getUpcomingEvents' ? 'Fetching your calendar data' :
                   toolName === 'createEvent' ? 'Adding event to your calendar' :
                   toolName === 'createMultipleEvents' ? 'Processing each event in batch' :
                   toolName === 'suggestEventTime' ? 'Analyzing your schedule for optimal times' : 
                   'Working on your request'}
                </p>
              </div>
            </div>
          </Card>
        </div>
      )
    }
  }

  const handleSuggestionClick = (value: string) => {
    handleInputChange({ target: { value } } as any)
  }

  return (
    <div className={cn("flex flex-col", height, className)}>
      <Suspense fallback={<ChatWindowSkeleton />}>
        <Card className="flex-1 overflow-hidden flex flex-col h-full">
          <ScrollArea className="flex-1">
            <div className="p-4 space-y-4">
              {messages.map((message) => (
                <div key={message.id}>
                  <div
                    className={cn(
                      "flex items-start gap-3 rounded-lg p-4 transition-all duration-200 hover:shadow-sm",
                      message.role === "user" 
                        ? "ml-auto bg-primary text-primary-foreground max-w-[85%] flex-row-reverse" 
                        : "bg-muted/50 hover:bg-muted/70",
                    )}
                  >
                    <div className={cn(
                      "flex size-8 shrink-0 items-center justify-center rounded-full border-2",
                      message.role === "user" 
                        ? "bg-primary-foreground text-primary border-primary-foreground/20" 
                        : "bg-background text-foreground border-border"
                    )}>
                      {message.role === "user" ? <User className="size-4" /> : <Bot className="size-4" />}
                    </div>
                    <div className={cn(
                      "text-sm flex-1 space-y-2",
                      message.role === "user" ? "text-right" : ""
                    )}>
                      {message.parts ? (
                        message.parts.map((part, index) => {
                          switch (part.type) {
                            case 'text':
                              return (
                                <MarkdownRenderer 
                                  key={index} 
                                  content={part.text}
                                  isUserMessage={message.role === "user"}
                                />
                              )
                            case 'tool-invocation':
                              return (
                                <div key={index} className="animate-in slide-in-from-bottom-2 duration-300">
                                  {renderToolInvocation(part.toolInvocation)}
                                </div>
                              )
                            default:
                              return null
                          }
                        })
                      ) : (
                        <MarkdownRenderer 
                          content={message.content}
                          isUserMessage={message.role === "user"}
                        />
                      )}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          <div className="border-t p-4 bg-muted/30">
            <form onSubmit={handleSubmit} className="flex gap-2">
              <Input
                value={input}
                onChange={handleInputChange}
                placeholder={placeholder}
                disabled={isLoading}
                className="flex-1"
              />
              <Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
                <Send className="size-4" />
              </Button>
            </form>
            
            {suggestions.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1 text-xs text-muted-foreground">
                <span>Try:</span>
                {suggestions.map((suggestion, index) => (
                  <div key={suggestion.value} className="flex items-center gap-1">
                    <button 
                      type="button"
                      className="text-primary hover:underline"
                      onClick={() => handleSuggestionClick(suggestion.value)}
                    >
                      "{suggestion.label}"
                    </button>
                    {index < suggestions.length - 1 && <span>•</span>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      </Suspense>
    </div>
  )
}
