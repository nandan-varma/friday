"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Spinner } from "@/components/ui/spinner";
import { HugeiconsIcon } from "@hugeicons/react";
import { Tick02Icon } from "@hugeicons/core-free-icons";

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
      <Card className="frame-corners relative w-full max-w-md mx-auto p-6">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border border-border flex items-center justify-center mx-auto">
            <HugeiconsIcon icon={Tick02Icon} strokeWidth={2} className="size-6 text-foreground" />
          </div>
          <h3 className="text-lg font-semibold">Passkey Registered</h3>
          <p className="text-sm text-muted-foreground">
            Your passkey has been successfully registered. You can now use it to
            sign in securely.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="frame-corners relative w-full max-w-md mx-auto p-6">
      <h2 className="text-2xl font-bold mb-2">Secure Your Account</h2>
      <p className="text-sm text-muted-foreground mb-6">
        Register a passkey for passwordless, secure login. You can add more
        later.
      </p>

      <form onSubmit={handleRegisterPasskey} className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-1.5">
          <Label htmlFor="passkeyName">Passkey Name (Optional)</Label>
          <Input
            id="passkeyName"
            type="text"
            placeholder="e.g., My Fingerprint"
            value={passkeyName}
            onChange={(e) => setPasskeyName(e.target.value)}
            disabled={loading}
          />
          <p className="text-xs font-mono text-muted-foreground">
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
