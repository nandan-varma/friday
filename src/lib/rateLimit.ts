import { NextRequest, NextResponse } from 'next/server'

// Simple in-memory rate limiter
// In production, use Redis or a proper rate limiting service
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

const WINDOW_MS = 60 * 1000 // 1 minute
const MAX_REQUESTS = 10 // 10 requests per minute

export function rateLimit(request: NextRequest): NextResponse | null {
  const ip = request.headers.get('x-forwarded-for') ||
             request.headers.get('x-real-ip') ||
             'unknown'

  const now = Date.now()
  const windowKey = `${ip}:${Math.floor(now / WINDOW_MS)}`

  const current = rateLimitMap.get(windowKey) || { count: 0, resetTime: now + WINDOW_MS }

  if (now > current.resetTime) {
    // Reset window
    rateLimitMap.set(windowKey, { count: 1, resetTime: now + WINDOW_MS })
  } else if (current.count >= MAX_REQUESTS) {
    // Rate limit exceeded
    const resetTime = new Date(current.resetTime)
    return NextResponse.json(
      {
        error: 'Too many requests',
        retryAfter: Math.ceil((current.resetTime - now) / 1000)
      },
      {
        status: 429,
        headers: {
          'Retry-After': Math.ceil((current.resetTime - now) / 1000).toString(),
          'X-RateLimit-Limit': MAX_REQUESTS.toString(),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': resetTime.toISOString()
        }
      }
    )
  } else {
    // Increment count
    rateLimitMap.set(windowKey, { count: current.count + 1, resetTime: current.resetTime })
  }

  return null
}

// Clean up old entries periodically
setInterval(() => {
  const now = Date.now()
  for (const [key, value] of rateLimitMap.entries()) {
    if (now > value.resetTime) {
      rateLimitMap.delete(key)
    }
  }
}, WINDOW_MS)