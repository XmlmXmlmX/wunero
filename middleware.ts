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

  // Redirect /auth/* and /profile to locale-prefixed versions
  if (pathname.startsWith("/auth/") || pathname === "/profile") {
    const localeMatch = pathname.match(localeRegex);
    const locale = localeMatch?.[1] ?? routing.defaultLocale;
    
    // Preserve query parameters
    const search = request.nextUrl.search;
    const newUrl = new URL(`/${locale}${pathname}${search}`, request.nextUrl.origin);
    return NextResponse.redirect(newUrl);
  }

  // Handle i18n routing first
  const intlResponse = intlMiddleware(request);
  
  // If intl middleware wants to redirect (e.g., / -> /de), do it
  if (intlResponse.status === 307 || intlResponse.status === 308 || intlResponse.headers.get("location")) {
    return intlResponse;
  }

  const localeMatch = pathname.match(localeRegex);
  const locale = localeMatch?.[1] ?? routing.defaultLocale;
  const pathnameWithoutLocale = pathname.replace(localeRegex, "");

  const protectedRoutes = ["/wishlists", "/profile"];
  const isProtected = protectedRoutes.some(route => pathnameWithoutLocale.startsWith(route));

  if (!isProtected) return intlResponse;

  // getToken works in the Edge runtime and avoids importing the DB-heavy auth helper
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
  if (!token?.id) {
    const signInUrl = new URL(`/${locale}/auth/signin`, request.nextUrl.origin);
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
     * - public folder
     */
    "/((?!api|_next/static|_next/image|favicon.ico|public).*)",
  ],
};
