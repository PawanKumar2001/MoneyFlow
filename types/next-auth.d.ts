import { DefaultSession, DefaultUser } from "next-auth";
import { DefaultJWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      username: string | null;
      currency: string;
      incomeType: string;
      isSetupDone: boolean;
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    username?: string | null;
    currency?: string;
    incomeType?: string;
    isSetupDone?: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    username?: string | null;
    currency?: string;
    incomeType?: string;
    isSetupDone?: boolean;
  }
}