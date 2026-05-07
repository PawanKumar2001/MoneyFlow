"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import {
  getCache,
  setCache,
  deleteCache,
  cacheKeys,
  TTL,
} from "@/lib/redis";

export async function getUserIncome() {
  const session = await auth();
  if (!session?.user?.id)
    return { total: 0, currency: "INR", incomes: [], incomeType: "SALARIED" };

  const userId = session.user.id;
  const cacheKey = cacheKeys.income(userId);

  // Try cache first
  const cached = await getCache<any>(cacheKey);
  if (cached) return cached;

  const [incomes, user] = await Promise.all([
    db.income.findMany({
      where: { userId },
      orderBy: { createdAt: "asc" },
    }),
    db.user.findUnique({ where: { id: userId } }),
  ]);

  const total = incomes.reduce((sum, i) => sum + i.amount, 0);
  const result = {
    total,
    currency: user?.currency ?? "INR",
    incomeType: user?.incomeType ?? "SALARIED",
    incomes,
  };

  await setCache(cacheKey, result, TTL.INCOME);

  return result;
}

export async function getMonthlyFreelanceIncome(month: number, year: number) {
  const session = await auth();
  if (!session?.user?.id) return { total: 0, entries: [] };

  const userId = session.user.id;
  const cacheKey = cacheKeys.freelanceIncome(userId, month, year);

  const cached = await getCache<any>(cacheKey);
  if (cached) return cached;

  const entries = await db.income.findMany({
    where: { userId, month, year },
    orderBy: { createdAt: "desc" },
  });

  const total = entries.reduce((sum, i) => sum + i.amount, 0);
  const result = { total, entries };

  await setCache(cacheKey, result, TTL.INCOME);

  return result;
}

export async function logFreelanceIncome(data: {
  sourceName: string;
  amount: number;
  month: number;
  year: number;
}) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  const userId = session.user.id;

  await db.income.create({
    data: {
      userId,
      type: "PRIMARY",
      sourceName: data.sourceName,
      amount: Number(data.amount),
      month: data.month,
      year: data.year,
    },
  });

  // Invalidate caches
  await deleteCache(cacheKeys.freelanceIncome(userId, data.month, data.year));
  await deleteCache(cacheKeys.income(userId));

  return { success: true };
}

export async function updateFreelanceIncome(
  id: string,
  data: { sourceName: string; amount: number }
) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  const userId = session.user.id;

  const existing = await db.income.findUnique({ where: { id } });

  await db.income.update({
    where: { id, userId },
    data: {
      sourceName: data.sourceName,
      amount: Number(data.amount),
    },
  });

  if (existing?.month && existing?.year) {
    await deleteCache(
      cacheKeys.freelanceIncome(userId, existing.month, existing.year)
    );
  }
  await deleteCache(cacheKeys.income(userId));

  return { success: true };
}

export async function deleteFreelanceIncome(id: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  const userId = session.user.id;

  const existing = await db.income.findUnique({ where: { id } });

  await db.income.delete({ where: { id, userId } });

  if (existing?.month && existing?.year) {
    await deleteCache(
      cacheKeys.freelanceIncome(userId, existing.month, existing.year)
    );
  }
  await deleteCache(cacheKeys.income(userId));

  return { success: true };
}

export async function updateIncome(data: {
  primaryIncome: { id?: string; sourceName: string; amount: number };
  secondaryIncomes: { id?: string; sourceName: string; amount: number }[];
}) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  const userId = session.user.id;

  if (data.primaryIncome.id) {
    await db.income.update({
      where: { id: data.primaryIncome.id },
      data: {
        sourceName: data.primaryIncome.sourceName,
        amount: Number(data.primaryIncome.amount),
      },
    });
  } else {
    await db.income.create({
      data: {
        userId,
        type: "PRIMARY",
        sourceName: data.primaryIncome.sourceName,
        amount: Number(data.primaryIncome.amount),
      },
    });
  }

  const existing = await db.income.findMany({
    where: { userId, type: "SECONDARY" },
  });

  const incomingIds = data.secondaryIncomes
    .filter((i) => i.id)
    .map((i) => i.id!);

  for (const inc of existing) {
    if (!incomingIds.includes(inc.id)) {
      await db.income.delete({ where: { id: inc.id } });
    }
  }

  for (const inc of data.secondaryIncomes) {
    if (!inc.sourceName || inc.amount <= 0) continue;
    if (inc.id) {
      await db.income.update({
        where: { id: inc.id },
        data: {
          sourceName: inc.sourceName,
          amount: Number(inc.amount),
        },
      });
    } else {
      await db.income.create({
        data: {
          userId,
          type: "SECONDARY",
          sourceName: inc.sourceName,
          amount: Number(inc.amount),
        },
      });
    }
  }

  // Invalidate income cache
  await deleteCache(cacheKeys.income(userId));

  return { success: true };
}