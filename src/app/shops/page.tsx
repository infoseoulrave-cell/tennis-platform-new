import type { Metadata } from "next";
import Link from "next/link";

import { ShopContactLink } from "@/components/shop-contact-link";
import { getAllActiveShops } from "@/lib/shops";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "매장 찾기",
  description:
    "racket lab에 등록된 테니스 매장 목록입니다. 라켓 구매와 스트링 장착을 상담할 수 있는 매장을 찾아보세요.",
};

/**
 * 매장 디렉토리 (마켓플레이스 0단계 — 소개).
 * 등록 매장이 없으면 준비 중 안내와 입점 문의 동선만 보여준다.
 * 임시 매장 정보를 지어내지 않는다.
 */
export default async function ShopsPage() {
  const shops = await getAllActiveShops().catch(() => []);

  return (
    <div className="mx-auto max-w-3xl px-6 py-8 md:py-12">
      <header className="border-b border-[var(--color-border)] pb-8">
        <p className="text-xs font-semibold tracking-[0.18em] text-[var(--color-text-muted)] uppercase">
          Shops
        </p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">
          매장 찾기
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-[var(--color-text-secondary)]">
          라켓 구매와 스트링 장착을 상담할 수 있는 매장입니다. 매장 등록
          여부는 라켓 점수와 추천 순위에 반영하지 않습니다.
        </p>
      </header>

      {shops.length === 0 ? (
        <section className="mt-8 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-subtle)] p-8 text-center">
          <span className="text-3xl" aria-hidden="true">
            🎾
          </span>
          <h2 className="mt-4 text-xl font-bold">등록 매장 준비 중</h2>
          <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-[var(--color-text-secondary)]">
            지금 함께할 매장을 모으고 있습니다. 확인된 매장만 등록하며, 임시
            정보를 표시하지 않습니다.
          </p>
          <Link
            href="/partners"
            className="mt-6 inline-flex min-h-11 items-center justify-center rounded-xl bg-[var(--color-text)] px-5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
          >
            매장 입점 문의하기
          </Link>
        </section>
      ) : (
        <ul className="mt-8 space-y-4">
          {shops.map((shop) => (
            <li
              key={shop.id}
              className="flex items-center gap-4 rounded-2xl border border-[var(--color-border)] p-5"
            >
              <div className="min-w-0 flex-1">
                <h2 className="text-sm font-semibold">
                  {shop.nameKo ?? shop.name}
                </h2>
                {shop.location && (
                  <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                    {shop.location}
                  </p>
                )}
                {shop.description && (
                  <p className="mt-1 text-xs leading-relaxed text-[var(--color-text-secondary)]">
                    {shop.description}
                  </p>
                )}
              </div>
              {shop.contactUrl && (
                <ShopContactLink shopId={shop.id} href={shop.contactUrl}>
                  연락·위치
                </ShopContactLink>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
