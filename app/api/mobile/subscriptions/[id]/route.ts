// app/api/mobile/subscriptions/[id]/route.ts

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireMobileUser } from "@/lib/mobile-auth";
import { redis } from "@/lib/redis";

function parseOptionalRequiredNumber(value: unknown, fallback: number) {
  if (value === undefined || value === null || value === "") {
    return fallback;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

// PATCH /api/mobile/subscriptions/[id]
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const { user, error } = await requireMobileUser(req);
    if (error) return error;

    const sub = await db.subscription.findFirst({
      where: {
        id,
        userId: user.id,
      },
    });

    if (!sub) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const { name, amount, recurringDate, startMonth, startYear } = await req.json();

    const parsedAmount = parseOptionalRequiredNumber(amount, sub.amount);
    const parsedRecurringDate = parseOptionalRequiredNumber(
      recurringDate,
      sub.recurringDate
    );
    const parsedStartMonth = parseOptionalRequiredNumber(startMonth, sub.startMonth);
    const parsedStartYear = parseOptionalRequiredNumber(startYear, sub.startYear);

    if (parsedRecurringDate < 1 || parsedRecurringDate > 28) {
      return NextResponse.json(
        { error: "Recurring date must be between 1 and 28" },
        { status: 400 }
      );
    }

    const updated = await db.subscription.update({
      where: { id },
      data: {
        name: name ?? sub.name,
        amount: parsedAmount,
        recurringDate: parsedRecurringDate,
        startMonth: parsedStartMonth,
        startYear: parsedStartYear,
      },
    });

    await redis.del(`subscriptions:${user.id}`);

    return NextResponse.json({ subscription: updated });
  } catch (error) {
    console.error("[MOBILE_SUBSCRIPTIONS_PATCH]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE /api/mobile/subscriptions/[id]
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const { user, error } = await requireMobileUser(req);
    if (error) return error;

    const sub = await db.subscription.findFirst({
      where: {
        id,
        userId: user.id,
      },
    });

    if (!sub) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    await db.expense.deleteMany({
      where: {
        userId: user.id,
        sourceSubscriptionId: id,
        OR: [
          { year: { gt: currentYear } },
          { year: currentYear, month: { gte: currentMonth } },
        ],
      },
    });

    await db.subscription.delete({ where: { id } });

    await Promise.all([
      redis.del(`subscriptions:${user.id}`),
      redis.del(`expenses:${user.id}:${currentMonth}:${currentYear}`),
      redis.del(`summary:${user.id}:${currentMonth}:${currentYear}`),
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[MOBILE_SUBSCRIPTIONS_DELETE]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
