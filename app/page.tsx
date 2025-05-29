import Link from "next/link"
import { Calendar, Bot, Clock, Users, Zap, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted animate-in fade-in duration-1000">
      {/* Header */}
      <header className="container mx-auto px-4 py-6 animate-in slide-in-from-top duration-700">
        <nav className="flex items-center justify-between">
          <div className="flex items-center gap-2 hover:scale-105 transition-transform duration-300">
            <Calendar className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold">Friday</span>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" asChild className="hover:scale-105 transition-transform duration-300">
              <Link href="/login">Sign In</Link>
            </Button>
            <Button asChild className="hover:scale-105 transition-all duration-300 hover:shadow-lg">
              <Link href="/dashboard">Get Started</Link>
            </Button>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center animate-in fade-in slide-in-from-bottom duration-1000 delay-300">
        <h1 className="text-5xl font-bold mb-6 hover:scale-105 transition-transform duration-500">Your AI-Powered Calendar Assistant</h1>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto animate-in fade-in duration-1000 delay-500">
          Schedule smarter, not harder. Let AI handle your calendar management with natural language input and
          intelligent suggestions.
        </p>
        <div className="flex gap-4 justify-center animate-in fade-in slide-in-from-bottom duration-1000 delay-700">
          <Button size="lg" asChild className="hover:scale-110 hover:shadow-xl">
            <Link href="/dashboard">Get Started</Link>
          </Button>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="container mx-auto px-4 py-20 animate-in fade-in duration-1000 delay-1000">
        <h2 className="text-3xl font-bold text-center mb-12 hover:scale-105 transition-transform duration-500">Features that save you time</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="hover:scale-105 hover:shadow-xl transition-all duration-300 hover:-translate-y-2 group">
            <CardHeader>
              <Bot className="h-10 w-10 text-primary mb-2 group-hover:scale-110 transition-transform duration-300" />
              <CardTitle>Natural Language Input</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Create events by typing naturally. "Lunch with Sarah next Tuesday at 1pm" - and we'll handle the rest.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="hover:scale-105 hover:shadow-xl transition-all duration-300 hover:-translate-y-2 group delay-100">
            <CardHeader>
              <Zap className="h-10 w-10 text-primary mb-2 group-hover:scale-110 transition-transform duration-300" />
              <CardTitle>Smart Scheduling</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                AI suggests optimal meeting times based on your availability and preferences. No more back-and-forth
                emails.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="hover:scale-105 hover:shadow-xl transition-all duration-300 hover:-translate-y-2 group delay-200">
            <CardHeader>
              <Clock className="h-10 w-10 text-primary mb-2 group-hover:scale-110 transition-transform duration-300" />
              <CardTitle>Intelligent Reminders</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Get reminders when you need them. AI learns your habits and sends notifications at the perfect time.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="hover:scale-105 hover:shadow-xl transition-all duration-300 hover:-translate-y-2 group delay-300">
            <CardHeader>
              <Users className="h-10 w-10 text-primary mb-2 group-hover:scale-110 transition-transform duration-300" />
              <CardTitle>Conflict Resolution</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Double-booked? AI automatically detects conflicts and suggests alternative times that work for everyone.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="hover:scale-105 hover:shadow-xl transition-all duration-300 hover:-translate-y-2 group delay-400">
            <CardHeader>
              <Calendar className="h-10 w-10 text-primary mb-2 group-hover:scale-110 transition-transform duration-300" />
              <CardTitle>Multi-Calendar Sync</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Connect Google Calendar, Outlook, and more. Keep all your calendars in sync automatically.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="hover:scale-105 hover:shadow-xl transition-all duration-300 hover:-translate-y-2 group delay-500">
            <CardHeader>
              <Shield className="h-10 w-10 text-primary mb-2 group-hover:scale-110 transition-transform duration-300" />
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
      <section className="container mx-auto px-4 py-20 text-center animate-in fade-in slide-in-from-bottom duration-1000 delay-1200">
        <Card className="max-w-2xl mx-auto hover:scale-105 hover:shadow-2xl transition-all duration-500 group">
          <CardHeader>
            <CardTitle className="text-3xl group-hover:scale-105 transition-transform duration-300">Ready to get started?</CardTitle>
            <CardDescription className="text-lg">
              Join thousands of professionals who've simplified their scheduling with AI Calendar.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button size="lg" asChild className="hover:scale-110 hover:shadow-xl">
              <Link href="/dashboard">Get Started</Link>
            </Button>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 border-t animate-in fade-in duration-1000 delay-1500">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">© 2024 Friday - AI Calendar. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-300 hover:scale-105 transform">
              Privacy
            </Link>
            <Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-300 hover:scale-105 transform">
              Terms
            </Link>
            <Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-300 hover:scale-105 transform">
              Contact
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
