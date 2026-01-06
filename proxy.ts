import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

export const auth_protected_routes = [
  '/api/calendars',
  '/api/events',
  '/app'
];

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  const session = await auth.api.getSession({
        headers: await headers()
    })
  
  return NextResponse.next()
}