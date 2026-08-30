import { createAgentUIStreamResponse, generateId, type UIMessage } from "ai";
import { headers } from "next/headers";
import { getStreamContext } from "@/lib/resumable-stream-context";
import { auth } from "@/lib/auth";
import { chatAgent } from "@/agents/chat-agent";
import { chatRatelimit } from "@/lib/ratelimit";
import { readChat, saveChat } from "@/lib/chat-store";
import { createLogger } from "@/lib/logger";

export const maxDuration = 30;

const log = createLogger("api/chat");

export async function POST(req: Request) {
  const startedAt = Date.now();
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) {
    log.warn("unauthorized request");
    return new Response("Unauthorized", { status: 401 });
  }
  const userId = session.user.id;

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

  const { id, message }: { id: string; message: UIMessage } = await req.json();
  log.info("chat request", { userId, chatId: id, messageId: message?.id });

  const existing = await readChat(id, userId);
  const messages = [...((existing?.messages as UIMessage[] | undefined) ?? []), message];

  await saveChat({ id, userId, messages, activeStreamId: null });

  return createAgentUIStreamResponse({
    agent: chatAgent,
    uiMessages: messages,
    options: { userId },
    generateMessageId: generateId,
    abortSignal: req.signal,
    onFinish: async ({ messages: finalMessages }) => {
      log.info("agent finished", { userId, chatId: id, durationMs: Date.now() - startedAt });
      await saveChat({ id, userId, messages: finalMessages, activeStreamId: null });
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
