"use client"

import { useState, useTransition } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"
import { updateUserSettingsAction } from "./actions"
import type { UserSettingsData } from "@/services/profileService"

const notificationFormSchema = z.object({
  notificationsEnabled: z.boolean(),
  aiSuggestionsEnabled: z.boolean(),
  timezone: z.string().min(1, {
    message: "Please select a timezone.",
  }),
})

interface PreferencesFormProps {
  initialSettings: UserSettingsData
}

export function PreferencesForm({ initialSettings }: PreferencesFormProps) {
  const [isPending, startTransition] = useTransition()

  const form = useForm<z.infer<typeof notificationFormSchema>>({
    resolver: zodResolver(notificationFormSchema),
    defaultValues: {
      notificationsEnabled: initialSettings.notificationsEnabled ?? true,
      aiSuggestionsEnabled: initialSettings.aiSuggestionsEnabled ?? true,
      timezone: initialSettings.timezone || "UTC",
    },
  })

  async function onSubmit(values: z.infer<typeof notificationFormSchema>) {
    startTransition(async () => {
      try {
        const result = await updateUserSettingsAction(values)
        
        if (result.success) {
          toast.success("Settings updated successfully")
        } else {
          throw new Error(result.error || "Failed to update settings")
        }
      } catch (error) {
        console.error("Error updating settings:", error)
        toast.error(error instanceof Error ? error.message : "Failed to update settings")
      }
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Preferences & Notifications</CardTitle>
        <CardDescription>Configure your notification preferences and system settings</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="notificationsEnabled"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Enable Notifications</FormLabel>
                    <FormDescription>
                      Receive notifications about upcoming events and reminders.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={isPending}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="aiSuggestionsEnabled"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">AI Suggestions</FormLabel>
                    <FormDescription>
                      Allow AI to suggest optimal meeting times and calendar optimizations.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={isPending}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <Separator />

            <FormField
              control={form.control}
              name="timezone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Timezone</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                    disabled={isPending}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your timezone" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="UTC">UTC</SelectItem>
                      <SelectItem value="America/New_York">Eastern Time</SelectItem>
                      <SelectItem value="America/Chicago">Central Time</SelectItem>
                      <SelectItem value="America/Denver">Mountain Time</SelectItem>
                      <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                      <SelectItem value="Europe/London">London</SelectItem>
                      <SelectItem value="Europe/Paris">Paris</SelectItem>
                      <SelectItem value="Europe/Berlin">Berlin</SelectItem>
                      <SelectItem value="Asia/Tokyo">Tokyo</SelectItem>
                      <SelectItem value="Asia/Shanghai">Shanghai</SelectItem>
                      <SelectItem value="Asia/Kolkata">Kolkata</SelectItem>
                      <SelectItem value="Australia/Sydney">Sydney</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    This will be used for scheduling and displaying events.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save preferences
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
