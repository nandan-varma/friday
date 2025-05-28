"use client"

import { useRef, useEffect } from "react"
import { Bot, Send, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useChat, type Message } from '@ai-sdk/react'
import { cn } from "@/lib/utils"
import { UpcomingEvents } from "@/components/ai/upcoming-events"
import { EventCreated } from "@/components/ai/event-created"
import { TimeSuggestions } from "@/components/ai/time-suggestions"

export default function AIAssistantPage() {
  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: '/api/chat',
    initialMessages: [
      {
        id: '1',
        role: 'assistant',
        content: "Hello! I'm your AI calendar assistant. How can I help you today? I can show you upcoming events, help you create new ones, or suggest available time slots.",
      },
    ],
  })

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const renderToolInvocation = (toolInvocation: any) => {
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
          <Card className="p-4">
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
              <span className="text-sm text-muted-foreground">
                {toolName === 'getUpcomingEvents' ? 'Loading your events...' :
                 toolName === 'createEvent' ? 'Creating event...' :
                 toolName === 'suggestEventTime' ? 'Finding available times...' : 
                 'Loading...'}
              </span>
            </div>
          </Card>
        </div>
      )
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <h1 className="text-3xl font-bold mb-6">AI Assistant</h1>

      <Card className="flex-1 overflow-hidden flex flex-col">
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div key={message.id}>
              <div
                className={cn(
                  "flex items-start gap-3 rounded-lg p-4",
                  message.role === "user" ? "ml-auto bg-primary text-primary-foreground max-w-[80%]" : "bg-muted",
                )}
              >
                <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-background">
                  {message.role === "user" ? <User className="size-4" /> : <Bot className="size-4" />}
                </div>
                <div className="text-sm flex-1">{message.content}</div>
              </div>

              {/* Render tool invocations */}
              {message.toolInvocations?.map(renderToolInvocation)}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <div className="border-t p-4">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              value={input}
              onChange={handleInputChange}
              placeholder="Ask me about your calendar, create events, or find available times..."
              disabled={isLoading}
              className="flex-1"
            />
            <Button type="submit" size="icon" disabled={isLoading}>
              <Send className="size-4" />
            </Button>
          </form>
        </div>
      </Card>
    </div>
  )
}
