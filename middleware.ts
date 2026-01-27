import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import type {} from "@/types/next-auth";

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const protectedRoutes = ["/wishlists"];
  const isProtected = protectedRoutes.some(route => pathname.startsWith(route));

  if (!isProtected) return NextResponse.next();

  // getToken works in the Edge runtime and avoids importing the DB-heavy auth helper
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
  if (!token?.id) {
    const signInUrl = new URL("/auth/signin", request.nextUrl.origin);
    signInUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
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
