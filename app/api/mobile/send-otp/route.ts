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

    const otpType = type ?? "LOGIN";

    // Find user
    const user = await db.user.findUnique({
      where: { email },
    });

    if (!user || !user.password) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Verify password
    const isValid = await bcrypt.compare(
      password,
      user.password
    );

    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Delete old unused OTPs
    await db.verificationCode.deleteMany({
      where: {
        email,
        type: otpType,
        used: false,
      },
    });

    // Generate OTP
    const code = generateOTP();

    // Expiry: 10 mins
    const expiresAt = new Date(
      Date.now() + 10 * 60 * 1000
    );

    // Save OTP
    await db.verificationCode.create({
      data: {
        email,
        code,
        type: otpType,
        expiresAt,
        attempts: 0,
        used: false,
      },
    });

    // SEND EMAIL
    await sendOTPEmail(email, code, otpType);

    return NextResponse.json({
      success: true,
      message: "OTP sent successfully",
    });
  } catch (error) {
    console.error("[MOBILE_SEND_OTP]", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}