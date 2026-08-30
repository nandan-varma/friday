import {
  createAgentUIStreamResponse,
  generateId,
  safeValidateUIMessages,
} from "ai";
import { z } from "zod";
import { chatAgent } from "@/agents/chat-agent";
import { getAuthenticatedUserId, parseJsonBody } from "@/lib/api";
import { readChat, saveChat } from "@/lib/chat-store";
import { createLogger } from "@/lib/logger";
import { chatRatelimit } from "@/lib/ratelimit";
import { getStreamContext } from "@/lib/resumable-stream-context";

export const maxDuration = 30;

const log = createLogger("api/chat");
const chatRequestSchema = z.object({
  id: z.string().uuid(),
  message: z.unknown(),
});

export async function POST(req: Request) {
  const startedAt = Date.now();
  const userId = await getAuthenticatedUserId();
  if (!userId) {
    log.warn("unauthorized request");
    return new Response("Unauthorized", { status: 401 });
  }

  // Rate limiting is a safety net, not core functionality - if Redis is
  // unreachable, let the request through rather than 500ing chat entirely.
  try {
    const { success, remaining } = await chatRatelimit.limit(userId);
    if (!success) {
      log.warn("rate limited", { userId });
      return new Response("Too many requests", { status: 429 });
    }
    log.debug("rate limit ok", { userId, remaining });
  } catch (error) {
    log.error("rate limit check failed, allowing request", { userId, error });
  }

  const parsed = await parseJsonBody(req, chatRequestSchema);
  if (parsed.error) return parsed.error;
  const { id, message } = parsed.data;
  const validatedIncomingMessage = await safeValidateUIMessages({
    messages: [message],
  });
  if (!validatedIncomingMessage.success) {
    return Response.json({ error: "Invalid chat message" }, { status: 400 });
  }
  const [incomingMessage] = validatedIncomingMessage.data;
  if (!incomingMessage) {
    return Response.json(
      { error: "Chat message is required" },
      { status: 400 },
    );
  }
  log.info("chat request", {
    userId,
    chatId: id,
    messageId: incomingMessage.id,
  });

  const existing = await readChat(id, userId);
  const validatedExistingMessages = await safeValidateUIMessages({
    messages: existing?.messages ?? [],
  });
  if (!validatedExistingMessages.success) {
    log.warn("invalid persisted chat history", { userId, chatId: id });
    return Response.json(
      { error: "Chat history could not be read" },
      { status: 409 },
    );
  }
  const messages = [...validatedExistingMessages.data, incomingMessage];

  await saveChat({ id, userId, messages, activeStreamId: null });

  return createAgentUIStreamResponse({
    agent: chatAgent,
    uiMessages: messages,
    options: { userId },
    generateMessageId: generateId,
    abortSignal: req.signal,
    onFinish: async ({ messages: finalMessages }) => {
      log.info("agent finished", {
        userId,
        chatId: id,
        durationMs: Date.now() - startedAt,
      });
      await saveChat({
        id,
        userId,
        messages: finalMessages,
        activeStreamId: null,
      });
    },
    async consumeSseStream({ stream }) {
      const streamContext = getStreamContext();
      if (!streamContext) return;
      const streamId = generateId();
      log.debug("creating resumable stream", { userId, chatId: id, streamId });
      await streamContext.createNewResumableStream(streamId, () => stream);
      await saveChat({ id, userId, messages, activeStreamId: streamId });
    },
  });
}
