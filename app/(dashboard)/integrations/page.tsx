"use client"

import type React from "react"

import { useState, useEffect, Suspense } from "react"
import { Calendar, Check, ExternalLink, Loader2, Plus } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Skeleton } from "@/components/ui/skeleton"
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
import { useGoogleCalendar } from "@/hooks/use-google-calendar"
import Google from "@/components/icons/google"

type Integration = {
  id: string
  name: string
  description: string
  icon: React.ReactNode
  connected: boolean
  lastSync?: Date
}

const availableIntegrations: Integration[] = [
  {
    id: "google-calendar",
    name: "Google Calendar",
    description: "Sync events with your Google Calendar",
    icon: <Google />,
    connected: false,
  },
  {
    id: "more-coming-soon",
    name: "More Coming Soon",
    description: "We're working on adding more integrations soon!",
    icon: <Plus className="h-5 w-5" />,
    connected: false,
  }
]

// Skeleton component for loading state
function IntegrationCardSkeleton() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-lg" />
            <div className="space-y-2">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-48" />
            </div>
          </div>
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-4 w-40" />
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-10 rounded-full" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-8 w-20" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function IntegrationsPageSkeleton() {
  return (
    <div className="grid gap-6">
      {Array.from({ length: 3 }).map((_, i) => (
        <IntegrationCardSkeleton key={i} />
      ))}
    </div>
  )
}

export default function IntegrationsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Integrations</h1>
        <p className="text-muted-foreground mt-2">Connect your calendar with external services</p>
      </div>

      <Suspense fallback={<IntegrationsPageSkeleton />}>
        <IntegrationsContent />
      </Suspense>
    </div>
  )
}

// Component that handles async integration loading
function IntegrationsContent() {
  const [integrations, setIntegrations] = useState(availableIntegrations)
  const [isConnecting, setIsConnecting] = useState<string | null>(null)
  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { isConnected: googleConnected, connectCalendar, disconnectCalendar } = useGoogleCalendar()

  // Simulate loading time for integrations data
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1000) // Simulate 1 second loading time

    return () => clearTimeout(timer)
  }, [])

  // Update Google Calendar connection status when hook state changes
  useEffect(() => {
    setIntegrations(prev =>
      prev.map(integration =>
        integration.id === 'google-calendar'
          ? { ...integration, connected: googleConnected, lastSync: googleConnected ? new Date() : undefined }
          : integration
      )
    )
  }, [googleConnected])

  if (isLoading) {
    return <IntegrationsPageSkeleton />
  }

  const handleConnect = async (integrationId: string) => {
    if (integrationId === 'google-calendar') {
      try {
        setIsConnecting('google-calendar')
        await connectCalendar()
        toast.success('Google Calendar connected successfully!')
        setSelectedIntegration(null)
      } catch (error) {
        console.error('Error connecting Google Calendar:', error)
        toast.error('Failed to connect Google Calendar')
      } finally {
        setIsConnecting(null)
      }
    } else {
      // Simulate OAuth flow for other integrations
      setIsConnecting(integrationId)
      setTimeout(() => {
        setIntegrations((prev) =>
          prev.map((integration) =>
            integration.id === integrationId ? { ...integration, connected: true, lastSync: new Date() } : integration,
          ),
        )
        setIsConnecting(null)
        setSelectedIntegration(null)
        toast.success(`${integrations.find(i => i.id === integrationId)?.name} connected successfully`)
      }, 2000)
    }
  }

  const handleDisconnect = async (integrationId: string) => {
    if (integrationId === 'google-calendar') {
      try {
        await disconnectCalendar()
        toast.success('Google Calendar disconnected')
      } catch (error) {
        console.error('Error disconnecting Google Calendar:', error)
        toast.error('Failed to disconnect Google Calendar')
      }
    } else {
      setIntegrations((prev) =>
        prev.map((integration) =>
          integration.id === integrationId ? { ...integration, connected: false, lastSync: undefined } : integration,
        ),
      )
      toast.success(`${integrations.find(i => i.id === integrationId)?.name} disconnected`)
    }
  }

  const handleToggleSync = (integrationId: string, enabled: boolean) => {
    // In a real app, this would update the sync settings
    console.log(`Sync ${enabled ? "enabled" : "disabled"} for ${integrationId}`)
  }

  // Enhanced Integration Card with connecting state
  function IntegrationCard({ integration, isConnecting, onConnect, onDisconnect, onSelectIntegration }: {
    integration: Integration
    isConnecting: boolean
    onConnect: (id: string) => void
    onDisconnect: (id: string) => void
    onSelectIntegration: (integration: Integration | null) => void
  }) {
    if (isConnecting) {
      return (
        <Card className="relative">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-10 flex items-center justify-center">
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm text-muted-foreground">Connecting...</span>
            </div>
          </div>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">{integration.icon}</div>
                <div>
                  <CardTitle className="text-lg">{integration.name}</CardTitle>
                  <CardDescription>{integration.description}</CardDescription>
                </div>
              </div>
              <Skeleton className="h-6 w-20 rounded-full" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <Skeleton className="h-4 w-40" />
              </div>
              <Skeleton className="h-8 w-20" />
            </div>
          </CardContent>
        </Card>
      )
    }

    return (
      <Card className={integration.id !== 'google-calendar' ? 'blur-sm opacity-60 pointer-events-none' : ''}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">{integration.icon}</div>
              <div>
                <CardTitle className="text-lg">{integration.name}</CardTitle>
                <CardDescription>{integration.description}</CardDescription>
              </div>
            </div>
            {integration.connected ? (
              <Badge variant="default" className="gap-1">
                <Check className="h-3 w-3" />
                Connected
              </Badge>
            ) : (
              <Badge variant="outline">Not connected</Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              {integration.connected && integration.lastSync && (
                <p className="text-sm text-muted-foreground">
                  Last synced: {integration.lastSync.toLocaleString()}
                </p>
              )}
              {integration.connected && (
                <div className="flex items-center gap-2">
                  <Switch
                    id={`sync-${integration.id}`}
                    defaultChecked
                    disabled
                    onCheckedChange={(checked) => handleToggleSync(integration.id, checked)}
                  />
                  <Label htmlFor={`sync-${integration.id}`} className="text-sm font-normal">
                    Auto-sync enabled
                  </Label>
                </div>
              )}
            </div>
            <div className="flex gap-2">
              {integration.connected ? (
                <>
                  <Button variant="outline" size="sm" onClick={() => handleDisconnect(integration.id)}>
                    Disconnect
                  </Button>
                </>
              ) : (
                <Dialog>
                  <DialogTrigger asChild>
                    <Button size="sm" onClick={() => setSelectedIntegration(integration)}>
                      <Plus className="h-4 w-4 mr-2" />
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
                    <div className="py-4">
                      <p className="text-sm text-muted-foreground">This integration will allow Friday - AI Calendar to:</p>
                      <ul className="mt-2 space-y-1 text-sm">
                        <li>• Read your calendar events</li>
                        <li>• Create new events</li>
                        <li>• Update existing events</li>
                        <li>• Delete events</li>
                      </ul>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => onSelectIntegration(null)}>
                        Cancel
                      </Button>
                      <Button onClick={() => onConnect(integration.id)}>
                        <ExternalLink className="mr-2 h-4 w-4" />
                        Authorize
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

  return (
    <div className="grid gap-6">
      {integrations.map((integration) => (
        <IntegrationCard
          key={integration.id}
          integration={integration}
          isConnecting={isConnecting === integration.id}
          onConnect={handleConnect}
          onDisconnect={handleDisconnect}
          onSelectIntegration={setSelectedIntegration}
        />
      ))}
    </div>
  )
}
