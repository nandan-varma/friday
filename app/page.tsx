
"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import { Calendar01Icon, Notification02Icon, AiCloudIcon, ArrowRight01Icon, CheckmarkCircle02Icon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Header } from "@/components/header";

function useScrollAnimation() {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, []);

  return { ref, isVisible };
}

export default function Page() {
  const router = useRouter();
  const featuresRef = useScrollAnimation();
  const faqRef = useScrollAnimation();
  const ctaRef = useScrollAnimation();
  
  return (
    <div className="min-h-screen bg-background">
        <Header />
      {/* Hero Section */}
      <section className="relative overflow-hidden px-6 pt-16 pb-20 lg:pt-24 lg:pb-32">
        {/* Gradient Background */}
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--primary)_0%,_transparent_50%)] opacity-20" />
        
        <div className="mx-auto max-w-4xl text-center">
          <Badge variant="secondary" className="mb-6">
            <HugeiconsIcon icon={Calendar01Icon} className="mr-1" />
            Built for busy professionals
          </Badge>
          
          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl lg:text-7xl mb-6">
            Never miss what matters
          </h1>
          
          <p className="text-lg text-muted-foreground sm:text-xl lg:text-2xl mb-8 max-w-2xl mx-auto">
            Stop juggling multiple calendars and missing important events. Friday uses AI to keep your schedule organized and sends smart reminders so you're always on time.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button size="lg" className="text-base px-8 group" onClick={() => router.push("/auth")}>
              Get started free
              <HugeiconsIcon icon={ArrowRight01Icon} className="ml-2 transition-transform group-hover:translate-x-1" />
            </Button>
            {/* <Button variant="outline" size="lg" className="text-base px-8">
              Watch demo
            </Button> */}
          </div>
        </div>
        
        {/* Hero Visual */}
        <div className="mx-auto mt-16 max-w-5xl">
          <div className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm p-4 shadow-2xl ring-1 ring-border/10">
            <div className="aspect-video rounded-lg bg-gradient-to-br from-primary/20 via-background to-accent/20 flex items-center justify-center">
              <HugeiconsIcon icon={Calendar01Icon} className="w-24 h-24 text-primary/40" />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" ref={featuresRef.ref} className={`px-6 py-20 lg:py-32 bg-muted/30 transition-all duration-700 ${featuresRef.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl mb-4">
              Everything you need to stay organized
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Powerful features designed to save you time and keep you on track.
            </p>
          </div>
          
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <FeatureCard
              icon={Calendar01Icon}
              title="Smart Scheduling"
              description="AI-powered suggestions find the perfect time for your events based on your habits and availability."
            />
            <FeatureCard
              icon={Notification02Icon}
              title="Intelligent Reminders"
              description="Get notified at the right time, not too early or too late. Context-aware notifications that adapt to your schedule."
            />
            <FeatureCard
              icon={AiCloudIcon}
              title="Calendar Sync"
              description="Seamlessly sync with Google Calendar, Outlook, and Apple Calendar. One unified view of everything."
            />
            <FeatureCard
              icon={CheckmarkCircle02Icon}
              title="Quick Event Creation"
              description="Create events in seconds with natural language input. Just type what you want and Friday handles the rest."
            />
            <FeatureCard
              icon={Calendar01Icon}
              title="Team Coordination"
              description="Share calendars and find meeting times that work for everyone. No more endless email chains."
            />
            <FeatureCard
              icon={AiCloudIcon}
              title="Privacy First"
              description="Your calendar data is encrypted and private. We never share or sell your information."
            />
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" ref={faqRef.ref} className={`px-6 py-20 lg:py-32 transition-all duration-700 ${faqRef.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <div className="mx-auto max-w-3xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
              Frequently asked questions
            </h2>
            <p className="text-lg text-muted-foreground">
              Everything you need to know about Friday
            </p>
          </div>
          
          <Accordion>
            <AccordionItem value="free">
              <AccordionTrigger>Is Friday really free?</AccordionTrigger>
              <AccordionContent>
                Yes! Friday is completely free to use with all features included. No hidden costs, no credit card required, and no premium tiers.
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="calendars">
              <AccordionTrigger>Which calendars can I sync?</AccordionTrigger>
              <AccordionContent>
                Friday supports Google Calendar, Microsoft Outlook, Apple Calendar (iCloud), and any calendar that uses the CalDAV protocol. Sync happens automatically in real-time.
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="privacy">
              <AccordionTrigger>Is my calendar data private?</AccordionTrigger>
              <AccordionContent>
                Absolutely. Your calendar data is encrypted both in transit and at rest. We never sell or share your data with third parties. You can delete your account and all associated data at any time.
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="mobile">
              <AccordionTrigger>Is there a mobile app?</AccordionTrigger>
              <AccordionContent>
                Yes! Friday is available on iOS and Android. All your calendars and settings sync seamlessly across all your devices.
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="limits">
              <AccordionTrigger>Are there any usage limits?</AccordionTrigger>
              <AccordionContent>
                No limits! You get unlimited calendar syncs, unlimited events, unlimited AI suggestions, and full access to all features completely free.
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="team">
              <AccordionTrigger>How does team sharing work?</AccordionTrigger>
              <AccordionContent>
                You can share specific calendars with team members, set permissions, and coordinate schedules. Team members can see availability without seeing private event details.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>

      {/* Final CTA Section */}
      <section ref={ctaRef.ref} className={`px-6 py-20 lg:py-32 bg-muted/30 transition-all duration-700 ${ctaRef.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl mb-6">
            Ready to take control of your time?
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of professionals who've already upgraded their calendar experience.
          </p>
          <Button size="lg" className="text-base px-8 group" onClick={() => router.push("/auth")}>
            Get started free
            <HugeiconsIcon icon={ArrowRight01Icon} className="ml-2 transition-transform group-hover:translate-x-1" />
          </Button>
          <p className="text-sm text-muted-foreground mt-4">
            Completely free · No credit card required
          </p>
        </div>
      </section>

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
              <a href="/privacy" className="hover:text-foreground transition-colors">Privacy</a>
              <a href="/terms" className="hover:text-foreground transition-colors">Terms</a>
              <a href="/support" className="hover:text-foreground transition-colors">Support</a>
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

function FeatureCard({ icon, title, description }: { icon: any; title: string; description: string }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 mb-4">
          <HugeiconsIcon icon={icon} className="text-primary" />
        </div>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
    </Card>
  );
}
