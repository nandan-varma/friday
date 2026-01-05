"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Alert } from "@/components/ui/alert";
import { Spinner } from "@/components/ui/spinner";

interface PasskeyRegistrationProps {
  onSuccess: () => void;
  onSkip: () => void;
}

export function PasskeyRegistration({
  onSuccess,
  onSkip,
}: PasskeyRegistrationProps) {
  const [passkeyName, setPasskeyName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleRegisterPasskey = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { data, error: passkeyError } =
        await authClient.passkey.addPasskey({
          name: passkeyName || undefined,
          authenticatorAttachment: "cross-platform",
        });

      if (passkeyError) {
        // If user cancels or doesn't have passkey available, it's not a critical error
        if (
          passkeyError.message?.includes("NotAllowedError") ||
          passkeyError.message?.includes("cancel")
        ) {
          setError("Passkey registration was cancelled. You can add it later.");
        } else {
          setError(passkeyError.message || "Failed to register passkey");
        }
        return;
      }

      if (data) {
        setSuccess(true);
        setPasskeyName("");
        setTimeout(() => {
          onSuccess();
        }, 2000);
      }
    } catch (err: any) {
      // Handle NotAllowedError gracefully
      if (err.message?.includes("NotAllowedError")) {
        setError("Passkey registration was cancelled. You can add it later.");
      } else {
        setError(err.message || "Failed to register passkey");
      }
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <Card className="w-full max-w-md mx-auto p-6">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 bg-green-500/10 rounded-full flex items-center justify-center mx-auto">
            <svg
              className="w-6 h-6 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold">Passkey Registered!</h3>
          <p className="text-sm text-muted-foreground">
            Your passkey has been successfully registered. You can now use it to
            sign in securely.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto p-6">
      <h2 className="text-2xl font-bold mb-2">Secure Your Account</h2>
      <p className="text-sm text-muted-foreground mb-6">
        Register a passkey for passwordless, secure login. You can add more
        later.
      </p>

      <form onSubmit={handleRegisterPasskey} className="space-y-4">
        {error && (
          <Alert className="bg-destructive/10 text-destructive border-destructive/20">
            {error}
          </Alert>
        )}

        <div>
          <Label htmlFor="passkeyName">Passkey Name (Optional)</Label>
          <Input
            id="passkeyName"
            type="text"
            placeholder="e.g., My Fingerprint"
            value={passkeyName}
            onChange={(e) => setPasskeyName(e.target.value)}
            disabled={loading}
          />
          <p className="text-xs text-muted-foreground mt-1">
            Give your passkey a descriptive name to identify it later
          </p>
        </div>

        <div className="space-y-2">
          <Button
            type="submit"
            className="w-full"
            disabled={loading}
            variant="default"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <Spinner className="w-4 h-4" />
                Registering Passkey...
              </span>
            ) : (
              "Register Passkey"
            )}
          </Button>

          <Button
            type="button"
            className="w-full"
            disabled={loading}
            variant="outline"
            onClick={onSkip}
          >
            Skip for Now
          </Button>
        </div>

        <p className="text-xs text-muted-foreground text-center">
          You can add a passkey to your account settings at any time
        </p>
      </form>
    </Card>
  );
}
