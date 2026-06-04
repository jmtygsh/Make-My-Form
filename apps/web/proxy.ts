import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const AUTH_COOKIE_NAME = "authentication-token";

// Routes that require authentication
const protectedRoutes = ["/dashboard"];

// Auth routes that authenticated users should be redirected away from
const authRoutes = ["/login", "/registration", "/verify"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Verify auth cookie
  const authCookie = request.cookies.get(AUTH_COOKIE_NAME);
  const isAuthenticated = !!authCookie;

  // If authenticated and visiting auth routes, redirect to dashboard
  if (isAuthenticated && authRoutes.some((route) => pathname.startsWith(route))) {
    const dashboardUrl = new URL("/dashboard", request.url);
    return NextResponse.redirect(dashboardUrl);
  }

  // Check if this is a protected route
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // Skip auth check for public routes
  if (!isProtectedRoute) {
    return NextResponse.next();
  }

  // Redirect unauthenticated users to login
  if (!authCookie) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\..*|api/).*)",
  ],
};
