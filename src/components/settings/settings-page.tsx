"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Calendar,
  Bell,
  User,
  Shield,
  Palette,
  Globe,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  RefreshCw,
  Trash2
} from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { updateProfile, updateSettings, connectGoogleCalendar, disconnectGoogleCalendar, getUserProfileData, getUserSettingsData, getGoogleIntegration } from "@/lib/actions"

interface UserSettingsData {
  timezone: string | null
  notificationsEnabled: boolean | null
  aiSuggestionsEnabled: boolean | null
  reminderTime: number | null
}

interface UserProfile {
  id: string
  name: string | null
  email: string
}

export function SettingsPage() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [settings, setSettings] = useState<UserSettingsData | null>(null)
  const [googleIntegration, setGoogleIntegration] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Form states
  const [profileForm, setProfileForm] = useState({
    name: '',
    email: ''
  })
  const [settingsForm, setSettingsForm] = useState<UserSettingsData>({
    timezone: 'UTC',
    notificationsEnabled: true,
    aiSuggestionsEnabled: true,
    reminderTime: 30
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [profileData, settingsData, googleData] = await Promise.all([
        getUserProfileData(),
        getUserSettingsData(),
        getGoogleIntegration()
      ])

      setProfile(profileData)
      setSettings(settingsData)
      setGoogleIntegration(googleData)

      // Update form states
      if (profileData) {
        setProfileForm({
          name: profileData.name || '',
          email: profileData.email || ''
        })
      }

      if (settingsData) {
        setSettingsForm(settingsData)
      }
    } catch (error) {
      console.error('Error loading settings:', error)
      toast({
        title: "Error",
        description: "Failed to load settings",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleProfileSubmit = async (formData: FormData) => {
    try {
      setSaving(true)
      await updateProfile(formData)
      // Refresh data
      const updatedProfile = await getUserProfileData()
      setProfile(updatedProfile)
      toast({
        title: "Success",
        description: "Profile updated successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleSettingsSubmit = async (formData: FormData) => {
    try {
      setSaving(true)
      await updateSettings(formData)
      // Refresh data
      const updatedSettings = await getUserSettingsData()
      setSettings(updatedSettings)
      toast({
        title: "Success",
        description: "Settings updated successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update settings",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleGoogleConnect = async () => {
    // Generate state parameter for CSRF protection
    const state = crypto.randomUUID()
    sessionStorage.setItem('google_oauth_state', state)

    // Open popup window for OAuth flow
    const width = 600
    const height = 700
    const left = (window.innerWidth - width) / 2
    const top = (window.innerHeight - height) / 2

    const popup = window.open(
      `/auth/google?state=${state}`,
      'google-oauth',
      `width=${width},height=${height},left=${left},top=${top}`
    )

    // Listen for messages from the popup
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return

      if (event.data.type === 'GOOGLE_AUTH_SUCCESS') {
        popup?.close()
        window.removeEventListener('message', handleMessage)
        // Refresh the page to show updated integration status
        window.location.reload()
      } else if (event.data.type === 'GOOGLE_AUTH_ERROR') {
        popup?.close()
        window.removeEventListener('message', handleMessage)
        toast({
          title: "Error",
          description: event.data.error || "Failed to connect Google Calendar",
          variant: "destructive",
        })
      }
    }

    window.addEventListener('message', handleMessage)
  }

  const handleGoogleDisconnect = async () => {
    try {
      await disconnectGoogleCalendar()
      setGoogleIntegration(null)
      toast({
        title: "Success",
        description: "Google Calendar disconnected",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to disconnect Google Calendar",
        variant: "destructive",
      })
    }
  }

  const timezones = [
    'UTC',
    'America/New_York',
    'America/Chicago',
    'America/Denver',
    'America/Los_Angeles',
    'Europe/London',
    'Europe/Paris',
    'Europe/Berlin',
    'Asia/Tokyo',
    'Asia/Shanghai',
    'Australia/Sydney'
  ]

  if (loading) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-48" />
          <div className="h-32 bg-muted rounded" />
          <div className="h-32 bg-muted rounded" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground">Manage your account preferences and integrations</p>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="w-4 h-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="preferences" className="flex items-center gap-2">
            <Palette className="w-4 h-4" />
            Preferences
          </TabsTrigger>
          <TabsTrigger value="integrations" className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Integrations
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="w-4 h-4" />
            Notifications
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
           <Card>
             <CardHeader>
               <CardTitle className="flex items-center gap-2">
                 <User className="w-5 h-5" />
                 Profile Information
               </CardTitle>
             </CardHeader>
             <CardContent>
               <form action={handleProfileSubmit} className="space-y-4">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <div className="space-y-2">
                     <Label htmlFor="name">Full Name</Label>
                     <Input
                       id="name"
                       name="name"
                       value={profileForm.name}
                       onChange={(e) => setProfileForm(prev => ({ ...prev, name: e.target.value }))}
                       placeholder="Enter your full name"
                     />
                   </div>
                   <div className="space-y-2">
                     <Label htmlFor="email">Email Address</Label>
                     <Input
                       id="email"
                       name="email"
                       type="email"
                       value={profileForm.email}
                       onChange={(e) => setProfileForm(prev => ({ ...prev, email: e.target.value }))}
                       placeholder="Enter your email"
                     />
                   </div>
                 </div>
                 <Button type="submit" disabled={saving}>
                   {saving ? "Saving..." : "Save Changes"}
                 </Button>
               </form>
             </CardContent>
           </Card>
         </TabsContent>

        {/* Preferences Tab */}
        <TabsContent value="preferences" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5" />
                General Preferences
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form action={handleSettingsSubmit} className="space-y-6">
                {/* Hidden inputs for form data */}
                <input type="hidden" name="timezone" value={settingsForm.timezone || 'UTC'} />
                <input type="hidden" name="notificationsEnabled" value={settingsForm.notificationsEnabled?.toString() || 'true'} />
                <input type="hidden" name="aiSuggestionsEnabled" value={settingsForm.aiSuggestionsEnabled?.toString() || 'true'} />
                <input type="hidden" name="reminderTime" value={settingsForm.reminderTime?.toString() || '30'} />

                <div className="space-y-2">
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select
                    value={settingsForm.timezone || 'UTC'}
                    onValueChange={(value) => setSettingsForm(prev => ({ ...prev, timezone: value }))}
                    name="timezone"
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {timezones.map(tz => (
                        <SelectItem key={tz} value={tz}>{tz}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>AI Suggestions</Label>
                      <p className="text-sm text-muted-foreground">
                        Enable AI-powered event suggestions and smart scheduling
                      </p>
                    </div>
                    <Switch
                      checked={settingsForm.aiSuggestionsEnabled ?? true}
                      onCheckedChange={(checked) =>
                        setSettingsForm(prev => ({ ...prev, aiSuggestionsEnabled: checked }))
                      }
                      name="aiSuggestionsEnabled"
                    />
                  </div>
                </div>

                <Button type="submit" disabled={saving}>
                  {saving ? "Saving..." : "Save Preferences"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Integrations Tab */}
        <TabsContent value="integrations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Google Calendar Integration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {googleIntegration ? (
                <div className="space-y-4">
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>
                      Your Google Calendar is connected and syncing events.
                    </AlertDescription>
                  </Alert>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                        <Calendar className="w-5 h-5 text-red-600" />
                      </div>
                      <div>
                        <p className="font-medium">Google Calendar</p>
                        <p className="text-sm text-muted-foreground">
                          Connected • Last synced: Just now
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Sync Now
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={handleGoogleDisconnect}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Disconnect
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Connect your Google Calendar to sync events and manage your schedule across platforms.
                    </AlertDescription>
                  </Alert>

                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Calendar className="w-8 h-8 text-red-600" />
                    </div>
                    <h3 className="text-lg font-medium mb-2">Connect Google Calendar</h3>
                    <p className="text-muted-foreground mb-4 max-w-md mx-auto">
                      Sync your Google Calendar events with Friday for a unified view of your schedule.
                    </p>
                    <Button onClick={handleGoogleConnect} className="gap-2">
                      <ExternalLink className="w-4 h-4" />
                      Connect Google Calendar
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Notification Settings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form action={handleSettingsSubmit} className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Enable Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive reminders and updates about your events
                    </p>
                  </div>
                  <Switch
                    checked={settingsForm.notificationsEnabled ?? true}
                    onCheckedChange={(checked) =>
                      setSettingsForm(prev => ({ ...prev, notificationsEnabled: checked }))
                    }
                    name="notificationsEnabled"
                  />
                </div>

                {settingsForm.notificationsEnabled && (
                  <div className="space-y-2">
                    <Label htmlFor="reminder">Default Reminder Time</Label>
                    <Select
                      value={settingsForm.reminderTime?.toString() || '30'}
                      onValueChange={(value) =>
                        setSettingsForm(prev => ({ ...prev, reminderTime: parseInt(value) }))
                      }
                      name="reminderTime"
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5">5 minutes before</SelectItem>
                        <SelectItem value="15">15 minutes before</SelectItem>
                        <SelectItem value="30">30 minutes before</SelectItem>
                        <SelectItem value="60">1 hour before</SelectItem>
                        <SelectItem value="120">2 hours before</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <Button type="submit" disabled={saving}>
                  {saving ? "Saving..." : "Save Notification Settings"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}