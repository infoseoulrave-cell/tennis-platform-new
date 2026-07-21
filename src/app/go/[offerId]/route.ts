import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { eventLog, offers } from "@/db/schema";

/**
 * 아웃바운드 어필리에이트 리다이렉트.
 * 클릭을 event_log에 기록한 뒤 판매처로 302.
 * JS 없이도 동작하며, 향후 전환 attribution의 단일 진입점이 된다.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ offerId: string }> },
) {
  const { offerId } = await params;

  if (!/^[0-9a-f-]{36}$/i.test(offerId)) {
    return NextResponse.redirect(new URL("/rackets", request.url));
  }

  const [offer] = await db
    .select()
    .from(offers)
    .where(eq(offers.id, offerId))
    .limit(1)
    .catch(() => []);

  if (!offer || !offer.active) {
    return NextResponse.redirect(new URL("/rackets", request.url));
  }

  const sessionId =
    request.nextUrl.searchParams.get("s") ??
    request.cookies.get("rl_session")?.value ??
    "anonymous";

  try {
    await db.insert(eventLog).values({
      sessionId,
      eventType: "affiliate_click",
      payload: {
        offerId: offer.id,
        racketSlug: offer.racketSlug,
        vendor: offer.vendor,
        priceKrw: offer.priceKrw,
      },
      pageUrl: request.headers.get("referer"),
      referrer: request.headers.get("referer"),
      userAgent: request.headers.get("user-agent"),
    });
  } catch (err) {
    // 로깅 실패가 사용자 리다이렉트를 막으면 안 된다
    console.error("[go] click log failed:", err);
  }

  return NextResponse.redirect(offer.url, 302);
}
