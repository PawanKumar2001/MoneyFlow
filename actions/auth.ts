"use server";

import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { signIn, signOut } from "@/lib/auth";
import { AuthError } from "next-auth";

export async function registerUser(data: {
  username: string;
  email: string;
  password: string;
}) {
  const { username, email, password } = data;

  // Check if user already exists
  const existingUser = await db.user.findUnique({ where: { email } });
  if (existingUser) {
    return { error: "Email already in use." };
  }

  const existingUsername = await db.user.findUnique({ where: { username } });
  if (existingUsername) {
    return { error: "Username already taken." };
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  await db.user.create({
    data: {
      username,
      email,
      password: hashedPassword,
    },
  });

  // Auto sign in after registration
  await signIn("credentials", {
    email,
    password: "__OTP_VERIFIED__",
    redirectTo: "/setup",
  });
}

export async function verifyCredentials(data: {
  email: string;
  password: string;
}) {
  const user = await db.user.findUnique({
    where: { email: data.email },
  });

  if (!user || !user.password) {
    return { error: "Invalid email or password." };
  }

  const passwordMatch = await bcrypt.compare(data.password, user.password);
  if (!passwordMatch) {
    return { error: "Invalid email or password." };
  }

  return { success: true };
}

export async function completeLogin(email: string) {
  try {
    await signIn("credentials", {
      email,
      password: "__OTP_VERIFIED__",
      redirectTo: "/dashboard",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Something went wrong." };
    }
    throw error;
  }
}

export async function loginUser(data: {
  email: string;
  password: string;
}) {
  try {
    await signIn("credentials", {
      email: data.email,
      password: data.password,
      redirectTo: "/dashboard",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "Invalid email or password." };
        default:
          return { error: "Something went wrong." };
      }
    }
    throw error;
  }
}

export async function setUsername(username: string) {
  const { auth } = await import("@/lib/auth");
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  const existing = await db.user.findUnique({ where: { username } });
  if (existing) return { error: "Username already taken." };

  await db.user.update({
    where: { id: session.user.id },
    data: { username },
  });

  return { success: true };
}

export async function logoutUser() {
  await signOut({ redirectTo: "/login" });
}