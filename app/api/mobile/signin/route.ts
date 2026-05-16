// ─────────────────────────────────────────────────────────────────────────────
// IMPORTANT: This file belongs in your NEXT.JS project, not the mobile app.
// Place it at: app/api/mobile/signin/route.ts
// ─────────────────────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { signMobileToken } from "@/lib/mobile-auth";
import { AuthTokenPayload } from "@/types";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    // Find user
    const user = await db.user.findUnique({ where: { email } });
    if (!user || !user.password) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Verify password
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Build token payload
    const payload: AuthTokenPayload = {
      userId: user.id,
      email: user.email,
      username: user.username,
      incomeType: user.incomeType as "SALARIED" | "FREELANCER",
      isSetupDone: user.isSetupDone,
      currency: user.currency,
    };

    // Sign and return JWT — valid for 30 days
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
    console.error("[MOBILE_SIGNIN]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
