import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/lib/auth";

export default auth((req: NextRequest & { auth?: { user?: { email?: string | null } } | null }) => {
  const { pathname } = req.nextUrl;

  if (pathname === "/admin/login") {
    if (req.auth?.user?.email) {
      return NextResponse.redirect(new URL("/admin", req.nextUrl.origin));
    }
    const rewriteUrl = new URL("/auth/admin-login", req.nextUrl.origin);
    rewriteUrl.search = req.nextUrl.search;
    return NextResponse.rewrite(rewriteUrl);
  }

  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    if (!req.auth?.user?.email) {
      const loginUrl = new URL("/admin/login", req.nextUrl.origin);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/admin", "/admin/:path*"]
};
