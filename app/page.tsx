import Link from "next/link"
import { Calendar, Bot, Clock, Users, Zap, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default async function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/50 to-background">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <div className="flex items-center gap-2 transition-transform duration-200 hover:scale-105">
            <Calendar className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">Friday</span>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" asChild className="transition-all duration-200 hover:scale-105">
              <Link href="/register">Sign In</Link>
            </Button>
            <Button asChild className="transition-all duration-200 hover:scale-105 hover:shadow-lg">
              <Link href="/dashboard">Get Started</Link>
            </Button>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="opacity-0 animate-fade-in-up">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent leading-tight">
            Your AI-Powered
            <br />
            Calendar Assistant
          </h1>
        </div>
        <div className="opacity-0 animate-fade-in-up animation-delay-300">
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
            Transform your scheduling experience with intelligent automation. Create events naturally, 
            resolve conflicts instantly, and let AI optimize your time.
          </p>
        </div>
        <div className="opacity-0 animate-fade-in-up animation-delay-600">
          <div className="flex justify-center">
            <Button size="lg" variant="outline" asChild className="transition-all duration-200 hover:scale-105">
              <Link href="/dashboard">Get Started</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="container mx-auto px-4 py-20">
        <div className="opacity-0 animate-fade-in-up animation-delay-900">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
            Features that <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">save you time</span>
          </h2>
          <p className="text-lg text-muted-foreground text-center mb-16 max-w-2xl mx-auto">
            Discover how AI can revolutionize your scheduling workflow
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Card className="opacity-0 animate-fade-in-up animation-delay-1200 border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group bg-gradient-to-br from-card to-card/50">
            <CardHeader>
              <Bot className="h-12 w-12 text-primary mb-4 group-hover:scale-110 transition-transform duration-300" />
              <CardTitle className="text-xl">Natural Language Input</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base leading-relaxed">
                Simply type "Coffee with Alex tomorrow at 3pm" and watch as your calendar updates automatically. No forms, no dropdowns—just natural conversation.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="opacity-0 animate-fade-in-up animation-delay-1400 border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group bg-gradient-to-br from-card to-card/50">
            <CardHeader>
              <Zap className="h-12 w-12 text-primary mb-4 group-hover:scale-110 transition-transform duration-300" />
              <CardTitle className="text-xl">Smart Scheduling</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base leading-relaxed">
                AI analyzes your schedule patterns and preferences to suggest optimal meeting times. End the email tennis and find time that works for everyone.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="opacity-0 animate-fade-in-up animation-delay-1600 border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group bg-gradient-to-br from-card to-card/50">
            <CardHeader>
              <Clock className="h-12 w-12 text-primary mb-4 group-hover:scale-110 transition-transform duration-300" />
              <CardTitle className="text-xl">Intelligent Reminders</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base leading-relaxed">
                Context-aware notifications that adapt to your habits. Get reminded to leave early for traffic, or prep time for important meetings.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="opacity-0 animate-fade-in-up animation-delay-1800 border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group bg-gradient-to-br from-card to-card/50">
            <CardHeader>
              <Users className="h-12 w-12 text-primary mb-4 group-hover:scale-110 transition-transform duration-300" />
              <CardTitle className="text-xl">Conflict Resolution</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base leading-relaxed">
                Double-booked meetings become a thing of the past. AI detects conflicts instantly and suggests alternative times that work for all participants.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="opacity-0 animate-fade-in-up animation-delay-2000 border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group bg-gradient-to-br from-card to-card/50">
            <CardHeader>
              <Calendar className="h-12 w-12 text-primary mb-4 group-hover:scale-110 transition-transform duration-300" />
              <CardTitle className="text-xl">Universal Sync</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base leading-relaxed">
                Connect Google Calendar, Outlook, Apple Calendar, and more. One unified view of all your commitments across every platform you use.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="opacity-0 animate-fade-in-up animation-delay-2200 border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group bg-gradient-to-br from-card to-card/50">
            <CardHeader>
              <Shield className="h-12 w-12 text-primary mb-4 group-hover:scale-110 transition-transform duration-300" />
              <CardTitle className="text-xl">Privacy First</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base leading-relaxed">
                End-to-end encryption keeps your data secure. We process everything locally when possible and never share your information with third parties.
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="opacity-0 animate-fade-in-up animation-delay-2400">
          <Card className="max-w-3xl mx-auto border-0 shadow-xl transition-all duration-300 hover:shadow-2xl group bg-gradient-to-br from-card via-card to-primary/5">
            <CardHeader className="pb-6">
              <CardTitle className="text-3xl md:text-4xl group-hover:scale-105 transition-transform duration-300 bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
                Ready to get started?
              </CardTitle>
              <CardDescription className="text-lg md:text-xl mt-4 leading-relaxed">
                Experience the future of calendar management with AI-powered scheduling.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0 pb-8">
              <div className="flex justify-center">
                <Button size="lg" variant="outline" asChild className="transition-all duration-200 hover:scale-105">
                  <Link href="/dashboard">Get Started</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 border-t border-border/50">
        <div className="opacity-0 animate-fade-in animation-delay-2600">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              <p className="text-sm text-muted-foreground">© 2025 Friday - AI Calendar. All rights reserved.</p>
            </div>
            <div className="flex gap-6">
              <Link href="/privacy" className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200 hover:scale-105 transform">
                Privacy Policy
              </Link>
              <Link href="/service" className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200 hover:scale-105 transform">
                Terms of Service
              </Link>
              <Link href="mailto:contact@nandan.fyi" className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200 hover:scale-105 transform">
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
