// app/api/mobile/income/route.ts

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyMobileToken } from "@/lib/mobile-auth";
import { redis } from "@/lib/redis";

const CACHE_TTL = 1800; // 30 minutes

function incomeCacheKey(userId: string, month?: number, year?: number) {
  if (typeof month === "number" && typeof year === "number") {
    return `income:${userId}:${month}:${year}`;
  }

  return `income:${userId}:salaried`;
}

function summaryCacheKey(userId: string, month: number, year: number) {
  return `summary:${userId}:${month}:${year}`;
}

function parseRequiredNumber(value: unknown) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

// GET /api/mobile/income
export async function GET(req: NextRequest) {
  try {
    const token = req.headers.get("authorization")?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = await verifyMobileToken(token);

    if (!payload) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);

    const monthParam = searchParams.get("month");
    const yearParam = searchParams.get("year");

    const month = monthParam ? Number(monthParam) : undefined;
    const year = yearParam ? Number(yearParam) : undefined;

    const hasValidMonthYear =
      typeof month === "number" &&
      typeof year === "number" &&
      Number.isFinite(month) &&
      Number.isFinite(year);

    const key = hasValidMonthYear
      ? incomeCacheKey(payload.userId, month, year)
      : incomeCacheKey(payload.userId);

    const cached = await redis.get(key);

    if (cached) {
      return NextResponse.json({ income: cached });
    }

    const where: {
      userId: string;
      month?: number;
      year?: number;
    } = {
      userId: payload.userId,
    };

    if (hasValidMonthYear) {
      where.month = month;
      where.year = year;
    }

    const income = await db.income.findMany({
      where,
      orderBy: { type: "asc" },
    });

    await redis.set(key, income, { ex: CACHE_TTL });

    return NextResponse.json({ income });
  } catch (error) {
    console.error("[MOBILE_INCOME_GET]", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/mobile/income
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

    const { sourceName, amount, month, year, type } = await req.json();

    const parsedAmount = parseRequiredNumber(amount);
    const parsedMonth = parseRequiredNumber(month);
    const parsedYear = parseRequiredNumber(year);

    if (!sourceName || parsedAmount === null || parsedMonth === null || parsedYear === null) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    const income = await db.income.create({
      data: {
        userId: payload.userId,
        sourceName,
        amount: parsedAmount,
        month: parsedMonth,
        year: parsedYear,
        type: type ?? "PRIMARY",
      },
    });

    // Clear income and summary cache
    await Promise.all([
      redis.del(incomeCacheKey(payload.userId, parsedMonth, parsedYear)),
      redis.del(incomeCacheKey(payload.userId)),
      redis.del(summaryCacheKey(payload.userId, parsedMonth, parsedYear)),
    ]);

    return NextResponse.json({ income }, { status: 201 });
  } catch (error) {
    console.error("[MOBILE_INCOME_POST]", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}