"use client"

import type React from "react"
import { useState } from "react"
import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport } from "ai"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Github, Calendar, Send, Loader2 } from "lucide-react"

export default function ChatPage() {
  const [input, setInput] = useState("")

  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/chat",
    }),
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || status !== "ready") return
    sendMessage({ text: input })
    setInput("")
  }

  const insertTag = (tag: string) => {
    setInput((prev) => prev + (prev ? " " : "") + tag)
  }

  return (
    <div className="flex flex-col h-screen bg-background">
        {/* Header */}
        <header className="border-b bg-card">
          <div className="container mx-auto px-4 py-4">
            <h1 className="text-2xl font-bold text-foreground">AI Assistant</h1>
            <p className="text-sm text-muted-foreground">Chat with your GitHub and Calendar integrations</p>
          </div>
        </header>

        {/* Main Chat Area */}
        <div className="flex-1 container mx-auto px-4 py-6 flex flex-col max-w-4xl">
          {/* Quick Actions */}
          {messages.length === 0 && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button
                  variant="outline"
                  className="justify-start h-auto py-4 px-4 bg-transparent"
                  onClick={() => setInput("Show me my GitHub activity today")}
                >
                  <Github className="mr-2 h-5 w-5" />
                  <div className="text-left">
                    <div className="font-semibold">GitHub Activity</div>
                    <div className="text-xs text-muted-foreground">View commits, PRs, and issues</div>
                  </div>
                </Button>
                <Button
                  variant="outline"
                  className="justify-start h-auto py-4 px-4 bg-transparent"
                  onClick={() => setInput("What's on my calendar today?")}
                >
                  <Calendar className="mr-2 h-5 w-5" />
                  <div className="text-left">
                    <div className="font-semibold">Today's Schedule</div>
                    <div className="text-xs text-muted-foreground">See your calendar events</div>
                  </div>
                </Button>
                <Button
                  variant="outline"
                  className="justify-start h-auto py-4 px-4 bg-transparent"
                  onClick={() => setInput("Generate my daily standup")}
                >
                  <Github className="mr-2 h-5 w-5" />
                  <div className="text-left">
                    <div className="font-semibold">Daily Standup</div>
                    <div className="text-xs text-muted-foreground">GitHub activity summary</div>
                  </div>
                </Button>
                <Button
                  variant="outline"
                  className="justify-start h-auto py-4 px-4 bg-transparent"
                  onClick={() => setInput("List my repositories")}
                >
                  <Github className="mr-2 h-5 w-5" />
                  <div className="text-left">
                    <div className="font-semibold">My Repositories</div>
                    <div className="text-xs text-muted-foreground">Browse your GitHub repos</div>
                  </div>
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Messages */}
          <ScrollArea className="flex-1 pr-4">
            <div className="space-y-4">
              {messages.map((message) => (
                <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                  <Card
                    className={`max-w-[80%] ${message.role === "user" ? "bg-primary text-primary-foreground" : "bg-card"
                      }`}
                  >
                    <CardContent className="p-4">
                      {message.parts.map((part, index) => {
                        if (part.type === "text") {
                          return (
                            <div key={index} className="whitespace-pre-wrap text-pretty">
                              {part.text}
                            </div>
                          )
                        }
                        // Handle tool calls
                        if (part.type.startsWith("tool-")) {
                          const toolName = part.type.replace("tool-", "")
                          return (
                            <div key={index} className="mt-2">
                              <Badge variant="secondary" className="mb-2">
                                🔧 {toolName}
                              </Badge>
                              {(part as any).state === "input-available" && (
                                <pre className="text-xs bg-muted p-2 rounded mt-1 overflow-x-auto">
                                  {JSON.stringify((part as any).input, null, 2)}
                                </pre>
                              )}
                            </div>
                          )
                        }
                        return null
                      })}
                    </CardContent>
                  </Card>
                </div>
              ))}
              {status === "streaming" && (
                <div className="flex justify-start">
                  <Card className="bg-card">
                    <CardContent className="p-4 flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-sm text-muted-foreground">Thinking...</span>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Input Area */}
          <div className="mt-6 space-y-2">
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => insertTag("@github")}
                className="flex items-center gap-1"
              >
                <Github className="h-3 w-3" />
                GitHub
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => insertTag("@calendar")}
                className="flex items-center gap-1"
              >
                <Calendar className="h-3 w-3" />
                Calendar
              </Button>
            </div>
            <form onSubmit={handleSubmit} className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about your GitHub activity or calendar..."
                disabled={status !== "ready"}
                className="flex-1"
              />
              <Button type="submit" disabled={status !== "ready" || !input.trim()}>
                {status === "streaming" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            </form>
          </div>
        </div>
      </div>
  )
}
