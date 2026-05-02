import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(db),
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "credentials") return true;
      if (account?.provider === "google") return true;
      return false;
    },
    async session({ session, token }) {
      if (token.sub && session.user) {
        session.user.id = token.sub;
        session.user.username = token.username as string;
        session.user.currency = token.currency as string;
        session.user.incomeType = token.incomeType as string;
        session.user.isSetupDone = token.isSetupDone as boolean;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.username = user.username;
        token.currency = user.currency;
        token.incomeType = user.incomeType;
        token.isSetupDone = user.isSetupDone;
      }

      if (token.sub) {
        const dbUser = await db.user.findUnique({
          where: { id: token.sub },
        });
        if (dbUser) {
          token.username = dbUser.username;
          token.currency = dbUser.currency;
          token.incomeType = dbUser.incomeType;
          token.isSetupDone = dbUser.isSetupDone;
        }
      }

      return token;
    },
  },
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
    }),
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await db.user.findUnique({
          where: { email: credentials.email as string },
        });

        if (!user || !user.password) return null;

        const passwordMatch = await bcrypt.compare(
          credentials.password as string,
          user.password
        );

        if (!passwordMatch) return null;

        return user;
      },
    }),
  ],
});