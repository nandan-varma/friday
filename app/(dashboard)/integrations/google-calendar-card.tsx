"use client"

import type React from "react"
import { useState, useTransition } from "react"
import { Check, ExternalLink, Loader2, Plus } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import Google from "@/components/icons/google"
import type { Integration } from "./page"
import {
  getGoogleAuthUrl,
  exchangeGoogleAuthCode,
  disconnectGoogleCalendar,
  refreshIntegrationsPage
} from "./actions"

interface GoogleCalendarCardProps {
  integration: Integration
  onUpdate: () => Promise<void>
}

export function GoogleCalendarCard({ integration, onUpdate }: GoogleCalendarCardProps) {
  const [isPending, startTransition] = useTransition()
  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null)

  const handleConnect = async () => {
    startTransition(async () => {
      try {
        // Get authorization URL
        const authResult = await getGoogleAuthUrl()

        if (!authResult.success || !authResult.data) {
          throw new Error(authResult.error || 'Failed to get authorization URL')
        }

        const { authUrl } = authResult.data

        // Open popup window for OAuth
        const popup = window.open(
          authUrl,
          'google-auth',
          'width=500,height=600,scrollbars=yes,resizable=yes'
        )

        if (!popup) {
          throw new Error('Popup blocked. Please allow popups for this site.')
        }

        await new Promise<void>((resolve, reject) => {
          let authCompleted = false

          // Listen for the OAuth callback
          const messageListener = async (event: MessageEvent) => {
            if (event.origin !== window.location.origin) return

            if (event.data.type === 'GOOGLE_AUTH_SUCCESS') {
              const { code } = event.data
              authCompleted = true

              try {
                const result = await exchangeGoogleAuthCode(code)

                if (result.success) {
                  resolve()
                } else {
                  reject(new Error(result.error || 'Failed to connect Google Calendar'))
                }
              } catch (err) {
                reject(err)
              }

              popup.close()
              window.removeEventListener('message', messageListener)
              clearInterval(checkClosed)
            } else if (event.data.type === 'GOOGLE_AUTH_ERROR') {
              authCompleted = true
              reject(new Error(event.data.error || 'Authentication failed'))
              popup.close()
              window.removeEventListener('message', messageListener)
              clearInterval(checkClosed)
            }
          }

          window.addEventListener('message', messageListener)

          // Check if popup was closed without completing auth
          const checkClosed = setInterval(() => {
            if (popup.closed && !authCompleted) {
              clearInterval(checkClosed)
              window.removeEventListener('message', messageListener)
              reject(new Error('Authentication cancelled'))
            } else if (popup.closed && authCompleted) {
              clearInterval(checkClosed)
              window.removeEventListener('message', messageListener)
            }
          }, 1000)
        })

        toast.success('Google Calendar connected successfully!')
        setSelectedIntegration(null)

        // Force a page refresh and update component state
        await refreshIntegrationsPage()
        await onUpdate()
      } catch (error) {
        console.error('Error connecting Google Calendar:', error)
        toast.error(error instanceof Error ? error.message : 'Failed to connect Google Calendar')
      }
    })
  }

  const handleDisconnect = async () => {
    startTransition(async () => {
      try {
        const result = await disconnectGoogleCalendar()

        if (result.success) {
          toast.success('Google Calendar disconnected')

          // Force a page refresh and update component state
          await refreshIntegrationsPage()
          await onUpdate()
        } else {
          throw new Error(result.error || 'Failed to disconnect Google Calendar')
        }
      } catch (error) {
        console.error('Error disconnecting Google Calendar:', error)
        toast.error('Failed to disconnect Google Calendar')
      }
    })
  }

  const handleToggleSync = (enabled: boolean) => {
    // In a real app, this would update the sync settings
    console.log(`Sync ${enabled ? "enabled" : "disabled"} for ${integration.id}`)
  }

  const isLoading = isPending

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center space-x-2">
          <Google />
          <div>
            <CardTitle className="text-base">{integration.name}</CardTitle>
            <CardDescription className="text-sm">{integration.description}</CardDescription>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {integration.connected && (
            <Badge variant="secondary" className="text-green-600 border-green-200 bg-green-50">
              <Check className="mr-1 h-3 w-3" />
              Connected
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            {integration.connected && integration.lastSync && (
              <p className="text-xs text-muted-foreground">
                Last sync: {integration.lastSync.toLocaleDateString()} at{" "}
                {integration.lastSync.toLocaleTimeString()}
              </p>
            )}
            {integration.connected && integration.integration?.expiresAt && (
              <p className="text-xs text-muted-foreground">
                Expires: {new Date(integration.integration.expiresAt).toLocaleDateString()}
              </p>
            )}
          </div>
          <div className="flex items-center space-x-2">
            {integration.connected && (
              <div className="flex items-center space-x-2">
                <Label htmlFor={`sync-${integration.id}`} className="text-sm">
                  Auto-sync
                </Label>
                <Switch
                  id={`sync-${integration.id}`}
                  defaultChecked={true}
                  onCheckedChange={handleToggleSync}
                  disabled={isLoading}
                />
              </div>
            )}
            {integration.connected ? (
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" disabled={isLoading}>
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Manage
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Manage {integration.name}</DialogTitle>
                    <DialogDescription>
                      Configure your {integration.name} integration settings.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label>Connection Status</Label>
                      <div className="flex items-center space-x-2">
                        <Badge variant="secondary" className="text-green-600 border-green-200 bg-green-50">
                          <Check className="mr-1 h-3 w-3" />
                          Connected
                        </Badge>
                      </div>
                    </div>
                    {integration.lastSync && (
                      <div className="space-y-2">
                        <Label>Last Synchronization</Label>
                        <p className="text-sm text-muted-foreground">
                          {integration.lastSync.toLocaleDateString()} at{" "}
                          {integration.lastSync.toLocaleTimeString()}
                        </p>
                      </div>
                    )}
                    <div className="space-y-2">
                      <Label>Auto-sync Events</Label>
                      <div className="flex items-center space-x-2">
                        <Switch defaultChecked={true} onCheckedChange={handleToggleSync} />
                        <span className="text-sm text-muted-foreground">
                          Automatically sync new events
                        </span>
                      </div>
                    </div>
                  </div>
                  <DialogFooter className="flex justify-between">
                    <Button
                      variant="destructive"
                      onClick={handleDisconnect}
                      disabled={isLoading}
                    >
                      {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                      Disconnect
                    </Button>
                    <DialogTrigger asChild>
                      <Button variant="outline">Close</Button>
                    </DialogTrigger>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            ) : (
              <Dialog open={selectedIntegration?.id === integration.id} onOpenChange={(open) => {
                if (!open) setSelectedIntegration(null)
              }}>
                <DialogTrigger asChild>
                  <Button
                    size="sm"
                    onClick={() => setSelectedIntegration(integration)}
                    disabled={isLoading}
                  >
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Connect
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Connect {integration.name}</DialogTitle>
                    <DialogDescription>
                      You'll be redirected to {integration.name} to authorize the connection.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="flex items-center space-x-3 p-4 border rounded-lg">
                      <Google />
                      <div>
                        <h4 className="font-medium">{integration.name}</h4>
                        <p className="text-sm text-muted-foreground">{integration.description}</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-medium">What we'll access:</h4>
                      <ul className="space-y-1 text-sm text-muted-foreground">
                        <li>• Read your calendar events</li>
                        <li>• Create new events</li>
                        <li>• Update existing events</li>
                        <li>• Access your calendar list</li>
                      </ul>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setSelectedIntegration(null)}>
                      Cancel
                    </Button>
                    <Button onClick={handleConnect} disabled={isLoading}>
                      {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Connect to {integration.name}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
