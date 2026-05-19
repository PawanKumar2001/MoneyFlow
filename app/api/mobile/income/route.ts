// app/api/mobile/income/route.ts

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyMobileToken } from "@/lib/mobile-auth";
import { redis } from "@/lib/redis";

const CACHE_TTL = 1800; // 30 minutes — matches web app

function cacheKey(userId: string, month?: number, year?: number) {
  if (month && year) return `income:${userId}:${month}:${year}`;
  return `income:${userId}:salaried`;
}

// GET /api/mobile/income
// Salaried: ?month=5&year=2026 (or no params for all-time primary/secondary)
// Freelancer: ?month=5&year=2026 (required)
export async function GET(req: NextRequest) {
  try {
    const token = req.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const payload = await verifyMobileToken(token);
    if (!payload) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const month = searchParams.get("month") ? parseInt(searchParams.get("month")!) : undefined;
    const year = searchParams.get("year") ? parseInt(searchParams.get("year")!) : undefined;

    const key = cacheKey(payload.userId, month, year);
    const cached = await redis.get(key);
    if (cached) return NextResponse.json({ income: cached });

    const where: any = { userId: payload.userId };
    if (month && year) {
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
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST /api/mobile/income (freelancer only)
export async function POST(req: NextRequest) {
  try {
    const token = req.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const payload = await verifyMobileToken(token);
    if (!payload) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

    const { sourceName, amount, month, year, type } = await req.json();

    if (!sourceName || !amount || !month || !year) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    const income = await db.income.create({
      data: {
        userId: payload.userId,
        sourceName,
        amount: parseFloat(amount),
        month: parseInt(month),
        year: parseInt(year),
        type: type ?? "PRIMARY",
      },
    });

    // Invalidate cache
    await redis.del(cacheKey(payload.userId, month, year));

    return NextResponse.json({ income }, { status: 201 });
  } catch (error) {
    console.error("[MOBILE_INCOME_POST]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
