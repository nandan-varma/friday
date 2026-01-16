import { calendarTools } from "@/tools/calendar-tools"
import { multiAgentPrompt } from "@/prompts/system-prompts"
import { LanguageModel } from "ai"
import { openai } from "@ai-sdk/openai";

export type IntegrationType = "github" | "calendar" | "all"

export function detectIntegrations(message: string): IntegrationType[] {
  const integrations: IntegrationType[] = []
  const lowerMessage = message.toLowerCase()

  // Check for GitHub-related keywords
  if (
    lowerMessage.includes("github") ||
    lowerMessage.includes("repository") ||
    lowerMessage.includes("repo") ||
    lowerMessage.includes("commit") ||
    lowerMessage.includes("pull request") ||
    lowerMessage.includes("pr") ||
    lowerMessage.includes("issue") ||
    lowerMessage.includes("code") ||
    lowerMessage.includes("standup")
  ) {
    integrations.push("github")
  }

  // Check for Calendar-related keywords
  if (
    lowerMessage.includes("calendar") ||
    lowerMessage.includes("event") ||
    lowerMessage.includes("meeting") ||
    lowerMessage.includes("schedule") ||
    lowerMessage.includes("today") ||
    lowerMessage.includes("tomorrow") ||
    lowerMessage.includes("appointment")
  ) {
    integrations.push("calendar")
  }

  // If no specific integration detected, use all
  if (integrations.length === 0) {
    integrations.push("all")
  }

  return integrations
}

export function getToolsForIntegrations(integrations: IntegrationType[]) {
  const tools: Record<string, any> = {}

    if (integrations.includes("calendar")) {
      Object.assign(tools, calendarTools)
    }

  return tools
}

export interface ChatAgentOptions {
  userId: string
  githubUsername?: string
  integrations?: IntegrationType[]
  model?: LanguageModel
  systemPrompt?: string
}

export function createChatAgent(options: ChatAgentOptions) {
  const {
    userId,
    githubUsername,
    integrations = ["all"],
    model = openai("gpt-4o"),
    systemPrompt = multiAgentPrompt,
  } = options

  const tools = getToolsForIntegrations(integrations)

  // Inject userId and username into tool calls
  const wrappedTools = Object.fromEntries(
    Object.entries(tools).map(([name, toolDef]) => {
      const originalExecute = toolDef.execute
      return [
        name,
        {
          ...toolDef,
          execute: async (args: any) => {
            // Auto-inject userId if not provided
            if (!args.userId) {
              args.userId = userId
            }
            // Auto-inject username for GitHub tools if not provided
            if (!args.username && githubUsername && name.startsWith("list")) {
              args.username = githubUsername
            }
            return originalExecute(args)
          },
        },
      ]
    }),
  )

  return {
    tools: wrappedTools,
    model,
    systemPrompt,
  }
}
