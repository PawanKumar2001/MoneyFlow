// Place at: app/api/mobile/signup/route.ts

import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { signMobileToken } from "@/lib/mobile-auth";
import { AuthTokenPayload } from "@/types";

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

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Generate a unique username from name
    const baseUsername = name.toLowerCase().replace(/\s+/g, "") + Math.floor(Math.random() * 9999);

    // Create user (isSetupDone: false — setup flow handles the rest)
    const user = await db.user.create({
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

    // Create and send OTP verification code
    // Reuse your existing OTP sending logic here
    // e.g. await sendOtpEmail(email, "SIGNUP");

    return NextResponse.json({
      message: "Account created. Check your email for the verification code.",
      email: user.email,
    });
  } catch (error) {
    console.error("[MOBILE_SIGNUP]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
