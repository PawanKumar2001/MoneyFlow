// Place at: app/api/mobile/send-otp/route.ts

import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { sendOTPEmail } from "@/lib/email";

function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(req: NextRequest) {
  try {
    const { email, password, type } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    const user = await db.user.findUnique({ where: { email } });
    if (!user || !user.password) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Delete existing unused codes — same as web app
    await db.verificationCode.deleteMany({
      where: { email, type: type ?? "LOGIN", used: false },
    });

    const code = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await db.verificationCode.create({
      data: { email, code, type: type ?? "LOGIN", expiresAt },
    });

    // Use exact same email function as web app
    await sendOTPEmail(email, code, type ?? "LOGIN");

    return NextResponse.json({ message: "OTP sent to your email" });
  } catch (error) {
    console.error("[MOBILE_SEND_OTP]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
