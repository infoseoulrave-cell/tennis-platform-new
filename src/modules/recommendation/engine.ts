import { db } from "@/db";
import {
  axisDefinitions,
  racketModels,
  racketSpecs,
  racketVariants,
  specSources,
  playerProfiles,
  recommendationRuns,
  recommendationResults,
} from "@/db/schema";
import { and, eq, exists, inArray } from "drizzle-orm";
import {
  computeAxisScores,
  hasReliableAxisScores,
  SCORING_VERSION,
  type RacketSpecInput,
} from "./scoring-core";
import { calculatePlayerWeights, suitabilityAdjustment } from "./ranking";

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
  elbow_pain: "상대적으로 낮은 강성의 비교 후보입니다. 통증이 지속되면 의료 전문가와 전문점 상담이 우선입니다",
  wrist_pain: "조작 부담을 비교하기 위한 후보입니다. 손목 증상은 의료 전문가와 전문점에 먼저 상담하세요",
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

type EvidenceRole = "manufacturer_static" | "tennis_warehouse_measured";

type EvidenceSourceRow = {
  racketModelId: string;
  verifiedByAdmin: boolean;
  rawValues: unknown;
};

function evidenceRole(rawValues: unknown): EvidenceRole | null {
  if (!rawValues || typeof rawValues !== "object" || Array.isArray(rawValues)) {
    return null;
  }
  const values = rawValues as Record<string, unknown>;
  if (
    values.source_role === "manufacturer_static"
    || values.source_role === "tennis_warehouse_measured"
  ) {
    return values.source_role;
  }
  if (values.measurement_basis === "unstrung") return "manufacturer_static";
  if (values.measurement_basis === "strung") return "tennis_warehouse_measured";
  return null;
}

export function collectVerifiedEvidenceRoles(
  rows: readonly EvidenceSourceRow[],
): Map<string, Set<EvidenceRole>> {
  const rolesByRacket = new Map<string, Set<EvidenceRole>>();
  for (const row of rows) {
    if (!row.verifiedByAdmin) continue;
    const role = evidenceRole(row.rawValues);
    if (!role) continue;
    const roles = rolesByRacket.get(row.racketModelId) ?? new Set<EvidenceRole>();
    roles.add(role);
    rolesByRacket.set(row.racketModelId, roles);
  }
  return rolesByRacket;
}

// Determine confidence level
export function computeRecommendationConfidence(
  answersCount: number,
  evidenceRoles: ReadonlySet<EvidenceRole> | undefined,
): { level: "high" | "medium" | "low"; reasonKo: string } {
  const hasManufacturer = evidenceRoles?.has("manufacturer_static") ?? false;
  const hasMeasured = evidenceRoles?.has("tennis_warehouse_measured") ?? false;
  if (answersCount >= 6 && hasManufacturer && hasMeasured) {
    return { level: "high", reasonKo: "모든 진단 답변과 충분한 스펙 소스가 확인되었습니다" };
  }
  if (answersCount >= 5 && (hasManufacturer || hasMeasured)) {
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
  const persistedAxisDefs = await db
    .select({
      id: axisDefinitions.id,
      axisKey: axisDefinitions.axisKey,
      axisNameKo: axisDefinitions.axisNameKo,
      weightDefault: axisDefinitions.weightDefault,
    })
    .from(axisDefinitions)
    .where(eq(axisDefinitions.version, SCORING_VERSION));

  // A deployment can receive the application code before the v3 definition
  // rows are migrated. The recommendation calculation itself is spec-based,
  // so keep the five equal default weights available as a safe fallback.
  const axisDefs = persistedAxisDefs.length === 5
    ? persistedAxisDefs
    : Object.entries(AXIS_LABEL_KO_FALLBACK).map(([axisKey, axisNameKo]) => ({
        id: axisKey,
        axisKey,
        axisNameKo,
        weightDefault: "0.20",
      }));

  const axisKeyToLabelKo = new Map<string, string>(
    axisDefs.map((a) => [a.axisKey, a.axisNameKo ?? AXIS_LABEL_KO_FALLBACK[a.axisKey] ?? a.axisKey])
  );
  // 2. Compute player weights
  const playerWeights = calculatePlayerWeights(axisDefs, answers);

  // 3. Load published specs and calculate every candidate with v3. This
  // avoids silently reusing stale rows and works before v3 rows persist.
  const publishedModelIds = await db
    .select({
      id: racketModels.id,
      segment: racketModels.segment,
      headSizeSqIn: racketSpecs.headSizeSqIn,
      weightG: racketSpecs.weightG,
      balanceMm: racketSpecs.balanceMm,
      swingWeightKgCm2: racketSpecs.swingWeightKgCm2,
      stiffnessRa: racketSpecs.stiffnessRa,
      beamWidthMm: racketSpecs.beamWidthMm,
      stringPattern: racketSpecs.stringPattern,
    })
    .from(racketModels)
    .innerJoin(racketSpecs, eq(racketSpecs.racketModelId, racketModels.id))
    .where(and(
      eq(racketSpecs.ingestionState, "published"),
      eq(racketModels.discontinued, false),
      exists(
        db
          .select({ id: racketVariants.id })
          .from(racketVariants)
          .where(and(
            eq(racketVariants.racketModelId, racketModels.id),
            eq(racketVariants.regionCode, "KR"),
            eq(racketVariants.availableInKorea, true),
          )),
      ),
    ));

  if (publishedModelIds.length === 0) {
    throw new Error("No published racket models found for recommendation");
  }

  const publishedIds = publishedModelIds.map((r) => r.id);

  const computedScoresByRacket = new Map<string, Record<string, number>>();
  const specsByRacket = new Map<string, RacketSpecInput>();
  for (const row of publishedModelIds) {
    const spec: RacketSpecInput = {
      headSizeSqIn: row.headSizeSqIn ? Number(row.headSizeSqIn) : null,
      weightG: row.weightG ? Number(row.weightG) : null,
      balanceMm: row.balanceMm ? Number(row.balanceMm) : null,
      swingWeightKgCm2: row.swingWeightKgCm2 ? Number(row.swingWeightKgCm2) : null,
      stiffnessRa: row.stiffnessRa ? Number(row.stiffnessRa) : null,
      beamWidthMm: row.beamWidthMm,
      stringPattern: row.stringPattern,
    };
    const scores = computeAxisScores(spec);
    if (!hasReliableAxisScores(scores)) continue;
    specsByRacket.set(row.id, spec);
    computedScoresByRacket.set(
      row.id,
      Object.fromEntries(scores.map((score) => [score.axisKey, score.score])),
    );
  }
  const axisScoresByRacket = computedScoresByRacket;

  // 5. Only include rackets that have scores for ALL axes
  const requiredAxisCount = 5;
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
    const candidateSpec = specsByRacket.get(racketId);
    if (!candidateSpec) continue;
    totalScore += suitabilityAdjustment(candidateSpec, answers);
    totalScore = Math.max(0, Math.min(100, totalScore));

    scored.push({ racket: info, totalScore, axisScores: axes });
  }

  // 8. Sort descending
  scored.sort((a, b) => b.totalScore - a.totalScore);

  // 9. Pick top 3: for rank 3 prefer different segment than rank 1
  const top2 = scored.slice(0, 2);
  const rank1Segment = top2[0]?.racket.segment ?? null;
  const rest = scored.slice(2);

  // Prefer different segment for adventurous choice
  const rank3 = rest.find((r) => r.racket.segment !== rank1Segment) ?? rest[0];

  // If we have fewer than 3 total, use what we have
  const top3: ScoredRacket[] = [top2[0], top2[1], rank3].filter(
    (r): r is ScoredRacket => r !== undefined
  );

  // 10. Current racket axes (for delta)
  const currentRacketId = answers.current_racket?.racketModelId ?? null;
  let currentAxes: Record<string, number> | null = null;

  if (currentRacketId) {
    currentAxes = axisScoresByRacket.get(currentRacketId) ?? null;
  }

  // 11. Load verified evidence roles for the top 3 rackets (for confidence)
  const top3Ids = top3.map((r) => r.racket.id);
  const evidenceSourceRows = await db
    .select({
      racketModelId: racketModels.id,
      verifiedByAdmin: specSources.verifiedByAdmin,
      rawValues: specSources.rawValues,
    })
    .from(specSources)
    .innerJoin(racketSpecs, eq(specSources.racketSpecsId, racketSpecs.id))
    .innerJoin(racketModels, eq(racketSpecs.racketModelId, racketModels.id))
    .where(and(
      inArray(racketModels.id, top3Ids),
      eq(specSources.verifiedByAdmin, true),
    ));
  const evidenceRolesByRacket = collectVerifiedEvidenceRoles(evidenceSourceRows);

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
    const { level: confidenceLevel, reasonKo: confidenceReasonKo } =
      computeRecommendationConfidence(
        answersCount,
        evidenceRolesByRacket.get(scored.racket.id),
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
