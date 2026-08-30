import { UI_MESSAGE_STREAM_HEADERS } from "ai";
import { getAuthenticatedUserId } from "@/lib/api";
import { readChat } from "@/lib/chat-store";
import { createLogger } from "@/lib/logger";
import { getStreamContext } from "@/lib/resumable-stream-context";

const log = createLogger("api/chat/stream");

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const userId = await getAuthenticatedUserId();
  if (!userId) {
    log.warn("unauthorized resume attempt");
    return new Response("Unauthorized", { status: 401 });
  }

  const streamContext = getStreamContext();
  if (!streamContext) {
    return new Response(null, { status: 204 });
  }

  const { id } = await params;
  const chatRow = await readChat(id, userId);

  if (!chatRow?.activeStreamId) {
    log.debug("no active stream to resume", {
      chatId: id,
      userId,
    });
    return new Response(null, { status: 204 });
  }

  log.info("resuming stream", {
    chatId: id,
    streamId: chatRow.activeStreamId,
    userId,
  });
  return new Response(
    await streamContext.resumeExistingStream(chatRow.activeStreamId),
    {
      headers: UI_MESSAGE_STREAM_HEADERS,
    },
  );
}
