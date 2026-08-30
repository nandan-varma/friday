import { getAuthenticatedUserId, parseJsonBody } from "@/lib/api";
import {
  fetchGoogleCalendars,
  isGoogleCalendarConnected,
  updateSelectedCalendars,
} from "@/lib/integrations/google/google-calendar";
import { createLogger } from "@/lib/logger";
import {
  calendarSelectionSchema,
  type GoogleCalendarResponse,
} from "@/lib/schemas/calendar";

const log = createLogger("api/calendars");

function toCalendarResponse(
  calendars: Awaited<ReturnType<typeof fetchGoogleCalendars>>,
): GoogleCalendarResponse[] {
  return calendars.flatMap((calendar) =>
    calendar.id
      ? [
          {
            id: calendar.id,
            summary: calendar.summary ?? "Untitled Calendar",
            description: calendar.description ?? undefined,
            primary: calendar.primary ?? undefined,
            accessRole: calendar.accessRole ?? undefined,
            backgroundColor: calendar.backgroundColor ?? undefined,
          },
        ]
      : [],
  );
}

// GET /api/calendars - Fetch user's Google calendars
export async function GET() {
  const userId = await getAuthenticatedUserId();
  if (!userId) {
    log.warn("unauthorized request");
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!(await isGoogleCalendarConnected(userId))) {
    log.info("calendar not connected", { userId });
    return Response.json(
      { error: "Google Calendar not connected" },
      { status: 400 },
    );
  }

  try {
    const calendars = await fetchGoogleCalendars(userId);
    return Response.json(toCalendarResponse(calendars));
  } catch (error) {
    log.error("failed to fetch calendars", { userId, error });
    return Response.json(
      { error: "Failed to fetch calendars" },
      { status: 500 },
    );
  }
}

// PATCH /api/calendars - Update selected calendar IDs for sync
export async function PATCH(request: Request) {
  const userId = await getAuthenticatedUserId();
  if (!userId) {
    log.warn("unauthorized request");
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = await parseJsonBody(request, calendarSelectionSchema);
  if (parsed.error) return parsed.error;
  const { calendarIds } = parsed.data;

  try {
    const availableCalendarIds = new Set(
      (await fetchGoogleCalendars(userId)).flatMap((calendar) =>
        calendar.id ? [calendar.id] : [],
      ),
    );
    if (
      calendarIds.some((calendarId) => !availableCalendarIds.has(calendarId))
    ) {
      return Response.json(
        { error: "One or more calendar IDs are unavailable" },
        { status: 400 },
      );
    }

    await updateSelectedCalendars(userId, calendarIds);
    log.info("updated selected calendars", {
      userId,
      count: calendarIds.length,
    });
    return Response.json({ success: true, selectedCalendarIds: calendarIds });
  } catch (error) {
    log.error("failed to update selected calendars", {
      userId,
      error,
    });
    return Response.json(
      { error: "Failed to update selected calendars" },
      { status: 500 },
    );
  }
}
