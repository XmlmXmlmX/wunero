import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import createMiddleware from "next-intl/middleware";
import { routing } from "./src/i18n";
import type {} from "@/types/next-auth";

const intlMiddleware = createMiddleware(routing);

// Locale pattern: only 2 letter codes (de, en, etc.)
const localePattern = routing.locales.join("|");
const localeRegex = new RegExp(`^/(${localePattern})(?=/|$)`);

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  
  // Run intlMiddleware first - it handles locale detection and redirection
  const intlResponse = intlMiddleware(request);
  
  // If intlMiddleware is redirecting, return that response
  if (intlResponse.status !== 200) {
    return intlResponse;
  }

  // Extract locale from the path
  const localeMatch = pathname.match(localeRegex);
  
  // If no valid locale prefix, intlMiddleware already handled it
  if (!localeMatch) {
    return intlResponse;
  }

  const locale = localeMatch[1];
  const pathnameWithoutLocale = pathname.slice(`/${locale}`.length) || "/";

  // Check if this is a protected route
  const protectedRoutes = ["/wishlists", "/profile"];
  const isProtected = protectedRoutes.some(route => 
    pathnameWithoutLocale.startsWith(route)
  );

  if (!isProtected) {
    return intlResponse;
  }

  // For protected routes, check authentication
  const token = await getToken({ 
    req: request, 
    secret: process.env.NEXTAUTH_SECRET 
  });
  
  if (!token?.id) {
    const signInUrl = new URL(
      `/${locale}/auth/signin`, 
      request.nextUrl.origin
    );
    signInUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(signInUrl);
  }

  return intlResponse;
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
