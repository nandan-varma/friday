import { and, eq } from "drizzle-orm";
import type { UIMessage } from "ai";
import { db } from "@/db";
import { chat } from "@/db/schema/chat";

export async function readChat(id: string, userId: string) {
  const [row] = await db
    .select()
    .from(chat)
    .where(and(eq(chat.id, id), eq(chat.userId, userId)))
    .limit(1);
  return row ?? null;
}

export async function saveChat({
  id,
  userId,
  messages,
  activeStreamId = null,
}: {
  id: string;
  userId: string;
  messages: UIMessage[];
  activeStreamId?: string | null;
}) {
  await db
    .insert(chat)
    .values({ id, userId, messages, activeStreamId })
    .onConflictDoUpdate({
      target: chat.id,
      set: { messages, activeStreamId, updatedAt: new Date() },
    });
}
