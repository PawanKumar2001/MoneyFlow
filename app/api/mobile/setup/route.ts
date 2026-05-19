// app/api/mobile/setup/route.ts

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyMobileToken } from "@/lib/mobile-auth";
import { signMobileToken } from "@/lib/mobile-auth";
import { AuthTokenPayload } from "@/types";

// POST /api/mobile/setup
// Called once when the user completes the setup flow.
// Body: { incomeType, currency, emailSummary, primaryIncome?, secondaryIncome? }

export async function POST(req: NextRequest) {
  try {
    const token = req.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = await verifyMobileToken(token);
    if (!payload) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const {
      incomeType,
      currency,
      emailSummary,
      primaryIncome,
      secondaryIncome,
    } = await req.json();

    // Update user
    const user = await db.user.update({
      where: { id: payload.userId },
      data: {
        incomeType,
        currency,
        emailSummary: emailSummary ?? false,
        isSetupDone: true,
      },
    });

    // If salaried — create income entries for current month
    if (incomeType === "SALARIED") {
      const now = new Date();
      const month = now.getMonth() + 1;
      const year = now.getFullYear();

      if (primaryIncome) {
        await db.income.create({
          data: {
            userId: user.id,
            type: "PRIMARY",
            sourceName: primaryIncome.sourceName ?? "Primary Income",
            amount: primaryIncome.amount,
            month,
            year,
          },
        });
      }

      if (secondaryIncome) {
        await db.income.create({
          data: {
            userId: user.id,
            type: "SECONDARY",
            sourceName: secondaryIncome.sourceName ?? "Secondary Income",
            amount: secondaryIncome.amount,
            month,
            year,
          },
        });
      }
    }

    // Issue a fresh token with updated isSetupDone + incomeType + currency
    const newPayload: AuthTokenPayload = {
      userId: user.id,
      email: user.email,
      username: user.username ?? "",
      incomeType: user.incomeType as "SALARIED" | "FREELANCER",
      isSetupDone: true,
      currency: user.currency ?? "USD",
    };

    const newToken = await signMobileToken(newPayload);

    return NextResponse.json({
      token: newToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        username: user.username ?? "",
        image: user.image,
        currency: user.currency ?? "USD",
        incomeType: user.incomeType,
        isSetupDone: user.isSetupDone,
        emailSummary: user.emailSummary,
      },
    });
  } catch (error) {
    console.error("[MOBILE_SETUP]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
