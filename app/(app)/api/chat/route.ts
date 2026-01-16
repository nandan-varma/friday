import { consumeStream, convertToModelMessages, streamText, type UIMessage, stepCountIs } from "ai"
import { createChatAgent, detectIntegrations } from "@/agents/chat-agent"
import { auth } from "@/lib/auth"
import { getIntegration } from "@/lib/integrations/github/github-oauth"

export const maxDuration = 30

export async function POST(req: Request) {
  // Get authenticated user from session
  const session = await auth.api.getSession({
    headers: req.headers,
  })

  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 })
  }

  const userId = session.user.id

  // Get GitHub username from integration if available
  const githubInteg = await getIntegration(userId)
  const githubUsername = githubInteg?.githubUsername

  console.log(`[v0] Starting chat for user ${userId} (GitHub: ${githubUsername || "not connected"})`) 

  const { messages }: { messages: UIMessage[] } = await req.json()

  // Detect which integrations to use based on the latest message
  const latestMessage = messages[messages.length - 1]
  const integrations = latestMessage?.parts
    ?.filter((p) => p.type === "text")
    .map((p) => (p as any).text)
    .join(" ")

  const detectedIntegrations = integrations ? detectIntegrations(integrations) : ["all"]

  // Create agent with appropriate tools
  const agent = createChatAgent({
    userId,
    githubUsername,
    integrations: detectedIntegrations as any,
  })

  const prompt = await convertToModelMessages(messages)

  const result = streamText({
    model: agent.model,
    system: agent.systemPrompt,
    messages: prompt,
    tools: agent.tools,
    stopWhen: stepCountIs(10),
    abortSignal: req.signal,
  })

  return result.toUIMessageStreamResponse({
    onFinish: async ({ isAborted }) => {
      if (isAborted) {
        console.log("[v0] Chat request aborted")
      }
    },
    consumeSseStream: consumeStream,
  })
}
