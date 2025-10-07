"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Send, Bot, User, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"
import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport, lastAssistantMessageIsCompleteWithToolCalls } from 'ai'
import { UpcomingEvents, EventCreated, TimeSuggestions, ToolLoading, ToolError } from "./ai-tool-components"

interface AIChatProps {
  onEventCreate?: (eventData: any) => void
  onEventClick?: (event: any) => void
}

export function AIChat({ onEventCreate, onEventClick }: AIChatProps) {
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const { messages, sendMessage, addToolResult, status } = useChat({
    transport: new DefaultChatTransport({
      api: '/api/chat',
    }),
  })

  useEffect(() => {
    // Scroll to bottom when new messages arrive
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]')
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight
      }
    }
  }, [messages])

  const handleSuggestionClick = (suggestion: string) => {
    sendMessage({ text: suggestion })
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage({ text: (e.target as HTMLInputElement).value })
      ;(e.target as HTMLInputElement).value = ''
    }
  }

  const isLoading = status === 'streaming'

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  }

  const renderToolPart = (part: any, messageId: string) => {
    const callId = part.toolCallId

    switch (part.type) {
      case 'tool-getUpcomingEvents': {
        switch (part.state) {
          case 'input-streaming':
            return <ToolLoading key={callId} toolName="getUpcomingEvents" />
          case 'input-available':
            return <ToolLoading key={callId} toolName="getUpcomingEvents" />
          case 'output-available':
            return (
              <UpcomingEvents
                key={callId}
                events={part.output.map((event: any) => ({
                  id: event.id,
                  title: event.title,
                  description: event.description,
                  location: event.location,
                  startTime: event.startTime,
                  endTime: event.endTime,
                  isAllDay: event.isAllDay,
                }))}
                count={part.output.length}
                onEventClick={onEventClick}
              />
            )
          case 'output-error':
            return <ToolError key={callId} toolName="getUpcomingEvents" error={part.errorText} />
        }
        break
      }

      case 'tool-getTodayEvents': {
        switch (part.state) {
          case 'input-streaming':
            return <ToolLoading key={callId} toolName="getTodayEvents" />
          case 'input-available':
            return <ToolLoading key={callId} toolName="getTodayEvents" />
          case 'output-available':
            return (
              <UpcomingEvents
                key={callId}
                events={part.output.map((event: any) => ({
                  id: event.id,
                  title: event.title,
                  description: event.description,
                  location: event.location,
                  startTime: event.startTime,
                  endTime: event.endTime,
                  isAllDay: event.isAllDay,
                }))}
                count={part.output.length}
                onEventClick={onEventClick}
              />
            )
          case 'output-error':
            return <ToolError key={callId} toolName="getTodayEvents" error={part.errorText} />
        }
        break
      }

      case 'tool-createEvent': {
        switch (part.state) {
          case 'input-streaming':
            return <ToolLoading key={callId} toolName="createEvent" />
          case 'input-available':
            return <ToolLoading key={callId} toolName="createEvent" />
          case 'output-available':
            return (
              <EventCreated
                key={callId}
                event={{
                  id: part.output.id,
                  title: part.output.title,
                  description: part.output.description,
                  location: part.output.location,
                  startTime: part.output.startTime,
                  endTime: part.output.endTime,
                  isAllDay: part.output.isAllDay,
                }}
                onEventClick={onEventClick}
              />
            )
          case 'output-error':
            return <ToolError key={callId} toolName="createEvent" error={part.errorText} />
        }
        break
      }

      case 'tool-searchEvents': {
        switch (part.state) {
          case 'input-streaming':
            return <ToolLoading key={callId} toolName="searchEvents" />
          case 'input-available':
            return <ToolLoading key={callId} toolName="searchEvents" />
          case 'output-available':
            return (
              <UpcomingEvents
                key={callId}
                events={part.output.map((event: any) => ({
                  id: event.id,
                  title: event.title,
                  description: event.description,
                  location: event.location,
                  startTime: event.startTime,
                  endTime: event.endTime,
                  isAllDay: event.isAllDay,
                }))}
                count={part.output.length}
                onEventClick={onEventClick}
              />
            )
          case 'output-error':
            return <ToolError key={callId} toolName="searchEvents" error={part.errorText} />
        }
        break
      }

      case 'tool-getEventStats': {
        switch (part.state) {
          case 'input-streaming':
            return <ToolLoading key={callId} toolName="getEventStats" />
          case 'input-available':
            return <ToolLoading key={callId} toolName="getEventStats" />
          case 'output-available':
            return (
              <Card key={callId}>
                <CardHeader>
                  <CardTitle>Calendar Statistics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold">{part.output.totalEvents}</div>
                      <div className="text-sm text-muted-foreground">Total Events</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{part.output.todayEvents}</div>
                      <div className="text-sm text-muted-foreground">Today</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{part.output.upcomingEvents}</div>
                      <div className="text-sm text-muted-foreground">Upcoming (7 days)</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{part.output.localEvents + part.output.googleEvents}</div>
                      <div className="text-sm text-muted-foreground">Sources</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          case 'output-error':
            return <ToolError key={callId} toolName="getEventStats" error={part.errorText} />
        }
        break
      }
    }

    return null
  }



  return (
    <div className="flex flex-col h-[600px] max-h-[80vh]">
      {/* Header */}
      <Card className="rounded-none border-x-0 border-t-0">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <Bot className="w-4 h-4 text-primary-foreground" />
              </div>
              <span>AI Calendar Assistant</span>
            </div>
            <Badge variant="secondary" className="text-xs">
              <Sparkles className="w-3 h-3 mr-1" />
              Powered by AI
            </Badge>
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Messages */}
      <ScrollArea ref={scrollAreaRef} className="flex-1 p-4">
        <div className="space-y-4">
          {/* Initial welcome message */}
          <div className="flex gap-3 justify-start">
            <Avatar className="w-8 h-8 mt-1">
              <AvatarFallback className="bg-primary text-primary-foreground">
                <Bot className="w-4 h-4" />
              </AvatarFallback>
            </Avatar>
            <div className="max-w-[80%] space-y-2 order-2">
              <div className="rounded-lg px-4 py-3 bg-muted">
                <p className="text-sm whitespace-pre-wrap">
                  Hello! I'm your AI calendar assistant. I can help you create events, find available time slots, check your schedule, and manage your calendar. What would you like to do?
                </p>
              </div>
              {/* Suggestions for initial message */}
              <div className="flex flex-wrap gap-2">
                {[
                  "Show me my upcoming events",
                  "Create a new event",
                  "Find a time for a meeting",
                  "What's on my calendar today?"
                ].map((suggestion, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    className="text-xs h-7"
                    onClick={() => handleSuggestionClick(suggestion)}
                  >
                    {suggestion}
                  </Button>
                ))}
              </div>
              <div className="text-xs text-muted-foreground">
                {formatTime(new Date())}
              </div>
            </div>
          </div>

          {messages?.map((message) => {
            const isUser = message.role !== 'assistant'
            return (
              <div
                key={message.id}
                className={cn(
                  "flex gap-3",
                  isUser ? "justify-end" : "justify-start"
                )}
              >
                {!isUser && (
                  <Avatar className="w-8 h-8 mt-1">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      <Bot className="w-4 h-4" />
                    </AvatarFallback>
                  </Avatar>
                )}

                <div className={cn(
                  "max-w-[80%] space-y-2",
                  isUser ? "order-1" : "order-2"
                )}>
                  {/* Render text parts */}
                  {message.parts
                    .filter(part => part.type === 'text')
                    .map((part, index) => (
                      <div
                        key={index}
                        className={cn(
                          "rounded-lg px-4 py-3",
                          isUser
                            ? "bg-primary text-primary-foreground ml-auto"
                            : "bg-muted"
                        )}
                      >
                        <p className="text-sm whitespace-pre-wrap">{part.text}</p>
                      </div>
                    ))}

                  {/* Render tool parts */}
                  {message.parts
                    .filter(part => part.type !== 'text')
                    .map((part, index) => renderToolPart(part, message.id))}



                  <div className="text-xs text-muted-foreground">
                    {formatTime(new Date())}
                  </div>
                </div>

                {isUser && (
                  <Avatar className="w-8 h-8 mt-1">
                    <AvatarFallback>
                      <User className="w-4 h-4" />
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            )
          })}

          {isLoading && (
            <div className="flex gap-3">
              <Avatar className="w-8 h-8 mt-1">
                <AvatarFallback className="bg-primary text-primary-foreground">
                  <Bot className="w-4 h-4" />
                </AvatarFallback>
              </Avatar>
              <div className="bg-muted rounded-lg px-4 py-3">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                  </div>
                  <span className="text-sm text-muted-foreground">Thinking...</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="p-4 border-t">
        <div className="flex gap-2">
          <Input
            ref={inputRef}
            onKeyPress={handleKeyPress}
            placeholder="Ask me about your calendar..."
            disabled={isLoading}
            className="flex-1"
          />
          <Button
            onClick={() => {
              const input = inputRef.current?.value
              if (input?.trim()) {
                sendMessage({ text: input.trim() })
                if (inputRef.current) inputRef.current.value = ''
              }
            }}
            disabled={isLoading}
            size="sm"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
        <div className="text-xs text-muted-foreground mt-2">
          Try: "Create a meeting tomorrow at 2pm" or "Show me my events this week"
        </div>
      </div>
    </div>
  )
}