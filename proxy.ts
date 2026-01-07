import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

export const public_routes = [
    '/',
    '/auth',
    '/privacy',
    '/terms',
];

function isPublicRoute(pathname: string): boolean {
    return public_routes.some(route => pathname === route || pathname.startsWith(route + '/'));
}

export async function proxy(request: NextRequest) {
    const pathname = request.nextUrl.pathname

    // Allow public routes
    if (isPublicRoute(pathname)) {
        return NextResponse.next()
    }

    // For protected routes, check if user is authenticated
    try {
        const session = await auth.api.getSession({
            headers: await headers()
        })

        // If not authenticated, redirect to auth
        if (!session?.user) {
            const authUrl = new URL('/auth', request.url)
            return NextResponse.redirect(authUrl)
        }

        // when authenticated, / should redirect to /app
        if(session.user && pathname === '/') {
            const appUrl = new URL('/app', request.url)
            return NextResponse.redirect(appUrl)
        }


        return NextResponse.next()
    } catch (error) {
        // If session check fails, redirect to auth
        const authUrl = new URL('/auth', request.url)
        return NextResponse.redirect(authUrl)
    }
}

export const config = {
    matcher: [
        // Match all routes except static files and API routes
        '/((?!_next/static|_next/image|favicon.ico|api).*)',
    ],
}