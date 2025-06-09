import Link from "next/link"
import { Shield, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/50 to-background">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <Button variant="ghost" asChild className="transition-all duration-200 hover:scale-105">
            <Link href="/" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Link>
          </Button>
        </nav>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="text-center mb-12">
          <Shield className="h-16 w-16 text-primary mx-auto mb-4" />
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
            Privacy Policy
          </h1>
          <p className="text-lg text-muted-foreground">
            Your privacy is important to us. Here's how we protect your data.
          </p>
        </div>

        <Card className="border-0 shadow-lg">
          <CardContent className="p-8 space-y-8">
            <div>
              <h2 className="text-2xl font-semibold mb-4">Information We Collect</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                We collect information you provide directly to us, such as when you create an account, 
                use our services, or contact us for support. This may include:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                <li>Account information (name, email address)</li>
                <li>Calendar data and events you create</li>
                <li>Usage data to improve our services</li>
                <li>Device and browser information</li>
              </ul>
            </div>

            <Separator />

            <div>
              <h2 className="text-2xl font-semibold mb-4">How We Use Your Information</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                We use the information we collect to:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                <li>Provide and improve our AI calendar services</li>
                <li>Process your calendar events and scheduling requests</li>
                <li>Send you important updates about our service</li>
                <li>Provide customer support</li>
                <li>Ensure security and prevent fraud</li>
              </ul>
            </div>

            <Separator />

            <div>
              <h2 className="text-2xl font-semibold mb-4">Data Security</h2>
              <p className="text-muted-foreground leading-relaxed">
                We implement industry-standard security measures to protect your personal information. 
                Your calendar data is encrypted both in transit and at rest. We use secure servers and 
                follow best practices for data protection to ensure your information remains safe.
              </p>
            </div>

            <Separator />

            <div>
              <h2 className="text-2xl font-semibold mb-4">Data Sharing</h2>
              <p className="text-muted-foreground leading-relaxed">
                We do not sell, trade, or otherwise transfer your personal information to third parties 
                without your consent, except as described in this policy. We may share information with 
                trusted service providers who assist us in operating our platform, conducting our business, 
                or serving our users.
              </p>
            </div>

            <Separator />

            <div>
              <h2 className="text-2xl font-semibold mb-4">Your Rights</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                You have the right to:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                <li>Access your personal data</li>
                <li>Correct inaccurate data</li>
                <li>Delete your account and data</li>
                <li>Export your data</li>
                <li>Opt out of marketing communications</li>
              </ul>
            </div>

            <Separator />

            <div>
              <h2 className="text-2xl font-semibold mb-4">Contact Us</h2>
              <p className="text-muted-foreground leading-relaxed">
                If you have any questions about this Privacy Policy or our data practices, 
                please contact us at contact@nandan.fyi or through our support channels.
              </p>
            </div>

            <div className="text-sm text-muted-foreground pt-4 border-t">
              <p>Last updated: May 29, 2025</p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
