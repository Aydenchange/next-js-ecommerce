"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const AUTH_COOKIE_NAME = "admin-auth";
const AUTH_COOKIE_MAX_AGE = 60 * 60 * 24 * 7;

export type LoginFormState = {
  error?: string;
};

export async function login(
  _prevState: LoginFormState,
  formData: FormData,
): Promise<LoginFormState> {
  const password = String(formData.get("password") ?? "").trim();
  const nextPathRaw = String(formData.get("next") ?? "/admin");
  const nextPath = nextPathRaw.startsWith("/admin") ? nextPathRaw : "/admin";

  const adminPassword = process.env.ADMIN_PASSWORD?.trim();

  if (!password || !adminPassword || password !== adminPassword) {
    return { error: "Password is incorrect" };
  }

  (await cookies()).set(AUTH_COOKIE_NAME, "1", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: AUTH_COOKIE_MAX_AGE,
  });

  redirect(nextPath);
}

export async function logout() {
  (await cookies()).set(AUTH_COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });

  redirect("/login");
}
