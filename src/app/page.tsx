import { PartnerBanner } from "@/components/partner-banner";
import { HeroCarousel, HeroPitch } from "@/components/hero-carousel";
import { QuickLinks } from "@/components/quick-links";
import { TopRacketsList } from "@/components/top-rackets-list";
import { NewsFeed } from "@/components/news-feed";
import { PlayerSynergySection } from "@/components/player-synergy-card";
import { KnowledgeCards } from "@/components/knowledge-cards";
import { StringGuide } from "@/components/string-guide";
import Link from "next/link";
import {
  featuredRacketCatalogIdentities,
  hydrateFeaturedRackets,
} from "@/data/featured-rackets";
import { getRacketsByCatalogIdentities } from "@/lib/queries";

export const revalidate = 3600;

export default async function Home() {
  const catalog = await getRacketsByCatalogIdentities(
    featuredRacketCatalogIdentities,
  ).catch(() => []);
  const heroRackets = hydrateFeaturedRackets(catalog);

  return (
    /* 데스크톱은 캠페인 → 진단 안내, 모바일은 캠페인 → TOP 5 → 진단 안내.
       HeroPitch 는 화면 크기와 관계없이 한 번만 렌더해 고정 h1 을 유지한다. */
    <div className="flex flex-col">
      <div className="order-1 md:order-none">
        <HeroCarousel rackets={heroRackets} />
      </div>
      <div className="order-3 bg-[var(--color-bg-dark)] text-white md:order-none">
        <section aria-label="3분 진단 안내" className="max-w-6xl mx-auto px-6 py-10 md:py-12">
          <HeroPitch asHeading />
        </section>
      </div>
      <div className="order-4 md:order-none w-full max-w-6xl mx-auto px-6">
        <section aria-label="테니스 의류와 용품 찾기" className="mt-8 rounded-3xl bg-[var(--color-bg-footer)] p-6 text-[#F3F0EA] md:p-8">
          <p className="text-xs font-semibold tracking-widest text-[var(--color-accent)]">ON COURT</p>
          <div className="mt-3 flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div>
              <h2 className="text-2xl font-bold md:text-3xl">라켓 다음, 코트에서 입고 쓸 것들.</h2>
              <p className="mt-3 max-w-xl text-sm leading-relaxed text-[#D3CEC4]">테니스 의류부터 공과 액세서리까지. 브랜드별 컬렉션을 살펴보고 공식몰에서 이어 보세요.</p>
            </div>
            <Link href="/gear" className="inline-flex min-h-12 shrink-0 items-center justify-center rounded-full bg-[var(--color-accent)] px-6 font-semibold text-[#171914]">의류·용품 둘러보기 →</Link>
          </div>
        </section>
        <QuickLinks />
      </div>
      <div className="order-2 md:order-none w-full max-w-6xl mx-auto px-6">
        <TopRacketsList />
      </div>
      <div className="order-5 md:order-none w-full max-w-6xl mx-auto px-6">
        <NewsFeed />
      </div>
      <div className="order-6 md:order-none">
        <PlayerSynergySection />
      </div>
      <div className="order-7 md:order-none w-full max-w-6xl mx-auto px-6">
        <KnowledgeCards />
        <StringGuide />
      </div>
      <div className="order-8 md:order-none">
        <PartnerBanner />
      </div>
    </div>
  );
}
