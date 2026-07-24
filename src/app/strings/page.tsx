import type { Metadata } from "next";
import Link from "next/link";
import {
  STRING_TENSION_METHODOLOGY,
  stringOfferId,
  stringProducts,
  type StringEditorialTag,
  type StringMaterialType,
} from "@/data/strings";
import {
  getActiveOffersForProductKeys,
  lowestPriceOfferId,
  offerVendorLabel,
  totalPrice,
  type Offer,
} from "@/lib/offers";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "테니스 스트링",
  description: "공식 제품 정보와 실제 등록된 국내 판매처 오퍼를 함께 확인하는 테니스 스트링 카탈로그.",
};

function formatKrw(value: number): string {
  return `₩${value.toLocaleString()}`;
}

type MaterialFilter = "all" | StringMaterialType;

const MATERIAL_FILTERS: Array<{
  value: MaterialFilter;
  label: string;
}> = [
  { value: "all", label: "전체" },
  { value: "polyester", label: "폴리에스터" },
  { value: "multifilament", label: "멀티필라멘트" },
  { value: "natural_gut", label: "내추럴 거트" },
  { value: "synthetic_gut", label: "신세틱 거트" },
];

const EDITORIAL_TAG_LABELS: Record<StringEditorialTag, string> = {
  balanced: "균형형 비교",
  "beginner-friendly": "입문자 우선 비교",
  comfort: "고강성·낮은 편안함 보완 비교",
  control: "컨트롤 성향 비교",
  durability: "내구성 우선 비교",
  "fast-swing": "빠른 스윙 비교",
  hybrid: "하이브리드 후보",
  power: "낮은 파워·덴스 패턴 비교",
  "soft-poly": "상대적 저강성 폴리 비교",
  spin: "오픈 패턴·스핀 비교",
};

function materialFilter(value: string | string[] | undefined): MaterialFilter {
  const candidate = Array.isArray(value) ? value[0] : value;
  return MATERIAL_FILTERS.some((filter) => filter.value === candidate)
    ? candidate as MaterialFilter
    : "all";
}

export default async function StringsPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string | string[] }>;
}) {
  const selectedMaterial = materialFilter((await searchParams).type);
  let offersByProductKey: Record<string, Offer[]> = {};
  let offersUnavailable = false;
  try {
    offersByProductKey = await getActiveOffersForProductKeys(
      stringProducts.map((product) => product.offerKey),
    );
  } catch {
    offersUnavailable = true;
  }
  const catalog = stringProducts
    .filter((product) => (
      selectedMaterial === "all" || product.materialType === selectedMaterial
    ))
    .map((product) => ({
      product,
      offers: offersByProductKey[product.offerKey] ?? [],
    }));

  return (
    <div className="max-w-6xl mx-auto px-6 py-12 md:py-16">
      <header className="max-w-3xl mb-10 md:mb-14">
        <p className="text-[10px] font-semibold tracking-[0.15em] text-[var(--color-brand)] uppercase mb-2">
          String catalog
        </p>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">스트링 찾기</h1>
        <p className="mt-4 text-sm md:text-base leading-relaxed text-[var(--color-text-secondary)]">
          제조사 공식 정보와 등록된 판매처를 분리해 보여드립니다. 한국 판매 가격과 재고는 확인된 오퍼만 표시합니다.
        </p>
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Link
            href="/guide/strings"
            className="rounded-lg bg-[var(--color-text)] px-4 py-2.5 text-sm font-semibold text-[var(--color-bg)] hover:opacity-85 transition-opacity"
          >
            스트링 가이드 읽기
          </Link>
          <span className="text-xs text-[var(--color-text-muted)]">
            소재와 장력을 먼저 이해하면 비교가 쉬워집니다.
          </span>
        </div>
      </header>

      <aside className="mb-10 border-y border-[var(--color-border)] py-4 text-xs leading-relaxed text-[var(--color-text-secondary)]">
        <p>
          일부 판매처 링크는 제휴 링크입니다. 링크를 통해 구매하면 운영에 수수료가 지원될 수 있으며,
          제품 선정과 정렬에는 영향을 주지 않습니다. 가격·배송비·재고는 판매처에서 최종 확인하세요.
        </p>
        <p className="mt-2">
          <strong className="font-semibold text-[var(--color-text)]">장력 범위 산정 방법:</strong>{" "}
          장력은 제조사 제품 수치가 아니라{" "}
          <a
            href={STRING_TENSION_METHODOLOGY.sourceUrl}
            target="_blank"
            rel="noreferrer"
            className="font-medium text-[var(--color-text)] underline underline-offset-2"
          >
            Wilson 소재별 일반 가이드
          </a>
          를 제품 소재와 공식 포지셔닝에 맞춰 좁힌 편집 시작값입니다. 라켓 표시 허용 범위를 우선하세요.
        </p>
      </aside>

      <nav aria-label="스트링 소재 필터" className="mb-8 flex flex-wrap gap-2">
        {MATERIAL_FILTERS.map((filter) => {
          const selected = filter.value === selectedMaterial;
          const count = filter.value === "all"
            ? stringProducts.length
            : stringProducts.filter((product) => product.materialType === filter.value).length;
          return (
            <Link
              key={filter.value}
              href={filter.value === "all" ? "/strings" : `/strings?type=${filter.value}`}
              aria-current={selected ? "page" : undefined}
              className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                selected
                  ? "border-[var(--color-text)] bg-[var(--color-text)] text-[var(--color-bg)]"
                  : "border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-text-muted)]"
              }`}
            >
              {filter.label} {count}
            </Link>
          );
        })}
      </nav>

      {offersUnavailable && (
        <div
          role="status"
          className="mb-8 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-subtle)] px-4 py-4 text-sm text-[var(--color-text-secondary)]"
        >
          판매처 정보를 일시적으로 불러올 수 없습니다. 잠시 후 다시 확인해 주세요.
        </div>
      )}

      <div className="space-y-5">
        {catalog.map(({ product, offers }) => {
          const lowestId = lowestPriceOfferId(offers);
          const lowestOffer = offers.find((offer) => offer.id === lowestId);
          const lowestTotal = lowestOffer ? totalPrice(lowestOffer) : null;

          return (
            <article
              key={product.offerKey}
              id={stringOfferId(product.offerKey)}
              className="scroll-mt-24 grid gap-6 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-white)] p-6 md:p-8 lg:grid-cols-[0.9fr_1.1fr]"
            >
              <div>
                <p className="text-xs font-medium tracking-wider text-[var(--color-text-muted)] uppercase">
                  {product.brand}
                </p>
                <h2 className="mt-1 text-xl font-bold tracking-tight">{product.name}</h2>
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="rounded-full bg-[var(--color-bg-subtle)] px-3 py-1 text-xs text-[var(--color-text-secondary)]">
                    {product.material}
                  </span>
                  <span className="rounded-full bg-[var(--color-bg-subtle)] px-3 py-1 text-xs text-[var(--color-text-secondary)]">
                    {product.gaugeMm.toFixed(2)} mm
                  </span>
                  <span className="rounded-full bg-[var(--color-bg-subtle)] px-3 py-1 text-xs text-[var(--color-text-secondary)]">
                    편집 시작 범위 {product.startTensionLbs.min}–{product.startTensionLbs.max} lbs
                  </span>
                </div>
                <ul className="mt-4 space-y-2">
                  {product.officialTraits.map((trait) => (
                    <li
                      key={`${trait.evidence}:${trait.text}`}
                      className="flex items-start gap-2 text-sm leading-relaxed text-[var(--color-text-secondary)]"
                    >
                      <span className="mt-0.5 shrink-0 rounded bg-[var(--color-bg-subtle)] px-1.5 py-0.5 text-[10px] font-medium text-[var(--color-text-muted)]">
                        {trait.evidence === "manufacturer_claim" ? "제조사 표현" : "공식 사실"}
                      </span>
                      <span>{trait.text}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-4">
                  <p className="text-[10px] font-semibold tracking-wider text-[var(--color-text-muted)] uppercase">
                    편집 궁합 기준
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {product.editorialTags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full border border-[var(--color-border)] px-2 py-1 text-[10px] text-[var(--color-text-secondary)]"
                      >
                        {EDITORIAL_TAG_LABELS[tag]}
                      </span>
                    ))}
                  </div>
                </div>
                <a
                  href={product.sourceUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-4 inline-flex text-xs font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text)] hover:underline"
                >
                  제조사 공식 정보 ↗
                </a>
                <p className="mt-2 text-[10px] text-[var(--color-text-muted)]">
                  공식 페이지 확인일 {product.verifiedAt}
                </p>
              </div>

              <div className="border-t border-[var(--color-border)] pt-5 lg:border-l lg:border-t-0 lg:pl-7 lg:pt-0">
                <div className="mb-4 flex items-end justify-between gap-4">
                  <div>
                    <p className="text-xs text-[var(--color-text-muted)]">등록 판매처</p>
                    <p className="mt-1 text-sm font-semibold">
                      {offersUnavailable
                        ? "판매처 조회 일시 중단"
                        : lowestTotal != null
                          ? `최저 총액 ${formatKrw(lowestTotal)}`
                          : "가격 확인 필요"}
                    </p>
                  </div>
                  {offers.length > 0 && (
                    <span className="text-xs text-[var(--color-text-muted)]">{offers.length}곳</span>
                  )}
                </div>

                {offersUnavailable ? (
                  <div className="rounded-xl bg-[var(--color-bg-subtle)] px-4 py-5">
                    <p className="text-sm font-medium">판매처 조회 일시 중단</p>
                    <p className="mt-1 text-xs leading-relaxed text-[var(--color-text-muted)]">
                      판매처 DB 연결이 복구되면 실제 가격과 재고를 다시 표시합니다.
                    </p>
                  </div>
                ) : offers.length === 0 ? (
                  <div className="rounded-xl bg-[var(--color-bg-subtle)] px-4 py-5">
                    <p className="text-sm font-medium">판매처 준비 중</p>
                    <p className="mt-1 text-xs leading-relaxed text-[var(--color-text-muted)]">
                      확인된 국내 오퍼가 등록되면 가격과 이동 링크를 표시합니다.
                    </p>
                  </div>
                ) : (
                  <ul className="divide-y divide-[var(--color-border)]">
                    {offers.map((offer) => {
                      const total = totalPrice(offer);
                      return (
                        <li key={offer.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="truncate text-sm font-medium">{offerVendorLabel(offer)}</span>
                              {offer.id === lowestId && (
                                <span className="rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-bold text-green-700">
                                  최저가
                                </span>
                              )}
                              {!offer.inStock && (
                                <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-bold text-gray-500">
                                  품절
                                </span>
                              )}
                            </div>
                            {offer.productName && (
                              <p className="mt-0.5 truncate text-xs text-[var(--color-text-muted)]">{offer.productName}</p>
                            )}
                          </div>
                          <p className="shrink-0 text-sm font-semibold">
                            {total != null ? formatKrw(total) : "가격 확인"}
                          </p>
                          {offer.inStock ? (
                            <a
                              href={`/go/${offer.id}`}
                              target="_blank"
                              rel="noopener noreferrer sponsored"
                              className="shrink-0 rounded-lg bg-[var(--color-text)] px-3 py-2 text-xs font-semibold text-[var(--color-bg)] hover:opacity-85 transition-opacity"
                            >
                              판매처 보기
                            </a>
                          ) : (
                            <span className="shrink-0 px-3 py-2 text-xs text-[var(--color-text-muted)]">구매 불가</span>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            </article>
          );
        })}
      </div>

      <section className="mt-10 rounded-2xl bg-[var(--color-bg-subtle)] p-6 text-sm leading-relaxed text-[var(--color-text-secondary)]">
        <h2 className="font-semibold text-[var(--color-text)]">선택 전 안전 안내</h2>
        <p className="mt-2">
          스트링 종류와 장력은 플레이 스타일, 라켓 표시 범위, 스트링 게이지, 부상 이력에 따라 달라집니다.
          통증이나 부상 이력이 있다면 전문점과 의료 전문가에게 상담하고, 라켓 표시 장력 범위 안에서 조정하세요.
        </p>
      </section>
    </div>
  );
}
