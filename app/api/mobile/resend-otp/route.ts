// Place at: app/api/mobile/resend-otp/route.ts

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sendOTPEmail } from "@/lib/email";

function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(req: NextRequest) {
  try {
    const { email, type } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Delete existing unused codes
    await db.verificationCode.deleteMany({
      where: { email, type: type ?? "LOGIN", used: false },
    });

    const code = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await db.verificationCode.create({
      data: { email, code, type: type ?? "LOGIN", expiresAt },
    });

    await sendOTPEmail(email, code, type ?? "LOGIN");

    return NextResponse.json({ message: "New code sent" });
  } catch (error) {
    console.error("[MOBILE_RESEND_OTP]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
