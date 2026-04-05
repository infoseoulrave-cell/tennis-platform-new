import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import { eventLog } from "@/db/schema";

const EVENT_TYPES = [
  "diagnosis_start",
  "diagnosis_step_complete",
  "diagnosis_complete",
  "recommendation_view",
  "recommendation_detail_view",
  "compare_add",
  "compare_view",
  "save_result",
  "partner_click",
  "partner_lead_submit",
  "page_view",
  "search",
] as const;

const eventSchema = z.object({
  sessionId: z.string().min(1).max(100),
  eventType: z.enum(EVENT_TYPES),
  payload: z.record(z.unknown()).optional(),
  pageUrl: z.string().optional(),
  referrer: z.string().optional(),
});

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = eventSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  const { sessionId, eventType, payload, pageUrl, referrer } = parsed.data;
  const userAgent = request.headers.get("user-agent") ?? undefined;

  // Fire-and-forget — don't await so the response is returned immediately
  db.insert(eventLog)
    .values({
      sessionId,
      eventType,
      payload: payload ?? null,
      pageUrl: pageUrl ?? null,
      referrer: referrer ?? null,
      userAgent: userAgent ?? null,
    })
    .catch((err) => {
      console.error("[events] insert failed:", err);
    });

  return new NextResponse(null, { status: 204 });
}
