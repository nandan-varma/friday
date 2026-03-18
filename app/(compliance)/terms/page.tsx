import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export default function TermsPage() {
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
          <h1 className="text-4xl font-bold tracking-tight mb-2">Terms of Service</h1>
          <p className="text-lg text-muted-foreground mb-8">Last updated: January 4, 2026</p>

          <div className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>1. Acceptance of Terms</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-muted-foreground">
                <p>
                  By accessing and using Friday, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>2. Use License</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-muted-foreground">
                <p>
                  Permission is granted to temporarily download one copy of the materials (information or software) on Friday for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
                </p>
                <ul className="space-y-2 list-disc list-inside">
                  <li>Modifying or copying the materials</li>
                  <li>Using the materials for any commercial purpose or for any public display</li>
                  <li>Attempting to decompile or reverse engineer any software contained on Friday</li>
                  <li>Removing any copyright or other proprietary notations from the materials</li>
                  <li>Transferring the materials to another person or "mirroring" the materials on any other server</li>
                  <li>Using automated tools to access or monitor the service</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>3. Disclaimer</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-muted-foreground">
                <p>
                  The materials on Friday are provided on an 'as is' basis. Friday makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>4. Limitations</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-muted-foreground">
                <p>
                  In no event shall Friday or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on Friday, even if Friday or an authorized representative has been notified orally or in writing of the possibility of such damage.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>5. Accuracy of Materials</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-muted-foreground">
                <p>
                  The materials appearing on Friday could include technical, typographical, or photographic errors. Friday does not warrant that any of the materials on its website are accurate, complete, or current. Friday may make changes to the materials contained on its website at any time without notice.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>6. User Account Responsibilities</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-muted-foreground">
                <p>
                  You are responsible for maintaining the confidentiality of your account login credentials and password. You agree to accept responsibility for all activities that occur under your account. You must notify Friday immediately of any unauthorized use of your account.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>7. User Conduct</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-muted-foreground">
                <p>You agree not to use Friday for any unlawful purposes or in any way that could damage, disable, overburden, or impair Friday. Prohibited conduct includes:</p>
                <ul className="space-y-2 list-disc list-inside">
                  <li>Harassing or causing distress or inconvenience to any person</li>
                  <li>Transmitting content that is abusive, offensive, or harmful</li>
                  <li>Disrupting normal flow of dialogue within our platform</li>
                  <li>Attempting to gain unauthorized access to our systems</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>8. Third-Party AI Services</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-muted-foreground">
                <p>
                  Friday uses OpenAI's API to provide AI-powered features and recommendations. By using Friday, you acknowledge that:
                </p>
                <ul className="space-y-2 list-disc list-inside">
                  <li>Your calendar events and scheduling data may be processed by OpenAI</li>
                  <li>OpenAI may store this data in accordance with their privacy policy</li>
                  <li>You are subject to OpenAI's terms of service in addition to these terms</li>
                  <li>Friday is not responsible for OpenAI's use or handling of your data</li>
                </ul>
                <p className="mt-4">
                  Please review OpenAI's privacy policy and terms of service at{" "}
                  <a href="https://openai.com/privacy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">openai.com/privacy</a>.
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>9. Intellectual Property Rights</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-muted-foreground">
                <p>
                  All content included on Friday, including text, graphics, logos, images, and software, is the property of Friday or its suppliers and protected by international copyright laws. The compilation of all content on Friday is the exclusive property of Friday and protected by international copyright laws.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>10. Links to Third-Party Websites</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-muted-foreground">
                <p>
                  Friday has not reviewed all of the sites linked to from its website and is not responsible for the contents of any such linked site. The inclusion of any link does not imply endorsement by Friday of the site. Use of any such linked website is at the user's own risk.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>11. Modifications</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-muted-foreground">
                <p>
                  Friday may revise these terms of service for its website at any time without notice. By using this website, you are agreeing to be bound by the then current version of these terms of service.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>12. Governing Law</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-muted-foreground">
                <p>
                  These terms and conditions are governed by and construed in accordance with the laws of the jurisdiction where Friday operates, and you irrevocably submit to the exclusive jurisdiction of the courts in that location.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>13. Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-muted-foreground">
                <p>
                  If you have any questions about these Terms of Service, please contact us at:
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
