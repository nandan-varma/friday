import { redirect } from "next/navigation";
import { GoogleIntegrationService } from "@/lib/services/googleIntegrationService";
import logger from "@/lib/logger";

export default async function GoogleAuthPage({
  searchParams,
}: {
  searchParams: Promise<{ state?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  const state = resolvedSearchParams.state;

  if (!state) {
    redirect("/settings?error=missing_state");
  }

  try {
    const { url } = await GoogleIntegrationService.getAuthUrl();

    // Add the state parameter to the URL
    const authUrl = new URL(url);
    authUrl.searchParams.set("state", state);

    redirect(authUrl.toString());
  } catch (error) {
    logger.error({ err: error }, "Error generating Google auth URL");
    redirect("/settings?error=auth_url_generation_failed");
  }
}
