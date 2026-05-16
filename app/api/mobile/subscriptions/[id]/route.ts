// Place at: app/api/mobile/subscriptions/[id]/route.ts

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyMobileToken } from "@/lib/mobile-auth";
import { redis } from "@/lib/redis";

// PATCH /api/mobile/subscriptions/[id]
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = req.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const payload = await verifyMobileToken(token);
    if (!payload) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

    const sub = await db.subscription.findUnique({ where: { id: params.id } });
    if (!sub || sub.userId !== payload.userId) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const { name, amount, recurringDate, startMonth, startYear } = await req.json();

    const updated = await db.subscription.update({
      where: { id: params.id },
      data: {
        name: name ?? sub.name,
        amount: amount ? parseFloat(amount) : sub.amount,
        recurringDate: recurringDate ? parseInt(recurringDate) : sub.recurringDate,
        startMonth: startMonth ? parseInt(startMonth) : sub.startMonth,
        startYear: startYear ? parseInt(startYear) : sub.startYear,
      },
    });

    await redis.del(`subscriptions:${payload.userId}`);

    return NextResponse.json({ subscription: updated });
  } catch (error) {
    console.error("[MOBILE_SUBSCRIPTIONS_PATCH]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE /api/mobile/subscriptions/[id]
// Deletes subscription + all current and future auto-generated expenses
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = req.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const payload = await verifyMobileToken(token);
    if (!payload) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

    const sub = await db.subscription.findUnique({ where: { id: params.id } });
    if (!sub || sub.userId !== payload.userId) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    // Delete current + future auto-generated expenses from this subscription
    await db.expense.deleteMany({
      where: {
        sourceSubscriptionId: params.id,
        OR: [
          { year: { gt: currentYear } },
          { year: currentYear, month: { gte: currentMonth } },
        ],
      },
    });

    await db.subscription.delete({ where: { id: params.id } });

    // Invalidate caches
    await redis.del(`subscriptions:${payload.userId}`);
    await redis.del(`expenses:${payload.userId}:${currentMonth}:${currentYear}`);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[MOBILE_SUBSCRIPTIONS_DELETE]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
