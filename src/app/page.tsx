import { PartnerBanner } from "@/components/partner-banner";
import { HeroCarousel, HeroPitch } from "@/components/hero-carousel";
import { QuickLinks } from "@/components/quick-links";
import { TopRacketsList } from "@/components/top-rackets-list";
import { NewsFeed } from "@/components/news-feed";
import { PlayerSynergySection } from "@/components/player-synergy-card";
import { KnowledgeCards } from "@/components/knowledge-cards";
import { StringGuide } from "@/components/string-guide";
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
    /* 모바일 순서(민호 지정): 라켓 이미지 쇼케이스(2026 NEW) → 인기 TOP 5 →
       3분 진단 배너 → 사진 배너 퀵링크 → 나머지. 히어로의 피치는 모바일에서
       히어로 밖으로 나와 별도 배너가 된다(HeroPitch).
       DOM 순서는 데스크톱 기준 그대로라 h1 하나 규칙과 SEO 는 안 변하고,
       md 미만에서만 CSS order 로 시각 순서를 바꾼다. */
    <div className="flex flex-col">
      {/* 초심자 진입점은 별도 배너가 아니라 히어로의 주 CTA 다.
          배너·히어로·퀵링크에 추천 버튼이 각각 있어서 목적지가 갈렸다.
          모바일에서 이 섹션은 라켓 쇼케이스만 남는다. */}
      <div className="order-1 md:order-none">
        <HeroCarousel rackets={heroRackets} />
      </div>
      <div className="order-4 md:order-none w-full max-w-6xl mx-auto px-6">
        <QuickLinks />
      </div>
      <div className="order-2 md:order-none w-full max-w-6xl mx-auto px-6">
        <TopRacketsList />
      </div>
      {/* 모바일 전용 — 히어로에서 내려온 3분 진단 배너 */}
      <div className="order-3 bg-[var(--color-bg-dark)] text-white md:hidden">
        <section aria-label="3분 진단 안내" className="max-w-6xl mx-auto px-6 py-12">
          <HeroPitch />
        </section>
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
