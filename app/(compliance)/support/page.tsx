"use client";

import { Mail02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Link from "next/link";
import { useState } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const supportRequestSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  email: z.email("Enter a valid email address"),
  subject: z.string().trim().min(1, "Subject is required").max(200),
  message: z.string().trim().min(1, "Message is required").max(10_000),
});

const SUPPORT_EMAIL = "contact@nandan.fyi";

export default function SupportPage() {
  const [formError, setFormError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    const parsed = supportRequestSchema.safeParse({
      ...formData,
      email: formData.email.trim(),
    });
    if (!parsed.success) {
      setFormError(
        parsed.error.issues[0]?.message ?? "Please check your message",
      );
      return;
    }

    const { name, email, subject, message } = parsed.data;
    const body = `Name: ${name}\nEmail: ${email}\n\n${message}`;
    window.location.assign(
      `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`,
    );
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border px-6 py-4">
        <div className="mx-auto max-w-4xl flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <span className="text-lg font-bold">F</span>
            </div>
            <span className="text-xl font-bold">Friday</span>
          </Link>
          <Link href="/">
            <Button variant="outline" size="sm">
              Back to home
            </Button>
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="px-6 py-12 lg:py-16">
        <div className="mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold tracking-tight mb-4">
              Support & Contact
            </h1>
            <p className="text-lg text-muted-foreground">
              We're here to help. Get in touch with us for any questions or
              issues.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3 mb-12">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HugeiconsIcon icon={Mail02Icon} />
                  Email Support
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  Have a question or issue? Send us an email and we'll get back
                  to you as soon as possible.
                </p>
                <a
                  href={`mailto:${SUPPORT_EMAIL}`}
                  className="text-primary hover:underline font-semibold"
                >
                  contact@nandan.fyi
                </a>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Response Time</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  We typically respond to support emails within 24 hours during
                  business days.
                </p>
                <p className="text-sm text-muted-foreground">
                  For urgent issues, please include "URGENT" in your subject
                  line.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Common Issues</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Calendar sync problems</li>
                  <li>• Account access issues</li>
                  <li>• Feature requests</li>
                  <li>• Bug reports</li>
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Contact Form */}
          <Card>
            <CardHeader>
              <CardTitle>Send us a message</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <p className="text-sm text-muted-foreground">
                  Sending opens your default email app with this message
                  prefilled.
                </p>
                {formError && (
                  <p className="text-sm text-destructive" role="alert">
                    {formError}
                  </p>
                )}
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      name="name"
                      placeholder="Your name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="your@email.com"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    name="subject"
                    placeholder="What is this about?"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    name="message"
                    placeholder="Tell us more about your question or issue..."
                    rows={6}
                    value={formData.message}
                    onChange={handleChange}
                    required
                  />
                </div>

                <Button type="submit" size="lg">
                  Send Message
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* FAQ Section */}
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-6">
              Frequently Asked Questions
            </h2>
            <div className="grid gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    How do I change my password?
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-muted-foreground">
                  Password changes are not available in the app yet. Contact
                  support from the email address on your account for help.
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    Why isn't my calendar syncing?
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-muted-foreground">
                  Calendar sync issues are usually due to permission changes.
                  Try disconnecting and reconnecting your calendar in your
                  Friday settings. Make sure to grant all necessary permissions.
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    Can I export my calendar data?
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-muted-foreground">
                  Friday does not currently offer calendar export. Your events
                  remain available in Google Calendar, where Google provides
                  export options.
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    What if I want to delete my account?
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-muted-foreground">
                  Account deletion is not yet self-service. Contact support from
                  the email address on your account to request deletion.
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    Is my calendar data backed up?
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-muted-foreground">
                  Yes, your calendar data is automatically backed up and
                  encrypted. We maintain multiple secure backups to ensure your
                  data is always protected.
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    How does Friday use AI?
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-muted-foreground">
                  Friday uses OpenAI's API to provide intelligent scheduling
                  suggestions, smart event summaries, and natural language
                  processing. When you use these features, event details are
                  securely sent to OpenAI for processing. Your data is handled
                  in accordance with OpenAI's privacy policy.
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    Is my data shared with OpenAI?
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-muted-foreground">
                  When you use Friday's AI-powered features, certain event
                  details are sent to OpenAI for processing. We only send the
                  minimum information necessary. For details on how OpenAI
                  handles your data, please review their privacy policy at{" "}
                  <a
                    href="https://openai.com/privacy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    openai.com/privacy
                  </a>
                  .
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border px-6 py-12 mt-16">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <span className="text-lg font-bold">F</span>
              </div>
              <span className="text-xl font-bold">Friday</span>
            </div>

            <div className="flex gap-8 text-sm text-muted-foreground">
              <Link
                href="/privacy"
                className="hover:text-foreground transition-colors"
              >
                Privacy
              </Link>
              <Link
                href="/terms"
                className="hover:text-foreground transition-colors"
              >
                Terms
              </Link>
              <Link
                href="/support"
                className="hover:text-foreground transition-colors"
              >
                Support
              </Link>
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
