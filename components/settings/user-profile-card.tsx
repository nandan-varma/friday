import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { Camera, Save, X } from "lucide-react"

interface UserProfileCardProps {
  name: string
  email: string
  avatarUrl?: string
  onProfileUpdate?: (data: { name: string; email: string }) => void
  isLoading?: boolean
}

function UserProfileSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-24" />
        <Skeleton className="h-4 w-48" />
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center space-x-4">
          <Skeleton className="h-20 w-20 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-8 w-24" />
          </div>
        </div>
        <Separator />
        <div className="space-y-4">
          <div className="space-y-2">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-10 w-full" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
      </CardContent>
    </Card>
  )
}

export function UserProfileCard({ 
  name, 
  email, 
  avatarUrl, 
  onProfileUpdate,
  isLoading = false 
}: UserProfileCardProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editName, setEditName] = useState(name)
  const [editEmail, setEditEmail] = useState(email)
  const [isPending, setIsPending] = useState(false)

  const handleSave = async () => {
    if (!onProfileUpdate) return
    
    setIsPending(true)
    try {
      await onProfileUpdate({ name: editName, email: editEmail })
      setIsEditing(false)
    } finally {
      setIsPending(false)
    }
  }

  const handleCancel = () => {
    setEditName(name)
    setEditEmail(email)
    setIsEditing(false)
  }

  if (isLoading) {
    return <UserProfileSkeleton />
  }

  const initials = name
    .split(" ")
    .map((part) => part.charAt(0))
    .join("")
    .toUpperCase()

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile Information</CardTitle>
        <CardDescription>
          Manage your personal information and account details
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Avatar Section */}
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Avatar className="h-20 w-20">
              <AvatarImage src={avatarUrl} alt={name} />
              <AvatarFallback className="text-lg">{initials}</AvatarFallback>
            </Avatar>
            <Button
              size="sm"
              variant="outline"
              className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0"
              onClick={() => {
                // TODO: Implement avatar upload
                console.log("Avatar upload coming soon")
              }}
            >
              <Camera className="h-4 w-4" />
            </Button>
          </div>
          <div>
            <h3 className="text-lg font-medium">{name}</h3>
            <p className="text-sm text-muted-foreground">{email}</p>
          </div>
        </div>

        <Separator />

        {/* Profile Form */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            {isEditing ? (
              <Input
                id="name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Enter your full name"
              />
            ) : (
              <div className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                {name}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            {isEditing ? (
              <Input
                id="email"
                type="email"
                value={editEmail}
                onChange={(e) => setEditEmail(e.target.value)}
                placeholder="Enter your email address"
              />
            ) : (
              <div className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                {email}
              </div>
            )}
          </div>

          <div className="flex space-x-2">
            {isEditing ? (
              <>
                <Button 
                  onClick={handleSave} 
                  disabled={isPending || !editName.trim() || !editEmail.trim()}
                  size="sm"
                >
                  <Save className="mr-2 h-4 w-4" />
                  {isPending ? "Saving..." : "Save Changes"}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={handleCancel}
                  size="sm"
                  disabled={isPending}
                >
                  <X className="mr-2 h-4 w-4" />
                  Cancel
                </Button>
              </>
            ) : (
              <Button onClick={() => setIsEditing(true)} size="sm">
                Edit Profile
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
