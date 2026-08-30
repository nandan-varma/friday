"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { MessageCircle } from "lucide-react";
import { useState } from "react";
import { buttonVariants } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { ChatInput } from "./chat-input";
import { ChatMessages } from "./chat-messages";
import { ChatQuickActions } from "./chat-quick-actions";

interface ChatBubbleProps {
  className?: string;
}

export function ChatBubble({ className }: ChatBubbleProps) {
  const [input, setInput] = useState("");
  const [open, setOpen] = useState(false);
  const [chatId] = useState(() => crypto.randomUUID());

  const { messages, sendMessage, status } = useChat({
    id: chatId,
    resume: true,
    transport: new DefaultChatTransport({
      api: "/api/chat",
      prepareSendMessagesRequest: ({ id, messages }) => ({
        body: { id, message: messages[messages.length - 1] },
      }),
    }),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || status !== "ready") return;
    sendMessage({ text: input });
    setInput("");
  };

  const handleQuickAction = (prompt: string) => {
    setInput(prompt);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        className={cn(
          buttonVariants({ size: "icon" }),
          "fixed bottom-6 right-6 h-14 w-14 border border-border",
        )}
      >
        <MessageCircle className="h-6 w-6" />
      </SheetTrigger>
      <SheetContent
        side="right"
        className="w-full sm:w-[540px] flex flex-col p-0 frame-corners"
      >
        <SheetHeader className="px-6 py-4 border-b">
          <SheetTitle>AI Assistant</SheetTitle>
        </SheetHeader>

        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Quick Actions */}
          {messages.length === 0 && (
            <div className="px-6 py-4">
              <ChatQuickActions onActionClick={handleQuickAction} />
            </div>
          )}

          {/* Messages */}
          <ScrollArea className="flex-1 px-6">
            <ChatMessages messages={messages} status={status} />
          </ScrollArea>

          {/* Input */}
          <div className="px-6 py-4 border-t bg-background">
            <ChatInput
              value={input}
              onChange={setInput}
              onSubmit={handleSubmit}
              disabled={status !== "ready"}
              isLoading={status === "streaming"}
            />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
