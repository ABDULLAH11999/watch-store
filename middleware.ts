import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

function hasSessionToken(req: NextRequest) {
  return Boolean(
    req.cookies.get("__Secure-authjs.session-token")?.value ||
      req.cookies.get("authjs.session-token")?.value ||
      req.cookies.get("__Secure-next-auth.session-token")?.value ||
      req.cookies.get("next-auth.session-token")?.value
  );
}

export default function middleware(req: NextRequest) {
  const { pathname, origin, search } = req.nextUrl;
  const isAuthed = hasSessionToken(req);

  if (pathname === "/admin/login") {
    if (isAuthed) {
      return NextResponse.redirect(new URL("/admin", origin));
    }

    return NextResponse.redirect(new URL(`/auth/admin-login${search}`, origin));
  }

  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    if (!isAuthed) {
      const loginUrl = new URL("/admin/login", origin);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin", "/admin/:path*"]
};
