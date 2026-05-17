// Place at: app/api/mobile/profile/route.ts

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyMobileToken, signMobileToken } from "@/lib/mobile-auth";
import { redis } from "@/lib/redis";
import bcrypt from "bcryptjs";
import { AuthTokenPayload } from "@/types";

// PATCH /api/mobile/profile
export async function PATCH(req: NextRequest) {
  try {
    const token = req.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const payload = await verifyMobileToken(token);
    if (!payload) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

    const { username, emailSummary, currentPassword, newPassword } = await req.json();

    const user = await db.user.findUnique({ where: { id: payload.userId } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    // Password change
    if (currentPassword && newPassword) {
      if (!user.password) {
        return NextResponse.json({ error: "Cannot change password for OAuth accounts" }, { status: 400 });
      }
      const isValid = await bcrypt.compare(currentPassword, user.password);
      if (!isValid) {
        return NextResponse.json({ error: "Current password is incorrect" }, { status: 401 });
      }
      const hashed = await bcrypt.hash(newPassword, 12);
      await db.user.update({ where: { id: user.id }, data: { password: hashed } });
      return NextResponse.json({ message: "Password updated" });
    }

    // Profile update
    const updated = await db.user.update({
      where: { id: payload.userId },
      data: {
        username: username ?? user.username,
        emailSummary: emailSummary ?? user.emailSummary,
      },
    });

    // Issue fresh token — coerce nullable fields to string with fallback
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
      },
    });
  } catch (error) {
    console.error("[MOBILE_PROFILE_PATCH]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE /api/mobile/profile
// Resets setup — deletes all user data and marks isSetupDone: false
export async function DELETE(req: NextRequest) {
  try {
    const token = req.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const payload = await verifyMobileToken(token);
    if (!payload) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

    const userId = payload.userId;

    // Delete all user data
    await db.expense.deleteMany({ where: { userId } });
    await db.income.deleteMany({ where: { userId } });
    await db.subscription.deleteMany({ where: { userId } });

    // Reset setup state
    await db.user.update({
      where: { id: userId },
      data: { isSetupDone: false, currency: "USD", incomeType: "SALARIED" },
    });

    // Clear all Redis cache for this user
    const keys = await redis.keys(`*:${userId}:*`);
    if (keys.length > 0) await redis.del(...keys);

    return NextResponse.json({ message: "Setup reset successfully" });
  } catch (error) {
    console.error("[MOBILE_PROFILE_DELETE]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
