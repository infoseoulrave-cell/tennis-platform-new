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
    <>
      <HeroCarousel rackets={heroRackets} />
      <div className="max-w-6xl mx-auto px-6">
        <QuickLinks />
        <TopRacketsList />
        <NewsFeed />
      </div>
      <PlayerSynergySection />
      <div className="max-w-6xl mx-auto px-6">
        <KnowledgeCards />
        <StringGuide />
      </div>
    </>
  );
}
