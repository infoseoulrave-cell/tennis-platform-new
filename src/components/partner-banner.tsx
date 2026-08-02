import Link from "next/link";

/**
 * 매장 입점 문의 배너.
 *
 * 마켓플레이스(매장 입점형)의 매장 섭외 진입점이다. 문의는 기존
 * `/partners` 폼(`partner_inquiries`)으로 모은다 — 입점 절차가 갖춰지기
 * 전이므로 "입점 신청"이 아니라 "문의"로 표현한다. 과장하지 않는다.
 */
export function PartnerBanner() {
  return (
    <section className="border-t border-[var(--color-border)] bg-[var(--color-bg-subtle)]">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base font-bold tracking-tight">
            테니스샵을 운영하시나요?
          </h2>
          <p className="mt-1 text-sm leading-relaxed text-[var(--color-text-secondary)]">
            racket LAB에서 라켓·스트링 장착 패키지를 판매할 매장을 찾고
            있습니다. 재고 관리 시스템 없이, 주문이 오면 링크 하나로 처리하는
            방식을 준비 중입니다.
          </p>
        </div>
        <Link
          href="/partners"
          className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-xl border border-[var(--color-text)] px-5 text-sm font-semibold text-[var(--color-text)] transition-colors hover:bg-[var(--color-text)] hover:text-white"
        >
          입점 문의하기
        </Link>
      </div>
    </section>
  );
}
