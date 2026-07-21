import { createHmac, timingSafeEqual } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";

export function isValidAdminToken(
  token: unknown,
  secret: unknown,
): boolean {
  if (typeof token !== "string" || typeof secret !== "string" || !token || !secret) {
    return false;
  }

  const tokenBuffer = Buffer.from(token);
  const secretBuffer = Buffer.from(secret);
  return tokenBuffer.length === secretBuffer.length
    && timingSafeEqual(tokenBuffer, secretBuffer);
}

export function createAdminSessionToken(secret: string): string {
  return createHmac("sha256", secret)
    .update("racketlab-admin-session:v1")
    .digest("hex");
}

export function isAdminRequest(
  request: NextRequest,
  secret: string | undefined = process.env.ADMIN_SECRET,
): boolean {
  if (!secret) return false;
  return isValidAdminToken(
    request.cookies.get("admin_token")?.value,
    createAdminSessionToken(secret),
  );
}

export function unauthorizedAdminResponse(): NextResponse {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}
