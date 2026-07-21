import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { partnerInquiries } from "@/db/schema";
import { partnerInquirySchema } from "@/lib/partner-inquiry";

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = partnerInquirySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  try {
    await db.insert(partnerInquiries).values({
      inquiryType: parsed.data.inquiryType,
      name: parsed.data.name,
      contact: parsed.data.contact,
      message: parsed.data.message ?? null,
    });
  } catch (err) {
    console.error("[partner-inquiries] insert failed:", err);
    return NextResponse.json({ error: "저장에 실패했습니다" }, { status: 500 });
  }

  return NextResponse.json({ ok: true }, { status: 201 });
}
