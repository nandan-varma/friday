"use client"

import { useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'

function GoogleAuthCallbackContent() {
    const searchParams = useSearchParams()

    useEffect(() => {
        const code = searchParams.get('code')
        const error = searchParams.get('error')

        if (code) {
            // Send success message to parent window
            window.opener?.postMessage(
                { type: 'GOOGLE_AUTH_SUCCESS', code },
                window.location.origin
            )
        } else if (error) {
            // Send error message to parent window
            window.opener?.postMessage(
                { type: 'GOOGLE_AUTH_ERROR', error },
                window.location.origin
            )
        }

        // Close the popup
        window.close()
    }, [searchParams])

    return (
        <div className="text-center">
            <h1 className="text-xl font-semibold mb-2">Connecting to Google Calendar...</h1>
            <p className="text-muted-foreground">This window will close automatically.</p>
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
