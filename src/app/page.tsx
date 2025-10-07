"use client";

import Link from "next/link";
import { Calendar, Bot, Clock, Users, Zap, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { motion } from "motion/react";

export default function HomePage() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
    },
    hover: {
      y: -8,
      scale: 1.02,
    },
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-background via-muted/50 to-background">
      {/* Header */}
      <motion.header
        className="container mx-auto px-4 py-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex items-center justify-between">
          <motion.div
            className="flex items-center gap-2"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
          >
            <Calendar className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold bg-linear-to-r from-foreground to-primary bg-clip-text text-transparent">
              Friday
            </span>
          </motion.div>
          <div className="flex items-center gap-4">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button variant="ghost" asChild>
                <Link href="/login">Sign In</Link>
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button asChild>
                <Link href="/dashboard">Get Started</Link>
              </Button>
            </motion.div>
          </div>
        </div>
      </motion.header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          <motion.h1
            className="text-5xl md:text-6xl font-bold mb-6 bg-linear-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent leading-tight"
            variants={itemVariants}
          >
            Your AI-Powered
            <br />
            Calendar Assistant
          </motion.h1>
          <motion.p
            className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed"
            variants={itemVariants}
          >
            Transform your scheduling experience with intelligent automation.
            Create events naturally, resolve conflicts instantly, and let AI
            optimize your time.
          </motion.p>
          <motion.div className="flex justify-center" variants={itemVariants}>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button size="lg" asChild>
                <Link href="/dashboard">Get Started</Link>
              </Button>
            </motion.div>
          </motion.div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section id="features" className="container mx-auto px-4 py-20">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          <motion.h2
            className="text-3xl md:text-4xl font-bold text-center mb-4"
            variants={itemVariants}
          >
            Features that{" "}
            <span className="bg-linear-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              save you time
            </span>
          </motion.h2>
          <motion.p
            className="text-lg text-muted-foreground text-center mb-16 max-w-2xl mx-auto"
            variants={itemVariants}
          >
            Discover how AI can revolutionize your scheduling workflow
          </motion.p>
        </motion.div>
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          <motion.div variants={cardVariants} whileHover="hover">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-linear-to-br from-card to-card/50 h-full">
              <CardHeader>
                <motion.div
                  whileHover={{ scale: 1.2 }}
                  transition={{ duration: 0.2 }}
                >
                  <Bot className="h-12 w-12 text-primary mb-4" />
                </motion.div>
                <CardTitle className="text-xl">
                  Natural Language Input
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base leading-relaxed">
                  Simply type &quot;Coffee with Alex tomorrow at 3pm&quot; and
                  watch as your calendar updates automatically. No forms, no
                  dropdowns—just natural conversation.
                </CardDescription>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={cardVariants} whileHover="hover">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-linear-to-br from-card to-card/50 h-full">
              <CardHeader>
                <motion.div
                  whileHover={{ scale: 1.2 }}
                  transition={{ duration: 0.2 }}
                >
                  <Zap className="h-12 w-12 text-primary mb-4" />
                </motion.div>
                <CardTitle className="text-xl">Smart Scheduling</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base leading-relaxed">
                  AI analyzes your schedule patterns and preferences to suggest
                  optimal meeting times. End the email tennis and find time that
                  works for everyone.
                </CardDescription>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={cardVariants} whileHover="hover">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-linear-to-br from-card to-card/50 h-full">
              <CardHeader>
                <motion.div
                  whileHover={{ scale: 1.2 }}
                  transition={{ duration: 0.2 }}
                >
                  <Clock className="h-12 w-12 text-primary mb-4" />
                </motion.div>
                <CardTitle className="text-xl">Intelligent Reminders</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base leading-relaxed">
                  Context-aware notifications that adapt to your habits. Get
                  reminded to leave early for traffic, or prep time for
                  important meetings.
                </CardDescription>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={cardVariants} whileHover="hover">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-linear-to-br from-card to-card/50 h-full">
              <CardHeader>
                <motion.div
                  whileHover={{ scale: 1.2 }}
                  transition={{ duration: 0.2 }}
                >
                  <Users className="h-12 w-12 text-primary mb-4" />
                </motion.div>
                <CardTitle className="text-xl">Conflict Resolution</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base leading-relaxed">
                  Double-booked meetings become a thing of the past. AI detects
                  conflicts instantly and suggests alternative times that work
                  for all participants.
                </CardDescription>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={cardVariants} whileHover="hover">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-linear-to-br from-card to-card/50 h-full">
              <CardHeader>
                <motion.div
                  whileHover={{ scale: 1.2 }}
                  transition={{ duration: 0.2 }}
                >
                  <Calendar className="h-12 w-12 text-primary mb-4" />
                </motion.div>
                <CardTitle className="text-xl">Universal Sync</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base leading-relaxed">
                  Connect Google Calendar, Outlook, Apple Calendar, and more.
                  One unified view of all your commitments across every platform
                  you use.
                </CardDescription>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={cardVariants} whileHover="hover">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-linear-to-br from-card to-card/50 h-full">
              <CardHeader>
                <motion.div
                  whileHover={{ scale: 1.2 }}
                  transition={{ duration: 0.2 }}
                >
                  <Shield className="h-12 w-12 text-primary mb-4" />
                </motion.div>
                <CardTitle className="text-xl">Privacy First</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base leading-relaxed">
                  End-to-end encryption keeps your data secure. We process
                  everything locally when possible and never share your
                  information with third parties.
                </CardDescription>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <Card className="max-w-3xl mx-auto border-0 shadow-xl transition-all duration-300 hover:shadow-2xl group bg-linear-to-br from-card via-card to-primary/5">
            <CardHeader className="pb-6">
              <motion.div
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.3 }}
              >
                <CardTitle className="text-3xl md:text-4xl bg-linear-to-r from-foreground to-primary bg-clip-text text-transparent">
                  Ready to get started?
                </CardTitle>
              </motion.div>
              <CardDescription className="text-lg md:text-xl mt-4 leading-relaxed">
                Experience the future of calendar management with AI-powered
                scheduling.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0 pb-8">
              <div className="flex justify-center">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button size="lg" asChild>
                    <Link href="/dashboard">Get Started</Link>
                  </Button>
                </motion.div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 border-t border-border/50">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              <p className="text-sm text-muted-foreground">
                © 2025 Friday - AI Calendar. All rights reserved.
              </p>
            </div>
            <div className="flex gap-6">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  href="/privacy"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200"
                >
                  Privacy Policy
                </Link>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  href="/service"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200"
                >
                  Terms of Service
                </Link>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  href="mailto:contact@nandan.fyi"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200"
                >
                  Contact Us
                </Link>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </footer>
    </div>
  );
}
