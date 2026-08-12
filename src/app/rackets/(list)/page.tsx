import { Suspense } from "react";
import { getRackets, getAllBrands } from "@/lib/queries";
import { RacketCard } from "@/components/racket-card";
import { RacketFiltersPanel } from "@/components/racket-filters";
import type { Metadata } from "next";
import Link from "next/link";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "라켓 찾기",
  description: "현재 카탈로그의 테니스 라켓을 5축 점수와 스펙으로 비교해 보세요.",
};

type SearchParams = {
  brand?: string | string[];
  q?: string;
  sort?: string;
  page?: string;
  minWeight?: string;
  maxWeight?: string;
  minHead?: string;
  maxHead?: string;
  segment?: string;
};

const PAGE_SIZE = 24;

function racketsHref(
  current: SearchParams,
  overrides: Partial<Record<keyof SearchParams, string | undefined>>,
): string {
  const params = new URLSearchParams();
  for (const [key, rawValue] of Object.entries(current)) {
    const value = Array.isArray(rawValue) ? rawValue[0] : rawValue;
    if (value) params.set(key, value);
  }
  for (const [key, value] of Object.entries(overrides)) {
    if (value) params.set(key, value);
    else params.delete(key);
  }
  return `/rackets${params.size ? `?${params.toString()}` : ""}`;
}

async function RacketGrid({ searchParams }: { searchParams: SearchParams }) {
  const brandFilter = Array.isArray(searchParams.brand)
    ? searchParams.brand
    : searchParams.brand
      ? [searchParams.brand]
      : undefined;

  let result;
  let brandsList;
  try {
    [result, brandsList] = await Promise.all([
      getRackets({
        brand: brandFilter,
        q: searchParams.q,
        sort: (searchParams.sort as "popular" | "price_asc" | "price_desc" | "newest" | "lightest" | "heaviest") ?? "popular",
        page: searchParams.page ? Number(searchParams.page) : 1,
        limit: PAGE_SIZE,
        minWeight: searchParams.minWeight ? Number(searchParams.minWeight) : undefined,
        maxWeight: searchParams.maxWeight ? Number(searchParams.maxWeight) : undefined,
        minHead: searchParams.minHead ? Number(searchParams.minHead) : undefined,
        maxHead: searchParams.maxHead ? Number(searchParams.maxHead) : undefined,
        segment: searchParams.segment,
      }),
      getAllBrands(),
    ]);
  } catch {
    return (
      <div className="text-center py-20 text-[var(--color-text-muted)]">
        라켓 정보를 불러올 수 없습니다.
      </div>
    );
  }

  const sortOptions = [
    { value: "popular", label: "인기순" },
    { value: "newest", label: "최신순" },
    { value: "price_asc", label: "가격 낮은순" },
    { value: "price_desc", label: "가격 높은순" },
    { value: "lightest", label: "가벼운순" },
    { value: "heaviest", label: "무거운순" },
  ];
  const currentPage = Math.max(1, Number(searchParams.page) || 1);
  const totalPages = Math.max(1, Math.ceil(result.total / PAGE_SIZE));

  return (
    <div className="grid lg:grid-cols-[260px_1fr] gap-8">
      <aside className="hidden lg:block">
        <div className="sticky top-20 space-y-8">
          <div>
            <h3 className="font-semibold text-sm mb-3">브랜드</h3>
            <ul className="space-y-1.5">
              <li>
                <Link
                  href={racketsHref(searchParams, { brand: undefined, page: undefined })}
                  className={`text-sm block py-1 ${
                    !brandFilter
                      ? "text-[var(--color-text)] font-semibold"
                      : "text-[var(--color-text-secondary)] hover:text-[var(--color-text)]"
                  }`}
                >
                  전체
                </Link>
              </li>
              {brandsList.map((brand) => (
                <li key={brand.name}>
                  <Link
                    href={racketsHref(searchParams, { brand: brand.name, page: undefined })}
                    className={`text-sm block py-1 ${
                      brandFilter?.includes(brand.name)
                        ? "text-[var(--color-text)] font-semibold"
                        : "text-[var(--color-text-secondary)] hover:text-[var(--color-text)]"
                    }`}
                  >
                    {brand.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <RacketFiltersPanel currentParams={searchParams} />
        </div>
      </aside>

      <div>
        <div className="flex items-center justify-between mb-6 gap-4">
          <p className="text-sm text-[var(--color-text-secondary)]">
            전체 <strong className="text-[var(--color-text)]">{result.total}</strong>개의 라켓
          </p>
          <div className="flex items-center gap-2">
            {sortOptions.map((opt) => (
              <Link
                key={opt.value}
                href={racketsHref(searchParams, { sort: opt.value, page: undefined })}
                className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                  (searchParams.sort ?? "popular") === opt.value
                    ? "border-[var(--color-text)] text-[var(--color-text)] font-medium"
                    : "border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-[var(--color-text-muted)]"
                }`}
              >
                {opt.label}
              </Link>
            ))}
          </div>
        </div>

        {result.rackets.length === 0 ? (
          <div className="text-center py-20 text-[var(--color-text-muted)]">
            조건에 맞는 라켓이 없습니다.
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
            {result.rackets.map((racket) => (
              <RacketCard key={racket.id} racket={racket} />
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <nav className="mt-10 flex items-center justify-center gap-2" aria-label="라켓 목록 페이지">
            {currentPage > 1 && (
              <Link
                href={racketsHref(searchParams, { page: String(currentPage - 1) })}
                className="rounded-lg border border-[var(--color-border)] px-3 py-2 text-xs text-[var(--color-text-secondary)]"
              >
                이전
              </Link>
            )}
            <span className="px-3 py-2 text-xs text-[var(--color-text-muted)]">
              {Math.min(currentPage, totalPages)} / {totalPages}
            </span>
            {currentPage < totalPages && (
              <Link
                href={racketsHref(searchParams, { page: String(currentPage + 1) })}
                className="rounded-lg border border-[var(--color-border)] px-3 py-2 text-xs text-[var(--color-text-secondary)]"
              >
                다음
              </Link>
            )}
          </nav>
        )}
      </div>
    </div>
  );
}

export default async function RacketsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <header className="mb-8">
        <h1 className="text-3xl font-bold">라켓 찾기</h1>
        <p className="text-sm text-[var(--color-text-secondary)] mt-2">
          현재 카탈로그의 라켓을 5축 점수와 스펙으로 비교해 보세요.
        </p>
      </header>

      <Suspense fallback={<div className="text-center py-20 text-[var(--color-text-muted)]">로딩 중...</div>}>
        <RacketGrid searchParams={params} />
      </Suspense>
    </div>
  );
}
