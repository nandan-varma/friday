"use client"

import { useEffect, Suspense, useState } from 'react'
import { useSearchParams } from 'next/navigation'

function GoogleAuthCallbackContent() {
    const searchParams = useSearchParams()
    const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing')

    useEffect(() => {
        const handleCallback = async () => {
            const code = searchParams.get('code')
            const error = searchParams.get('error')
            const state = searchParams.get('state')

            // Validate state parameter for CSRF protection
            const storedState = sessionStorage.getItem('google_oauth_state')
            if (state && storedState && state !== storedState) {
                console.error('CSRF attack detected: state parameter mismatch')
                setStatus('error')
                window.opener?.postMessage(
                    { type: 'GOOGLE_AUTH_ERROR', error: 'CSRF validation failed' },
                    window.location.origin
                )
                setTimeout(() => window.close(), 2000)
                return
            }

            // Clear the stored state
            if (storedState) {
                sessionStorage.removeItem('google_oauth_state')
            }

            if (error) {
                // Send error message to parent window
                setStatus('error')
                window.opener?.postMessage(
                    { type: 'GOOGLE_AUTH_ERROR', error },
                    window.location.origin
                )
                setTimeout(() => window.close(), 2000)
                return
            }

            if (code) {
                try {
                    // Exchange code for tokens on the server
                    const response = await fetch('/api/auth/google/callback', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ code, state }),
                    })

                    if (!response.ok) {
                        const errorData = await response.json()
                        throw new Error(errorData.error || 'Failed to connect Google Calendar')
                    }

                    // Send success message to parent window
                    setStatus('success')
                    window.opener?.postMessage(
                        { type: 'GOOGLE_AUTH_SUCCESS' },
                        window.location.origin
                    )
                    setTimeout(() => window.close(), 1000)
                } catch (err) {
                    console.error('Error exchanging code for tokens:', err)
                    setStatus('error')
                    window.opener?.postMessage(
                        { type: 'GOOGLE_AUTH_ERROR', error: err instanceof Error ? err.message : 'Unknown error' },
                        window.location.origin
                    )
                    setTimeout(() => window.close(), 2000)
                }
            }
        }

        handleCallback()
    }, [searchParams])

    return (
        <div className="text-center">
            {status === 'processing' && (
                <>
                    <h1 className="text-xl font-semibold mb-2">Connecting to Google Calendar...</h1>
                    <p className="text-muted-foreground">Please wait while we complete the connection.</p>
                </>
            )}
            {status === 'success' && (
                <>
                    <h1 className="text-xl font-semibold mb-2 text-green-600">✓ Connected Successfully!</h1>
                    <p className="text-muted-foreground">This window will close automatically.</p>
                </>
            )}
            {status === 'error' && (
                <>
                    <h1 className="text-xl font-semibold mb-2 text-red-600">Connection Failed</h1>
                    <p className="text-muted-foreground">This window will close automatically.</p>
                </>
            )}
        </div>
    )
}

export default function GoogleAuthCallback() {
    return (
        <div className="flex items-center justify-center min-h-screen">
            <Suspense fallback={
                <div className="text-center">
                    <h1 className="text-xl font-semibold mb-2">Loading...</h1>
                    <p className="text-muted-foreground">Please wait...</p>
                </div>
            }>
                <GoogleAuthCallbackContent />
            </Suspense>
        </div>
    )
}
