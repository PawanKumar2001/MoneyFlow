// Place at: app/api/mobile/verify-otp/route.ts

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { signMobileToken } from "@/lib/mobile-auth";
import { AuthTokenPayload } from "@/types";

export async function POST(req: NextRequest) {
  try {
    const { email, code, type } = await req.json();

    if (!email || !code) {
      return NextResponse.json(
        { error: "Email and code are required" },
        { status: 400 }
      );
    }

    // Mirror exact logic from web app verifyOTP action
    const record = await db.verificationCode.findFirst({
      where: { email, type: type ?? "LOGIN", used: false },
      orderBy: { createdAt: "desc" },
    });

    if (!record) {
      return NextResponse.json(
        { error: "Invalid or expired code." },
        { status: 400 }
      );
    }

    // Check expiry
    if (new Date() > record.expiresAt) {
      await db.verificationCode.delete({ where: { id: record.id } });
      return NextResponse.json(
        { error: "Code has expired. Please request a new one." },
        { status: 400 }
      );
    }

    // Check attempts — max 3 same as web app
    if (record.attempts >= 3) {
      await db.verificationCode.delete({ where: { id: record.id } });
      return NextResponse.json(
        { error: "Too many attempts. Please request a new code." },
        { status: 400 }
      );
    }

    // Wrong code
    if (record.code !== code) {
      await db.verificationCode.update({
        where: { id: record.id },
        data: { attempts: record.attempts + 1 },
      });
      const remaining = 2 - record.attempts;
      return NextResponse.json(
        {
          error: `Incorrect code. ${remaining} attempt${remaining === 1 ? "" : "s"} remaining.`,
        },
        { status: 400 }
      );
    }

    // Mark as used
    await db.verificationCode.update({
      where: { id: record.id },
      data: { used: true },
    });

    // Get user
    const user = await db.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Sign JWT — 365 days so user stays logged in until explicit logout
    const payload: AuthTokenPayload = {
      userId: user.id,
      email: user.email,
      username: user.username ?? "",
      incomeType: user.incomeType as "SALARIED" | "FREELANCER",
      isSetupDone: user.isSetupDone,
      currency: user.currency ?? "USD",
    };

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
