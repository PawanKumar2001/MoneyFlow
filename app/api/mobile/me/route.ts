import { NextRequest, NextResponse } from "next/server";
import { requireMobileUser } from "@/lib/mobile-auth";

export async function GET(req: NextRequest) {
  const { user, error } = await requireMobileUser(req);

  if (error) return error;

  const safeUser = {
    id: user.id,
    email: user.email,
    name: user.name,
    username: user.username,
    image: user.image,
    currency: user.currency,
    incomeType: user.incomeType,
    isSetupDone: user.isSetupDone,
    emailSummary: user.emailSummary,
    hasPassword: !!user.password,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };

  return NextResponse.json({ user: safeUser });
}
