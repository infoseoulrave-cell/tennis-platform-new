import Link from "next/link";
import {
  activeRacketFilterCount,
  racketFilterHref,
  resetRacketFiltersHref,
  type RacketSearchParams,
} from "@/lib/racket-filter-urls";

const WEIGHT_RANGES = [
  { label: "전체", min: "", max: "" },
  { label: "~270g (초경량)", min: "", max: "270" },
  { label: "270-290g (경량)", min: "270", max: "290" },
  { label: "290-310g (표준)", min: "290", max: "310" },
  { label: "310g+ (중량)", min: "310", max: "" },
];

const HEAD_RANGES = [
  { label: "전체", min: "", max: "" },
  { label: '~97" (소형)', min: "", max: "97" },
  { label: '98-100" (표준)', min: "98", max: "100" },
  { label: '100"+ (대형)', min: "100", max: "" },
];

const SEGMENTS = [
  { value: "", label: "전체" },
  { value: "beginner", label: "입문자" },
  { value: "intermediate", label: "중급자" },
  { value: "advanced", label: "상급자" },
  { value: "pro", label: "프로" },
];

function filterLinkClass(selected: boolean): string {
  return `flex min-h-11 items-center rounded px-2 py-2 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-text)] ${
    selected
      ? "bg-[var(--color-accent)] text-[var(--color-text)] font-semibold"
      : "text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-subtle)] hover:text-[var(--color-text)]"
  }`;
}

/** URL이 유일한 선택 상태이므로 뒤로가기나 브랜드 변경 뒤에도 표시가 일치한다. */
export function RacketFiltersPanel({ currentParams }: { currentParams: RacketSearchParams }) {
  const customWeight = !WEIGHT_RANGES.some((range) =>
    range.min === (currentParams.minWeight ?? "") && range.max === (currentParams.maxWeight ?? ""),
  );
  const customHead = !HEAD_RANGES.some((range) =>
    range.min === (currentParams.minHead ?? "") && range.max === (currentParams.maxHead ?? ""),
  );

  return (
    <>
      <div>
        <h3 className="mb-3 text-sm font-semibold">무게</h3>
        {customWeight && (
          <p className="mb-2 text-xs text-[var(--color-text-secondary)]">
            적용 범위: {currentParams.minWeight || "제한 없음"} ~ {currentParams.maxWeight || "제한 없음"}g
          </p>
        )}
        <ul className="space-y-1">
          {WEIGHT_RANGES.map((range) => {
            const selected = range.min === (currentParams.minWeight ?? "")
              && range.max === (currentParams.maxWeight ?? "");
            return (
              <li key={range.label}>
                <Link
                  prefetch={false}
                  href={racketFilterHref(currentParams, { minWeight: range.min, maxWeight: range.max })}
                  aria-current={selected ? "true" : undefined}
                  className={filterLinkClass(selected)}
                >
                  {range.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-semibold">헤드사이즈</h3>
        {customHead && (
          <p className="mb-2 text-xs text-[var(--color-text-secondary)]">
            적용 범위: {currentParams.minHead || "제한 없음"} ~ {currentParams.maxHead || "제한 없음"} in²
          </p>
        )}
        <ul className="space-y-1">
          {HEAD_RANGES.map((range) => {
            const selected = range.min === (currentParams.minHead ?? "")
              && range.max === (currentParams.maxHead ?? "");
            return (
              <li key={range.label}>
                <Link
                  prefetch={false}
                  href={racketFilterHref(currentParams, { minHead: range.min, maxHead: range.max })}
                  aria-current={selected ? "true" : undefined}
                  className={filterLinkClass(selected)}
                >
                  {range.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-semibold">레벨</h3>
        <ul className="space-y-1">
          {SEGMENTS.map((segment) => {
            const selected = (currentParams.segment ?? "") === segment.value;
            return (
              <li key={segment.value}>
                <Link
                  prefetch={false}
                  href={racketFilterHref(currentParams, { segment: segment.value })}
                  aria-current={selected ? "true" : undefined}
                  className={filterLinkClass(selected)}
                >
                  {segment.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </>
  );
}

type CatalogFilterProps = {
  brands: readonly { name: string }[];
  currentParams: RacketSearchParams;
};

function CatalogFilterOptions({ brands, currentParams }: CatalogFilterProps) {
  const selectedBrands = Array.isArray(currentParams.brand)
    ? currentParams.brand.filter(Boolean)
    : currentParams.brand ? [currentParams.brand] : [];
  const activeCount = activeRacketFilterCount(currentParams);

  return (
    <>
      {activeCount > 0 && (
        <Link
          prefetch={false}
          href={resetRacketFiltersHref(currentParams)}
          className="mb-4 inline-flex min-h-11 items-center text-xs text-[var(--color-text-secondary)] underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-text)]"
        >
          조건 초기화
        </Link>
      )}
      <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-1">
        <div>
          <h3 className="mb-3 text-sm font-semibold">브랜드</h3>
          <ul className="flex flex-wrap gap-1.5 lg:block lg:space-y-1">
            <li>
              <Link
                prefetch={false}
                href={racketFilterHref(currentParams, { brand: undefined })}
                aria-current={selectedBrands.length === 0 ? "true" : undefined}
                className={filterLinkClass(selectedBrands.length === 0)}
              >
                전체
              </Link>
            </li>
            {brands.map((brand) => (
              <li key={brand.name}>
                <Link
                  prefetch={false}
                  href={racketFilterHref(currentParams, { brand: brand.name })}
                  aria-current={selectedBrands.includes(brand.name) ? "true" : undefined}
                  className={filterLinkClass(selectedBrands.includes(brand.name))}
                >
                  {brand.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <RacketFiltersPanel currentParams={currentParams} />
      </div>
    </>
  );
}

export function RacketCatalogFilters(props: CatalogFilterProps) {
  const activeCount = activeRacketFilterCount(props.currentParams);

  return (
    <>
      <aside aria-label="라켓 필터" className="hidden lg:block">
        <div className="sticky top-20 max-h-[calc(100dvh-6rem)] overflow-y-auto pr-2">
          <CatalogFilterOptions {...props} />
        </div>
      </aside>

      <details className="group rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-white)] lg:hidden">
        <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-3 rounded-xl px-4 py-3 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-text)] [&::-webkit-details-marker]:hidden">
          <span className="flex items-center gap-2">
            필터
            {activeCount > 0 && (
              <span className="rounded-full bg-[var(--color-accent)] px-2 py-0.5 text-xs text-[var(--color-text)]">
                {activeCount}개 적용
              </span>
            )}
          </span>
          <span aria-hidden="true" className="text-lg leading-none group-open:hidden">+</span>
          <span aria-hidden="true" className="hidden text-lg leading-none group-open:inline">−</span>
        </summary>
        <div className="border-t border-[var(--color-border)] p-4">
          <CatalogFilterOptions {...props} />
        </div>
      </details>
    </>
  );
}
