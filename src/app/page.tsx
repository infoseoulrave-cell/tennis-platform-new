import { PartnerBanner } from "@/components/partner-banner";
import { HeroCarousel } from "@/components/hero-carousel";
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
    /* 모바일은 진단 배너(히어로)가 첫 화면을 가득 채우면 광고처럼 읽힌다.
       좁은 화면에서는 인기 라켓부터 보여주고 히어로를 중간으로 내린다 —
       구경하다가 "뭘 골라야 할지 모르겠으면 진단" 순서가 자연스럽다.
       DOM 순서는 데스크톱 기준 그대로라 h1 하나 규칙과 SEO 는 안 변하고,
       md 미만에서만 CSS order 로 시각 순서를 바꾼다. */
    <div className="flex flex-col">
      {/* 초심자 진입점은 별도 배너가 아니라 히어로의 주 CTA 다.
          배너·히어로·퀵링크에 추천 버튼이 각각 있어서 목적지가 갈렸다. */}
      <div className="order-2 md:order-none">
        <HeroCarousel rackets={heroRackets} />
      </div>
      <div className="order-3 md:order-none w-full max-w-6xl mx-auto px-6">
        <QuickLinks />
      </div>
      <div className="order-1 md:order-none w-full max-w-6xl mx-auto px-6">
        <TopRacketsList />
      </div>
      <div className="order-4 md:order-none w-full max-w-6xl mx-auto px-6">
        <NewsFeed />
      </div>
      <div className="order-5 md:order-none">
        <PlayerSynergySection />
      </div>
      <div className="order-6 md:order-none w-full max-w-6xl mx-auto px-6">
        <KnowledgeCards />
        <StringGuide />
      </div>
      <div className="order-7 md:order-none">
        <PartnerBanner />
      </div>
    </div>
  );
}
