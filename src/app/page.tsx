import { HeroCarousel } from "@/components/hero-carousel";
import { QuickLinks } from "@/components/quick-links";
import { TopRacketsList } from "@/components/top-rackets-list";
import { NewsFeed } from "@/components/news-feed";
import { PlayerSynergySection } from "@/components/player-synergy-card";
import { KnowledgeCards } from "@/components/knowledge-cards";
import { StringGuide } from "@/components/string-guide";

export const dynamic = "force-dynamic";

export default function Home() {
  return (
    <>
      <HeroCarousel />
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
