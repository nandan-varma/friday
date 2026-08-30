"use client"

import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { Header } from '@/components/header'
import {
  useGoogleIntegration,
  useConnectGoogle,
  useDisconnectGoogle,
} from '@/hooks/use-google-calendar'

export default function SettingsPage() {
  const { data: googleStatus, isLoading } = useGoogleIntegration()
  const connectMutation = useConnectGoogle()
  const disconnectMutation = useDisconnectGoogle()

  const handleConnect = () => {
    connectMutation.mutate()
  }

  const handleDisconnect = () => {
    if (!confirm('Are you sure you want to disconnect Google Calendar?')) {
      return
    }
    disconnectMutation.mutate()
  }

  return (
    <div className="min-h-screen bg-background pt-16">
      <Header />
      <div className="max-w-4xl mx-auto p-4">
        <h1 className="text-3xl font-bold mb-6">Settings</h1>
        <p className="text-muted-foreground mb-8">Manage your account settings and preferences here.</p>

        <div className="space-y-6">
          <div className="frame-corners relative border border-border bg-card p-6">
            <h2 className="text-xl font-semibold mb-4">Integrations</h2>
            <div className="flex items-center justify-between border-t border-border pt-4">
              <div className="flex-1">
                <h3 className="font-medium">Google Calendar</h3>
                <p className="text-sm text-muted-foreground">
                  Connect your Google Calendar to sync events
                </p>
                {isLoading ? (
                  <div className="flex items-center gap-2 mt-2">
                    <Spinner className="size-3" />
                    <span className="text-xs font-mono text-muted-foreground">CHECKING_STATUS</span>
                  </div>
                ) : googleStatus?.connected ? (
                  <div className="mt-2 space-y-1">
                    <div className="flex items-center gap-2">
                      <div className="size-2 bg-foreground" />
                      <span className="text-xs font-mono uppercase tracking-wide text-foreground">
                        Connected
                      </span>
                    </div>
                    {googleStatus.lastSyncAt && (
                      <p className="text-xs font-mono text-muted-foreground">
                        Last synced: {new Date(googleStatus.lastSyncAt).toLocaleString()}
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center gap-2 mt-2">
                    <div className="size-2 border border-muted-foreground" />
                    <span className="text-xs font-mono uppercase tracking-wide text-muted-foreground">Not connected</span>
                  </div>
                )}
              </div>
              <div>
                {isLoading ? (
                  <Button disabled variant="secondary">
                    <Spinner className="size-4 mr-2" />
                    Loading
                  </Button>
                ) : googleStatus?.connected ? (
                  <Button
                    variant="outline"
                    onClick={handleDisconnect}
                    disabled={disconnectMutation.isPending}
                  >
                    {disconnectMutation.isPending ? (
                      <>
                        <Spinner className="size-4 mr-2" />
                        Disconnecting
                      </>
                    ) : (
                      'Disconnect'
                    )}
                  </Button>
                ) : (
                  <Button onClick={handleConnect} disabled={connectMutation.isPending}>
                    {connectMutation.isPending ? (
                      <>
                        <Spinner className="size-4 mr-2" />
                        Connecting
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
  );
}
