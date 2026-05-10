import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sendMonthlySummaryEmail } from "@/lib/email";
import { getCurrencySymbol } from "@/lib/currency";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  // Verify the request is from Vercel Cron
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Get the previous month
    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const month = lastMonth.getMonth() + 1;
    const year = lastMonth.getFullYear();

    const MONTHS = [
      "January", "February", "March", "April",
      "May", "June", "July", "August",
      "September", "October", "November", "December",
    ];

    // Get all users
    const users = await db.user.findMany({
      where: {
        isSetupDone: true,
        emailSummary: true,
      },
      include: { incomes: true },
    });

    let sent = 0;
    let failed = 0;

    for (const user of users) {
      try {
        if (!user.email) continue;

        // Get expenses for last month
        const expenses = await db.expense.findMany({
          where: { userId: user.id, month, year },
        });

        // Skip if no activity
        if (expenses.length === 0) continue;

        // Calculate income
        let totalIncome = 0;
        if (user.incomeType === "SALARIED") {
          totalIncome = user.incomes.reduce((sum, i) => sum + i.amount, 0);
        } else {
          totalIncome = user.incomes
            .filter((i) => i.month === month && i.year === year)
            .reduce((sum, i) => sum + i.amount, 0);
        }

        const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
        const remaining = totalIncome - totalExpenses;
        const savingsPercent =
          totalIncome > 0
            ? ((remaining / totalIncome) * 100).toFixed(1)
            : "0";

        // Get top category
        const categoryMap: Record<string, number> = {};
        for (const expense of expenses) {
          categoryMap[expense.category] =
            (categoryMap[expense.category] || 0) + expense.amount;
        }
        const topCategory =
          Object.entries(categoryMap).sort((a, b) => b[1] - a[1])[0]?.[0] ??
          "N/A";

        const symbol = getCurrencySymbol(user.currency);

        await sendMonthlySummaryEmail(user.email, user.username ?? "there", {
          month: MONTHS[month - 1],
          year,
          totalIncome,
          totalExpenses,
          remaining,
          savingsPercent,
          topCategory,
          currency: symbol,
        });

        sent++;
      } catch (err) {
        console.error(`Failed to send summary to ${user.email}:`, err);
        failed++;
      }
    }

    return NextResponse.json({
      success: true,
      sent,
      failed,
      month: MONTHS[month - 1],
      year,
    });
  } catch (error) {
    console.error("Cron job failed:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}