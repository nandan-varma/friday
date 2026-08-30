"use client";

import {
  AiCloudIcon,
  ArrowRight01Icon,
  Calendar01Icon,
  CheckmarkCircle02Icon,
  Notification02Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Header } from "@/components/header";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";

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
      { threshold: 0.1 },
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

  useEffect(() => {
    const checkSession = async () => {
      try {
        const session = await authClient.getSession();
        if (session.data?.user) {
          router.push("/app");
        }
      } catch {
        // Anonymous visitors remain on the public landing page.
      }
    };

    checkSession();
  }, [router]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      {/* Hero Section */}
      <section className="px-6 pt-16 pb-20 lg:pt-24 lg:pb-32">
        <div className="mx-auto max-w-4xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 border border-border px-3 py-1 font-mono text-xs uppercase tracking-wide text-muted-foreground">
            <HugeiconsIcon icon={Calendar01Icon} className="size-3.5" />
            Built for busy professionals
          </div>

          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl lg:text-7xl mb-6">
            Never miss what matters
          </h1>

          <p className="text-lg text-muted-foreground sm:text-xl lg:text-2xl mb-8 max-w-2xl mx-auto">
            Stop juggling multiple calendars and missing important events.
            Friday uses AI to keep your schedule organized and sends smart
            reminders so you're always on time.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              size="lg"
              className="text-base px-8 group"
              onClick={() => router.push("/auth")}
            >
              Get started free
              <HugeiconsIcon
                icon={ArrowRight01Icon}
                className="ml-2 transition-transform group-hover:translate-x-1"
              />
            </Button>
          </div>
        </div>

        {/* Hero Visual */}
        <div className="mx-auto mt-16 max-w-5xl">
          <div className="frame-corners relative border border-border bg-card p-4">
            <div className="aspect-video border border-border flex items-center justify-center">
              <HugeiconsIcon
                icon={Calendar01Icon}
                className="w-24 h-24 text-muted-foreground"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section
        id="features"
        ref={featuresRef.ref}
        className={`px-6 py-20 lg:py-32 border-t border-border transition-all duration-700 ${featuresRef.isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
      >
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl mb-4">
              Everything you need to stay organized
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Powerful features designed to save you time and keep you on track.
            </p>
          </div>

          <div className="grid gap-px bg-border md:grid-cols-2 lg:grid-cols-3">
            <FeatureCard
              icon={Calendar01Icon}
              title="Google Calendar Sync"
              description="Connect your Google Calendar and manage the calendars you choose from one focused view."
            />
            <FeatureCard
              icon={Notification02Icon}
              title="Clear Calendar Views"
              description="Switch between day, week, month, and agenda views to see your schedule at the right level of detail."
            />
            <FeatureCard
              icon={AiCloudIcon}
              title="AI Calendar Assistant"
              description="Ask the built-in assistant about your schedule or use it to help create and update Google Calendar events."
            />
            <FeatureCard
              icon={CheckmarkCircle02Icon}
              title="Quick Event Creation"
              description="Create events directly from the calendar and edit the details you need, including attendees and location."
            />
            <FeatureCard
              icon={Calendar01Icon}
              title="Recurring Events"
              description="Edit or move a single occurrence or an entire recurring Google Calendar series with a clear choice."
            />
            <FeatureCard
              icon={AiCloudIcon}
              title="Calendar Control"
              description="Choose which connected Google calendars appear in Friday, and change that selection whenever you need."
            />
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section
        id="faq"
        ref={faqRef.ref}
        className={`px-6 py-20 lg:py-32 border-t border-border transition-all duration-700 ${faqRef.isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
      >
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
                Friday is currently available without a paid plan. We will
                communicate any future pricing changes before they take effect.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="calendars">
              <AccordionTrigger>Which calendars can I sync?</AccordionTrigger>
              <AccordionContent>
                Friday currently supports Google Calendar. Outlook, iCloud, and
                CalDAV integrations are not available yet.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="privacy">
              <AccordionTrigger>Is my calendar data private?</AccordionTrigger>
              <AccordionContent>
                Friday only requests the Google Calendar access needed to
                provide calendar features. Review the Privacy Policy for the
                current details on data handling and account management.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="mobile">
              <AccordionTrigger>Is there a mobile app?</AccordionTrigger>
              <AccordionContent>
                Friday is a responsive web app. Native iOS and Android apps are
                not available yet.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="limits">
              <AccordionTrigger>Are there any usage limits?</AccordionTrigger>
              <AccordionContent>
                Current limits may depend on the connected services and the AI
                provider. Friday will show any applicable limits in-product.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="team">
              <AccordionTrigger>How does team sharing work?</AccordionTrigger>
              <AccordionContent>
                Team sharing is not available yet. Calendar permissions remain
                managed in Google Calendar.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>

      {/* Final CTA Section */}
      <section
        ref={ctaRef.ref}
        className={`px-6 py-20 lg:py-32 border-t border-border transition-all duration-700 ${ctaRef.isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
      >
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl mb-6">
            Ready to take control of your time?
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Connect your Google Calendar and keep your schedule in one place.
          </p>
          <Button
            size="lg"
            className="text-base px-8 group"
            onClick={() => router.push("/auth")}
          >
            Get started free
            <HugeiconsIcon
              icon={ArrowRight01Icon}
              className="ml-2 transition-transform group-hover:translate-x-1"
            />
          </Button>
          <p className="text-sm text-muted-foreground mt-4 font-mono">
            Completely free · No credit card required
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border px-6 py-12">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center border border-border bg-primary text-primary-foreground">
                <span className="text-lg font-bold">F</span>
              </div>
              <span className="text-xl font-bold">Friday</span>
            </div>

            <div className="flex gap-8 text-sm text-muted-foreground">
              <a
                href="/privacy"
                className="hover:text-foreground transition-colors"
              >
                Privacy
              </a>
              <a
                href="/terms"
                className="hover:text-foreground transition-colors"
              >
                Terms
              </a>
              <a
                href="/support"
                className="hover:text-foreground transition-colors"
              >
                Support
              </a>
            </div>

            <p className="text-sm text-muted-foreground font-mono">
              © 2026 Friday. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: IconSvgElement;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-background p-6">
      <div className="flex h-10 w-10 items-center justify-center border border-border mb-4">
        <HugeiconsIcon icon={icon} className="text-foreground" />
      </div>
      <h3 className="text-base font-medium mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
