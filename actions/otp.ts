"use server";

import { db } from "@/lib/db";
import { sendOTPEmail } from "@/lib/email";

function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function sendOTP(
  email: string,
  type: "SIGNUP" | "LOGIN"
) {
  // Delete any existing unused codes for this email + type
  await db.verificationCode.deleteMany({
    where: { email, type, used: false },
  });

  const code = generateOTP();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  await db.verificationCode.create({
    data: {
      email,
      code,
      type,
      expiresAt,
    },
  });

  await sendOTPEmail(email, code, type);

  return { success: true };
}

export async function verifyOTP(
  email: string,
  code: string,
  type: "SIGNUP" | "LOGIN"
): Promise<{ success: boolean; error?: string }> {
  const record = await db.verificationCode.findFirst({
    where: {
      email,
      type,
      used: false,
    },
    orderBy: { createdAt: "desc" },
  });

  if (!record) {
    return { success: false, error: "Invalid or expired code." };
  }

  // Check expiry
  if (new Date() > record.expiresAt) {
    await db.verificationCode.delete({ where: { id: record.id } });
    return { success: false, error: "Code has expired. Please request a new one." };
  }

  // Check attempts
  if (record.attempts >= 3) {
    await db.verificationCode.delete({ where: { id: record.id } });
    return { success: false, error: "Too many attempts. Please request a new code." };
  }

  // Wrong code
  if (record.code !== code) {
    await db.verificationCode.update({
      where: { id: record.id },
      data: { attempts: record.attempts + 1 },
    });
    return {
      success: false,
      error: `Incorrect code. ${2 - record.attempts} attempt${2 - record.attempts === 1 ? "" : "s"} remaining.`,
    };
  }

  // Mark as used
  await db.verificationCode.update({
    where: { id: record.id },
    data: { used: true },
  });

  return { success: true };
}