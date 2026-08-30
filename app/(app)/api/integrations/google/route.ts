import { getAuthenticatedUserId } from "@/lib/api";
import {
  getSelectedCalendarIds,
  isGoogleCalendarConnected,
} from "@/lib/integrations/google/google-calendar";
import { createLogger } from "@/lib/logger";

const log = createLogger("api/integrations/google");

// GET /api/integrations/google - Connection status
// Connecting/disconnecting happens directly through Better Auth's client
// (authClient.linkSocial / authClient.unlinkAccount), no custom OAuth flow needed.
export async function GET() {
  const userId = await getAuthenticatedUserId();
  if (!userId) {
    log.warn("unauthorized request");
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const connected = await isGoogleCalendarConnected(userId);
  log.debug("connection status", { userId, connected });
  if (!connected) {
    return Response.json({ connected: false });
  }

  const selectedCalendarIds = await getSelectedCalendarIds(userId);

  return Response.json({
    connected: true,
    selectedCalendarIds,
  });
}
