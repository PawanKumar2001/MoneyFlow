// app/api/mobile/setup/route.ts

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireMobileUser, signMobileToken } from "@/lib/mobile-auth";
import { AuthTokenPayload } from "@/types";

function parseRequiredNumber(value: unknown) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

// POST /api/mobile/setup
// Called once when the user completes the setup flow.
// Body: { incomeType, currency, emailSummary, primaryIncome?, secondaryIncome? }
export async function POST(req: NextRequest) {
  try {
    const { user: currentUser, error } = await requireMobileUser(req);
    if (error) return error;

    const {
      incomeType,
      currency,
      emailSummary,
      primaryIncome,
      secondaryIncome,
    } = await req.json();

    if (!["SALARIED", "FREELANCER"].includes(incomeType)) {
      return NextResponse.json(
        { error: "Invalid income type" },
        { status: 400 }
      );
    }

    if (!currency) {
      return NextResponse.json(
        { error: "Currency is required" },
        { status: 400 }
      );
    }

    const user = await db.$transaction(async (tx) => {
      const updatedUser = await tx.user.update({
        where: { id: currentUser.id },
        data: {
          incomeType,
          currency,
          emailSummary: emailSummary ?? false,
          isSetupDone: true,
        },
      });

      if (incomeType === "SALARIED") {
        const now = new Date();
        const month = now.getMonth() + 1;
        const year = now.getFullYear();

        const primaryAmount = parseRequiredNumber(primaryIncome?.amount);

        if (primaryIncome && primaryAmount !== null) {
          await tx.income.create({
            data: {
              userId: updatedUser.id,
              type: "PRIMARY",
              sourceName: primaryIncome.sourceName ?? "Primary Income",
              amount: primaryAmount,
              month,
              year,
            },
          });
        }

        const secondaryAmount = parseRequiredNumber(secondaryIncome?.amount);

        if (secondaryIncome && secondaryAmount !== null) {
          await tx.income.create({
            data: {
              userId: updatedUser.id,
              type: "SECONDARY",
              sourceName: secondaryIncome.sourceName ?? "Secondary Income",
              amount: secondaryAmount,
              month,
              year,
            },
          });
        }
      }

      return updatedUser;
    });

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
