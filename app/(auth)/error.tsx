'use client'

import { useEffect } from 'react'
import { ErrorDisplay } from '@/components/error-display'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return <ErrorDisplay error={error} reset={reset} message="Something interrupted authentication. Retry, or go back and start again." />
}
