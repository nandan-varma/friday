import { headers } from "next/headers";
import type { z } from "zod";
import { auth } from "@/lib/auth";

export async function getAuthenticatedUserId(): Promise<string | null> {
  const session = await auth.api.getSession({ headers: await headers() });
  return session?.user.id ?? null;
}

export async function parseJsonBody<T extends z.ZodType>(
  request: Request,
  schema: T,
) {
  try {
    const body: unknown = await request.json();
    const result = schema.safeParse(body);
    return result.success
      ? { data: result.data, error: null }
      : {
          data: null,
          error: Response.json(
            { error: "Validation failed", details: result.error.issues },
            { status: 400 },
          ),
        };
  } catch {
    return {
      data: null,
      error: Response.json(
        { error: "Request body must be valid JSON" },
        { status: 400 },
      ),
    };
  }
}
