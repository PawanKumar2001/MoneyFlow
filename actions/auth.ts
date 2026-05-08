"use server";

import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { signIn, signOut, auth } from "@/lib/auth";
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
    password,
    redirectTo: "/setup",
  });
}

export async function loginUser(
  data: { email: string; password: string },
  skipPassword?: boolean
) {
  try {
    await signIn("credentials", {
      email: data.email,
      password: skipPassword ? "__OTP_VERIFIED__" : data.password,
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

export async function logoutUser() {
  await signOut({ redirectTo: "/login" });
}

export async function setUsername(username: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  // Check if username is taken
  const existing = await db.user.findUnique({ where: { username } });
  if (existing) return { error: "Username already taken." };

  await db.user.update({
    where: { id: session.user.id },
    data: { username },
  });

  return { success: true };
}