import { NextRequest, NextResponse } from "next/server";
import { createAdminSessionToken, isValidAdminToken } from "@/lib/admin-auth";

export async function POST(request: NextRequest) {
  const { secret } = await request.json();
  const adminSecret = process.env.ADMIN_SECRET;

  if (!isValidAdminToken(secret, adminSecret)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set("admin_token", createAdminSessionToken(adminSecret!), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 60 * 60 * 24,
    path: "/",
  });

  return response;
}
