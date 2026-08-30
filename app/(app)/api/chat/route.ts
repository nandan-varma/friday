import { createAgentUIStreamResponse, generateId, type UIMessage } from "ai";
import { headers } from "next/headers";
import { streamContext } from "@/lib/resumable-stream-context";
import { auth } from "@/lib/auth";
import { chatAgent } from "@/agents/chat-agent";
import { chatRatelimit } from "@/lib/ratelimit";
import { readChat, saveChat } from "@/lib/chat-store";

export const maxDuration = 30;

export async function POST(req: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 });
  }
  const userId = session.user.id;

  const { success } = await chatRatelimit.limit(userId);
  if (!success) {
    return new Response("Too many requests", { status: 429 });
  }

  const { id, message }: { id: string; message: UIMessage } = await req.json();

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
      await saveChat({ id, userId, messages: finalMessages, activeStreamId: null });
    },
    async consumeSseStream({ stream }) {
      const streamId = generateId();
      await streamContext.createNewResumableStream(streamId, () => stream);
      await saveChat({ id, userId, messages, activeStreamId: streamId });
    },
  });
}
