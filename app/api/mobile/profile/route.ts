// app/api/mobile/profile/route.ts

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireMobileUser, signMobileToken } from "@/lib/mobile-auth";
import { redis } from "@/lib/redis";
import bcrypt from "bcryptjs";
import { AuthTokenPayload } from "@/types";

async function clearUserCaches(userId: string) {
  const keys = await redis.keys(`*:${userId}:*`);
  if (keys.length > 0) await redis.del(...keys);

  await Promise.all([
    redis.del(`income:${userId}:salaried`),
    redis.del(`subscriptions:${userId}`),
  ]);
}

// PATCH /api/mobile/profile
export async function PATCH(req: NextRequest) {
  try {
    const { user, error } = await requireMobileUser(req);
    if (error) return error;

    const { username, emailSummary, currentPassword, newPassword } = await req.json();

    if (currentPassword && newPassword) {
      if (!user.password) {
        return NextResponse.json(
          { error: "Cannot change password for OAuth accounts" },
          { status: 400 }
        );
      }

      const isValid = await bcrypt.compare(currentPassword, user.password);
      if (!isValid) {
        return NextResponse.json(
          { error: "Current password is incorrect" },
          { status: 401 }
        );
      }

      const hashed = await bcrypt.hash(newPassword, 12);
      await db.user.update({
        where: { id: user.id },
        data: { password: hashed },
      });

      return NextResponse.json({ message: "Password updated" });
    }

    if (username && username !== user.username) {
      const existing = await db.user.findFirst({
        where: {
          username,
          NOT: { id: user.id },
        },
      });

      if (existing) {
        return NextResponse.json(
          { error: "Username already taken" },
          { status: 409 }
        );
      }
    }

    const updated = await db.user.update({
      where: { id: user.id },
      data: {
        username: username ?? user.username,
        emailSummary: emailSummary ?? user.emailSummary,
      },
    });

    const newPayload: AuthTokenPayload = {
      userId: updated.id,
      email: updated.email,
      username: updated.username ?? "",
      incomeType: updated.incomeType as "SALARIED" | "FREELANCER",
      isSetupDone: updated.isSetupDone,
      currency: updated.currency ?? "USD",
    };

    const newToken = await signMobileToken(newPayload);

    return NextResponse.json({
      token: newToken,
      user: {
        id: updated.id,
        name: updated.name,
        email: updated.email,
        username: updated.username,
        image: updated.image,
        currency: updated.currency,
        incomeType: updated.incomeType,
        isSetupDone: updated.isSetupDone,
        emailSummary: updated.emailSummary,
        hasPassword: !!updated.password,
      },
    });
  } catch (error) {
    console.error("[MOBILE_PROFILE_PATCH]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/mobile/profile
// Resets setup — deletes all user data and marks isSetupDone: false
export async function DELETE(req: NextRequest) {
  try {
    const { user, error } = await requireMobileUser(req);
    if (error) return error;

    const userId = user.id;

    await db.$transaction(async (tx) => {
      await tx.expense.deleteMany({ where: { userId } });
      await tx.income.deleteMany({ where: { userId } });
      await tx.subscription.deleteMany({ where: { userId } });

      await tx.user.update({
        where: { id: userId },
        data: {
          isSetupDone: false,
          currency: "USD",
          incomeType: "SALARIED",
        },
      });
    });

    await clearUserCaches(userId);

    return NextResponse.json({ message: "Setup reset successfully" });
  } catch (error) {
    console.error("[MOBILE_PROFILE_DELETE]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
