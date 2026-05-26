// app/api/mobile/google-callback/route.ts
// Google redirects here after OAuth — issues JWT and deep links back to app

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { signMobileToken } from "@/lib/mobile-auth";
import { AuthTokenPayload } from "@/types";

function mobileRedirect(params: Record<string, string | boolean>) {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    searchParams.set(key, String(value));
  });

  return NextResponse.redirect(`moneyflow://oauth?${searchParams.toString()}`);
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const code = searchParams.get("code");
    const googleError = searchParams.get("error");

    if (googleError) {
      return mobileRedirect({
        error: googleError,
      });
    }

    if (!code) {
      return mobileRedirect({
        error: "no_code",
      });
    }

    const nextAuthUrl = process.env.NEXTAUTH_URL;
    const googleClientId = process.env.AUTH_GOOGLE_ID;
    const googleClientSecret = process.env.AUTH_GOOGLE_SECRET;

    if (!nextAuthUrl || !googleClientId || !googleClientSecret) {
      console.error("[MOBILE_GOOGLE_CALLBACK] Missing OAuth env vars");

      return mobileRedirect({
        error: "missing_oauth_config",
      });
    }

    const redirectUri = `${nextAuthUrl}/api/mobile/google-callback`;

    // Exchange code for tokens
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        code,
        client_id: googleClientId,
        client_secret: googleClientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });

    const tokens = await tokenRes.json();

    if (!tokenRes.ok || !tokens.access_token) {
      console.error("[MOBILE_GOOGLE_CALLBACK] Token exchange failed", tokens);

      return mobileRedirect({
        error: tokens.error ?? "token_exchange_failed",
      });
    }

    // Get user info from Google
    const userRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: {
        Authorization: `Bearer ${tokens.access_token}`,
      },
    });

    const googleUser = await userRes.json();

    if (!userRes.ok || !googleUser.email) {
      console.error("[MOBILE_GOOGLE_CALLBACK] User info failed", googleUser);

      return mobileRedirect({
        error: "google_user_fetch_failed",
      });
    }

    // Find or create user
    let user = await db.user.findUnique({
      where: {
        email: googleUser.email,
      },
    });

    if (!user) {
      const emailPrefix = String(googleUser.email).split("@")[0];
      const baseUsername = `${emailPrefix}${Math.floor(Math.random() * 9999)}`;

      user = await db.user.create({
        data: {
          email: googleUser.email,
          name: googleUser.name ?? emailPrefix,
          image: googleUser.picture ?? null,
          username: baseUsername,
          isSetupDone: false,
          currency: "USD",
          incomeType: "SALARIED",
          emailSummary: false,
        },
      });
    } else {
      user = await db.user.update({
        where: { id: user.id },
        data: {
          name: googleUser.name ?? user.name,
          image: googleUser.picture ?? user.image,
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

    return mobileRedirect({
      token: jwtToken,
      setupDone: user.isSetupDone,
    });
  } catch (error) {
    console.error("[MOBILE_GOOGLE_CALLBACK]", error);

    return mobileRedirect({
      error: "server_error",
    });
  }
}