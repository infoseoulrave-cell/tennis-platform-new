import { db } from "@/db";
import {
  axisDefinitions,
  racketAxisScores,
  racketModels,
  racketSpecs,
  racketVariants,
  brands,
  specSources,
  playerProfiles,
  recommendationRuns,
  recommendationResults,
} from "@/db/schema";
import { eq, and, inArray, desc } from "drizzle-orm";

const SCORING_VERSION = "v1";

// Tier labels by rank
const TIER_BY_RANK: Record<number, string> = {
  1: "best_fit",
  2: "safe_alternative",
  3: "adventurous_choice",
};

// Korean axis label fallbacks keyed by axisKey
const AXIS_LABEL_KO_FALLBACK: Record<string, string> = {
  control: "컨트롤",
  power: "파워",
  comfort: "편안함",
  spin: "스핀",
  stability: "안정성",
};

// Korean pain point descriptions
const PAIN_POINT_KO: Record<string, string> = {
  elbow_pain: "팔꿈치 통증 완화에 도움이 되는 라켓입니다",
  wrist_pain: "손목 부담이 적은 구조로 설계되었습니다",
  short_shots: "짧은 샷 컨트롤에 유리한 설계입니다",
  inconsistent_serve: "서브 일관성 향상에 기여합니다",
  heavy_racket: "가벼운 취급감으로 피로감을 줄여줍니다",
};

// Axis keys associated with each pain point for comfort/control threshold checks
const PAIN_POINT_AXIS_MAP: Record<string, { axisKey: string; threshold: number }> = {
  elbow_pain: { axisKey: "comfort", threshold: 45 },
  wrist_pain: { axisKey: "comfort", threshold: 45 },
  short_shots: { axisKey: "control", threshold: 50 },
  inconsistent_serve: { axisKey: "control", threshold: 45 },
  heavy_racket: { axisKey: "comfort", threshold: 50 },
};

// Anti-recommendation templates by tier
const ANTI_RECOMMENDATION_KO: Record<string, string> = {
  best_fit: "파워/스핀 극대화가 최우선이면 도전적 선택 참고",
  safe_alternative: "더 높은 컨트롤과 편안함을 원한다면 최적 선택 참고",
  adventurous_choice: "안정적인 선택을 원한다면 최적 선택 또는 무난한 선택을 참고",
};

interface ExplanationFragment {
  type: "positive" | "tradeoff";
  textKo: string;
}

const templates = {
  highPriority: (axisLabelKo: string): ExplanationFragment => ({
    type: "positive",
    textKo: `당신이 원한 ${axisLabelKo} 향상에 가장 적합한 밸런스`,
  }),
  secondPriority: (axisLabelKo: string): ExplanationFragment => ({
    type: "positive",
    textKo: `${axisLabelKo}도 균형 있게 갖추고 있습니다`,
  }),
  painPointResolved: (painKo: string): ExplanationFragment => ({
    type: "positive",
    textKo: painKo,
  }),
  tradeoff: (axisLabelKo: string): ExplanationFragment => ({
    type: "tradeoff",
    textKo: `순수 ${axisLabelKo}는 현재 라켓보다 약간 감소할 수 있음`,
  }),
};

// Answers shape parsed from the submit request
interface DiagnosisAnswers {
  current_racket?: {
    racketModelId?: string | null;
    selection?: "search" | "unknown" | "first_purchase";
  };
  play_profile?: {
    experience?: string;
    frequency?: string;
  };
  swing_style?: {
    swingSpeed?: number;
    playStyle?: string;
  };
  pain_points?: string[];
  priority_tradeoffs?: {
    first?: string;
    second?: string;
  };
  confirmation?: boolean;
}

interface AxisScoreRow {
  racketModelId: string;
  axisKey: string;
  axisDefinitionId: string;
  axisNameKo: string | null;
  score: string; // numeric comes back as string from drizzle
}

interface RacketInfo {
  id: string;
  name: string;
  nameKo: string | null;
  segment: string | null;
  imageUrl: string | null;
}

interface ScoredRacket {
  racket: RacketInfo;
  totalScore: number;
  axisScores: Record<string, number>;
}

// Derive playstyle archetype from answers
function deriveArchetype(answers: DiagnosisAnswers): string {
  const first = answers.priority_tradeoffs?.first ?? "balanced";
  const experience = answers.play_profile?.experience ?? "unknown";

  const expMap: Record<string, string> = {
    "less_1_year": "beginner",
    "1_3_years": "intermediate",
    "3_5_years": "intermediate",
    "5_plus_years": "advanced",
    "10_plus_years": "advanced",
  };
  const expLabel = expMap[experience as string] ?? "intermediate";

  return `${expLabel}_${first}_seeker`;
}

// Generate player summary in Korean
function generateSummaryKo(answers: DiagnosisAnswers): string {
  const experienceMap: Record<string, string> = {
    "less_1_year": "1년 미만",
    "1_3_years": "1-3년",
    "3_5_years": "3-5년",
    "5_plus_years": "5년 이상",
    "10_plus_years": "10년 이상",
  };
  const frequencyMap: Record<string, string> = {
    "once_weekly": "주 1회",
    "2_3_weekly": "주 2-3회",
    "4_5_weekly": "주 4-5회",
    "daily": "매일",
  };
  const priorityMap: Record<string, string> = {
    control: "컨트롤",
    power: "파워",
    comfort: "편안함",
    spin: "스핀",
    stability: "안정성",
  };

  const exp = experienceMap[answers.play_profile?.experience ?? ""] ?? "경력 불명";
  const freq = frequencyMap[answers.play_profile?.frequency ?? ""] ?? "빈도 불명";
  const first = priorityMap[answers.priority_tradeoffs?.first ?? ""] ?? "밸런스";

  return `경력 ${exp} / ${freq} / ${first} 중시`;
}

// Compute player axis weights from defaults + priority boosts
function computePlayerWeights(
  axisRows: { id: string; axisKey: string; weightDefault: string }[],
  answers: DiagnosisAnswers
): Map<string, number> {
  const weights = new Map<string, number>();

  // Initialize with defaults
  for (const axis of axisRows) {
    weights.set(axis.axisKey, parseFloat(axis.weightDefault));
  }

  // Apply priority boosts
  const first = answers.priority_tradeoffs?.first;
  const second = answers.priority_tradeoffs?.second;

  if (first && weights.has(first)) {
    weights.set(first, (weights.get(first) ?? 0) + 0.15);
  }
  if (second && weights.has(second)) {
    weights.set(second, (weights.get(second) ?? 0) + 0.10);
  }

  // Normalize to sum = 1.0
  const total = Array.from(weights.values()).reduce((a, b) => a + b, 0);
  if (total > 0) {
    for (const [key, val] of weights.entries()) {
      weights.set(key, val / total);
    }
  }

  return weights;
}

// Build explanation fragments for a ranked racket
function buildExplanationFragments(
  racketAxes: Record<string, number>,
  axisKeyToLabelKo: Map<string, string>,
  answers: DiagnosisAnswers,
  currentAxes: Record<string, number> | null
): ExplanationFragment[] {
  const fragments: ExplanationFragment[] = [];

  const firstPriority = answers.priority_tradeoffs?.first;
  const secondPriority = answers.priority_tradeoffs?.second;
  const painPoints = answers.pain_points ?? [];

  // High priority axis check (>55)
  if (firstPriority && (racketAxes[firstPriority] ?? 0) > 55) {
    const labelKo = axisKeyToLabelKo.get(firstPriority) ?? AXIS_LABEL_KO_FALLBACK[firstPriority] ?? firstPriority;
    fragments.push(templates.highPriority(labelKo));
  }

  // Second priority axis check (>45)
  if (secondPriority && (racketAxes[secondPriority] ?? 0) > 45) {
    const labelKo = axisKeyToLabelKo.get(secondPriority) ?? AXIS_LABEL_KO_FALLBACK[secondPriority] ?? secondPriority;
    fragments.push(templates.secondPriority(labelKo));
  }

  // Pain point resolution
  for (const pain of painPoints) {
    const mapping = PAIN_POINT_AXIS_MAP[pain];
    if (mapping && (racketAxes[mapping.axisKey] ?? 0) >= mapping.threshold) {
      const textKo = PAIN_POINT_KO[pain] ?? `${pain} 문제를 완화하는 데 적합합니다`;
      fragments.push(templates.painPointResolved(textKo));
    }
  }

  // Tradeoff fragments from delta (only if current racket known)
  if (currentAxes) {
    for (const [axisKey, recommendedScore] of Object.entries(racketAxes)) {
      const currentScore = currentAxes[axisKey] ?? 0;
      const delta = recommendedScore - currentScore;
      if (delta < -3) {
        const labelKo = axisKeyToLabelKo.get(axisKey) ?? AXIS_LABEL_KO_FALLBACK[axisKey] ?? axisKey;
        fragments.push(templates.tradeoff(labelKo));
      }
    }
  }

  return fragments;
}

// Compute per-axis delta vs current racket (|delta| >= 3 only)
function computeDelta(
  recommended: Record<string, number>,
  current: Record<string, number>
): Record<string, number> {
  const delta: Record<string, number> = {};
  for (const [axisKey, score] of Object.entries(recommended)) {
    const d = score - (current[axisKey] ?? 0);
    if (Math.abs(d) >= 3) {
      delta[axisKey] = parseFloat(d.toFixed(2));
    }
  }
  return delta;
}

// Determine confidence level
function computeConfidence(
  answersCount: number,
  specSourceCount: number
): { level: "high" | "medium" | "low"; reasonKo: string } {
  if (answersCount >= 6 && specSourceCount >= 3) {
    return { level: "high", reasonKo: "모든 진단 답변과 충분한 스펙 소스가 확인되었습니다" };
  }
  if (answersCount >= 5 && specSourceCount >= 1) {
    return { level: "medium", reasonKo: "대부분의 진단 답변과 스펙이 확인되었습니다" };
  }
  return { level: "low", reasonKo: "일부 답변 또는 스펙 데이터가 부족합니다" };
}

export interface RecommendationResult {
  rank: number;
  tier: string;
  racketModelId: string;
  racketName: string;
  racketNameKo: string | null;
  segment: string | null;
  imageUrl: string | null;
  totalScore: number;
  axisScores: Record<string, number>;
  delta: Record<string, number> | null;
  explanationFragments: ExplanationFragment[];
  antiRecommendationKo: string;
  confidenceLevel: "high" | "medium" | "low";
  confidenceReasonKo: string;
}

export interface RunRecommendationResult {
  playerProfile: {
    id: string;
    sessionId: string;
    playstyleArchetype: string;
    summaryKo: string;
  };
  recommendationRunId: string;
  recommendations: RecommendationResult[];
}

export async function runRecommendation(input: {
  sessionId: string;
  answers: Record<string, unknown>;
}): Promise<RunRecommendationResult> {
  const answers = input.answers as DiagnosisAnswers;
  const answersCount = Object.keys(answers).length;

  // 1. Load axis definitions
  const axisDefs = await db
    .select({
      id: axisDefinitions.id,
      axisKey: axisDefinitions.axisKey,
      axisNameKo: axisDefinitions.axisNameKo,
      weightDefault: axisDefinitions.weightDefault,
    })
    .from(axisDefinitions)
    .where(eq(axisDefinitions.version, SCORING_VERSION));

  const axisKeyToLabelKo = new Map<string, string>(
    axisDefs.map((a) => [a.axisKey, a.axisNameKo ?? AXIS_LABEL_KO_FALLBACK[a.axisKey] ?? a.axisKey])
  );
  const axisDefIdToKey = new Map<string, string>(axisDefs.map((a) => [a.id, a.axisKey]));

  // 2. Compute player weights
  const playerWeights = computePlayerWeights(axisDefs, answers);

  // 3. Load all pre-computed axis scores for v1 (published rackets only)
  const publishedModelIds = await db
    .select({ id: racketModels.id, segment: racketModels.segment })
    .from(racketModels)
    .innerJoin(racketSpecs, eq(racketSpecs.racketModelId, racketModels.id))
    .where(eq(racketSpecs.ingestionState, "published"));

  if (publishedModelIds.length === 0) {
    throw new Error("No published racket models found for recommendation");
  }

  const publishedIds = publishedModelIds.map((r) => r.id);
  const segmentByModelId = new Map(publishedModelIds.map((r) => [r.id, r.segment]));

  const allAxisScores = await db
    .select({
      racketModelId: racketAxisScores.racketModelId,
      axisDefinitionId: racketAxisScores.axisDefinitionId,
      score: racketAxisScores.score,
    })
    .from(racketAxisScores)
    .where(
      and(
        eq(racketAxisScores.scoringVersion, SCORING_VERSION),
        inArray(racketAxisScores.racketModelId, publishedIds)
      )
    );

  // 4. Group axis scores by racket
  const axisScoresByRacket = new Map<string, Record<string, number>>();
  for (const row of allAxisScores) {
    const axisKey = axisDefIdToKey.get(row.axisDefinitionId);
    if (!axisKey) continue;
    if (!axisScoresByRacket.has(row.racketModelId)) {
      axisScoresByRacket.set(row.racketModelId, {});
    }
    axisScoresByRacket.get(row.racketModelId)![axisKey] = parseFloat(row.score);
  }

  // 5. Only include rackets that have scores for ALL axes
  const requiredAxisCount = axisDefs.length;
  const completeRacketIds = publishedIds.filter((id) => {
    const scores = axisScoresByRacket.get(id);
    return scores !== undefined && Object.keys(scores).length >= requiredAxisCount;
  });

  if (completeRacketIds.length === 0) {
    throw new Error("No rackets with complete axis scores found");
  }

  // 6. Load racket model details
  const racketDetails = await db
    .select({
      id: racketModels.id,
      name: racketModels.name,
      nameKo: racketModels.nameKo,
      segment: racketModels.segment,
      imageUrl: racketModels.imageUrl,
    })
    .from(racketModels)
    .where(inArray(racketModels.id, completeRacketIds));

  const racketInfoById = new Map<string, RacketInfo>(racketDetails.map((r) => [r.id, r]));

  // 7. Score each racket
  const scored: ScoredRacket[] = [];
  for (const racketId of completeRacketIds) {
    const axes = axisScoresByRacket.get(racketId)!;
    const info = racketInfoById.get(racketId);
    if (!info) continue;

    let totalScore = 0;
    for (const [axisKey, weight] of playerWeights.entries()) {
      totalScore += weight * (axes[axisKey] ?? 0);
    }

    scored.push({ racket: info, totalScore, axisScores: axes });
  }

  // 8. Sort descending
  scored.sort((a, b) => b.totalScore - a.totalScore);

  // 9. Pick top 3: for rank 3 prefer different segment than rank 1
  const top2 = scored.slice(0, 2);
  const rank1Segment = top2[0]?.racket.segment ?? null;
  let rank3: ScoredRacket | undefined;
  const rest = scored.slice(2);

  // Prefer different segment for adventurous choice
  rank3 = rest.find((r) => r.racket.segment !== rank1Segment) ?? rest[0];

  // If we have fewer than 3 total, use what we have
  const top3: ScoredRacket[] = [top2[0], top2[1], rank3].filter(
    (r): r is ScoredRacket => r !== undefined
  );

  // 10. Current racket axes (for delta)
  const currentRacketId = answers.current_racket?.racketModelId ?? null;
  let currentAxes: Record<string, number> | null = null;

  if (currentRacketId) {
    const currentAxisRows = await db
      .select({
        axisDefinitionId: racketAxisScores.axisDefinitionId,
        score: racketAxisScores.score,
      })
      .from(racketAxisScores)
      .where(
        and(
          eq(racketAxisScores.racketModelId, currentRacketId),
          eq(racketAxisScores.scoringVersion, SCORING_VERSION)
        )
      );

    if (currentAxisRows.length > 0) {
      currentAxes = {};
      for (const row of currentAxisRows) {
        const axisKey = axisDefIdToKey.get(row.axisDefinitionId);
        if (axisKey) currentAxes[axisKey] = parseFloat(row.score);
      }
    }
  }

  // 11. Count spec sources for the top 3 rackets (for confidence)
  const top3Ids = top3.map((r) => r.racket.id);
  const sourceCountRows = await db
    .select({ count: specSources.id, racketModelId: racketModels.id })
    .from(specSources)
    .innerJoin(racketSpecs, eq(specSources.racketSpecsId, racketSpecs.id))
    .innerJoin(racketModels, eq(racketSpecs.racketModelId, racketModels.id))
    .where(inArray(racketModels.id, top3Ids));

  const sourceCountByRacket = new Map<string, number>();
  for (const row of sourceCountRows) {
    sourceCountByRacket.set(
      row.racketModelId,
      (sourceCountByRacket.get(row.racketModelId) ?? 0) + 1
    );
  }

  // 12. Build final recommendations
  const playstyleArchetype = deriveArchetype(answers);
  const summaryKo = generateSummaryKo(answers);

  const recommendations: RecommendationResult[] = top3.map((scored, idx) => {
    const rank = idx + 1;
    const tier = TIER_BY_RANK[rank] ?? "other";
    const fragments = buildExplanationFragments(
      scored.axisScores,
      axisKeyToLabelKo,
      answers,
      currentAxes
    );
    const delta = currentAxes ? computeDelta(scored.axisScores, currentAxes) : null;
    const specSourceCount = sourceCountByRacket.get(scored.racket.id) ?? 0;
    const { level: confidenceLevel, reasonKo: confidenceReasonKo } = computeConfidence(
      answersCount,
      specSourceCount
    );

    return {
      rank,
      tier,
      racketModelId: scored.racket.id,
      racketName: scored.racket.name,
      racketNameKo: scored.racket.nameKo,
      segment: scored.racket.segment,
      imageUrl: scored.racket.imageUrl,
      totalScore: parseFloat(scored.totalScore.toFixed(2)),
      axisScores: scored.axisScores,
      delta,
      explanationFragments: fragments,
      antiRecommendationKo: ANTI_RECOMMENDATION_KO[tier] ?? "",
      confidenceLevel,
      confidenceReasonKo,
    };
  });

  // 13. Persist player profile
  const shareToken = crypto.randomUUID().slice(0, 8);

  const [playerProfile] = await db
    .insert(playerProfiles)
    .values({
      sessionId: input.sessionId,
      answers: input.answers,
      playstyleArchetype,
      summaryKo,
    })
    .returning({
      id: playerProfiles.id,
      sessionId: playerProfiles.sessionId,
      playstyleArchetype: playerProfiles.playstyleArchetype,
      summaryKo: playerProfiles.summaryKo,
    });

  // 14. Persist recommendation run
  const rankedResults = recommendations.map((r) => ({
    rank: r.rank,
    tier: r.tier,
    racketModelId: r.racketModelId,
    totalScore: r.totalScore,
  }));

  const [recommendationRun] = await db
    .insert(recommendationRuns)
    .values({
      playerProfileId: playerProfile.id,
      scoringVersion: SCORING_VERSION,
      inputSnapshot: input.answers,
      rankedResults,
      shareToken,
    })
    .returning({ id: recommendationRuns.id });

  // 15. Persist recommendation results
  await db.insert(recommendationResults).values(
    recommendations.map((r) => ({
      recommendationRunId: recommendationRun.id,
      racketModelId: r.racketModelId,
      rank: r.rank,
      totalScore: r.totalScore.toString(),
      axisScores: r.axisScores,
      explanationFragments: r.explanationFragments,
      tier: r.tier,
      antiRecommendationKo: r.antiRecommendationKo,
      confidenceLevel: r.confidenceLevel,
      confidenceReasonKo: r.confidenceReasonKo,
    }))
  );

  return {
    playerProfile: {
      id: playerProfile.id,
      sessionId: playerProfile.sessionId,
      playstyleArchetype: playerProfile.playstyleArchetype ?? playstyleArchetype,
      summaryKo: playerProfile.summaryKo ?? summaryKo,
    },
    recommendationRunId: recommendationRun.id,
    recommendations,
  };
}
