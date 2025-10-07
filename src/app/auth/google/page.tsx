import { redirect } from 'next/navigation'
import { GoogleIntegrationService } from '@/lib/googleIntegrationService'

export default async function GoogleAuthPage({
  searchParams,
}: {
  searchParams: { state?: string }
}) {
  const state = searchParams.state

  if (!state) {
    redirect('/settings?error=missing_state')
  }

  try {
    const { url } = await GoogleIntegrationService.getAuthUrl()

    // Add the state parameter to the URL
    const authUrl = new URL(url)
    authUrl.searchParams.set('state', state)

    redirect(authUrl.toString())
  } catch (error) {
    console.error('Error generating Google auth URL:', error)
    redirect('/settings?error=auth_url_generation_failed')
  }
}