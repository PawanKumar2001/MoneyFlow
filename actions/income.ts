"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function getUserIncome() {
  const session = await auth();
  if (!session?.user?.id)
    return { total: 0, currency: "INR", incomes: [], incomeType: "SALARIED" };

  const [incomes, user] = await Promise.all([
    db.income.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "asc" },
    }),
    db.user.findUnique({ where: { id: session.user.id } }),
  ]);

  const total = incomes.reduce((sum, i) => sum + i.amount, 0);
  return {
    total,
    currency: user?.currency ?? "INR",
    incomeType: user?.incomeType ?? "SALARIED",
    incomes,
  };
}

export async function getMonthlyFreelanceIncome(month: number, year: number) {
  const session = await auth();
  if (!session?.user?.id) return { total: 0, entries: [] };

  const entries = await db.income.findMany({
    where: {
      userId: session.user.id,
      month,
      year,
    },
    orderBy: { createdAt: "desc" },
  });

  const total = entries.reduce((sum, i) => sum + i.amount, 0);
  return { total, entries };
}

export async function logFreelanceIncome(data: {
  sourceName: string;
  amount: number;
  month: number;
  year: number;
}) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  await db.income.create({
    data: {
      userId: session.user.id,
      type: "PRIMARY",
      sourceName: data.sourceName,
      amount: Number(data.amount),
      month: data.month,
      year: data.year,
    },
  });

  return { success: true };
}

export async function updateFreelanceIncome(
  id: string,
  data: { sourceName: string; amount: number }
) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  await db.income.update({
    where: { id, userId: session.user.id },
    data: {
      sourceName: data.sourceName,
      amount: Number(data.amount),
    },
  });

  return { success: true };
}

export async function deleteFreelanceIncome(id: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  await db.income.delete({
    where: { id, userId: session.user.id },
  });

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

  return { success: true };
}