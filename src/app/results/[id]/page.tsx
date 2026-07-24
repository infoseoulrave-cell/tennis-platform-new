import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/db";
import {
  recommendationRuns,
  recommendationResults,
  playerProfiles,
  racketModels,
  racketSpecs,
  brands,
} from "@/db/schema";
import { asc, eq, inArray } from "drizzle-orm";
import { RecommendationCard } from "@/components/recommendation-card";
import { TrustBadge } from "@/components/trust-badge";
import { NeutralityDisclaimer } from "@/components/neutrality-disclaimer";
import { track } from "@/events/track";
import { generateSlug } from "@/lib/queries";
import {
  recommendStringPairings,
  requiresComfortSafetyGate,
  type StringPairingInput,
} from "@/lib/string-pairing";
import { stringOfferId } from "@/data/strings";
import type { RawAxisScores100 } from "@/lib/score-display";

type ExplanationFragment = {
  type: "positive" | "tradeoff";
  textKo: string;
};

type ProfileAnswers = {
  current_racket?: {
    selection?: string;
  };
  play_profile?: {
    experience?: string;
  };
  pain_points?: string[];
};

function numericSpec(value: string | null): number | null {
  if (!value) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

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

  const [[profile], results] = await Promise.all([
    db
      .select()
      .from(playerProfiles)
      .where(eq(playerProfiles.id, run.playerProfileId)),
    db
      .select()
      .from(recommendationResults)
      .where(eq(recommendationResults.recommendationRunId, id))
      .orderBy(asc(recommendationResults.rank)),
  ]);

  const racketIds = results.map((r) => r.racketModelId);
  const racketRows = racketIds.length === 0
    ? []
    : await db
      .select({
        id: racketModels.id,
        name: racketModels.name,
        nameKo: racketModels.nameKo,
        imageUrl: racketModels.imageUrl,
        releaseYear: racketModels.releaseYear,
        brandName: brands.name,
        stiffnessRa: racketSpecs.stiffnessRa,
        weightG: racketSpecs.weightG,
        headSizeSqIn: racketSpecs.headSizeSqIn,
        stringPattern: racketSpecs.stringPattern,
        segment: racketModels.segment,
      })
      .from(racketModels)
      .innerJoin(brands, eq(brands.id, racketModels.brandId))
      .leftJoin(racketSpecs, eq(racketSpecs.racketModelId, racketModels.id))
      .where(inArray(racketModels.id, racketIds));

  const racketInfo = new Map<
    string,
    {
      name: string;
      nameKo: string | null;
      brandName: string | null;
      imageUrl: string | null;
      releaseYear: number | null;
    }
  >();
  const racketSpecsMap = new Map<
    string,
    {
      stiffnessRa: number | null;
      weightG: number | null;
      headSizeSqIn: number | null;
      stringPattern: string | null;
      segment: string | null;
    }
  >();

  for (const racket of racketRows) {
    racketInfo.set(racket.id, {
      name: racket.name,
      nameKo: racket.nameKo,
      imageUrl: racket.imageUrl,
      releaseYear: racket.releaseYear,
      brandName: racket.brandName,
    });
    racketSpecsMap.set(racket.id, {
      stiffnessRa: numericSpec(racket.stiffnessRa),
      weightG: numericSpec(racket.weightG),
      headSizeSqIn: numericSpec(racket.headSizeSqIn),
      stringPattern: racket.stringPattern,
      segment: racket.segment,
    });
  }

  const profileAnswers = (profile?.answers ?? {}) as ProfileAnswers;
  const painPoints = new Set(profileAnswers.pain_points ?? []);
  const beginner = profileAnswers.play_profile?.experience === "less_1_year"
    || profileAnswers.current_racket?.selection === "first_purchase";
  const armSensitive = painPoints.has("elbow_pain") || painPoints.has("wrist_pain");

  // Track recommendation_view event (server-side, fire-and-forget)
  track(run.playerProfileId ?? "unknown", "recommendation_view", {
    runId: id,
    resultCount: results.length,
  }).catch(() => {});

  const allCompareSlugs = results.flatMap((result) => {
    const racket = racketInfo.get(result.racketModelId);
    if (!racket?.brandName) return [];
    return [generateSlug(racket.brandName, racket.name, racket.releaseYear)];
  }).join(",");

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
                  matchScore={Math.round(Number(result.totalScore))}
                  explanationFragments={fragments}
                  confidenceLevel={
                    (result.confidenceLevel as "high" | "medium" | "low") ?? "medium"
                  }
                  racketSlug={racket?.brandName
                    ? generateSlug(racket.brandName, racket.name, racket.releaseYear)
                    : ""}
                  compareSlugs={allCompareSlugs}
                />
              );
            })}
          </div>

          {/* String & Grip follow-on hooks */}
          <div className="mt-8">
            <h3 className="text-base font-bold mb-3">스트링 시타 출발점</h3>
            <p className="text-xs text-gray-400 mb-3">
              확인 가능한 라켓 사양(RA·무게·헤드·패턴)과 5축 점수, 진단의 통증 이력을 함께 반영합니다. 장력은 소재별 일반 가이드 안의 편집 시작값이며, 라켓 표시 범위를 확인하고 전문점 또는 의료 전문가와 결정하세요.
            </p>
            <div className="space-y-2">
              {results.map((result) => {
                const racket = racketInfo.get(result.racketModelId);
                const specs = racketSpecsMap.get(result.racketModelId);
                const pairingInput: StringPairingInput = {
                  stiffnessRa: specs?.stiffnessRa ?? null,
                  weightG: specs?.weightG ?? null,
                  headSizeSqIn: specs?.headSizeSqIn ?? null,
                  stringPattern: specs?.stringPattern ?? null,
                  segment: specs?.segment ?? null,
                  rawScores: result.axisScores as Partial<RawAxisScores100>,
                  beginner,
                  armSensitive,
                };
                const suggestions = recommendStringPairings(pairingInput);
                const safetyGate = requiresComfortSafetyGate(pairingInput);
                return (
                  <div
                    key={`string-${result.id}`}
                    className="border border-gray-100 rounded-xl p-4"
                  >
                    <div className="mb-3 flex flex-wrap items-center gap-2">
                      <span className="text-sm font-semibold text-gray-800">{racket?.name ?? "Unknown"}</span>
                      {safetyGate && (
                        <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
                          폴리에스터 제외 필터
                        </span>
                      )}
                    </div>
                    {suggestions.length === 0 ? (
                      <p className="text-xs leading-relaxed text-gray-500">
                        추천을 만들 근거가 부족합니다. 라켓 사양이 확인되면 조합을 표시합니다.
                      </p>
                    ) : (
                    <div className="grid gap-3">
                      {suggestions.map((suggestion) => (
                        <div key={suggestion.mode} className="rounded-lg bg-gray-50 p-3">
                          <div className="flex flex-wrap items-baseline justify-between gap-2">
                            <span className="text-[10px] font-semibold tracking-wider text-gray-400 uppercase">
                              {suggestion.modeLabel}
                            </span>
                            <span className="text-xs font-medium text-gray-700">
                              편집 시작값 {suggestion.tensionLbs.min}–{suggestion.tensionLbs.max} lbs
                            </span>
                          </div>
                          <Link
                            href={`/strings#${stringOfferId(suggestion.product.offerKey)}`}
                            className="mt-1 inline-flex text-sm font-medium text-blue-600 hover:underline"
                          >
                            {suggestion.product.brand} {suggestion.product.name}
                          </Link>
                          <p className="mt-1 text-xs leading-relaxed text-gray-500">
                            {suggestion.reason}
                          </p>
                          <p className="mt-1 text-[11px] leading-relaxed text-gray-400">
                            주의: {suggestion.tradeoff}
                          </p>
                        </div>
                      ))}
                    </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Grip hook teaser */}
            <div className="mt-4 border border-dashed border-gray-200 rounded-xl p-4 text-center">
              <p className="text-sm text-gray-500">
                🤚 그립 사이즈 추천은 곧 출시됩니다
              </p>
              <p className="text-xs text-gray-400 mt-1">
                손 크기 기반 그립 추천 · 오버그립 조합 안내
              </p>
            </div>
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
