


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
  const {
    data: googleStatus,
    isLoading,
    refetch: refetchIntegration,
  } = useGoogleIntegration()

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
                      disabled={disconnectMutation.status === 'pending' || disconnectMutation.isPending}
                    >
                      {(disconnectMutation.status === 'pending' || disconnectMutation.isPending) ? (
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
                      disabled={connectMutation.status === 'pending' || connectMutation.isPending}
                    >
                      {(connectMutation.status === 'pending' || connectMutation.isPending) ? (
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