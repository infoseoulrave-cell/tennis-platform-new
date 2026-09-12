import type { Metadata } from "next";
import Link from "next/link";
import { GearExplorer } from "@/components/gear-explorer";
import { GEAR_BRANDS, tennisGearCollections } from "@/data/tennis-gear";
import { parseGearFilters, type GearSearchParams } from "@/lib/tennis-gear";

export const metadata: Metadata = {
  title: "테니스 의류·공·액세서리 찾기",
  description: "테니스 의류부터 공, 액세서리와 가방까지. 브랜드 공식 컬렉션을 종류별로 살펴보고 공식몰로 연결하세요.",
  alternates: { canonical: "https://racketlab.kr/gear" },
};

export default async function GearPage({ searchParams }: {
  searchParams: Promise<GearSearchParams>;
}) {
  const params = await searchParams;
  const filters = parseGearFilters(params);

  return (
    <div className="mx-auto max-w-6xl px-5 py-10 md:px-6 md:py-16">
      <header className="mb-8 grid overflow-hidden rounded-3xl border border-[var(--color-border)] bg-[var(--color-bg-white)] md:grid-cols-[1.35fr_0.65fr]">
        <div className="px-7 py-10 md:p-12">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--color-text-secondary)]">Racketlab / Tennis essentials</p>
          <h1 className="mt-5 text-4xl font-bold leading-[1.22] tracking-tight md:text-5xl">라켓 너머,<br />테니스의 모든 준비.</h1>
          <p className="mt-5 max-w-md text-sm leading-7 text-[var(--color-text-secondary)] md:text-base">브랜드마다 흩어져 있던 테니스 의류와 용품을 모았습니다. 입을 옷부터 공과 가방까지, 필요한 컬렉션을 찾아보세요.</p>
          <a href="#collections" className="mt-7 inline-flex min-h-11 items-center gap-6 rounded-full bg-[var(--color-accent)] px-5 py-3 text-sm font-semibold">컬렉션 살펴보기 <span aria-hidden="true">↓</span></a>
        </div>
        <div className="relative hidden min-h-80 overflow-hidden bg-[var(--color-text)] p-8 text-[var(--color-bg)] md:flex md:flex-col md:justify-between" aria-hidden="true">
          <div className="absolute inset-x-9 inset-y-12 border border-white/20"><div className="absolute inset-x-5 inset-y-0 border-x border-white/20" /><div className="absolute inset-x-0 top-1/2 border-t border-white/20" /><div className="absolute inset-x-5 inset-y-1/4 border-y border-white/20" /><div className="absolute inset-y-1/4 left-1/2 border-l border-white/20" /></div>
          <p className="relative text-[10px] tracking-[0.16em]">DRESS. PACK. PLAY.</p>
          <p className="relative text-5xl font-black leading-none tracking-tighter">ON<br />COURT.</p>
          <p className="relative text-[10px] tracking-[0.12em]">{GEAR_BRANDS.length} BRANDS / {tennisGearCollections.length} COLLECTIONS</p>
        </div>
      </header>

      <aside className="mb-12 rounded-xl bg-[var(--color-bg-subtle)] px-5 py-4 text-xs leading-6 text-[var(--color-text-secondary)]">
        <p>현재는 공식몰 컬렉션을 안내하는 서비스입니다. 아래 브랜드와 입점·광고·수수료 제휴가 체결된 상태는 아닙니다.</p>
        <p>가격, 사이즈, 재고, 배송·교환 조건은 이동한 공식몰에서 확인하세요. 구매와 결제도 각 공식몰에서 진행됩니다.</p>
      </aside>

      <GearExplorer filters={filters} searchParams={params} />

      <section className="mt-14 flex flex-col gap-6 rounded-2xl border border-[var(--color-border)] px-6 py-8 md:flex-row md:items-center md:justify-between md:px-8" aria-labelledby="gear-partner-title">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--color-text-secondary)]">For brands & stores</p>
          <h2 id="gear-partner-title" className="mt-2 text-xl font-bold tracking-tight">테니스 고객에게 소개할 제품이 있나요?</h2>
          <p className="mt-2 max-w-xl text-sm leading-6 text-[var(--color-text-secondary)]">테니스 의류·용품 브랜드와 판매점의 상품 연결, 입점 및 협업 제안을 받습니다.</p>
        </div>
        <Link href="/partners" className="inline-flex min-h-11 shrink-0 items-center justify-center gap-6 rounded-lg bg-[var(--color-text)] px-5 py-3 text-sm font-semibold text-[var(--color-bg)]">입점·협업 문의 <span aria-hidden="true">↗</span></Link>
      </section>
    </div>
  );
}
