import { UI_MESSAGE_STREAM_HEADERS } from "ai";
import { headers } from "next/headers";
import { getStreamContext } from "@/lib/resumable-stream-context";
import { auth } from "@/lib/auth";
import { readChat } from "@/lib/chat-store";
import { createLogger } from "@/lib/logger";

const log = createLogger("api/chat/stream");

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) {
    log.warn("unauthorized resume attempt");
    return new Response("Unauthorized", { status: 401 });
  }

  const streamContext = getStreamContext();
  if (!streamContext) {
    return new Response(null, { status: 204 });
  }

  const { id } = await params;
  const chatRow = await readChat(id, session.user.id);

  if (!chatRow?.activeStreamId) {
    log.debug("no active stream to resume", { chatId: id, userId: session.user.id });
    return new Response(null, { status: 204 });
  }

  log.info("resuming stream", { chatId: id, streamId: chatRow.activeStreamId, userId: session.user.id });
  return new Response(await streamContext.resumeExistingStream(chatRow.activeStreamId), {
    headers: UI_MESSAGE_STREAM_HEADERS,
  });
}
