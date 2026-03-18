import { calendarTools } from "@/tools/calendar-tools"
import { multiAgentPrompt } from "@/prompts/system-prompts"
import { createAuthenticatedTools } from "@/lib/create-authenticated-tools"
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

  console.log(`[createChatAgent] Creating agent for authenticated user: ${userId}`)

  const tools = getToolsForIntegrations(integrations)

  // Create authenticated tools that inject the real userId from session
  const authenticatedTools = createAuthenticatedTools(
    tools,
    userId,
    githubUsername ? { username: githubUsername } : undefined
  )

  return {
    tools: authenticatedTools,
    model,
    systemPrompt,
  }
}
