// Place at: app/api/mobile/google-callback/route.ts
// Google redirects here after OAuth — issues JWT and deep links back to app

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { signMobileToken } from "@/lib/mobile-auth";
import { AuthTokenPayload } from "@/types";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get("code");

    if (!code) {
      return NextResponse.redirect(`moneyflow://oauth?error=no_code`);
    }

    // Exchange code for tokens
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        redirect_uri: `${process.env.NEXTAUTH_URL}/api/mobile/google-callback`,
        grant_type: "authorization_code",
      }),
    });

    const tokens = await tokenRes.json();

    // Get user info from Google
    const userRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });
    const googleUser = await userRes.json();

    // Find or create user
    let user = await db.user.findUnique({ where: { email: googleUser.email } });

    if (!user) {
      const baseUsername = googleUser.email.split("@")[0] + Math.floor(Math.random() * 9999);
      user = await db.user.create({
        data: {
          email: googleUser.email,
          name: googleUser.name,
          image: googleUser.picture,
          username: baseUsername,
          isSetupDone: false,
          currency: "USD",
          incomeType: "SALARIED",
          emailSummary: false,
        },
      });
    }

    const payload: AuthTokenPayload = {
      userId: user.id,
      email: user.email,
      username: user.username ?? "",
      incomeType: user.incomeType as "SALARIED" | "FREELANCER",
      isSetupDone: user.isSetupDone,
      currency: user.currency ?? "USD",
    };

    const jwtToken = await signMobileToken(payload);

    // Deep link back to the mobile app with the token
    return NextResponse.redirect(
      `moneyflow://oauth?token=${jwtToken}&setupDone=${user.isSetupDone}`
    );
  } catch (error) {
    console.error("[MOBILE_GOOGLE_CALLBACK]", error);
    return NextResponse.redirect(`moneyflow://oauth?error=server_error`);
  }
}
