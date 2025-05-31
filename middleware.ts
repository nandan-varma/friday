import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const authToken = request.cookies.get("auth-token")
  const isAuthPage = request.nextUrl.pathname.startsWith("/auth")
  const isPublicPage = request.nextUrl.pathname === "/" || 
                       request.nextUrl.pathname.startsWith("/privacy") ||
                       request.nextUrl.pathname.startsWith("/service")

  // If user is not authenticated and trying to access protected routes
  if (!authToken && !isAuthPage && !isPublicPage) {
    return NextResponse.redirect(new URL("/auth", request.url))
  }

  // If user is authenticated and trying to access auth pages
  if (authToken && isAuthPage) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
