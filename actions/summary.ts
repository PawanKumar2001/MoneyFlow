"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function getMonthlySummary(month: number, year: number) {
  const session = await auth();
  if (!session?.user?.id) return null;

  const userId = session.user.id;

  const [expenses, user, subscriptions] = await Promise.all([
    db.expense.findMany({
      where: { userId, month, year },
      orderBy: { date: "desc" },
    }),
    db.user.findUnique({
      where: { id: userId },
      include: { incomes: true },
    }),
    db.subscription.findMany({
      where: { userId, isActive: true },
    }),
  ]);

  const incomeType = user?.incomeType ?? "SALARIED";

  // For salaried: sum all incomes (no month/year filter)
  // For freelancer: sum only this month's logged incomes
  let totalIncome = 0;
  if (incomeType === "SALARIED") {
    totalIncome = user?.incomes.reduce((sum, i) => sum + i.amount, 0) ?? 0;
  } else {
    totalIncome =
      user?.incomes
        .filter((i) => i.month === month && i.year === year)
        .reduce((sum, i) => sum + i.amount, 0) ?? 0;
  }

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const totalSubscriptions = subscriptions.reduce((sum, s) => sum + s.amount, 0);
  const remaining = totalIncome - totalExpenses;
  const savingsPercent =
    totalIncome > 0
      ? ((remaining / totalIncome) * 100).toFixed(1)
      : "0";

  // Group by category
  const categoryMap: Record<string, number> = {};
  for (const expense of expenses) {
    categoryMap[expense.category] =
      (categoryMap[expense.category] || 0) + expense.amount;
  }
  const byCategory = Object.entries(categoryMap)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  return {
    expenses,
    totalIncome,
    totalExpenses,
    totalSubscriptions,
    remaining,
    savingsPercent,
    byCategory,
    incomeType,
    currency: user?.currency ?? "INR",
  };
}

export async function getMonthlyTrend(month: number, year: number) {
  const session = await auth();
  if (!session?.user?.id) return [];

  const userId = session.user.id;
  const user = await db.user.findUnique({ where: { id: userId } });
  const incomeType = user?.incomeType ?? "SALARIED";
  const months = [];

  for (let i = 5; i >= 0; i--) {
    const date = new Date(year, month - 1 - i, 1);
    const m = date.getMonth() + 1;
    const y = date.getFullYear();

    const expenses = await db.expense.findMany({
      where: { userId, month: m, year: y },
    });

    let income = 0;
    if (incomeType === "SALARIED") {
      const incomes = await db.income.findMany({ where: { userId } });
      income = incomes.reduce((sum, i) => sum + i.amount, 0);
    } else {
      const incomes = await db.income.findMany({
        where: { userId, month: m, year: y },
      });
      income = incomes.reduce((sum, i) => sum + i.amount, 0);
    }

    const total = expenses.reduce((sum, e) => sum + e.amount, 0);
    months.push({
      name: date.toLocaleString("default", { month: "short" }),
      expenses: total,
      income,
    });
  }

  return months;
}