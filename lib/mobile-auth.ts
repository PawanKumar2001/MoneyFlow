import { encode, decode } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { AuthTokenPayload } from "@/types";

const SECRET = process.env.AUTH_SECRET!;
const SALT = "moneyflow-mobile-token";

export async function signMobileToken(payload: AuthTokenPayload): Promise<string> {
  return await encode({
    token: payload,
    secret: SECRET,
    salt: SALT,
    maxAge: 30 * 24 * 60 * 60, // 30 days
  });
}

export async function verifyMobileToken(token: string): Promise<AuthTokenPayload | null> {
  try {
    const decoded = await decode({
      token,
      secret: SECRET,
      salt: SALT,
    });

    return decoded as AuthTokenPayload | null;
  } catch {
    return null;
  }
}

export async function requireMobileUser(req: NextRequest) {
  const token = req.headers.get("authorization")?.replace("Bearer ", "").trim();

  if (!token) {
    return {
      user: null,
      payload: null,
      error: NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 }),
    };
  }

  const payload = await verifyMobileToken(token);

  if (!payload?.userId) {
    return {
      user: null,
      payload: null,
      error: NextResponse.json({ error: "INVALID_TOKEN" }, { status: 401 }),
    };
  }

  const user = await db.user.findUnique({
    where: { id: payload.userId },
  });

  if (!user) {
    return {
      user: null,
      payload,
      error: NextResponse.json({ error: "ACCOUNT_DELETED" }, { status: 401 }),
    };
  }

  return {
    user,
    payload,
    error: null,
  };
}
