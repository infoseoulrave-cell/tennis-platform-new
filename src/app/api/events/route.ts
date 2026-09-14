import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { eventLog } from "@/db/schema";
import { eventSchema } from "@/events/product-interaction-schema";

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

  // A successful response means the event was persisted before the function ends.
  try {
    await db.insert(eventLog).values({
      sessionId,
      eventType,
      payload: payload ?? null,
      pageUrl: pageUrl ?? null,
      referrer: referrer ?? null,
      userAgent: userAgent ?? null,
    });
  } catch {
    console.error("[events] insert failed");
    return NextResponse.json({ error: "Event storage unavailable" }, { status: 503 });
  }

  return new NextResponse(null, { status: 204 });
}
