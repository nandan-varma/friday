import Link from "next/link"
import { Calendar, Bot, Clock, Users, Zap, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold">Friday</span>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" asChild>
              <Link href="/login">Sign In</Link>
            </Button>
            <Button asChild>
              <Link href="/signup">Get Started</Link>
            </Button>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-5xl font-bold mb-6">Your AI-Powered Calendar Assistant</h1>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          Schedule smarter, not harder. Let AI handle your calendar management with natural language input and
          intelligent suggestions.
        </p>
        <div className="flex gap-4 justify-center">
          <Button size="lg" asChild>
            <Link href="/signup">Start Free Trial</Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="#features">Learn More</Link>
          </Button>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="container mx-auto px-4 py-20">
        <h2 className="text-3xl font-bold text-center mb-12">Features that save you time</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <Bot className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Natural Language Input</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Create events by typing naturally. "Lunch with Sarah next Tuesday at 1pm" - and we'll handle the rest.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Zap className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Smart Scheduling</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                AI suggests optimal meeting times based on your availability and preferences. No more back-and-forth
                emails.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Clock className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Intelligent Reminders</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Get reminders when you need them. AI learns your habits and sends notifications at the perfect time.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Users className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Conflict Resolution</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Double-booked? AI automatically detects conflicts and suggests alternative times that work for everyone.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Calendar className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Multi-Calendar Sync</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Connect Google Calendar, Outlook, and more. Keep all your calendars in sync automatically.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Shield className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Privacy First</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Your data is encrypted and secure. We never share your calendar information with third parties.
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-3xl">Ready to get started?</CardTitle>
            <CardDescription className="text-lg">
              Join thousands of professionals who've simplified their scheduling with AI Calendar.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button size="lg" asChild>
              <Link href="/signup">Start Your Free Trial</Link>
            </Button>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 border-t">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">© 2024 AI Calendar. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">
              Privacy
            </Link>
            <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">
              Terms
            </Link>
            <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">
              Contact
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
