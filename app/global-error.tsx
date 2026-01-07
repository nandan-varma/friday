'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle } from 'lucide-react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html>
      <body className="flex items-center justify-center min-h-screen bg-linear-to-b from-background to-muted p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="flex flex-col items-center gap-2 text-center">
            <div className="rounded-full bg-destructive/10 p-3">
              <AlertCircle className="h-6 w-6 text-destructive" />
            </div>
            <CardTitle>Something went wrong!</CardTitle>
            <CardDescription>
              An unexpected error occurred. Please try again or contact support if the problem persists.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error.message && (
              <div className="rounded-lg bg-muted p-3 text-xs font-mono text-muted-foreground wrap-break-word">
                {error.message}
              </div>
            )}
            <div className="flex gap-2">
              <Button onClick={() => reset()} className="flex-1" variant="default">
                Try again
              </Button>
              <Button onClick={() => window.location.href = '/'} className="flex-1" variant="outline">
                Go home
              </Button>
            </div>
          </CardContent>
        </Card>
      </body>
    </html>
  )
}