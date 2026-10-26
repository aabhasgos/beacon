import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect all /app routes
  if (pathname.startsWith("/app")) {
    const sessionCookie = request.cookies.get("beacon_session")?.value;
    const userIdCookie = request.cookies.get("beacon_user_id")?.value;

    if (!sessionCookie && !userIdCookie) {
      // Redirect unauthenticated visitors directly to the Gateway/Login page
      const loginUrl = new URL("/", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/app/:path*"],
};
