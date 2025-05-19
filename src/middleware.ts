import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server';

const protectedRoutes = createRouteMatcher([
  "/dashboard(.*)",
  "/lists/(.*)",    // todas las /lists/*
]);

export default clerkMiddleware(async (auth, req: NextRequest) => {
  const { pathname, searchParams } = req.nextUrl;

  if (pathname.startsWith('/accept-invitation')) {
    return NextResponse.next();
  }

  // 1) Listas públicas sin params → NEXT
  if (
    pathname.startsWith("/lists/") &&
    !searchParams.has("shared") &&
    !searchParams.has("__clerk_status") &&
    !searchParams.has("__clerk_ticket")
  ) {
    return NextResponse.next();
  }

  // 2) Flujo de invitación Clerk → NEXT
  if (
    pathname.startsWith("/lists/") &&
    searchParams.get("__clerk_status") === "sign_in" &&
    searchParams.has("__clerk_ticket")
  ) {
    return NextResponse.next();
  }

  // 3) Resto de rutas protegidas (dashboard, API, listas privadas sin invite)
  if (protectedRoutes(req)) {
    await auth.protect();  // redirige al sign-in si no hay sesión
  }

  return NextResponse.next();
});

//TODO: Check clerkDocs to add middleware to protect API routes
// https://clerk.com/docs/references/nextjs/clerk-middleware

export const config = {
  matcher: [ 
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}