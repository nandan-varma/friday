"use client"

import type React from "react"
import { useState } from "react"
import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport } from "ai"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ChatMessages } from "@/components/ai/chat-messages"
import { ChatInput } from "@/components/ai/chat-input"
import { ChatQuickActions } from "@/components/ai/chat-quick-actions"

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
            <ChatQuickActions onActionClick={setInput} />
          )}

          {/* Messages */}
          <ScrollArea className="flex-1 pr-4">
            <ChatMessages messages={messages} status={status} />
          </ScrollArea>

          {/* Input Area */}
          <div className="mt-6">
            <ChatInput
              value={input}
              onChange={setInput}
              onSubmit={handleSubmit}
              disabled={status !== "ready"}
              isLoading={status === "streaming"}
            />
          </div>
        </div>
      </div>
  )
}
