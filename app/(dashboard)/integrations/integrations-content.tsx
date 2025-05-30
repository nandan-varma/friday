"use client"

import React from "react"
import { useState, useTransition, useEffect } from "react"
import { Check, ExternalLink, Loader2, Plus } from "lucide-react"
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
import Google from "@/components/icons/google"
import { GoogleCalendarCard } from "./google-calendar-card"
import type { Integration } from "./page"

interface IntegrationsContentProps {
    initialIntegrations: Integration[]
    onRefresh: () => Promise<Integration[]>
}

// Helper function to render integration icons
function getIntegrationIcon(iconType: string) {
    switch (iconType) {
        case "google":
            return <Google />
        case "plus":
            return <Plus className="h-5 w-5" />
        default:
            return <Plus className="h-5 w-5" />
    }
}

// Skeleton component for loading state
function IntegrationsCardSkeleton() {
    return (
        <Card>
            <CardHeader>
                <div className="flex items-center space-x-2">
                    <Skeleton className="h-5 w-5 rounded" />
                    <div className="space-y-1">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-48" />
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="flex items-center justify-between">
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="h-8 w-16" />
                </div>
            </CardContent>
        </Card>
    )
}

export function IntegrationsContent({ initialIntegrations, onRefresh }: IntegrationsContentProps) {
    const [integrations, setIntegrations] = useState(initialIntegrations)
    const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null)
    const [isPending, startTransition] = useTransition()

    // Update integrations when initialIntegrations prop changes
    useEffect(() => {
        setIntegrations(initialIntegrations)
    }, [initialIntegrations])

    // Create a wrapper function to handle refresh and update state
    const handleRefresh = async () => {
        try {
            const refreshedIntegrations = await onRefresh()
            setIntegrations(refreshedIntegrations)
        } catch (error) {
            console.error('Error refreshing integrations:', error)
        }
    }

    const handleToggleSync = (integrationId: string, enabled: boolean) => {
        // In a real app, this would update the sync settings
        console.log(`Sync ${enabled ? "enabled" : "disabled"} for ${integrationId}`)
    }

    const handleConnect = (integrationId: string) => {
        if (integrationId !== 'google-calendar') {
            // Simulate OAuth flow for other integrations
            startTransition(() => {
                setTimeout(() => {
                    toast.success(`${integrations.find(i => i.id === integrationId)?.name} connected successfully`)
                    setSelectedIntegration(null)
                    handleRefresh()
                }, 2000)
            })
        }
    }

    return (
        <div className="grid gap-6 md:grid-cols-2">
            {integrations.map((integration) => {
                if (integration.id === 'google-calendar') {
                    return (
                        <GoogleCalendarCard
                            key={integration.id}
                            integration={integration}
                            onUpdate={handleRefresh}
                        />
                    )
                }

                // Render other integrations (coming soon cards)
                return (
                    <Card key={integration.id}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <div className="flex items-center space-x-2">
                                {getIntegrationIcon(integration.icon as string)}
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
                                                onCheckedChange={(enabled) => handleToggleSync(integration.id, enabled)}
                                                disabled={isPending}
                                            />
                                        </div>
                                    )}
                                    {integration.connected ? (
                                        <Button variant="outline" size="sm" disabled={isPending}>
                                            {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                            Manage
                                        </Button>
                                    ) : (
                                        <Dialog open={selectedIntegration?.id === integration.id} onOpenChange={(open) => {
                                            if (!open) setSelectedIntegration(null)
                                        }}>
                                            <DialogTrigger asChild>
                                                <Button
                                                    size="sm"
                                                    onClick={() => setSelectedIntegration(integration)}
                                                    disabled={isPending || integration.id === 'more-coming-soon'}
                                                >
                                                    {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                                    {integration.id === 'more-coming-soon' ? 'Coming Soon' : 'Connect'}
                                                </Button>
                                            </DialogTrigger>
                                            {integration.id !== 'more-coming-soon' && (
                                                <DialogContent>
                                                    <DialogHeader>
                                                        <DialogTitle>Connect {integration.name}</DialogTitle>
                                                        <DialogDescription>
                                                            You'll be redirected to {integration.name} to authorize the connection.
                                                        </DialogDescription>
                                                    </DialogHeader>
                                                    <div className="space-y-4 py-4">
                                                        <div className="flex items-center space-x-3 p-4 border rounded-lg">
                                                            {getIntegrationIcon(integration.icon as string)}
                                                            <div>
                                                                <h4 className="font-medium">{integration.name}</h4>
                                                                <p className="text-sm text-muted-foreground">{integration.description}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <DialogFooter>
                                                        <Button variant="outline" onClick={() => setSelectedIntegration(null)}>
                                                            Cancel
                                                        </Button>
                                                        <Button onClick={() => handleConnect(integration.id)} disabled={isPending}>
                                                            {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                                            <ExternalLink className="mr-2 h-4 w-4" />
                                                            Connect to {integration.name}
                                                        </Button>
                                                    </DialogFooter>
                                                </DialogContent>
                                            )}
                                        </Dialog>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )
            })}
        </div>
    )
}
