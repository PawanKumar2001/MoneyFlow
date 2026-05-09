"use server";

import { db } from "@/lib/db";
import { sendPasswordResetEmail } from "@/lib/email";
import bcrypt from "bcryptjs";
import crypto from "crypto";

export async function requestPasswordReset(email: string) {
  // Check if user exists
  const user = await db.user.findUnique({ where: { email } });
  if (!user) {
    // Don't reveal if email exists or not
    return { success: true };
  }

  if (!user.password) {
    return { error: "This account uses Google sign-in. Password reset is not available." };
  }

  // Delete any existing tokens for this email
  await db.passwordResetToken.deleteMany({ where: { email } });

  // Generate secure token
  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  await db.passwordResetToken.create({
    data: { email, token, expiresAt },
  });

  const resetLink = `${process.env.NEXTAUTH_URL}/reset-password?token=${token}`;

  await sendPasswordResetEmail(email, resetLink);

  return { success: true };
}

export async function validateResetToken(token: string) {
  const record = await db.passwordResetToken.findUnique({
    where: { token },
  });

  if (!record) return { valid: false, error: "Invalid reset link." };
  if (record.used) return { valid: false, error: "This reset link has already been used." };
  if (new Date() > record.expiresAt) return { valid: false, error: "This reset link has expired." };

  return { valid: true, email: record.email };
}

export async function resetPassword(token: string, newPassword: string) {
  // Validate token
  const validation = await validateResetToken(token);
  if (!validation.valid) return { error: validation.error };

  const hashedPassword = await bcrypt.hash(newPassword, 12);

  // Update password
  await db.user.update({
    where: { email: validation.email },
    data: { password: hashedPassword },
  });

  // Mark token as used
  await db.passwordResetToken.update({
    where: { token },
    data: { used: true },
  });

  return { success: true };
}