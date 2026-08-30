import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { createLogger } from '@/lib/logger';

const log = createLogger('proxy');

// Routes that never require a session. '/' is handled separately below so
// authenticated users can still be redirected from it to /app.
export const public_routes = [
    '/auth',
    '/privacy',
    '/terms',
    '/support',
];

function isPublicRoute(pathname: string): boolean {
    return public_routes.some(route => pathname === route || pathname.startsWith(route + '/'));
}

export async function proxy(request: NextRequest) {
    const pathname = request.nextUrl.pathname

    if (pathname !== '/' && isPublicRoute(pathname)) {
        log.debug('public route, passthrough', pathname)
        return NextResponse.next()
    }

    try {
        const session = await auth.api.getSession({
            headers: await headers()
        })

        if (!session?.user) {
            if (pathname === '/') {
                log.debug('unauthenticated, landing page passthrough')
                return NextResponse.next()
            }
            log.info('unauthenticated, redirecting to /auth', pathname)
            return NextResponse.redirect(new URL('/auth', request.url))
        }

        if (pathname === '/') {
            log.debug('authenticated on /, redirecting to /app', { userId: session.user.id })
            return NextResponse.redirect(new URL('/app', request.url))
        }

        log.debug('authenticated, passthrough', { pathname, userId: session.user.id })
        return NextResponse.next()
    } catch (error) {
        log.error('session check failed, redirecting to /auth', pathname, error)
        return NextResponse.redirect(new URL('/auth', request.url))
    }
}

export const config = {
    matcher: [
        // Match all routes except static files and API routes
        '/((?!_next/static|_next/image|favicon.ico|api).*)',
    ],
}
