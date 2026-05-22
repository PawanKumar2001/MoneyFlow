// Place at: app/api/mobile/verify-otp/route.ts
// Verifies OTP and returns JWT token — user stays logged in until explicit logout

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { signMobileToken } from "@/lib/mobile-auth";
import { AuthTokenPayload } from "@/types";

export async function POST(req: NextRequest) {
  try {
    const { email, code, type } = await req.json();

    if (!email || !code) {
      return NextResponse.json({ error: "Email and code are required" }, { status: 400 });
    }

    const verification = await db.verificationCode.findFirst({
      where: { email, type: type ?? "LOGIN", used: false },
      orderBy: { expiresAt: "desc" },
    });

    if (!verification) {
      return NextResponse.json({ error: "No verification code found. Please request a new one." }, { status: 400 });
    }

    if (verification.expiresAt < new Date()) {
      return NextResponse.json({ error: "Code has expired. Please request a new one." }, { status: 400 });
    }

    if (verification.attempts >= 5) {
      return NextResponse.json({ error: "Too many attempts. Please request a new code." }, { status: 400 });
    }

    if (verification.code !== code) {
      await db.verificationCode.update({
        where: { id: verification.id },
        data: { attempts: { increment: 1 } },
      });
      return NextResponse.json({ error: "Invalid code" }, { status: 400 });
    }

    // Mark OTP as used
    await db.verificationCode.update({
      where: { id: verification.id },
      data: { used: true },
    });

    // Get or activate user
    const user = await db.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Build JWT — no expiry set so user stays logged in until they log out
    const payload: AuthTokenPayload = {
      userId: user.id,
      email: user.email,
      username: user.username ?? "",
      incomeType: user.incomeType as "SALARIED" | "FREELANCER",
      isSetupDone: user.isSetupDone,
      currency: user.currency ?? "USD",
    };

    // 365 day token — effectively "stay logged in"
    const token = await signMobileToken(payload);

    return NextResponse.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        username: user.username,
        image: user.image,
        currency: user.currency,
        incomeType: user.incomeType,
        isSetupDone: user.isSetupDone,
        emailSummary: user.emailSummary,
      },
    });
  } catch (error) {
    console.error("[MOBILE_VERIFY_OTP]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
