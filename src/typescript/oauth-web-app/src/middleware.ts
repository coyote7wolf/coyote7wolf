import { NextRequest, NextResponse } from "next/server";
import type { NextMiddleware } from "next/server";

const PROTECTED_ROUTES = ["/dashboard"];
const AUTH_ROUTES = ["/login", "/register"];

export const middleware: NextMiddleware = (request: NextRequest) => {
  const { pathname } = request.nextUrl;
  const authCookie = request.cookies.get("auth_user")?.value;

  // Redirect authenticated users away from auth pages
  if (AUTH_ROUTES.includes(pathname) && authCookie) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Redirect unauthenticated users away from protected routes
  if (PROTECTED_ROUTES.includes(pathname) && !authCookie) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
};

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     */
    "/((?!_next/static|_next/image|favicon.ico|public).*)",
  ],
};
