// Place at: app/api/mobile/summary/route.ts

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyMobileToken } from "@/lib/mobile-auth";
import { redis } from "@/lib/redis";

const CACHE_TTL = 600; // 10 minutes — matches web app

function cacheKey(userId: string, month: number, year: number) {
  return `summary:${userId}:${month}:${year}`;
}

// GET /api/mobile/summary?month=5&year=2026
export async function GET(req: NextRequest) {
  try {
    const token = req.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const payload = await verifyMobileToken(token);
    if (!payload) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const month = parseInt(searchParams.get("month") ?? "0");
    const year = parseInt(searchParams.get("year") ?? "0");

    if (!month || !year) {
      return NextResponse.json({ error: "month and year required" }, { status: 400 });
    }

    const key = cacheKey(payload.userId, month, year);
    const cached = await redis.get(key);
    if (cached) return NextResponse.json({ summary: cached });

    // Fetch expenses for the month
    const expenses = await db.expense.findMany({
      where: { userId: payload.userId, month, year },
    });

    // Fetch income for the month
    const income = await db.income.findMany({
      where: { userId: payload.userId, month, year },
    });

    const totalIncome = income.reduce((sum, i) => sum + i.amount, 0);
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
    const remaining = totalIncome - totalExpenses;
    const savingsPercent =
      totalIncome > 0
        ? Math.max(0, Math.round(((totalIncome - totalExpenses) / totalIncome) * 100))
        : 0;

    // Category breakdown
    const categoryMap: Record<string, number> = {};
    for (const e of expenses) {
      categoryMap[e.category] = (categoryMap[e.category] ?? 0) + e.amount;
    }
    const categoryBreakdown = Object.entries(categoryMap).map(([category, amount]) => ({
      category,
      amount,
      percentage: totalExpenses > 0 ? Math.round((amount / totalExpenses) * 100) : 0,
    }));

    // Last 6 months trend
    const trendMonths: { month: number; year: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(year, month - 1 - i, 1);
      trendMonths.push({ month: d.getMonth() + 1, year: d.getFullYear() });
    }

    const trendData = await Promise.all(
      trendMonths.map(async ({ month: m, year: y }) => {
        const [monthExpenses, monthIncome] = await Promise.all([
          db.expense.aggregate({ where: { userId: payload.userId, month: m, year: y }, _sum: { amount: true } }),
          db.income.aggregate({ where: { userId: payload.userId, month: m, year: y }, _sum: { amount: true } }),
        ]);
        return {
          month: m,
          year: y,
          expenses: monthExpenses._sum.amount ?? 0,
          income: monthIncome._sum.amount ?? 0,
        };
      })
    );

    // Basic rule-based insights
    const insights: string[] = [];
    if (savingsPercent >= 20) insights.push("Great job! You're saving over 20% of your income.");
    if (savingsPercent < 10 && totalIncome > 0) insights.push("Your savings rate is below 10%. Consider cutting discretionary spending.");
    if (remaining < 0) insights.push("You've spent more than you earned this month.");
    const topCategory = categoryBreakdown.sort((a, b) => b.amount - a.amount)[0];
    if (topCategory) insights.push(`Your biggest spending category is ${topCategory.category} at ${topCategory.percentage}%.`);

    const summary = {
      month,
      year,
      totalIncome,
      totalExpenses,
      remaining,
      savingsPercent,
      categoryBreakdown,
      monthlyTrend: trendData,
      insights,
    };

    await redis.set(key, summary, { ex: CACHE_TTL });

    return NextResponse.json({ summary });
  } catch (error) {
    console.error("[MOBILE_SUMMARY_GET]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
