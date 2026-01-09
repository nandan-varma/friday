'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { authClient } from '@/lib/auth-client'
import { Spinner } from '@/components/ui/spinner'

function GithubCallbackContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing')
  const [message, setMessage] = useState<string>('Connecting to GitHub...')

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get authorization code from URL
        const code = searchParams.get('code')
        const error = searchParams.get('error')

        if (error) {
          setStatus('error')
          setMessage(`Authorization failed: ${error}`)
          setTimeout(() => router.push('/settings'), 3000)
          return
        }

        if (!code) {
          setStatus('error')
          setMessage('No authorization code received')
          setTimeout(() => router.push('/settings'), 3000)
          return
        }

        // Verify user is authenticated
        const session = await authClient.getSession()
        if (!session) {
          setStatus('error')
          setMessage('Please sign in first')
          setTimeout(() => router.push('/auth'), 3000)
          return
        }

        // Exchange code for tokens
        const response = await fetch('/api/integrations/github/callback', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ code }),
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Failed to connect GitHub')
        }

        setStatus('success')
        setMessage('Successfully connected GitHub!')
        setTimeout(() => router.push('/settings'), 2000)
      } catch (error) {
        console.error('GitHub callback error:', error)
        setStatus('error')
        setMessage(error instanceof Error ? error.message : 'An error occurred')
        setTimeout(() => router.push('/settings'), 3000)
      }
    }

    handleCallback()
  }, [searchParams, router])

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-card border rounded-lg p-8 text-center space-y-4">
        {status === 'processing' && (
          <>
            <Spinner className="mx-auto size-12" />
            <h2 className="text-xl font-semibold">Connecting...</h2>
            <p className="text-muted-foreground">{message}</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="w-12 h-12 mx-auto rounded-full bg-green-500/10 flex items-center justify-center">
              <svg
                className="w-6 h-6 text-green-500"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-green-500">Success!</h2>
            <p className="text-muted-foreground">{message}</p>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="w-12 h-12 mx-auto rounded-full bg-destructive/10 flex items-center justify-center">
              <svg
                className="w-6 h-6 text-destructive"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-destructive">Error</h2>
            <p className="text-muted-foreground">{message}</p>
          </>
        )}
      </div>
    </div>
  )
}

export default function GithubCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Spinner className="size-12" />
      </div>
    }>
      <GithubCallbackContent />
    </Suspense>
  )
}
