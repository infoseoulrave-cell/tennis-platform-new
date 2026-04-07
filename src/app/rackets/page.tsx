import { Suspense } from "react";
import { getRackets, getAllBrands } from "@/lib/queries";
import { RacketCard } from "@/components/racket-card";

type SearchParams = {
  brand?: string | string[];
  sort?: string;
  page?: string;
};

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
        sort: (searchParams.sort as "popular" | "price_asc" | "price_desc") ?? "popular",
        page: searchParams.page ? Number(searchParams.page) : 1,
        limit: 24,
      }),
      getAllBrands(),
    ]);
  } catch (e) {
    return (
      <div className="text-center py-20 text-[var(--color-text-muted)]">
        라켓 정보를 불러올 수 없습니다.
      </div>
    );
  }

  return (
    <div className="grid lg:grid-cols-[240px_1fr] gap-8">
      {/* Filter sidebar */}
      <aside className="hidden lg:block">
        <div className="sticky top-20">
          <h3 className="font-semibold text-sm mb-4">브랜드</h3>
          <ul className="space-y-2">
            {brandsList.map((brand) => (
              <li key={brand.name}>
                <a
                  href={`/rackets?brand=${encodeURIComponent(brand.name)}`}
                  className={`text-sm block py-1 ${
                    brandFilter?.includes(brand.name)
                      ? "text-[var(--color-text)] font-semibold"
                      : "text-[var(--color-text-secondary)] hover:text-[var(--color-text)]"
                  }`}
                >
                  {brand.name}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </aside>

      {/* Grid */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-[var(--color-text-secondary)]">
            전체 <strong className="text-[var(--color-text)]">{result.total}</strong>개의 라켓
          </p>
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
          한국에서 실제 판매 중인 라켓을 5축 점수와 스펙으로 비교해 보세요.
        </p>
      </header>

      <Suspense fallback={<div className="text-center py-20 text-[var(--color-text-muted)]">로딩 중...</div>}>
        <RacketGrid searchParams={params} />
      </Suspense>
    </div>
  );
}
