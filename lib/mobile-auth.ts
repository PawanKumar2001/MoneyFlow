import { encode, decode } from "next-auth/jwt";
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