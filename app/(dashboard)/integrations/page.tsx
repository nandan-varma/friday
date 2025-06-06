import type React from "react"
import { Suspense } from "react"
import { GoogleIntegrationService } from "@/services/googleIntegrationService"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { IntegrationsContent } from "./integrations-content"
import { IntegrationsPageSkeleton } from "./integrations-skeleton"
import { revalidatePath } from "next/cache"

export type Integration = {
  id: string
  name: string
  description: string
  icon: React.ReactNode
  connected: boolean
  lastSync?: Date
  integration?: {
    id: number
    expiresAt: Date | null
    hasRefreshToken: boolean
  }
}

async function getIntegrationsData(): Promise<Integration[]> {
  const session = await auth.api.getSession({
    headers: await headers()
  })

  let googleConnected = false
  let googleIntegration = null

  if (session?.user) {
    try {
      googleConnected = await GoogleIntegrationService.hasValidIntegration(session.user.id)
      googleIntegration = await GoogleIntegrationService.getUserIntegration(session.user.id)
    } catch (error) {
      console.error('Error checking Google integration:', error)
    }
  }

  const availableIntegrations: Integration[] = [
    {
      id: "google-calendar",
      name: "Google Calendar",
      description: "Sync events with your Google Calendar",
      icon: "google",
      connected: googleConnected,
      lastSync: googleConnected ? new Date() : undefined,
      integration: googleIntegration ? {
        id: googleIntegration.id,
        expiresAt: googleIntegration.expiresAt,
        hasRefreshToken: !!googleIntegration.refreshToken
      } : undefined
    },
    {
      id: "more-coming-soon",
      name: "More Coming Soon",
      description: "We're working on adding more integrations soon!",
      icon: "plus",
      connected: false,
    }
  ]

  return availableIntegrations
}

// Server action to refresh the page data
async function refreshIntegrations() {
  'use server'
  revalidatePath('/integrations')
}

// Server action to get fresh integrations data
async function getRefreshedIntegrationsData() {
  'use server'
  return await getIntegrationsData()
}

// Server component wrapper that provides refresh functionality
async function IntegrationsWrapper() {
  const integrations = await getIntegrationsData()

  return (
    <IntegrationsContent
      initialIntegrations={integrations}
      onRefresh={getRefreshedIntegrationsData}
    />
  )
}

export default async function IntegrationsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Integrations</h1>
        <p className="text-muted-foreground mt-2">Connect your calendar with external services</p>
      </div>

      <Suspense fallback={<IntegrationsPageSkeleton />}>
        <IntegrationsWrapper />
      </Suspense>
    </div>
  )
}
