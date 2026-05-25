// Place at: app/api/mobile/income/[id]/route.ts

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyMobileToken } from "@/lib/mobile-auth";
import { redis } from "@/lib/redis";

async function clearCaches(userId: string, month: number, year: number) {
  await Promise.all([
    redis.del(`income:${userId}:${month}:${year}`),
    redis.del(`income:${userId}:salaried`),
    redis.del(`summary:${userId}:${month}:${year}`),
  ]);
}

// PATCH /api/mobile/income/[id]
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const token = req.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const payload = await verifyMobileToken(token);
    if (!payload) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

    const income = await db.income.findUnique({ where: { id } });
    if (!income || income.userId !== payload.userId) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const { sourceName, amount, month, year, type } = await req.json();

    const updated = await db.income.update({
      where: { id },
      data: {
        sourceName: sourceName ?? income.sourceName,
        amount: amount ? parseFloat(amount) : income.amount,
        month: month ? parseInt(month) : income.month,
        year: year ? parseInt(year) : income.year,
        type: type ?? income.type,
      },
    });

    // Clear caches for both old and new month
    await clearCaches(payload.userId, income.month, income.year);
    await clearCaches(payload.userId, updated.month, updated.year);

    return NextResponse.json({ income: updated });
  } catch (error) {
    console.error("[MOBILE_INCOME_PATCH]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE /api/mobile/income/[id]
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const token = req.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const payload = await verifyMobileToken(token);
    if (!payload) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

    const income = await db.income.findUnique({ where: { id } });
    if (!income || income.userId !== payload.userId) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    await db.income.delete({ where: { id } });

    // Clear income and summary cache
    await clearCaches(payload.userId, income.month, income.year);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[MOBILE_INCOME_DELETE]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
