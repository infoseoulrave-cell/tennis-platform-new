"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import {
  APPAREL_SUBCATEGORIES,
  GEAR_BRANDS,
  GEAR_CATEGORIES,
  type GearCategory,
} from "@/data/tennis-gear";
import {
  DEFAULT_GEAR_FILTERS,
  buildGearHref,
  filterGearCollections,
  gearFilterPayload,
  gearStoreClickPayload,
  type GearFilters,
  type GearSearchParams,
} from "@/lib/tennis-gear";
import { trackEvent } from "@/lib/track-event";

function trackQuietly(eventType: string, payload: Record<string, unknown>) {
  try {
    trackEvent(eventType, payload);
  } catch {
    // Analytics must never interfere with a filter or an official-store link.
  }
}

function CategoryIcon({ category }: { category: GearCategory }) {
  return (
    <svg viewBox="0 0 80 80" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true" className="h-16 w-16">
      {category === "apparel" ? (
        <>
          <path d="M29 16 15 23 7 38l14 7 5-9v29h28V36l5 9 14-7-8-15-14-7" />
          <path d="M29 16c0 14 22 14 22 0M26 58h28M22 23l4 13m32-13-4 13" />
        </>
      ) : category === "balls" ? (
        <>
          <circle cx="40" cy="40" r="26" />
          <path d="M18 26c26 4 18 30 39 33M24 19c27 3 18 32 39 35" />
        </>
      ) : category === "accessories" ? (
        <>
          <path d="M19 47V36a21 21 0 0 1 42 0v11M19 47h42l11 10H17c-6 0-8-7 2-10ZM40 15v26M27 47l6-6h28v6" />
        </>
      ) : (
        <>
          <rect x="11" y="27" width="58" height="34" rx="7" />
          <path d="M29 27v-7a5 5 0 0 1 5-5h12a5 5 0 0 1 5 5v7M24 27v34m32-34v34M30 40h20M30 45h12" />
        </>
      )}
    </svg>
  );
}

const pillBase = "inline-flex min-h-10 items-center justify-center gap-2 rounded-full border px-4 py-2 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-text)]";

export function GearExplorer({ filters, searchParams }: {
  filters: GearFilters;
  searchParams: GearSearchParams;
}) {
  const router = useRouter();
  const collections = filterGearCollections(filters);
  const selectedCategory = GEAR_CATEGORIES.find(({ id }) => id === filters.category);
  const activeFilters = filters.brand !== "all" || filters.subcategory !== "all" || filters.category !== "apparel";
  const categoryOptions = [{ id: "all" as const, label: "전체" }, ...GEAR_CATEGORIES];
  const { category, brand, subcategory } = filters;

  useEffect(() => {
    trackQuietly("catalog_filter", gearFilterPayload({ category, brand, subcategory }, "view"));
  }, [category, brand, subcategory]);

  function trackFilter(next: GearFilters) {
    trackQuietly("catalog_filter", gearFilterPayload(next));
  }

  return (
    <section id="collections" aria-labelledby="gear-explorer-title" className="scroll-mt-24">
      <div className="flex flex-col gap-5 border-b border-[var(--color-border)] pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--color-text-secondary)]">The collection directory</p>
          <h2 id="gear-explorer-title" className="text-2xl font-bold tracking-tight">종목은 테니스, 선택은 다양하게.</h2>
        </div>
        <div className="flex gap-4 text-sm font-medium">
          <Link href="/rackets" className="underline underline-offset-4 hover:text-[var(--color-text-secondary)]">라켓 찾기 ↗</Link>
          <Link href="/strings" className="underline underline-offset-4 hover:text-[var(--color-text-secondary)]">스트링 찾기 ↗</Link>
        </div>
      </div>

      <nav aria-label="테니스 용품 카테고리" className="mt-6 flex flex-wrap gap-2">
        {categoryOptions.map((category) => {
          const next = { ...filters, category: category.id, subcategory: "all" as const };
          const count = filterGearCollections(next).length;
          const selected = category.id === filters.category;
          return (
            <Link
              key={category.id}
              href={buildGearHref(next, searchParams)}
              scroll={false}
              onClick={() => trackFilter(next)}
              aria-current={selected ? "page" : undefined}
              className={`${pillBase} ${selected
                ? "border-[var(--color-text)] bg-[var(--color-text)] font-semibold text-[var(--color-bg)]"
                : "border-[var(--color-border)] bg-[var(--color-bg-white)] text-[var(--color-text-secondary)] hover:border-[var(--color-text)]"}`}
            >
              {category.label}<span className="text-xs opacity-70">{count}</span>
            </Link>
          );
        })}
      </nav>

      <div className="my-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        {filters.category === "apparel" ? (
          <nav aria-label="테니스 의류 종류" className="flex flex-wrap gap-2">
            {[{ id: "all" as const, label: "의류 전체" }, ...APPAREL_SUBCATEGORIES].map((subcategory) => {
              const next = { ...filters, subcategory: subcategory.id };
              const selected = filters.subcategory === subcategory.id;
              return (
                <Link
                  key={subcategory.id}
                  href={buildGearHref(next, searchParams)}
                  scroll={false}
                  onClick={() => trackFilter(next)}
                  aria-current={selected ? "page" : undefined}
                  className={`min-h-10 rounded-md px-3 py-2.5 text-xs transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 ${selected
                    ? "bg-[var(--color-bg-subtle)] font-semibold text-[var(--color-text)]"
                    : "text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-subtle)]"}`}
                >
                  {subcategory.label} <span className="ml-1 opacity-60">{filterGearCollections(next).length}</span>
                </Link>
              );
            })}
          </nav>
        ) : <p className="text-sm text-[var(--color-text-secondary)]">{selectedCategory?.description ?? "의류부터 코트에 필요한 용품까지"}</p>}

        <div className="flex items-center gap-3">
          <label htmlFor="gear-brand" className="shrink-0 text-xs font-semibold text-[var(--color-text-secondary)]">브랜드</label>
          <select
            id="gear-brand"
            value={filters.brand}
            onChange={(event) => {
              const brand = GEAR_BRANDS.find(({ id }) => id === event.target.value)?.id ?? "all";
              const next: GearFilters = { ...filters, brand };
              trackFilter(next);
              router.push(buildGearHref(next, searchParams), { scroll: false });
            }}
            className="min-h-11 w-full min-w-44 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-white)] px-3 text-sm lg:w-auto"
          >
            <option value="all">모든 브랜드</option>
            {GEAR_BRANDS.map((brand) => (
              <option key={brand.id} value={brand.id}>
                {brand.label} ({filterGearCollections({ ...filters, brand: brand.id }).length})
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mb-6 flex items-center justify-between gap-3 border-t border-[var(--color-border)] pt-5">
        <p role="status" aria-live="polite" aria-atomic="true" className="text-sm text-[var(--color-text-secondary)]">
          <strong className="font-semibold text-[var(--color-text)]">{collections.length}개 컬렉션</strong>
          <span className="ml-2 text-xs">상품 수가 아닌 공식몰 모음 수입니다.</span>
        </p>
        {activeFilters ? (
          <Link
            href={buildGearHref(DEFAULT_GEAR_FILTERS, searchParams)}
            scroll={false}
            onClick={() => trackFilter(DEFAULT_GEAR_FILTERS)}
            className="shrink-0 py-2 text-xs font-medium underline underline-offset-4"
          >필터 초기화</Link>
        ) : null}
      </div>

      {collections.length ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {collections.map((collection) => {
            const brand = GEAR_BRANDS.find(({ id }) => id === collection.brand)!;
            const category = filters.category !== "all" && collection.categories.includes(filters.category)
              ? filters.category : collection.categories[0];
            return (
              <article key={collection.id} className="group flex flex-col overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-white)]">
                <div className="relative flex min-h-36 items-center justify-between gap-4 overflow-hidden border-b border-[var(--color-border)] bg-[var(--color-bg-subtle)] px-6 py-7">
                  <div>
                    <p className="text-[10px] font-medium tracking-[0.12em] text-[var(--color-text-secondary)]">{brand.label}</p>
                    <p className="mt-1 text-2xl font-black tracking-tight sm:text-3xl">{brand.name}</p>
                  </div>
                  <div className="text-[var(--color-text-secondary)] transition-transform duration-300 motion-safe:group-hover:-rotate-6"><CategoryIcon category={category} /></div>
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <h3 className="text-lg font-bold tracking-tight">{collection.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">{collection.description}</p>
                  <ul aria-label="컬렉션에서 확인한 품목" className="mb-6 mt-4 flex flex-wrap gap-1.5">
                    {collection.coverage.map((coverage) => (
                      <li key={coverage} className="rounded-md border border-[var(--color-border)] px-2 py-1 text-[11px] text-[var(--color-text-secondary)]">{coverage}</li>
                    ))}
                  </ul>
                  <div className="mt-auto">
                    <a
                      href={collection.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => trackQuietly("store_click", gearStoreClickPayload(collection, filters))}
                      aria-label={`${brand.label} ${collection.title} 공식몰에서 보기 (새 창)`}
                      className="flex min-h-11 items-center justify-between rounded-lg border border-[var(--color-text)] px-4 py-3 text-sm font-semibold transition-colors hover:bg-[var(--color-text)] hover:text-[var(--color-bg)] focus-visible:outline-2 focus-visible:outline-offset-4"
                    >공식몰에서 보기 <span aria-hidden="true">↗</span></a>
                    <p className="mt-3 text-[10px] text-[var(--color-text-secondary)]">컬렉션 확인 {collection.verifiedOn.replaceAll("-", ".")}</p>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-[var(--color-border)] bg-[var(--color-bg-white)] px-6 py-16 text-center">
          <p className="text-lg font-semibold">이 조건에서 확인한 컬렉션은 아직 없어요.</p>
          <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-[var(--color-text-secondary)]">해당 브랜드에 제품이 없다는 뜻은 아닙니다. 브랜드나 의류 종류를 바꿔보세요.</p>
          <Link href={buildGearHref(DEFAULT_GEAR_FILTERS, searchParams)} scroll={false} onClick={() => trackFilter(DEFAULT_GEAR_FILTERS)} className="mt-6 inline-flex min-h-11 items-center rounded-lg bg-[var(--color-text)] px-5 py-3 text-sm font-semibold text-[var(--color-bg)]">전체 의류 컬렉션 보기</Link>
        </div>
      )}
      {filters.category === "apparel" ? (
        <p className="mt-5 text-xs leading-5 text-[var(--color-text-secondary)]">의류 종류 필터는 공식 컬렉션에서 확인한 품목 기준입니다. 세부 품목을 확인하지 못한 모음은 &lsquo;의류 전체&rsquo;에만 표시합니다.</p>
      ) : null}
    </section>
  );
}
