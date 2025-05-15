import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server';

const protectedRoutes = createRouteMatcher([
  "/dashboard(.*)",  
  "/lists/:path*",      // /lists/a o /lists/favoritas?shared=true
]);

export default clerkMiddleware(async (auth, req) => {
  const { pathname, searchParams } = req.nextUrl;

  // Listas públicas (por slug)
  if (pathname.startsWith("/lists/") && !searchParams.has("shared")) {
    // Supón que si la ruta es /lists/[slug] y la lista es pública,
    // no protegemos: simplemente Next.js cargará la página públicamente.
    return NextResponse.next();
  }

  // Listas privadas
  if (pathname.startsWith("/lists/") && searchParams.has("shared")) {
    // Si tienen ?shared=true, permitimos ver la página,
    // pero para comentar se chequeará sesión en cliente.
    return NextResponse.next();
  }

  // Otras rutas protegidas (dashboard, books, etc.)
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