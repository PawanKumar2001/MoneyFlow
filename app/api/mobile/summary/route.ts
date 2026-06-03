// app/api/mobile/summary/route.ts

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireMobileUser } from "@/lib/mobile-auth";
import { redis } from "@/lib/redis";

const CACHE_TTL = 600;

function cacheKey(userId: string, month: number, year: number) {
  return `summary:${userId}:${month}:${year}`;
}

function parseRequiredNumber(value: string | null) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

export async function GET(req: NextRequest) {
  try {
    const { user, error } = await requireMobileUser(req);
    if (error) return error;

    const { searchParams } = new URL(req.url);
    const month = parseRequiredNumber(searchParams.get("month"));
    const year = parseRequiredNumber(searchParams.get("year"));

    if (month === null || year === null) {
      return NextResponse.json(
        { error: "month and year required" },
        { status: 400 }
      );
    }

    const key = cacheKey(user.id, month, year);
    const cached = await redis.get(key);
    if (cached) return NextResponse.json({ summary: cached });

    const isSalaried = user.incomeType === "SALARIED";

    const expenses = await db.expense.findMany({
      where: { userId: user.id, month, year },
    });

    let totalIncome = 0;

    if (isSalaried) {
      const allIncome = await db.income.findMany({
        where: { userId: user.id },
      });
      totalIncome = allIncome.reduce((sum, income) => sum + income.amount, 0);
    } else {
      const monthIncome = await db.income.findMany({
        where: { userId: user.id, month, year },
      });
      totalIncome = monthIncome.reduce((sum, income) => sum + income.amount, 0);
    }

    const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    const remaining = totalIncome - totalExpenses;
    const savingsPercent =
      totalIncome > 0
        ? Math.max(0, Math.round(((totalIncome - totalExpenses) / totalIncome) * 100))
        : 0;

    const categoryMap: Record<string, number> = {};
    for (const expense of expenses) {
      categoryMap[expense.category] =
        (categoryMap[expense.category] ?? 0) + expense.amount;
    }

    const categoryBreakdown = Object.entries(categoryMap).map(
      ([category, amount]) => ({
        category,
        amount,
        percentage:
          totalExpenses > 0 ? Math.round((amount / totalExpenses) * 100) : 0,
      })
    );

    const trendMonths: { month: number; year: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date(year, month - 1 - i, 1);
      trendMonths.push({ month: date.getMonth() + 1, year: date.getFullYear() });
    }

    let salariedMonthlyIncome = 0;
    if (isSalaried) {
      const allIncome = await db.income.findMany({
        where: { userId: user.id },
      });
      salariedMonthlyIncome = allIncome.reduce(
        (sum, income) => sum + income.amount,
        0
      );
    }

    const trendData = await Promise.all(
      trendMonths.map(async ({ month: trendMonth, year: trendYear }) => {
        const monthExpensesAgg = await db.expense.aggregate({
          where: { userId: user.id, month: trendMonth, year: trendYear },
          _sum: { amount: true },
        });

        let monthIncome = 0;

        if (isSalaried) {
          monthIncome = salariedMonthlyIncome;
        } else {
          const monthIncomeAgg = await db.income.aggregate({
            where: { userId: user.id, month: trendMonth, year: trendYear },
            _sum: { amount: true },
          });
          monthIncome = monthIncomeAgg._sum.amount ?? 0;
        }

        return {
          month: trendMonth,
          year: trendYear,
          expenses: monthExpensesAgg._sum.amount ?? 0,
          income: monthIncome,
        };
      })
    );

    const format = (value: number) =>
      value.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });

    const insights: string[] = [];

    if (totalIncome > 0) {
      insights.push(
        `You earned a total of ${format(totalIncome)} this month, saving ${savingsPercent}% of your income.`
      );
    }

    if (remaining < 0) {
      insights.push(
        `You overspent by ${format(Math.abs(remaining))} this month. Review your expenses to get back on track.`
      );
    } else if (savingsPercent >= 30) {
      insights.push(
        `Excellent! You saved ${format(remaining)}, which is ${savingsPercent}% of your income.`
      );
    } else if (savingsPercent >= 20) {
      insights.push(
        `Good job! You saved ${format(remaining)} this month — above the recommended 20% savings rate.`
      );
    } else if (savingsPercent < 10 && totalIncome > 0) {
      insights.push(
        `Your savings rate is only ${savingsPercent}% this month. Aim to save at least 20% of your income.`
      );
    }

    const sortedCategories = [...categoryBreakdown].sort(
      (a, b) => b.amount - a.amount
    );
    const topCategory = sortedCategories[0];

    if (topCategory && totalExpenses > 0) {
      insights.push(
        `Your biggest expense category is ${topCategory.category} at ${format(topCategory.amount)} (${topCategory.percentage}% of total spending).`
      );
    }

    const subscriptionTotal = expenses
      .filter((expense) => expense.autoGenerated)
      .reduce((sum, expense) => sum + expense.amount, 0);

    if (subscriptionTotal > 0 && totalExpenses > 0) {
      const subscriptionPercent = Math.round(
        (subscriptionTotal / totalExpenses) * 100
      );
      insights.push(
        `Subscriptions account for ${format(subscriptionTotal)} (${subscriptionPercent}% of your total expenses this month).`
      );
    }

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
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
