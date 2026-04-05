import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/db";
import {
  recommendationRuns,
  recommendationResults,
  playerProfiles,
  racketModels,
  brands,
} from "@/db/schema";
import { eq, asc } from "drizzle-orm";
import { RecommendationCard } from "@/components/recommendation-card";
import { TrustBadge } from "@/components/trust-badge";
import { NeutralityDisclaimer } from "@/components/neutrality-disclaimer";

type ExplanationFragment = {
  type: "positive" | "tradeoff";
  textKo: string;
};

export default async function ResultsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // Fetch the recommendation run
  const [run] = await db
    .select()
    .from(recommendationRuns)
    .where(eq(recommendationRuns.id, id));

  if (!run) {
    notFound();
  }

  // Fetch player profile
  const [profile] = await db
    .select()
    .from(playerProfiles)
    .where(eq(playerProfiles.id, run.playerProfileId));

  // Fetch all recommendation results for this run, ordered by rank
  const results = await db
    .select()
    .from(recommendationResults)
    .where(eq(recommendationResults.recommendationRunId, id))
    .orderBy(asc(recommendationResults.rank));

  // Fetch racket info for each result
  const racketIds = results.map((r) => r.racketModelId);
  const racketInfo = new Map<
    string,
    { name: string; nameKo: string | null; brandName: string | null; imageUrl: string | null }
  >();

  for (const racketId of racketIds) {
    const [racket] = await db
      .select({
        name: racketModels.name,
        nameKo: racketModels.nameKo,
        imageUrl: racketModels.imageUrl,
        brandName: brands.name,
      })
      .from(racketModels)
      .innerJoin(brands, eq(brands.id, racketModels.brandId))
      .where(eq(racketModels.id, racketId));

    if (racket) {
      racketInfo.set(racketId, racket);
    }
  }

  // Build compare IDs string (all result IDs)
  const allResultIds = results.map((r) => r.id).join(",");

  return (
    <main className="min-h-screen bg-white pb-32">
      {/* Header */}
      <header className="sticky top-0 bg-white/95 backdrop-blur border-b border-gray-100 px-6 py-3 z-10">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <Link
            href="/diagnosis"
            className="text-sm text-gray-600 min-w-[44px] min-h-[44px] flex items-center"
          >
            ← 다시 진단
          </Link>
          <h1 className="text-sm font-semibold">추천 결과</h1>
          <div className="w-11" />
        </div>
      </header>

      <div className="px-6 pt-6">
        <div className="max-w-lg mx-auto">
          {/* Player summary */}
          {profile && (
            <div className="bg-gray-50 rounded-xl p-4 mb-6">
              <h2 className="text-sm font-semibold text-gray-700 mb-1">
                나의 진단 프로필
              </h2>
              <p className="text-sm text-gray-600">
                {profile.summaryKo ?? "진단 완료"}
              </p>
            </div>
          )}

          {/* Recommendation cards */}
          <div className="space-y-4">
            {results.map((result) => {
              const racket = racketInfo.get(result.racketModelId);
              const fragments = (result.explanationFragments ?? []) as ExplanationFragment[];

              return (
                <RecommendationCard
                  key={result.id}
                  tier={
                    (result.tier as "best_fit" | "safe_alternative" | "adventurous_choice") ??
                    "best_fit"
                  }
                  racketName={racket?.name ?? "Unknown"}
                  racketNameKo={racket?.nameKo ?? null}
                  brandName={racket?.brandName ?? null}
                  imageUrl={racket?.imageUrl ?? null}
                  matchScore={Math.round(Number(result.totalScore))}
                  explanationFragments={fragments}
                  confidenceLevel={
                    (result.confidenceLevel as "high" | "medium" | "low") ?? "medium"
                  }
                  recommendationResultId={result.id}
                  compareIds={allResultIds}
                />
              );
            })}
          </div>

          {/* Next steps */}
          <div className="mt-8 space-y-3">
            <h3 className="text-base font-bold">다음 단계</h3>
            <Link
              href="/partners"
              className="flex items-center gap-3 p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors min-h-[44px]"
            >
              <span className="text-lg">📍</span>
              <div>
                <div className="text-sm font-semibold text-gray-800">
                  가까운 매장에서 시타해보기
                </div>
                <div className="text-xs text-gray-500">
                  추천 라켓을 직접 쳐볼 수 있는 매장
                </div>
              </div>
              <span className="ml-auto text-gray-400">→</span>
            </Link>
            <button
              type="button"
              className="flex items-center gap-3 w-full p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors text-left min-h-[44px]"
            >
              <span className="text-lg">💾</span>
              <div>
                <div className="text-sm font-semibold text-gray-800">
                  내 진단 저장하기
                </div>
                <div className="text-xs text-gray-500">
                  나중에 다시 확인하고 비교할 수 있습니다
                </div>
              </div>
            </button>
          </div>

          {/* Neutrality disclaimer */}
          <div className="mt-8 text-center">
            <TrustBadge variant="neutrality" />
            <NeutralityDisclaimer />
          </div>
        </div>
      </div>
    </main>
  );
}
