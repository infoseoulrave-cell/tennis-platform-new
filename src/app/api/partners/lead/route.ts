import { db } from "@/db";
import { partnerLeads } from "@/db/schema";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const leadSchema = z.object({
  partnerOfferId: z.string().uuid(),
  playerProfileId: z.string().uuid().optional(),
  recommendationResultId: z.string().uuid().optional(),
  leadType: z.enum([
    "demo_request",
    "fitting_appointment",
    "restring_booking",
    "lesson_intro",
  ]),
  metadata: z.record(z.unknown()).optional(),
});

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON in request body" },
      { status: 400 }
    );
  }

  const parsed = leadSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Validation failed",
        details: parsed.error.flatten().fieldErrors,
      },
      { status: 422 }
    );
  }

  const {
    partnerOfferId,
    playerProfileId,
    recommendationResultId,
    leadType,
    metadata,
  } = parsed.data;

  try {
    const [lead] = await db
      .insert(partnerLeads)
      .values({
        partnerOfferId,
        playerProfileId: playerProfileId ?? null,
        recommendationResultId: recommendationResultId ?? null,
        leadType,
        metadata: metadata ?? null,
      })
      .returning({ id: partnerLeads.id, createdAt: partnerLeads.createdAt });

    return NextResponse.json(
      { id: lead.id, createdAt: lead.createdAt },
      { status: 201 }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unexpected error";
    console.error("[partners/lead] insert failed:", err);
    return NextResponse.json(
      { error: "Failed to record lead", message },
      { status: 500 }
    );
  }
}
