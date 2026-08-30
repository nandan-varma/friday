import { UI_MESSAGE_STREAM_HEADERS } from "ai";
import { headers } from "next/headers";
import { streamContext } from "@/lib/resumable-stream-context";
import { auth } from "@/lib/auth";
import { readChat } from "@/lib/chat-store";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { id } = await params;
  const chatRow = await readChat(id, session.user.id);

  if (!chatRow?.activeStreamId) {
    return new Response(null, { status: 204 });
  }

  return new Response(await streamContext.resumeExistingStream(chatRow.activeStreamId), {
    headers: UI_MESSAGE_STREAM_HEADERS,
  });
}
