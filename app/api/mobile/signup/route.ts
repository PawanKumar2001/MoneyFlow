// Place at: app/api/mobile/signup/route.ts

import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { sendOTPEmail } from "@/lib/email";

function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(req: NextRequest) {
  try {
    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Name, email and password are required" },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existing = await db.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const baseUsername = name.toLowerCase().replace(/\s+/g, "") + Math.floor(Math.random() * 9999);

    // Create user
    await db.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        username: baseUsername,
        isSetupDone: false,
        currency: "USD",
        incomeType: "SALARIED",
        emailSummary: false,
      },
    });

    // Send OTP verification email — same function as web app
    await db.verificationCode.deleteMany({
      where: { email, type: "SIGNUP", used: false },
    });

    const code = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await db.verificationCode.create({
      data: { email, code, type: "SIGNUP", expiresAt },
    });

    await sendOTPEmail(email, code, "SIGNUP");

    return NextResponse.json({
      message: "Account created. Check your email for the verification code.",
      email,
    });
  } catch (error) {
    console.error("[MOBILE_SIGNUP]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
