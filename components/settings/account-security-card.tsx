import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Calendar, Mail, Smartphone, Shield, Key, Trash2 } from "lucide-react"
import Link from "next/link"

interface AccountSecurityCardProps {
  lastLoginDate?: string
  twoFactorEnabled?: boolean
}

export function AccountSecurityCard({ 
  lastLoginDate = new Date().toLocaleDateString(),
  twoFactorEnabled = false,
}: AccountSecurityCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Shield className="mr-2 h-5 w-5" />
          Account Security (WIP)
        </CardTitle>
        <CardDescription>
          Manage your account security settings and connected devices
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Security Overview */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Last Login</p>
                <p className="text-sm text-muted-foreground">{lastLoginDate}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Key className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Two-Factor Authentication</p>
                <p className="text-sm text-muted-foreground">
                  {twoFactorEnabled ? "Enabled" : "Not enabled"}
                </p>
              </div>
            </div>
            <Badge variant={twoFactorEnabled ? "default" : "secondary"}>
              {twoFactorEnabled ? "Enabled" : "Disabled"}
            </Badge>
          </div>

          <div className="flex items-center justify-between">
            <Link href={"/sessions"}>
            <Button variant="outline" size="sm">
              Manage
            </Button>
            </Link>
          </div>
        </div>

        <Separator />

        {/* Security Actions */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Change Password</p>
              <p className="text-sm text-muted-foreground">
                Update your account password
              </p>
            </div>
            <Button variant="outline" size="sm">
              Change
            </Button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Two-Factor Authentication</p>
              <p className="text-sm text-muted-foreground">
                {twoFactorEnabled ? "Disable" : "Enable"} 2FA for extra security
              </p>
            </div>
            <Button 
              variant={twoFactorEnabled ? "destructive" : "default"} 
              size="sm"
            >
              {twoFactorEnabled ? "Disable" : "Enable"}
            </Button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Download Data</p>
              <p className="text-sm text-muted-foreground">
                Export your account data
              </p>
            </div>
            <Button variant="outline" size="sm">
              Download
            </Button>
          </div>
        </div>

        <Separator />

        {/* Danger Zone */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-destructive">Danger Zone</h4>
          <div className="flex items-center justify-between p-4 border border-destructive/20 rounded-lg">
            <div>
              <p className="text-sm font-medium">Delete Account</p>
              <p className="text-sm text-muted-foreground">
                Permanently delete your account and all data
              </p>
            </div>
            <Button variant="destructive" size="sm">
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
