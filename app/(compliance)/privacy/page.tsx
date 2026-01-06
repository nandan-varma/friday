import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border px-6 py-4">
        <div className="mx-auto max-w-4xl flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <span className="text-lg font-bold">F</span>
            </div>
            <span className="text-xl font-bold">Friday</span>
          </Link>
          <Link href="/">
            <Button variant="outline" size="sm">Back to home</Button>
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="px-6 py-12 lg:py-16">
        <div className="mx-auto max-w-4xl">
          <h1 className="text-4xl font-bold tracking-tight mb-2">Privacy Policy</h1>
          <p className="text-lg text-muted-foreground mb-8">Last updated: January 4, 2026</p>

          <div className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>1. Introduction</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-muted-foreground">
                <p>
                  Friday ("we," "us," "our," or "Company") operates the Friday calendar application. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our application.
                </p>
                <p>
                  We are committed to protecting your privacy and ensuring you have a positive experience on Friday. If you have questions about this Privacy Policy, please contact us at{" "}
                  <a href="mailto:contact@nandan.fyi" className="text-primary hover:underline">
                    contact@nandan.fyi
                  </a>
                  .
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>2. Information We Collect</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-muted-foreground">
                <div>
                  <h4 className="font-semibold text-foreground mb-2">Account Information</h4>
                  <p>
                    When you create a Friday account, we collect your name, email address, and password.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-2">Calendar Data</h4>
                  <p>
                    When you sync your calendar with Friday, we access and store your calendar events, event details, attendee information, and scheduling preferences. You control what calendar data is shared with us.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-2">Usage Information</h4>
                  <p>
                    We automatically collect information about how you use Friday, including features accessed, actions taken, and interaction data. This helps us improve our service.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-2">AI Processing Data</h4>
                  <p>
                    When you use Friday's AI-powered features (such as intelligent scheduling or event suggestions), event details and context may be processed by OpenAI's API. This data is used to generate AI-powered recommendations and improve our service. We minimize the data sent to OpenAI and do not send personally identifiable information unless necessary.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-2">Device Information</h4>
                  <p>
                    We collect information about your device, including device type, operating system, browser type, IP address, and device identifiers.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>3. How We Use Your Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-muted-foreground">
                <p>We use the information we collect to:</p>
                <ul className="space-y-2 list-disc list-inside">
                  <li>Provide, maintain, and improve Friday</li>
                  <li>Process your account and provide customer support</li>
                  <li>Send transactional emails and service updates</li>
                  <li>Personalize your experience and provide AI-powered scheduling suggestions via OpenAI</li>
                  <li>Process event data with OpenAI to generate intelligent recommendations</li>
                  <li>Monitor and analyze trends and usage patterns</li>
                  <li>Detect and prevent fraudulent activity and security issues</li>
                  <li>Comply with legal obligations</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>4. Data Security</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-muted-foreground">
                <p>
                  We implement comprehensive technical, administrative, and physical security measures to protect your personal information. Your calendar data is encrypted both in transit and at rest using industry-standard encryption protocols.
                </p>
                <p>
                  However, no method of transmission over the Internet is 100% secure. While we strive to protect your information, we cannot guarantee absolute security.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>5. Data Retention</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-muted-foreground">
                <p>
                  We retain your personal information for as long as your account is active or as needed to provide our services. You can delete your account and associated data at any time from your account settings. Once deleted, your data will be permanently removed from our servers within 30 days.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>6. Third-Party Services</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-muted-foreground">
                <div>
                  <h4 className="font-semibold text-foreground mb-2">Calendar Integration</h4>
                  <p>
                    Friday integrates with third-party calendar services (Google Calendar, Microsoft Outlook, Apple Calendar, and CalDAV services) to sync your calendars. These integrations use OAuth 2.0 authentication to securely access your calendar data. We do not share your information with third parties beyond what is necessary to provide these integrations.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-2">OpenAI Integration</h4>
                  <p>
                    Friday uses OpenAI's API to provide AI-powered features such as intelligent scheduling suggestions, smart event summaries, and natural language processing. When you use these AI features, certain information (such as event details and scheduling preferences) may be sent to OpenAI for processing. OpenAI may retain this data in accordance with their privacy policy. You can review OpenAI's privacy policy at{" "}
                    <a href="https://openai.com/privacy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">openai.com/privacy</a>.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>7. Your Privacy Rights</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-muted-foreground">
                <p>You have the right to:</p>
                <ul className="space-y-2 list-disc list-inside">
                  <li>Access the personal information we hold about you</li>
                  <li>Request correction of inaccurate data</li>
                  <li>Request deletion of your data</li>
                  <li>Opt-out of certain communications</li>
                  <li>Data portability in a structured, commonly used format</li>
                </ul>
                <p className="mt-4">
                  To exercise any of these rights, please contact us at{" "}
                  <a href="mailto:contact@nandan.fyi" className="text-primary hover:underline">
                    contact@nandan.fyi
                  </a>
                  .
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>8. Changes to This Privacy Policy</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-muted-foreground">
                <p>
                  We may update this Privacy Policy from time to time. We will notify you of any significant changes by posting the updated policy on our website and updating the "Last updated" date.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>9. Contact Us</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-muted-foreground">
                <p>
                  If you have questions about this Privacy Policy or our privacy practices, please contact us at:
                </p>
                <div className="bg-muted p-4 rounded-lg">
                  <p className="font-semibold text-foreground">Email:</p>
                  <a href="mailto:contact@nandan.fyi" className="text-primary hover:underline">
                    contact@nandan.fyi
                  </a>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border px-6 py-12">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <span className="text-lg font-bold">F</span>
              </div>
              <span className="text-xl font-bold">Friday</span>
            </div>
            
            <div className="flex gap-8 text-sm text-muted-foreground">
              <Link href="/privacy" className="hover:text-foreground transition-colors">Privacy</Link>
              <Link href="/terms" className="hover:text-foreground transition-colors">Terms</Link>
              <Link href="/support" className="hover:text-foreground transition-colors">Support</Link>
            </div>
            
            <p className="text-sm text-muted-foreground">
              © 2026 Friday. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
