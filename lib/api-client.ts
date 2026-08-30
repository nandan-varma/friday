import { z } from "zod";

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function getErrorMessage(response: Response, fallback: string) {
  const body: unknown = await response.json().catch(() => null);
  const result = z.object({ error: z.string().min(1) }).safeParse(body);
  return result.success ? result.data.error : fallback;
}

/** Parses a successful API response and preserves useful server error messages. */
export async function parseApiResponse<T>(
  response: Response,
  schema: z.ZodType<T>,
  fallbackError: string,
): Promise<T> {
  if (!response.ok) {
    throw new ApiError(
      await getErrorMessage(response, fallbackError),
      response.status,
    );
  }

  return schema.parse(await response.json());
}
