// app/api/mobile/income/[id]/route.ts

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireMobileUser } from "@/lib/mobile-auth";
import { redis } from "@/lib/redis";

async function clearCaches(userId: string, month: number, year: number) {
  await Promise.all([
    redis.del(`income:${userId}:${month}:${year}`),
    redis.del(`income:${userId}:salaried`),
    redis.del(`summary:${userId}:${month}:${year}`),
  ]);
}

async function clearSalariedIncomeCache(userId: string) {
  await redis.del(`income:${userId}:salaried`);
}

function parseOptionalRequiredNumber(value: unknown, fallback: number) {
  if (value === undefined || value === null || value === "") {
    return fallback;
  }

  const parsed = Number(value);

  return Number.isFinite(parsed) ? parsed : fallback;
}

function parseOptionalNullableNumber(value: unknown, fallback: number | null) {
  if (value === undefined || value === null || value === "") {
    return fallback;
  }

  const parsed = Number(value);

  return Number.isFinite(parsed) ? parsed : fallback;
}

// PATCH /api/mobile/income/[id]
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const { user, error } = await requireMobileUser(req);
    if (error) return error;

    const income = await db.income.findFirst({
      where: {
        id,
        userId: user.id,
      },
    });

    if (!income) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const { sourceName, amount, month, year, type } = await req.json();

    const updated = await db.income.update({
      where: { id },
      data: {
        sourceName: sourceName ?? income.sourceName,
        amount: parseOptionalRequiredNumber(amount, income.amount),
        month: parseOptionalNullableNumber(month, income.month),
        year: parseOptionalNullableNumber(year, income.year),
        type: type ?? income.type,
      },
    });

    // Clear caches for the old month/year if they exist
    if (income.month !== null && income.year !== null) {
      await clearCaches(user.id, income.month, income.year);
    } else {
      await clearSalariedIncomeCache(user.id);
    }

    // Clear caches for the updated month/year if they exist
    if (updated.month !== null && updated.year !== null) {
      await clearCaches(user.id, updated.month, updated.year);
    } else {
      await clearSalariedIncomeCache(user.id);
    }

    return NextResponse.json({ income: updated });
  } catch (error) {
    console.error("[MOBILE_INCOME_PATCH]", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/mobile/income/[id]
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const { user, error } = await requireMobileUser(req);
    if (error) return error;

    const income = await db.income.findFirst({
      where: {
        id,
        userId: user.id,
      },
    });

    if (!income) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    await db.income.delete({
      where: { id },
    });

    // Clear income and summary cache only when month/year exist
    if (income.month !== null && income.year !== null) {
      await clearCaches(user.id, income.month, income.year);
    } else {
      await clearSalariedIncomeCache(user.id);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[MOBILE_INCOME_DELETE]", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
