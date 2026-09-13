import { Suspense } from "react";
import { getRackets, getAllBrands } from "@/lib/queries";
import { RacketCard } from "@/components/racket-card";
import { RacketCatalogFilters } from "@/components/racket-filters";
import { racketsHref, type RacketSearchParams } from "@/lib/racket-filter-urls";
import type { Metadata } from "next";
import Link from "next/link";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "라켓 찾기",
  description: "현재 카탈로그의 테니스 라켓을 5축 점수와 스펙으로 비교해 보세요.",
};

type SearchParams = RacketSearchParams;

const PAGE_SIZE = 24;

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
      <RacketCatalogFilters brands={brandsList} currentParams={searchParams} />

      <div className="min-w-0">
        {/* 정렬 알약 6개는 모바일 폭에 안 들어간다. 줄바꿈 없이 짓누르면
            한글이 세로로 꺾이므로, 좁은 화면은 개수를 윗줄로 올리고 알약을
            한 줄 가로 스크롤로 둔다. */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          <p className="text-sm text-[var(--color-text-secondary)]">
            전체 <strong className="text-[var(--color-text)]">{result.total}</strong>개의 라켓
          </p>
          <div className="-mx-6 flex items-center gap-2 overflow-x-auto px-6 pb-1 sm:m-0 sm:flex-wrap sm:justify-end sm:overflow-visible sm:p-0">
            {sortOptions.map((opt) => (
              <Link
                key={opt.value}
                href={racketsHref(searchParams, { sort: opt.value, page: undefined })}
                className={`shrink-0 whitespace-nowrap text-xs px-3 py-1.5 rounded-full border transition-colors ${
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
