import { db } from "@/db";
import {
  recommendationResults,
  recommendationRuns,
  playerProfiles,
  racketModels,
  brands,
  racketSpecs,
  racketVariants,
} from "@/db/schema";
import { eq, inArray, and } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

type AxisScores = Record<string, number>;

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const idsParam = searchParams.get("ids");

  if (!idsParam) {
    return NextResponse.json(
      { error: "Missing required query parameter: ids" },
      { status: 400 }
    );
  }

  const ids = idsParam
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  if (ids.length < 2 || ids.length > 3) {
    return NextResponse.json(
      { error: "ids must contain between 2 and 3 recommendation result IDs" },
      { status: 400 }
    );
  }

  // 1. Fetch all recommendation results
  const results = await db
    .select()
    .from(recommendationResults)
    .where(inArray(recommendationResults.id, ids));

  if (results.length !== ids.length) {
    const foundIds = new Set(results.map((r) => r.id));
    const missing = ids.filter((id) => !foundIds.has(id));
    return NextResponse.json(
      { error: "One or more recommendation results not found", missing },
      { status: 404 }
    );
  }

  // Preserve caller's ordering
  const orderedResults = ids.map(
    (id) => results.find((r) => r.id === id)!
  );

  const racketModelIds = orderedResults.map((r) => r.racketModelId);

  // 2. Fetch racket models + brands for all rackets in one query
  const racketRows = await db
    .select({
      id: racketModels.id,
      name: racketModels.name,
      nameKo: racketModels.nameKo,
      segment: racketModels.segment,
      imageUrl: racketModels.imageUrl,
      brandName: brands.name,
      brandNameKo: brands.nameKo,
    })
    .from(racketModels)
    .innerJoin(brands, eq(brands.id, racketModels.brandId))
    .where(inArray(racketModels.id, racketModelIds));

  const racketByModelId = Object.fromEntries(racketRows.map((r) => [r.id, r]));

  // 3. Fetch specs for all rackets
  const specsRows = await db
    .select()
    .from(racketSpecs)
    .where(inArray(racketSpecs.racketModelId, racketModelIds));

  const specsByModelId = Object.fromEntries(
    specsRows.map((s) => [s.racketModelId, s])
  );

  // 4. Fetch best Korean price for each racket
  const variantRows = await db
    .select({
      racketModelId: racketVariants.racketModelId,
      retailPriceKrw: racketVariants.retailPriceKrw,
    })
    .from(racketVariants)
    .where(
      and(
        inArray(racketVariants.racketModelId, racketModelIds),
        eq(racketVariants.availableInKorea, true)
      )
    );

  const priceByModelId: Record<string, number | null> = {};
  for (const v of variantRows) {
    const existing = priceByModelId[v.racketModelId];
    if (v.retailPriceKrw != null) {
      priceByModelId[v.racketModelId] =
        existing == null ? v.retailPriceKrw : Math.min(existing, v.retailPriceKrw);
    }
  }

  // 5. Fetch recommendation run → player profile (use first result's run)
  const runIds = [...new Set(orderedResults.map((r) => r.recommendationRunId))];
  const [run] = await db
    .select()
    .from(recommendationRuns)
    .where(eq(recommendationRuns.id, runIds[0]));

  const [profile] = run
    ? await db
        .select()
        .from(playerProfiles)
        .where(eq(playerProfiles.id, run.playerProfileId))
    : [undefined];

  // 6. Build rackets array
  const rackets = orderedResults.map((result) => {
    const racket = racketByModelId[result.racketModelId];
    const specs = specsByModelId[result.racketModelId];
    return {
      recommendationResultId: result.id,
      racketModelId: result.racketModelId,
      name: racket?.name ?? null,
      nameKo: racket?.nameKo ?? null,
      segment: racket?.segment ?? null,
      imageUrl: racket?.imageUrl ?? null,
      brand: racket
        ? { name: racket.brandName, nameKo: racket.brandNameKo }
        : null,
      specs: specs
        ? {
            headSizeSqIn: specs.headSizeSqIn != null ? Number(specs.headSizeSqIn) : null,
            weightG: specs.weightG != null ? Number(specs.weightG) : null,
            balanceMm: specs.balanceMm != null ? Number(specs.balanceMm) : null,
            swingWeightKgCm2:
              specs.swingWeightKgCm2 != null ? Number(specs.swingWeightKgCm2) : null,
            stiffnessRa: specs.stiffnessRa != null ? Number(specs.stiffnessRa) : null,
            stringPattern: specs.stringPattern ?? null,
            composition: specs.composition ?? null,
          }
        : null,
      retailPriceKrw: priceByModelId[result.racketModelId] ?? null,
      recommendation: {
        rank: result.rank,
        tier: result.tier,
        totalScore: Number(result.totalScore),
        axisScores: result.axisScores as AxisScores,
        explanationFragments: result.explanationFragments,
        confidence: {
          level: result.confidenceLevel,
          reasonKo: result.confidenceReasonKo,
        },
      },
    };
  });

  // 7. Extract player priorities from profile answers
  const answers = profile?.answers as Record<string, unknown> | undefined;
  const priorityTradeoffs = answers?.priority_tradeoffs as
    | { first?: string; second?: string }
    | undefined;

  const playerPriorities = {
    first: priorityTradeoffs?.first ?? null,
    second: priorityTradeoffs?.second ?? null,
  };

  // 8. Generate verdicts: for each priority axis, find which racket scores highest
  const verdicts: Array<{
    axisKey: string;
    winnerRacketModelId: string;
    winnerName: string | null;
    scores: Array<{ racketModelId: string; score: number }>;
  }> = [];

  const priorityAxes = [
    priorityTradeoffs?.first,
    priorityTradeoffs?.second,
  ].filter((a): a is string => Boolean(a));

  for (const axisKey of priorityAxes) {
    const scores = orderedResults.map((r) => ({
      racketModelId: r.racketModelId,
      score: ((r.axisScores as AxisScores)?.[axisKey] ?? 0),
    }));

    const winner = scores.reduce((best, cur) =>
      cur.score > best.score ? cur : best
    );

    verdicts.push({
      axisKey,
      winnerRacketModelId: winner.racketModelId,
      winnerName: racketByModelId[winner.racketModelId]?.name ?? null,
      scores,
    });
  }

  // 9. Generate key differences: one summary line per racket
  const keyDifferences = orderedResults.map((result) => {
    const racket = racketByModelId[result.racketModelId];
    const specs = specsByModelId[result.racketModelId];
    const axisScores = result.axisScores as AxisScores | null;

    // Pick the axis where this racket leads compared to others
    const leadingAxis = axisScores
      ? Object.entries(axisScores).reduce<{
          key: string;
          margin: number;
        } | null>((best, [key, score]) => {
          const othersMax = orderedResults
            .filter((r) => r.id !== result.id)
            .map((r) => ((r.axisScores as AxisScores)?.[key] ?? 0))
            .reduce((a, b) => Math.max(a, b), 0);
          const margin = Number(score) - othersMax;
          if (!best || margin > best.margin) return { key, margin };
          return best;
        }, null)
      : null;

    return {
      racketModelId: result.racketModelId,
      name: racket?.name ?? null,
      totalScore: Number(result.totalScore),
      rank: result.rank,
      strengthAxisKey: leadingAxis && leadingAxis.margin > 0 ? leadingAxis.key : null,
      summaryLine: buildSummaryLine({
        name: racket?.name ?? null,
        segment: racket?.segment ?? null,
        weightG: specs?.weightG != null ? Number(specs.weightG) : null,
        rank: result.rank,
        strengthAxis: leadingAxis && leadingAxis.margin > 0 ? leadingAxis.key : null,
      }),
    };
  });

  return NextResponse.json({
    rackets,
    playerPriorities,
    verdicts,
    keyDifferences,
  });
}

function buildSummaryLine(opts: {
  name: string | null;
  segment: string | null;
  weightG: number | null;
  rank: number;
  strengthAxis: string | null;
}): string {
  const parts: string[] = [];
  if (opts.name) parts.push(opts.name);
  if (opts.segment) parts.push(`(${opts.segment})`);
  if (opts.weightG) parts.push(`${opts.weightG}g`);
  if (opts.strengthAxis) parts.push(`— strongest in ${opts.strengthAxis}`);
  parts.push(`[rank #${opts.rank}]`);
  return parts.join(" ");
}
