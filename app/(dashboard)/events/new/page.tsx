"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { format } from "date-fns"
import { CalendarIcon, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

const formSchema = z.object({
  title: z.string().min(2, {
    message: "Title must be at least 2 characters.",
  }),
  description: z.string().optional(),
  location: z.string().optional(),
  date: z.date({
    required_error: "A date is required.",
  }),
  startTime: z.string({
    required_error: "Start time is required.",
  }),
  endTime: z.string({
    required_error: "End time is required.",
  }),
  isAllDay: z.boolean(),
})

export default function NewEventPage() {
  const router = useRouter()
  const [naturalLanguageInput, setNaturalLanguageInput] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      location: "",
      isAllDay: false,
      startTime: "09:00",
      endTime: "10:00",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    // In a real app, this would be a server action to create the event
    console.log(values)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Redirect to calendar
    router.push("/calendar")
  }

  async function processNaturalLanguage() {
    if (!naturalLanguageInput.trim()) return

    setIsProcessing(true)

    try {
      const { text } = await generateText({
        model: openai("gpt-4o"),
        prompt: `Parse the following natural language input into a calendar event with these fields: title, description (optional), location (optional), date (YYYY-MM-DD), startTime (HH:MM), endTime (HH:MM), isAllDay (true/false). Format the response as JSON. Input: "${naturalLanguageInput}"`,
      })

      // Parse the response
      const eventData = JSON.parse(text)

      // Update form values
      form.setValue("title", eventData.title)
      if (eventData.description) form.setValue("description", eventData.description)
      if (eventData.location) form.setValue("location", eventData.location)
      if (eventData.date) form.setValue("date", new Date(eventData.date))
      if (eventData.startTime) form.setValue("startTime", eventData.startTime)
      if (eventData.endTime) form.setValue("endTime", eventData.endTime)
      form.setValue("isAllDay", eventData.isAllDay || false)
    } catch (error) {
      console.error("Error processing natural language input:", error)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Create New Event</h1>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Natural Language Input</CardTitle>
          <CardDescription>
            Describe your event in natural language (e.g., "Lunch with John next Friday at 1pm")
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="Lunch with John next Friday at 1pm"
              value={naturalLanguageInput}
              onChange={(e) => setNaturalLanguageInput(e.target.value)}
              className="flex-1"
            />
            <Button onClick={processNaturalLanguage} disabled={isProcessing}>
              {isProcessing ? "Processing..." : "Process"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input placeholder="Event title" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea placeholder="Event description" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Location</FormLabel>
                <FormControl>
                  <Input placeholder="Event location" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                      >
                        {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="startTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Start Time</FormLabel>
                  <div className="flex items-center">
                    <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                    <Input type="time" {...field} disabled={form.watch("isAllDay")} />
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="endTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>End Time</FormLabel>
                  <div className="flex items-center">
                    <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                    <Input type="time" {...field} disabled={form.watch("isAllDay")} />
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="isAllDay"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">All Day Event</FormLabel>
                  <FormDescription>Toggle if this is an all-day event</FormDescription>
                </div>
                <FormControl>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full">
            Create Event
          </Button>
        </form>
      </Form>
    </div>
  )
}
