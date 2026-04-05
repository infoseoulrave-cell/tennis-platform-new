import { db } from "@/db";
import { eventLog } from "@/db/schema";
import type { EventType, EventPayloadMap } from "./taxonomy";

export async function track<T extends EventType>(
  sessionId: string,
  eventType: T,
  payload: EventPayloadMap[T],
  context?: { pageUrl?: string; referrer?: string; userAgent?: string },
) {
  await db.insert(eventLog).values({
    sessionId,
    eventType,
    payload,
    pageUrl: context?.pageUrl,
    referrer: context?.referrer,
    userAgent: context?.userAgent,
  });
}
