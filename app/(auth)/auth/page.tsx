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
  const [shouldRegisterPasskey, setShouldRegisterPasskey] = useState(false);
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
      } catch {}
    };
    
    // Small delay to ensure page is fully loaded
    const timer = setTimeout(() => {
      attemptPasskeyAuth();
    }, 100);
    
    return () => clearTimeout(timer);
  }, [router]);



  const handleSignUpSuccess = () => {
    setShouldRegisterPasskey(true);
    setStep("passkey-registration");
  };

  const handleSignInSuccess = handleSignUpSuccess;

  const handlePasskeySuccess = () => {
    // After successful passkey registration, redirect to dashboard
    // For now, just show a success message
    window.location.href = "/";
  };

  const handlePasskeySkip = () => {
    // Skip passkey registration and redirect to dashboard
    window.location.href = "/";
  };

  const handleGoogleSignIn = async () => {
    // Calendar scope is already requested by default for every Google flow
    // (see socialProviders.google.scope in lib/auth.ts) - no need to repeat it.
    await authClient.signIn.social({
      provider: "google",
      callbackURL: "/app",
    });
  };

  if (step === "passkey-registration" && shouldRegisterPasskey) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center bg-background p-4">
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
      <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center bg-background p-4">
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
      <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center bg-background p-4">
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
    <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold">Welcome</h1>
          <p className="text-muted-foreground">
            Sign in or create an account to continue
          </p>
        </div>

        <Card className="frame-corners relative p-6 space-y-3">
          <Button
            className="w-full"
            size="lg"
            variant="outline"
            onClick={handleGoogleSignIn}
          >
            Continue with Google
          </Button>
          <div className="relative py-2">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-card px-2 text-muted-foreground">or</span>
            </div>
          </div>
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
