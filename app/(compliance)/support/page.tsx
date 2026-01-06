"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import { Mail02Icon, CheckmarkCircle02Icon } from "@hugeicons/core-free-icons";

export default function SupportPage() {
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, you'd send this to a backend
    console.log("Form submitted:", formData);
    setFormSubmitted(true);
    setTimeout(() => {
      setFormSubmitted(false);
      setFormData({ name: "", email: "", subject: "", message: "" });
    }, 3000);
  };

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
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold tracking-tight mb-4">Support & Contact</h1>
            <p className="text-lg text-muted-foreground">
              We're here to help. Get in touch with us for any questions or issues.
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
                  Have a question or issue? Send us an email and we'll get back to you as soon as possible.
                </p>
                <a
                  href="mailto:contact@nandan.fyi"
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
                  We typically respond to support emails within 24 hours during business days.
                </p>
                <p className="text-sm text-muted-foreground">
                  For urgent issues, please include "URGENT" in your subject line.
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
              {formSubmitted ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <HugeiconsIcon icon={CheckmarkCircle02Icon} className="w-16 h-16 text-primary mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Message sent successfully!</h3>
                  <p className="text-muted-foreground mb-6">
                    Thank you for reaching out. We'll get back to you soon.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
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
              )}
            </CardContent>
          </Card>

          {/* FAQ Section */}
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
            <div className="grid gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">How do I reset my password?</CardTitle>
                </CardHeader>
                <CardContent className="text-muted-foreground">
                  Click on "Forgot password?" on the login page. Enter your email address and follow the instructions sent to your inbox.
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Why isn't my calendar syncing?</CardTitle>
                </CardHeader>
                <CardContent className="text-muted-foreground">
                  Calendar sync issues are usually due to permission changes. Try disconnecting and reconnecting your calendar in your Friday settings. Make sure to grant all necessary permissions.
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Can I export my calendar data?</CardTitle>
                </CardHeader>
                <CardContent className="text-muted-foreground">
                  Yes! You can export your calendar data as an ICS file from your account settings. This allows you to import your events into other calendar applications.
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">What if I want to delete my account?</CardTitle>
                </CardHeader>
                <CardContent className="text-muted-foreground">
                  You can delete your account and all associated data from your account settings. This action is permanent. Please contact us at contact@nandan.fyi if you need assistance.
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Is my calendar data backed up?</CardTitle>
                </CardHeader>
                <CardContent className="text-muted-foreground">
                  Yes, your calendar data is automatically backed up and encrypted. We maintain multiple secure backups to ensure your data is always protected.
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">How does Friday use AI?</CardTitle>
                </CardHeader>
                <CardContent className="text-muted-foreground">
                  Friday uses OpenAI's API to provide intelligent scheduling suggestions, smart event summaries, and natural language processing. When you use these features, event details are securely sent to OpenAI for processing. Your data is handled in accordance with OpenAI's privacy policy.
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Is my data shared with OpenAI?</CardTitle>
                </CardHeader>
                <CardContent className="text-muted-foreground">
                  When you use Friday's AI-powered features, certain event details are sent to OpenAI for processing. We only send the minimum information necessary. For details on how OpenAI handles your data, please review their privacy policy at{" "}
                  <a href="https://openai.com/privacy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">openai.com/privacy</a>.
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
