import Link from "next/link";
import { FileText, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-linear-to-br from-background via-muted/50 to-background">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <Button
            variant="ghost"
            asChild
            className="transition-all duration-200 hover:scale-105"
          >
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
          <FileText className="h-16 w-16 text-primary mx-auto mb-4" />
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-linear-to-r from-foreground to-primary bg-clip-text text-transparent">
            Terms of Service
          </h1>
          <p className="text-lg text-muted-foreground">
            Please read these terms carefully before using Friday AI Calendar.
          </p>
        </div>

        <Card className="border-0 shadow-lg">
          <CardContent className="p-8 space-y-8">
            <div>
              <p className="text-sm text-muted-foreground mb-6">
                Last updated:{" "}
                {new Date().toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-semibold mb-4">
                1. Acceptance of Terms
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                By accessing and using Friday AI Calendar (&quot;the
                Service&quot;), you accept and agree to be bound by the terms
                and provision of this agreement. If you do not agree to abide by
                the above, please do not use this service.
              </p>
            </div>

            <Separator />

            <div>
              <h2 className="text-2xl font-semibold mb-4">
                2. Description of Service
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Friday AI Calendar is an intelligent calendar management
                platform that helps users organize their schedules, manage
                events, and integrate with various calendar services. The
                Service includes:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                <li>AI-powered calendar assistance</li>
                <li>Event creation and management</li>
                <li>Calendar integrations (Google Calendar, etc.)</li>
                <li>Smart scheduling suggestions</li>
                <li>Notification and reminder services</li>
              </ul>
            </div>

            <Separator />

            <div>
              <h2 className="text-2xl font-semibold mb-4">
                3. User Accounts and Registration
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                To access certain features of the Service, you must register for
                an account. You agree to:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                <li>
                  Provide accurate, current, and complete information during
                  registration
                </li>
                <li>Maintain and promptly update your account information</li>
                <li>Maintain the security of your password and account</li>
                <li>
                  Accept responsibility for all activities under your account
                </li>
                <li>
                  Notify us immediately of any unauthorized use of your account
                </li>
              </ul>
            </div>

            <Separator />

            <div>
              <h2 className="text-2xl font-semibold mb-4">
                4. Acceptable Use Policy
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                You agree not to use the Service to:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                <li>Violate any applicable laws or regulations</li>
                <li>Infringe upon the rights of others</li>
                <li>Transmit harmful, offensive, or inappropriate content</li>
                <li>Attempt to gain unauthorized access to our systems</li>
                <li>Interfere with or disrupt the Service or servers</li>
                <li>
                  Use the Service for commercial purposes without authorization
                </li>
                <li>Share your account credentials with third parties</li>
              </ul>
            </div>

            <Separator />

            <div>
              <h2 className="text-2xl font-semibold mb-4">
                5. Privacy and Data Protection
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Your privacy is important to us. Our collection and use of
                personal information is governed by our{" "}
                <Link
                  href="/privacy"
                  className="text-primary hover:underline font-medium"
                >
                  Privacy Policy
                </Link>
                , which is incorporated into these Terms by reference. By using
                the Service, you consent to the collection and use of your
                information as outlined in our Privacy Policy.
              </p>
            </div>

            <Separator />

            <div>
              <h2 className="text-2xl font-semibold mb-4">
                6. Intellectual Property Rights
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                The Service and its original content, features, and
                functionality are owned by Friday AI Calendar and are protected
                by international copyright, trademark, patent, trade secret, and
                other intellectual property laws.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                You retain ownership of any content you create or upload to the
                Service, but grant us a license to use, modify, and display such
                content as necessary to provide the Service.
              </p>
            </div>

            <Separator />

            <div>
              <h2 className="text-2xl font-semibold mb-4">
                7. Third-Party Integrations
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                The Service may integrate with third-party services (such as
                Google Calendar). Your use of these integrations is subject to
                the respective third-party terms and privacy policies. We are
                not responsible for the content, privacy policies, or practices
                of any third-party services.
              </p>
            </div>

            <Separator />

            <div>
              <h2 className="text-2xl font-semibold mb-4">
                8. Service Availability and Modifications
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                We strive to maintain high availability of the Service, but we
                do not guarantee uninterrupted access. We reserve the right to:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                <li>Modify, suspend, or discontinue any part of the Service</li>
                <li>Update these Terms at any time</li>
                <li>Implement maintenance and updates as needed</li>
                <li>Set usage limits and restrictions</li>
              </ul>
            </div>

            <Separator />

            <div>
              <h2 className="text-2xl font-semibold mb-4">
                9. Limitation of Liability
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                To the maximum extent permitted by law, Friday AI Calendar shall
                not be liable for any indirect, incidental, special,
                consequential, or punitive damages, or any loss of profits or
                revenues, whether incurred directly or indirectly, or any loss
                of data, use, goodwill, or other intangible losses.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Our total liability to you for any claims arising from or
                relating to the Service shall not exceed the amount you paid us
                in the twelve months preceding the claim.
              </p>
            </div>

            <Separator />

            <div>
              <h2 className="text-2xl font-semibold mb-4">
                10. Disclaimer of Warranties
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                The Service is provided &quot;as is&quot; and &quot;as
                available&quot; without any warranties of any kind, either
                express or implied, including but not limited to the implied
                warranties of merchantability, fitness for a particular purpose,
                or non-infringement. We do not warrant that the Service will be
                error-free or uninterrupted.
              </p>
            </div>

            <Separator />

            <div>
              <h2 className="text-2xl font-semibold mb-4">11. Termination</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                We may terminate or suspend your account and access to the
                Service immediately, without prior notice, for any reason,
                including breach of these Terms.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                You may terminate your account at any time by contacting us.
                Upon termination, your right to use the Service will cease
                immediately, and we may delete your account and data.
              </p>
            </div>

            <Separator />

            <div>
              <h2 className="text-2xl font-semibold mb-4">12. Governing Law</h2>
              <p className="text-muted-foreground leading-relaxed">
                These Terms shall be governed by and construed in accordance
                with the laws of [Your Jurisdiction], without regard to its
                conflict of law provisions. Any disputes arising from these
                Terms or the Service shall be resolved in the courts of [Your
                Jurisdiction].
              </p>
            </div>

            <Separator />

            <div>
              <h2 className="text-2xl font-semibold mb-4">
                13. Changes to Terms
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                We reserve the right to modify these Terms at any time. We will
                notify users of any material changes by posting the new Terms on
                this page and updating the &quot;Last updated&quot; date. Your
                continued use of the Service after any such changes constitutes
                your acceptance of the new Terms.
              </p>
            </div>

            <Separator />

            <div>
              <h2 className="text-2xl font-semibold mb-4">
                14. Contact Information
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                If you have any questions about these Terms of Service, please
                contact us:
              </p>
              <div className="bg-muted/50 p-4 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  <strong>Email:</strong> contact@nandan.fyi
                  <br />
                </p>
              </div>
            </div>

            <Separator />

            <div className="text-center pt-4">
              <p className="text-sm text-muted-foreground mb-6">
                By using Friday AI Calendar, you acknowledge that you have read,
                understood, and agree to be bound by these Terms of Service.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild>
                  <Link href="/">Return to Home</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/privacy">View Privacy Policy</Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
