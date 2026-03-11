import NextAuth from "next-auth";
import { authConfig } from "./auth.config";
import { NextResponse } from "next/server";

// Initialize NextAuth strictly with the Edge-safe config
const { auth } = NextAuth(authConfig);

// We explicitly export the middleware function here
export default auth((req) => {
  // AUTH DISABLED FOR DEVELOPMENT — re-enable by removing this early return
  if (process.env.NODE_ENV === "development") {
    return NextResponse.next();
  }

  const isLoggedIn = !!req.auth;
  const { pathname } = req.nextUrl;

  // 1. Define the routes that require authentication
  const isProtectedRoute = 
    pathname.startsWith('/vault') || 
    pathname.startsWith('/upload') || 
    pathname.startsWith('/chat');

  // 2. If they are trying to access a protected route without logging in, bounce them
  if (isProtectedRoute && !isLoggedIn) {
    return NextResponse.redirect(new URL('/', req.nextUrl));
  }

  // 3. Otherwise, let them through
  return NextResponse.next();
});

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};