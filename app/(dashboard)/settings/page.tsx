import { Suspense } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent } from "@/components/ui/tabs"
import { AccountSecurityCard } from "@/components/settings/account-security-card"
import { ProfileForm } from "./profile-form"
import { PreferencesForm } from "./preferences-form"
import { getUserData } from "./actions"

// Force dynamic rendering since we use cookies
export const dynamic = 'force-dynamic'

async function SettingsContent() {
  const result = await getUserData()

  if (!result.success || !result.data) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-red-600">
            {result.error || "Failed to load user data"}
          </p>
        </CardContent>
      </Card>
    )
  }

  const { profile, settings } = result.data
  
  return (
    <Tabs defaultValue="profile" className="space-y-6">
      <TabsList>
        <TabsTrigger value="profile">Profile</TabsTrigger>
        <TabsTrigger value="preferences">Preferences</TabsTrigger>
        <TabsTrigger value="security">Security</TabsTrigger>
      </TabsList>
      <TabsContent value="profile" className="space-y-6">
        <ProfileForm initialProfile={profile} />
      </TabsContent>

      <TabsContent value="preferences">
        <PreferencesForm initialSettings={settings} />
      </TabsContent>

      <TabsContent value="security">
        <AccountSecurityCard />
      </TabsContent>
    </Tabs>
  )
}

export default function SettingsPage() {
  return (
    <Suspense fallback={null}>
      <SettingsContent />
    </Suspense>
  )
}
