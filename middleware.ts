import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"

export async function middleware(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    });

    const isAuthPage = request.nextUrl.pathname.startsWith("/login") ||
                       request.nextUrl.pathname.startsWith("/signup");
    const isPublicPage = request.nextUrl.pathname === "/" ||
                         request.nextUrl.pathname.startsWith("/privacy") ||
                         request.nextUrl.pathname.startsWith("/service");

    // Prevent redirect loops and add API route exclusion
    if (!session && !isAuthPage && !isPublicPage && !request.nextUrl.pathname.startsWith("/api")) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    if (session && isAuthPage) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    return NextResponse.next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return NextResponse.redirect(new URL("/login", request.url));
  }
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
