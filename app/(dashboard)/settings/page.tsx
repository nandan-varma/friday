"use client"

import { useState, useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { UserProfileCard } from "@/components/settings/user-profile-card"
import { AccountSecurityCard } from "@/components/settings/account-security-card"

const notificationFormSchema = z.object({
  notificationsEnabled: z.boolean(),
  aiSuggestionsEnabled: z.boolean(),
  timezone: z.string().min(1, {
    message: "Please select a timezone.",
  }),
})

// Skeleton component for loading states
function SettingsSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-10 w-48" />
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-10 w-full" />
          </div>
          <Skeleton className="h-10 w-32" />
        </CardContent>
      </Card>
    </div>
  )
}


export default function SettingsPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [isPending, setIsPending] = useState(false)
  const [userProfile, setUserProfile] = useState({ name: "", email: "" })
  const { toast } = useToast()

  const notificationForm = useForm<z.infer<typeof notificationFormSchema>>({
    resolver: zodResolver(notificationFormSchema),
    defaultValues: {
      notificationsEnabled: true,
      aiSuggestionsEnabled: true,
      timezone: "UTC",
    },
  })

  // Load user data on component mount
  useEffect(() => {
    async function loadUserData() {
      try {
        // Load profile data
        const profileResponse = await fetch("/api/profile")
        if (profileResponse.ok) {
          const profileData = await profileResponse.json()
          setUserProfile({
            name: profileData.name || "",
            email: profileData.email || "",
          })
        }

        // Load settings data
        const settingsResponse = await fetch("/api/settings")
        if (settingsResponse.ok) {
          const settingsData = await settingsResponse.json()
          notificationForm.reset({
            notificationsEnabled: settingsData.notificationsEnabled ?? true,
            aiSuggestionsEnabled: settingsData.aiSuggestionsEnabled ?? true,
            timezone: settingsData.timezone || "UTC",
          })
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load user data",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadUserData()
  }, [notificationForm, toast])

  async function onProfileUpdate(values: { name: string; email: string }) {
    try {
      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      })

      if (!response.ok) {
        throw new Error("Failed to update profile")
      }

      const updatedProfile = await response.json()
      setUserProfile({
        name: updatedProfile.name || "",
        email: updatedProfile.email || "",
      })

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
      throw error
    }
  }

  async function onNotificationSubmit(values: z.infer<typeof notificationFormSchema>) {
    setIsPending(true)

    try {
      const response = await fetch("/api/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      })

      if (!response.ok) {
        throw new Error("Failed to update settings")
      }

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
      setIsPending(false)
    }
  }

  if (isLoading) {
    return <SettingsSkeleton />
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Settings</h1>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <UserProfileCard
            name={userProfile.name}
            email={userProfile.email}
            onProfileUpdate={onProfileUpdate}
            isLoading={isLoading}
          />
        </TabsContent>

        <TabsContent value="preferences">
          <Card>
            <CardHeader>
              <CardTitle>Preferences & Notifications</CardTitle>
              <CardDescription>Configure your notification preferences and system settings</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...notificationForm}>
                <form onSubmit={notificationForm.handleSubmit(onNotificationSubmit)} className="space-y-6">
                  <FormField
                    control={notificationForm.control}
                    name="notificationsEnabled"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Email Notifications</FormLabel>
                          <FormDescription>
                            Receive email notifications for events and reminders
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={notificationForm.control}
                    name="aiSuggestionsEnabled"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">AI Suggestions</FormLabel>
                          <FormDescription>
                            Receive AI-powered suggestions for scheduling and productivity
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <Separator />

                  <FormField
                    control={notificationForm.control}
                    name="timezone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Timezone</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select your timezone" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="UTC">UTC (Coordinated Universal Time)</SelectItem>
                            <SelectItem value="America/New_York">Eastern Time (EST/EDT)</SelectItem>
                            <SelectItem value="America/Chicago">Central Time (CST/CDT)</SelectItem>
                            <SelectItem value="America/Denver">Mountain Time (MST/MDT)</SelectItem>
                            <SelectItem value="America/Los_Angeles">Pacific Time (PST/PDT)</SelectItem>
                            <SelectItem value="Europe/London">London (GMT/BST)</SelectItem>
                            <SelectItem value="Europe/Paris">Paris (CET/CEST)</SelectItem>
                            <SelectItem value="Europe/Berlin">Berlin (CET/CEST)</SelectItem>
                            <SelectItem value="Asia/Tokyo">Tokyo (JST)</SelectItem>
                            <SelectItem value="Asia/Shanghai">Shanghai (CST)</SelectItem>
                            <SelectItem value="Asia/Kolkata">India (IST)</SelectItem>
                            <SelectItem value="Australia/Sydney">Sydney (AEST/AEDT)</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Your timezone affects how dates and times are displayed
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" disabled={isPending}>
                    {isPending ? "Saving..." : "Save Settings"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <AccountSecurityCard />
        </TabsContent>

        <TabsContent value="integrations">
          <Card>
            <CardHeader>
              <CardTitle>Integrations</CardTitle>
              <CardDescription>Connect your external accounts and services</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-1">
                  <h4 className="text-sm font-medium">Google Calendar</h4>
                  <p className="text-sm text-muted-foreground">
                    Sync your events with Google Calendar
                  </p>
                </div>
                <Badge variant="secondary">Coming Soon</Badge>
              </div>
              
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-1">
                  <h4 className="text-sm font-medium">Microsoft Outlook</h4>
                  <p className="text-sm text-muted-foreground">
                    Sync your events with Outlook Calendar
                  </p>
                </div>
                <Badge variant="secondary">Coming Soon</Badge>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-1">
                  <h4 className="text-sm font-medium">Slack</h4>
                  <p className="text-sm text-muted-foreground">
                    Get notifications and updates in Slack
                  </p>
                </div>
                <Badge variant="secondary">Coming Soon</Badge>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-1">
                  <h4 className="text-sm font-medium">Zoom</h4>
                  <p className="text-sm text-muted-foreground">
                    Automatically add Zoom links to events
                  </p>
                </div>
                <Badge variant="secondary">Coming Soon</Badge>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
