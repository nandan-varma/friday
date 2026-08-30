'use client'

import { ErrorDisplay } from '@/components/error-display'

export default function AuthError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return <ErrorDisplay error={error} reset={reset} message="Something interrupted authentication. Retry, or go back and start again." />
}
