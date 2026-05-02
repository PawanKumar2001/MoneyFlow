import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { nextUrl, auth: session } = req;
  const isLoggedIn = !!session;
  const isSetupDone = session?.user?.isSetupDone;
  const username = session?.user?.username;

  const isAuthRoute =
    nextUrl.pathname.startsWith("/login") ||
    nextUrl.pathname.startsWith("/signup");
  const isSetupRoute = nextUrl.pathname.startsWith("/setup");
  const isUsernameRoute = nextUrl.pathname.startsWith("/setup-username");
  const isProtectedRoute = nextUrl.pathname.startsWith("/dashboard");

  // Redirect logged-in users away from auth pages
  if (isLoggedIn && isAuthRoute) {
    if (!username) {
      return NextResponse.redirect(new URL("/setup-username", nextUrl));
    }
    if (!isSetupDone) {
      return NextResponse.redirect(new URL("/setup", nextUrl));
    }
    return NextResponse.redirect(new URL("/dashboard", nextUrl));
  }

  // Redirect unauthenticated users to login
  if (!isLoggedIn && (isProtectedRoute || isSetupRoute || isUsernameRoute)) {
    return NextResponse.redirect(new URL("/login", nextUrl));
  }

  // If logged in but no username → go to username setup
  if (isLoggedIn && !username && !isUsernameRoute) {
    return NextResponse.redirect(new URL("/setup-username", nextUrl));
  }

  // If logged in, has username but setup not done → go to setup
  if (isLoggedIn && username && !isSetupDone && !isSetupRoute) {
    return NextResponse.redirect(new URL("/setup", nextUrl));
  }

  // If setup done, redirect away from setup pages
  if (isLoggedIn && isSetupDone && (isSetupRoute || isUsernameRoute)) {
    return NextResponse.redirect(new URL("/dashboard", nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};