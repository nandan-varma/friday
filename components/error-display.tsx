"use client"

import { Button } from "@/components/ui/button"

interface ErrorDisplayProps {
  error: Error & { digest?: string }
  reset?: () => void
  message?: string
}

// Shared error boundary UI: a red-outlined status stamp, a plain-language
// explanation, the monospace error code, and recovery actions.
export function ErrorDisplay({ error, reset, message }: ErrorDisplayProps) {
  const code = error.digest ?? "ERR_UNKNOWN"

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="frame-corners relative w-full max-w-md border border-destructive bg-card p-6">
        <div className="mb-4 inline-flex items-center gap-2 border border-destructive px-3 py-1">
          <span className="size-2 bg-destructive" />
          <span className="font-mono text-xs uppercase tracking-widest text-destructive">
            System Error
          </span>
        </div>

        <h1 className="text-xl font-semibold mb-2">Something went wrong</h1>
        <p className="text-sm text-muted-foreground mb-4">
          {message ?? "An unexpected error interrupted this request. You can retry the action or return to a known-good state."}
        </p>

        <div className="mb-6 border border-border bg-muted px-3 py-2">
          <div className="text-[10px] font-mono uppercase tracking-wide text-muted-foreground mb-1">
            Error Code
          </div>
          <div className="font-mono text-xs break-all text-foreground">{code}</div>
        </div>

        <div className="flex gap-2">
          {reset && (
            <Button onClick={reset} className="flex-1">
              Try again
            </Button>
          )}
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => {
              window.location.href = "/"
            }}
          >
            Go home
          </Button>
        </div>
      </div>
    </div>
  )
}
