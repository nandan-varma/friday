"use client"

import { AIChat } from "@/components/ai-chat"

export default function AIAssistantPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <AIChat
        onEventCreate={() => {}}
        onEventClick={() => {}}
      />
    </div>
  )
}