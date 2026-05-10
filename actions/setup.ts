"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

type IncomeEntry = {
  sourceName: string;
  amount: number;
};

type SetupData = {
  incomeType: "SALARIED" | "FREELANCER";
  currency: string;
  emailSummary: boolean;
  primaryIncome?: IncomeEntry;
  secondaryIncomes?: IncomeEntry[];
};

export async function completeSetup(data: SetupData) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  const { incomeType, currency, emailSummary, primaryIncome, secondaryIncomes } = data;

  if (incomeType === "SALARIED") {
    if (!primaryIncome?.sourceName || Number(primaryIncome?.amount) <= 0) {
      return { error: "Primary income is required and must be greater than 0." };
    }
  }

  await db.user.update({
    where: { id: session.user.id },
    data: { currency, incomeType, emailSummary, isSetupDone: true },
  });

  if (incomeType === "SALARIED" && primaryIncome) {
    await db.income.create({
      data: {
        userId: session.user.id,
        type: "PRIMARY",
        sourceName: primaryIncome.sourceName,
        amount: Number(primaryIncome.amount),
      },
    });

    if (secondaryIncomes) {
      for (const income of secondaryIncomes) {
        if (income.sourceName && Number(income.amount) > 0) {
          await db.income.create({
            data: {
              userId: session.user.id,
              type: "SECONDARY",
              sourceName: income.sourceName,
              amount: Number(income.amount),
            },
          });
        }
      }
    }
  }

  redirect("/dashboard");
}