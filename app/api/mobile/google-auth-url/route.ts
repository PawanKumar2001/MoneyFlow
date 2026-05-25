// app/api/mobile/google-auth-url/route.ts
// Returns Google OAuth URL for mobile to open in browser

import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const redirectUri = `${process.env.NEXTAUTH_URL}/api/mobile/google-callback`;

    const params = new URLSearchParams({
      client_id: clientId!,
      redirect_uri: redirectUri,
      response_type: "code",
      scope: "openid email profile",
      access_type: "offline",
      state: "mobile", // identifies this as a mobile request
    });

    const url = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;

    return NextResponse.json({ url });
  } catch (error) {
    console.error("[MOBILE_GOOGLE_AUTH_URL]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
