import createIntlMiddleware from "next-intl/middleware";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { routing } from "@/i18n/routing";
import { getToken } from "next-auth/jwt";

const intlMiddleware = createIntlMiddleware(routing);

const publicPaths = ["/login", "/register"];

function getPathWithoutLocale(pathname: string): string {
  return pathname.replace(/^\/(en|el)/, "") || "/";
}

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip API routes
  if (pathname.startsWith("/api")) {
    return NextResponse.next();
  }

  // Apply intl middleware
  const intlResponse = intlMiddleware(request);

  const pathWithoutLocale = getPathWithoutLocale(pathname);

  // Check if public path
  if (publicPaths.some((p) => pathWithoutLocale.startsWith(p))) {
    return intlResponse;
  }

  // Check auth using JWT (works in Edge runtime)
  const token = await getToken({ req: request });

  if (!token) {
    const locale = pathname.match(/^\/(en|el)/)?.[1] || "en";
    const loginUrl = new URL(`/${locale}/login`, request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Role-based route protection
  const role = token.role as string;

  if (pathWithoutLocale.startsWith("/supplier") && role !== "SUPPLIER") {
    const locale = pathname.match(/^\/(en|el)/)?.[1] || "en";
    return NextResponse.redirect(new URL(`/${locale}`, request.url));
  }

  if (pathWithoutLocale.startsWith("/admin") && role !== "ADMIN") {
    const locale = pathname.match(/^\/(en|el)/)?.[1] || "en";
    return NextResponse.redirect(new URL(`/${locale}`, request.url));
  }

  return intlResponse;
}

export const config = {
  matcher: ["/((?!_next|favicon.ico|api|.*\\..*).*)" ],
};
