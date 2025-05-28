"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const profileFormSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
})

const notificationFormSchema = z.object({
  emailNotifications: z.boolean().default(true),
  reminderTime: z.string().min(1, {
    message: "Please select a reminder time.",
  }),
  aiSuggestions: z.boolean().default(true),
})

const integrationFormSchema = z.object({
  googleCalendar: z.boolean().default(false),
})

export default function SettingsPage() {
  const [isPending, setIsPending] = useState(false)

  const profileForm = useForm<z.infer<typeof profileFormSchema>>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: "John Doe",
      email: "john.doe@example.com",
    },
  })

  const notificationForm = useForm<z.infer<typeof notificationFormSchema>>({
    resolver: zodResolver(notificationFormSchema),
    defaultValues: {
      emailNotifications: true,
      reminderTime: "30",
      aiSuggestions: true,
    },
  })

  const integrationForm = useForm<z.infer<typeof integrationFormSchema>>({
    resolver: zodResolver(integrationFormSchema),
    defaultValues: {
      googleCalendar: false,
    },
  })

  function onProfileSubmit(values: z.infer<typeof profileFormSchema>) {
    setIsPending(true)

    // Simulate API call
    setTimeout(() => {
      console.log(values)
      setIsPending(false)
    }, 1000)
  }

  function onNotificationSubmit(values: z.infer<typeof notificationFormSchema>) {
    setIsPending(true)

    // Simulate API call
    setTimeout(() => {
      console.log(values)
      setIsPending(false)
    }, 1000)
  }

  function onIntegrationSubmit(values: z.infer<typeof integrationFormSchema>) {
    setIsPending(true)

    // Simulate API call
    setTimeout(() => {
      console.log(values)
      setIsPending(false)
    }, 1000)
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Settings</h1>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Profile</CardTitle>
              <CardDescription>Manage your personal information</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...profileForm}>
                <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-8">
                  <FormField
                    control={profileForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Your name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={profileForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input placeholder="Your email" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" disabled={isPending}>
                    {isPending ? "Saving..." : "Save Changes"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notifications</CardTitle>
              <CardDescription>Configure how you receive notifications</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...notificationForm}>
                <form onSubmit={notificationForm.handleSubmit(onNotificationSubmit)} className="space-y-8">
                  <FormField
                    control={notificationForm.control}
                    name="emailNotifications"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Email Notifications</FormLabel>
                          <FormDescription>Receive email notifications for events</FormDescription>
                        </div>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={notificationForm.control}
                    name="reminderTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Default Reminder Time</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select reminder time" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="5">5 minutes before</SelectItem>
                            <SelectItem value="10">10 minutes before</SelectItem>
                            <SelectItem value="15">15 minutes before</SelectItem>
                            <SelectItem value="30">30 minutes before</SelectItem>
                            <SelectItem value="60">1 hour before</SelectItem>
                            <SelectItem value="1440">1 day before</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>When to send reminders for events</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={notificationForm.control}
                    name="aiSuggestions"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">AI Suggestions</FormLabel>
                          <FormDescription>Receive AI-powered suggestions for your calendar</FormDescription>
                        </div>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <Button type="submit" disabled={isPending}>
                    {isPending ? "Saving..." : "Save Changes"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integrations">
          <Card>
            <CardHeader>
              <CardTitle>Integrations</CardTitle>
              <CardDescription>Connect with external calendar services</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...integrationForm}>
                <form onSubmit={integrationForm.handleSubmit(onIntegrationSubmit)} className="space-y-8">
                  <FormField
                    control={integrationForm.control}
                    name="googleCalendar"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Google Calendar</FormLabel>
                          <FormDescription>Sync events with Google Calendar</FormDescription>
                        </div>
                        <FormControl>
                          <div className="flex items-center gap-2">
                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                            {!field.value && (
                              <Button variant="outline" size="sm" type="button">
                                Connect
                              </Button>
                            )}
                          </div>
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <Button type="submit" disabled={isPending}>
                    {isPending ? "Saving..." : "Save Changes"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
