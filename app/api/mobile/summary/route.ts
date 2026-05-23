// Place at: app/api/mobile/summary/route.ts

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyMobileToken } from "@/lib/mobile-auth";
import { redis } from "@/lib/redis";

const CACHE_TTL = 600;

function cacheKey(userId: string, month: number, year: number) {
  return `summary:${userId}:${month}:${year}`;
}

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

    // Get user to check income type
    const user = await db.user.findUnique({ where: { id: payload.userId } });
    const isSalaried = user?.incomeType === "SALARIED";

    // Fetch expenses for the month
    const expenses = await db.expense.findMany({
      where: { userId: payload.userId, month, year },
    });

    // ─── Income logic ─────────────────────────────────────────────────────────
    // Salaried: sum ALL income entries (not month-scoped) since salary is fixed
    // Freelancer: sum only this month's income entries
    let totalIncome = 0;
    if (isSalaried) {
      const allIncome = await db.income.findMany({
        where: { userId: payload.userId },
      });
      totalIncome = allIncome.reduce((sum, i) => sum + i.amount, 0);
    } else {
      const monthIncome = await db.income.findMany({
        where: { userId: payload.userId, month, year },
      });
      totalIncome = monthIncome.reduce((sum, i) => sum + i.amount, 0);
    }

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

    // ─── Last 6 months trend ──────────────────────────────────────────────────
    const trendMonths: { month: number; year: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(year, month - 1 - i, 1);
      trendMonths.push({ month: d.getMonth() + 1, year: d.getFullYear() });
    }

    // For salaried users, get income once (same for all months)
    let salariedMonthlyIncome = 0;
    if (isSalaried) {
      const allIncome = await db.income.findMany({
        where: { userId: payload.userId },
      });
      salariedMonthlyIncome = allIncome.reduce((sum, i) => sum + i.amount, 0);
    }

    const trendData = await Promise.all(
      trendMonths.map(async ({ month: m, year: y }) => {
        const monthExpensesAgg = await db.expense.aggregate({
          where: { userId: payload.userId, month: m, year: y },
          _sum: { amount: true },
        });

        let monthIncome = 0;
        if (isSalaried) {
          // Salaried income is the same every month
          monthIncome = salariedMonthlyIncome;
        } else {
          const monthIncomeAgg = await db.income.aggregate({
            where: { userId: payload.userId, month: m, year: y },
            _sum: { amount: true },
          });
          monthIncome = monthIncomeAgg._sum.amount ?? 0;
        }

        return {
          month: m,
          year: y,
          expenses: monthExpensesAgg._sum.amount ?? 0,
          income: monthIncome,
        };
      })
    );

    // ─── Insights ─────────────────────────────────────────────────────────────
    const fmt = (n: number) =>
      n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const insights: string[] = [];

    if (totalIncome > 0) {
      insights.push(`You earned a total of ${fmt(totalIncome)} this month, saving ${savingsPercent}% of your income.`);
    }
    if (remaining < 0) {
      insights.push(`You overspent by ${fmt(Math.abs(remaining))} this month. Review your expenses to get back on track.`);
    } else if (savingsPercent >= 30) {
      insights.push(`Excellent! You saved ${fmt(remaining)}, which is ${savingsPercent}% of your income.`);
    } else if (savingsPercent >= 20) {
      insights.push(`Good job! You saved ${fmt(remaining)} this month — above the recommended 20% savings rate.`);
    } else if (savingsPercent < 10 && totalIncome > 0) {
      insights.push(`Your savings rate is only ${savingsPercent}% this month. Aim to save at least 20% of your income.`);
    }

    const sortedCategories = [...categoryBreakdown].sort((a, b) => b.amount - a.amount);
    const topCategory = sortedCategories[0];
    if (topCategory && totalExpenses > 0) {
      insights.push(`Your biggest expense category is ${topCategory.category} at ${fmt(topCategory.amount)} (${topCategory.percentage}% of total spending).`);
    }

    const subTotal = expenses
      .filter((e) => e.autoGenerated)
      .reduce((sum, e) => sum + e.amount, 0);
    if (subTotal > 0 && totalExpenses > 0) {
      const subPercent = Math.round((subTotal / totalExpenses) * 100);
      insights.push(`Subscriptions account for ${fmt(subTotal)} (${subPercent}% of your total expenses this month).`);
    }

    const summary = {
      month, year, totalIncome, totalExpenses, remaining,
      savingsPercent, categoryBreakdown, monthlyTrend: trendData, insights,
    };

    await redis.set(key, summary, { ex: CACHE_TTL });
    return NextResponse.json({ summary });
  } catch (error) {
    console.error("[MOBILE_SUMMARY_GET]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
