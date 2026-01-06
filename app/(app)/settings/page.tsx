'use client'

import { Button } from '@/components/ui/button'
import { useEffect, useState } from 'react'
import { Spinner } from '@/components/ui/spinner'

interface IntegrationStatus {
  connected: boolean
  googleUserId?: string
  lastSyncAt?: string
  selectedCalendarIds?: string[]
}

export default function SettingsPage() {
  const [googleStatus, setGoogleStatus] = useState<IntegrationStatus | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isConnecting, setIsConnecting] = useState(false)
  const [isDisconnecting, setIsDisconnecting] = useState(false)

  useEffect(() => {
    fetchIntegrationStatus()
  }, [])

  const fetchIntegrationStatus = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/integrations/google')
      const data = await response.json()
      setGoogleStatus(data)
    } catch (error) {
      console.error('Failed to fetch integration status:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleConnect = async () => {
    try {
      setIsConnecting(true)
      const response = await fetch('/api/integrations/google', {
        method: 'POST',
      })
      const data = await response.json()

      if (data.authUrl) {
        // Redirect to Google OAuth
        window.location.href = data.authUrl
      }
    } catch (error) {
      console.error('Failed to initiate connection:', error)
      setIsConnecting(false)
    }
  }

  const handleDisconnect = async () => {
    if (!confirm('Are you sure you want to disconnect Google Calendar?')) {
      return
    }

    try {
      setIsDisconnecting(true)
      await fetch('/api/integrations/google', {
        method: 'DELETE',
      })
      await fetchIntegrationStatus()
    } catch (error) {
      console.error('Failed to disconnect:', error)
    } finally {
      setIsDisconnecting(false)
    }
  }

  return (
    <div className="min-h-screen bg-background pt-16">
      <div className="max-w-4xl mx-auto p-4">
        <h1 className="text-3xl font-bold mb-6">Settings</h1>
        <p className="text-muted-foreground mb-8">Manage your account settings and preferences here.</p>

        <div className="space-y-6">
          <div className="bg-card border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Integrations</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="font-medium">Google Calendar</h3>
                  <p className="text-sm text-muted-foreground">
                    Connect your Google Calendar to sync events
                  </p>
                  {isLoading ? (
                    <div className="flex items-center gap-2 mt-2">
                      <Spinner className="size-3" />
                      <span className="text-xs text-muted-foreground">Checking status...</span>
                    </div>
                  ) : googleStatus?.connected ? (
                    <div className="mt-2 space-y-1">
                      <div className="flex items-center gap-2">
                        <div className="size-2 rounded-full bg-green-500" />
                        <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                          Connected
                        </span>
                      </div>
                      {googleStatus.lastSyncAt && (
                        <p className="text-xs text-muted-foreground">
                          Last synced: {new Date(googleStatus.lastSyncAt).toLocaleString()}
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 mt-2">
                      <div className="size-2 rounded-full bg-muted-foreground/30" />
                      <span className="text-xs text-muted-foreground">Not connected</span>
                    </div>
                  )}
                </div>
                <div>
                  {isLoading ? (
                    <Button disabled>
                      <Spinner className="size-4 mr-2" />
                      Loading...
                    </Button>
                  ) : googleStatus?.connected ? (
                    <Button 
                      variant="outline" 
                      onClick={handleDisconnect}
                      disabled={isDisconnecting}
                    >
                      {isDisconnecting ? (
                        <>
                          <Spinner className="size-4 mr-2" />
                          Disconnecting...
                        </>
                      ) : (
                        'Disconnect'
                      )}
                    </Button>
                  ) : (
                    <Button 
                      onClick={handleConnect}
                      disabled={isConnecting}
                    >
                      {isConnecting ? (
                        <>
                          <Spinner className="size-4 mr-2" />
                          Connecting...
                        </>
                      ) : (
                        'Connect'
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}