import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { getGoogleAccount, getSelectedCalendarIds, isGoogleCalendarConnected } from "@/lib/integrations/google/google-calendar";
import { createLogger } from "@/lib/logger";

const log = createLogger("api/integrations/google");

// GET /api/integrations/google - Connection status
// Connecting/disconnecting happens directly through Better Auth's client
// (authClient.linkSocial / authClient.unlinkAccount), no custom OAuth flow needed.
export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    log.warn("unauthorized request");
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const connected = await isGoogleCalendarConnected(session.user.id);
  log.debug("connection status", { userId: session.user.id, connected });
  if (!connected) {
    return Response.json({ connected: false });
  }

  const [googleAccount, selectedCalendarIds] = await Promise.all([
    getGoogleAccount(session.user.id),
    getSelectedCalendarIds(session.user.id),
  ]);

  return Response.json({
    connected: true,
    lastSyncAt: googleAccount?.updatedAt,
    selectedCalendarIds,
  });
}
