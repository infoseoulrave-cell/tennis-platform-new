"use client";

/**
 * 매장 연락처/지도 링크. 클릭을 `partner_leads` 로 남겨 어느 매장에 관심이
 * 모이는지 본다 — 이후 판매 연동(C조각) 영업의 근거 데이터가 된다.
 * 기록 실패는 조용히 무시한다. 링크 이동을 막지 않는 것이 우선이다.
 */
export function ShopContactLink({
  shopId,
  href,
  children,
}: {
  shopId: string;
  href: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => {
        void fetch("/api/partners/lead", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            partnerOfferId: shopId,
            leadType: "shop_contact_click",
          }),
          keepalive: true,
        }).catch(() => {});
      }}
      className="inline-flex min-h-11 items-center justify-center rounded-lg border border-[var(--color-border)] px-4 text-xs font-medium hover:border-[var(--color-text-muted)]"
    >
      {children}
    </a>
  );
}
