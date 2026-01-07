"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { SignUpForm, SignInForm } from "@/components/auth/auth-forms";
import { PasskeyRegistration } from "@/components/auth/passkey-registration";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { authClient } from "@/lib/auth-client";

type AuthStep = "choice" | "sign-up" | "sign-in" | "passkey-registration";

export default function AuthPage() {
  const [step, setStep] = useState<AuthStep>("choice");
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    // Automatically attempt passkey authentication on page load
    const attemptPasskeyAuth = async () => {
      try {
        const response = await authClient.signIn.passkey({
          autoFill: false,
        });
        
        
        if (response.error) {
          return;
        }
        
        if (response.data) {
          // Wait a moment for session to be established before redirecting
          await new Promise(resolve => setTimeout(resolve, 500));
          router.push("/app");
        }
      } catch (err: any) {
      }
    };
    
    // Small delay to ensure page is fully loaded
    const timer = setTimeout(() => {
      attemptPasskeyAuth();
    }, 100);
    
    return () => clearTimeout(timer);
  }, [router]);



  const handleSignUpSuccess = (userData: any) => {
    setUser(userData);
    setStep("passkey-registration");
  };

  const handleSignInSuccess = (userData: any) => {
    setUser(userData);
    setStep("passkey-registration");
  };

  const handlePasskeySuccess = () => {
    // After successful passkey registration, redirect to dashboard
    // For now, just show a success message
    window.location.href = "/";
  };

  const handlePasskeySkip = () => {
    // Skip passkey registration and redirect to dashboard
    window.location.href = "/";
  };

  const handleBack = () => {
    setUser(null);
    setStep("choice");
  };

  if (step === "passkey-registration" && user) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center bg-gradient-to-br from-background to-muted/20 p-4">
        <div className="w-full max-w-md">
          <PasskeyRegistration
            onSuccess={handlePasskeySuccess}
            onSkip={handlePasskeySkip}
          />
        </div>
      </div>
    );
  }



  if (step === "sign-up") {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center bg-gradient-to-br from-background to-muted/20 p-4">
        <div className="w-full max-w-md space-y-4">
          <SignUpForm onSuccess={handleSignUpSuccess} />
          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Button
              variant="link"
              className="p-0 h-auto"
              onClick={() => setStep("sign-in")}
            >
              Sign In
            </Button>
          </p>
        </div>
      </div>
    );
  }

  if (step === "sign-in") {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center bg-gradient-to-br from-background to-muted/20 p-4">
        <div className="w-full max-w-md space-y-4">
          <SignInForm onSuccess={handleSignInSuccess} />
          <p className="text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Button
              variant="link"
              className="p-0 h-auto"
              onClick={() => setStep("sign-up")}
            >
              Sign Up
            </Button>
          </p>
        </div>
      </div>
    );
  }

  // Choice step
  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center bg-gradient-to-br from-background to-muted/20 p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold">Welcome</h1>
          <p className="text-muted-foreground">
            Sign in or create an account to continue
          </p>
        </div>

        <Card className="p-6 space-y-3">
          <Button
            className="w-full"
            size="lg"
            onClick={() => setStep("sign-in")}
          >
            Sign In
          </Button>
          <Button
            className="w-full"
            size="lg"
            variant="outline"
            onClick={() => setStep("sign-up")}
          >
            Create Account
          </Button>
        </Card>

        <p className="text-xs text-center text-muted-foreground">
          By continuing, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
}
