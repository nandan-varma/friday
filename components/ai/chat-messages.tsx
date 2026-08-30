import type { UIMessage } from "ai";
import { Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

interface ChatMessagesProps {
  messages: UIMessage[];
  status?: string;
}

interface ToolPart {
  type: `tool-${string}`;
  state?: string;
  input?: unknown;
}

export function ChatMessages({ messages, status }: ChatMessagesProps) {
  return (
    <div className="space-y-4">
      {messages.map((message) => (
        <div
          key={message.id}
          className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
        >
          <Card
            className={`max-w-[80%] ${
              message.role === "user"
                ? "bg-primary text-primary-foreground"
                : "bg-card"
            }`}
          >
            <CardContent className="p-4">
              {message.parts.map((part) => {
                if (part.type === "text") {
                  return (
                    <div
                      key={`${message.id}-${part.type}-${part.text}`}
                      className="whitespace-pre-wrap text-pretty"
                    >
                      {part.text}
                    </div>
                  );
                }
                // Handle tool calls
                if (part.type.startsWith("tool-")) {
                  const toolName = part.type.replace("tool-", "");
                  const toolPart = part as unknown as ToolPart;
                  return (
                    <div key={`${message.id}-${part.type}`} className="mt-2">
                      <Badge variant="secondary" className="mb-2">
                        TOOL: {toolName}
                      </Badge>
                      {toolPart.state === "input-available" && (
                        <pre className="text-xs font-mono bg-muted border border-border p-2 mt-1 overflow-x-auto">
                          {JSON.stringify(toolPart.input, null, 2)}
                        </pre>
                      )}
                    </div>
                  );
                }
                return null;
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
  );
}
