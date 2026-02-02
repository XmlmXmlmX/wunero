import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import createMiddleware from "next-intl/middleware";
import { routing } from "./src/i18n";
import type {} from "@/types/next-auth";

const intlMiddleware = createMiddleware(routing);

const localeRegex = new RegExp(`^/(${routing.locales.join("|")})(?=/|$)`);

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  
  console.log('[Middleware] Processing:', pathname);
  
  const localeMatch = pathname.match(localeRegex);
  
  // If no locale prefix, let intlMiddleware handle it (it will redirect to add locale)
  if (!localeMatch) {
    console.log('[Middleware] No locale match, calling intlMiddleware for:', pathname);
    return intlMiddleware(request);
  }

  // We have a locale prefix, extract it
  const locale = localeMatch[1];
  const pathnameWithoutLocale = pathname.replace(localeRegex, "");
  
  console.log('[Middleware] Locale:', locale, 'Path without locale:', pathnameWithoutLocale);

  // Check if this is a protected route
  const protectedRoutes = ["/wishlists", "/profile"];
  const isProtected = protectedRoutes.some(route => pathnameWithoutLocale.startsWith(route));

  if (!isProtected) {
    return intlMiddleware(request);
  }

  // For protected routes, check authentication
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
  if (!token?.id) {
    const signInUrl = new URL(`/${locale}/auth/signin`, request.nextUrl.origin);
    signInUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(signInUrl);
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images, icons, and other public assets
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|xml|webmanifest)$).*)",
  ],
};
