import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { createRouteMatcher } from "@clerk/nextjs/server";

// Define protected routes using route matcher
const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/resume(.*)",
  "/coverletter(.*)",
  "/ai-assistant-interview(.*)",
  "/refinejd(.*)",
  "/ai-resume-review(.*)",
  "/onboarding(.*)",
]);

// Middleware handler wrapped with Clerk's `withAuth` function for authentication
export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth();  // Get userId from Clerk's auth context

  if (!userId && isProtectedRoute(req)) {
    // If no user is authenticated and trying to access protected routes, redirect to sign-in
    const { redirectToSignIn } = await auth();
    return redirectToSignIn();
  }

  // Allow request to continue if user is authenticated or not accessing protected route
  return NextResponse.next();
});

// Define the configuration for the middleware to match specific routes
export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}; 