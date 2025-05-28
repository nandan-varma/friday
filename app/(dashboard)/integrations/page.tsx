"use client"

import type React from "react"

import { useState } from "react"
import { Calendar, Check, ExternalLink, Loader2, Plus } from "lucide-react"
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
import { Input } from "@/components/ui/input"

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
    icon: <Calendar className="h-5 w-5" />,
    connected: false,
  },
  {
    id: "outlook",
    name: "Outlook Calendar",
    description: "Connect with Microsoft Outlook",
    icon: <Calendar className="h-5 w-5" />,
    connected: false,
  },
  {
    id: "apple-calendar",
    name: "Apple Calendar",
    description: "Sync with iCloud Calendar",
    icon: <Calendar className="h-5 w-5" />,
    connected: false,
  },
]

export default function IntegrationsPage() {
  const [integrations, setIntegrations] = useState(availableIntegrations)
  const [isConnecting, setIsConnecting] = useState<string | null>(null)
  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null)

  const handleConnect = async (integrationId: string) => {
    setIsConnecting(integrationId)

    // Simulate OAuth flow
    setTimeout(() => {
      setIntegrations((prev) =>
        prev.map((integration) =>
          integration.id === integrationId ? { ...integration, connected: true, lastSync: new Date() } : integration,
        ),
      )
      setIsConnecting(null)
      setSelectedIntegration(null)
    }, 2000)
  }

  const handleDisconnect = (integrationId: string) => {
    setIntegrations((prev) =>
      prev.map((integration) =>
        integration.id === integrationId ? { ...integration, connected: false, lastSync: undefined } : integration,
      ),
    )
  }

  const handleToggleSync = (integrationId: string, enabled: boolean) => {
    // In a real app, this would update the sync settings
    console.log(`Sync ${enabled ? "enabled" : "disabled"} for ${integrationId}`)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Integrations</h1>
        <p className="text-muted-foreground mt-2">Connect your calendar with external services</p>
      </div>

      <div className="grid gap-6">
        {integrations.map((integration) => (
          <Card key={integration.id}>
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
                      <Button variant="outline" size="sm">
                        Settings
                      </Button>
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
                          <p className="text-sm text-muted-foreground">This integration will allow AI Calendar to:</p>
                          <ul className="mt-2 space-y-1 text-sm">
                            <li>• Read your calendar events</li>
                            <li>• Create new events</li>
                            <li>• Update existing events</li>
                            <li>• Delete events</li>
                          </ul>
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setSelectedIntegration(null)}>
                            Cancel
                          </Button>
                          <Button
                            onClick={() => handleConnect(integration.id)}
                            disabled={isConnecting === integration.id}
                          >
                            {isConnecting === integration.id ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Connecting...
                              </>
                            ) : (
                              <>
                                <ExternalLink className="mr-2 h-4 w-4" />
                                Authorize
                              </>
                            )}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Request Integration</CardTitle>
          <CardDescription>Don't see the integration you need? Let us know!</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input placeholder="Enter integration name..." />
            <Button>Request</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
