"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import bcrypt from "bcryptjs";
import { deleteCachePattern, deleteCache, cacheKeys } from "@/lib/redis";

export async function updateProfile(data: {
  username: string;
  emailSummary: boolean;
}) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  const existing = await db.user.findFirst({
    where: {
      username: data.username,
      NOT: { id: session.user.id },
    },
  });

  if (existing) return { error: "Username already taken." };

  await db.user.update({
    where: { id: session.user.id },
    data: {
      username: data.username,
      emailSummary: data.emailSummary,
    },
  });

  return { success: true };
}

export async function updateCredentials(data: {
  currentPassword: string;
  newPassword: string;
}) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  const user = await db.user.findUnique({
    where: { id: session.user.id },
  });

  if (!user?.password) {
    return { error: "This account uses Google sign-in. Password change is not available." };
  }

  const isValid = await bcrypt.compare(data.currentPassword, user.password);
  if (!isValid) return { error: "Current password is incorrect." };

  const hashed = await bcrypt.hash(data.newPassword, 12);
  await db.user.update({
    where: { id: session.user.id },
    data: { password: hashed },
  });

  return { success: true };
}

export async function resetUserSetup() {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  const userId = session.user.id;

  // Delete all data
  await db.income.deleteMany({ where: { userId } });
  await db.expense.deleteMany({ where: { userId } });
  await db.subscription.deleteMany({ where: { userId } });

  // Reset user
  await db.user.update({
    where: { id: userId },
    data: {
      isSetupDone: false,
      incomeType: "SALARIED",
      currency: "INR",
    },
  });

  // Clear all Redis caches for this user
  await deleteCache(cacheKeys.income(userId));
  await deleteCache(cacheKeys.subscriptions(userId));
  await deleteCachePattern(`expenses:${userId}:*`);
  await deleteCachePattern(`summary:${userId}:*`);
  await deleteCachePattern(`trend:${userId}:*`);
  await deleteCachePattern(`freelance-income:${userId}:*`);

  return { success: true };
}

export async function deleteAccount() {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  const userId = session.user.id;

  try {
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { email: true },
    });

    if (!user?.email) {
      return { error: "User not found." };
    }

    await db.$transaction(async (tx) => {
      // These records are not connected to User by relation, so delete them by email.
      await tx.verificationCode.deleteMany({
        where: { email: user.email },
      });

      await tx.passwordResetToken.deleteMany({
        where: { email: user.email },
      });

      // User-owned records are configured with onDelete: Cascade in Prisma,
      // but we delete these explicitly to keep the action predictable.
      await tx.income.deleteMany({ where: { userId } });
      await tx.expense.deleteMany({ where: { userId } });
      await tx.subscription.deleteMany({ where: { userId } });
      await tx.account.deleteMany({ where: { userId } });
      await tx.session.deleteMany({ where: { userId } });

      await tx.user.delete({
        where: { id: userId },
      });
    });

    // Clear all Redis caches for this user after the database transaction succeeds.
    await deleteCache(cacheKeys.income(userId));
    await deleteCache(cacheKeys.subscriptions(userId));
    await deleteCachePattern(`expenses:${userId}:*`);
    await deleteCachePattern(`summary:${userId}:*`);
    await deleteCachePattern(`trend:${userId}:*`);
    await deleteCachePattern(`freelance-income:${userId}:*`);

    return { success: true };
  } catch (error) {
    console.error("Delete account failed:", error);
    return { error: "Failed to delete account. Please try again." };
  }
}
