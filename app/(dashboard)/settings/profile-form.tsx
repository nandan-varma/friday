"use client"

import { useState, useTransition, useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Camera, Save, X, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { updateUserProfileAction } from "./actions"
import type { UserProfile } from "@/services/profileService"

const profileFormSchema = z.object({
    name: z.string().min(1, {
        message: "Name is required.",
    }),
    email: z.string().email({
        message: "Please enter a valid email address.",
    }),
})

interface ProfileFormProps {
    initialProfile: UserProfile
}

export function ProfileForm({ initialProfile }: ProfileFormProps) {
    const [isEditing, setIsEditing] = useState(false)
    const [isPending, startTransition] = useTransition()
    // Local state to track current profile data for optimistic updates
    const [currentProfile, setCurrentProfile] = useState(initialProfile)

    const form = useForm<z.infer<typeof profileFormSchema>>({
        resolver: zodResolver(profileFormSchema),
        defaultValues: {
            name: currentProfile.name || "",
            email: currentProfile.email,
        },
    })

    // Update local state when initialProfile changes (on component mount or external updates)
    useEffect(() => {
        setCurrentProfile(initialProfile)
    }, [initialProfile])

    // Sync form with current profile data when not editing
    useEffect(() => {
        if (!isEditing) {
            form.reset({
                name: currentProfile.name || "",
                email: currentProfile.email,
            })
        }
    }, [currentProfile, form, isEditing])

    async function onSubmit(values: z.infer<typeof profileFormSchema>) {
        startTransition(async () => {
            try {
                const result = await updateUserProfileAction(values)

                if (result.success) {
                    toast.success("Profile updated successfully")
                    setIsEditing(false)

                    // Update local state with the saved values for optimistic UI
                    if (result.data) {
                        setCurrentProfile(result.data)
                    } else {
                        // Fallback to the submitted values if no data returned
                        setCurrentProfile(prev => ({
                            ...prev,
                            name: values.name,
                            email: values.email,
                        }))
                    }
                } else {
                    throw new Error(result.error || "Failed to update profile")
                }
            } catch (error) {
                console.error("Error updating profile:", error)
                toast.error(error instanceof Error ? error.message : "Failed to update profile")
            }
        })
    }
    const handleCancel = () => {
        form.reset({
            name: currentProfile.name || "",
            email: currentProfile.email,
        })
        setIsEditing(false)
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Profile</CardTitle>
                <CardDescription>Manage your personal information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Avatar Section */}        <div className="flex items-center space-x-4">
                    <Avatar className="h-20 w-20">
                        <AvatarImage src="/placeholder-user.jpg" alt={currentProfile.name || "User"} />
                        <AvatarFallback className="text-lg">
                            {(currentProfile.name || currentProfile.email)
                                .split(" ")
                                .map((n) => n[0])
                                .join("")
                                .toUpperCase()
                                .slice(0, 2)}
                        </AvatarFallback>
                    </Avatar>
                    <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">Profile picture</p>
                        <Button variant="outline" size="sm" className="gap-2" disabled>
                            <Camera className="h-4 w-4" />
                            Change photo
                        </Button>
                        <p className="text-xs text-muted-foreground">Coming soon</p>
                    </div>
                </div>

                <Separator />

                {/* Profile Form */}
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Name</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Enter your name"
                                            {...field}
                                            disabled={!isEditing || isPending}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Enter your email"
                                            type="email"
                                            {...field}
                                            disabled={!isEditing || isPending}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />            {/* Action Buttons */}
                        <div className="flex gap-2 pt-4">              {!isEditing ? (
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsEditing(true)}
                                disabled={isPending}
                            >
                                Edit Profile
                            </Button>
                        ) : (
                            <>
                                <Button
                                    type="submit"
                                    disabled={isPending}
                                >
                                    {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    <Save className="mr-2 h-4 w-4" />
                                    Save Changes
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={handleCancel}
                                    disabled={isPending}
                                >
                                    <X className="mr-2 h-4 w-4" />
                                    Cancel
                                </Button>
                            </>
                        )}
                        </div>
                    </form>
                </Form>
            </CardContent>
        </Card>
    )
}
