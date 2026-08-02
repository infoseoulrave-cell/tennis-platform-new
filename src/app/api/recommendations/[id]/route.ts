import { db } from "@/db";
import {
  recommendationResults,
  recommendationRuns,
  playerProfiles,
  racketModels,
  brands,
  racketSpecs,
  racketVariants,
  partnerOffers,
} from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import {
  canViewPersonalNarrative,
  isUuid,
  parseOwnedRunIds,
  RUN_OWNER_COOKIE,
} from "@/lib/recommendation-access";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  // uuid 컬럼에 넣기 전에 형식을 본다. 안 그러면 Postgres 캐스트 오류가 그대로
  // 올라와 스택 트레이스가 붙은 500이 나간다.
  if (!isUuid(id)) {
    return NextResponse.json(
      { error: "Invalid recommendation result id" },
      { status: 400 }
    );
  }

  try {
    // 1. Fetch recommendation result
    const [result] = await db
      .select()
      .from(recommendationResults)
      .where(eq(recommendationResults.id, id));

    if (!result) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // 2. Fetch racket model + brand
    const [racket] = await db
      .select({
        name: racketModels.name,
        nameKo: racketModels.nameKo,
        segment: racketModels.segment,
        imageUrl: racketModels.imageUrl,
        brandName: brands.name,
        brandNameKo: brands.nameKo,
      })
      .from(racketModels)
      .innerJoin(brands, eq(brands.id, racketModels.brandId))
      .where(eq(racketModels.id, result.racketModelId));

    // 3. Fetch specs
    const [specs] = await db
      .select({
        headSizeSqIn: racketSpecs.headSizeSqIn,
        weightG: racketSpecs.weightG,
        balanceMm: racketSpecs.balanceMm,
        swingWeightKgCm2: racketSpecs.swingWeightKgCm2,
        stiffnessRa: racketSpecs.stiffnessRa,
        stringPattern: racketSpecs.stringPattern,
        composition: racketSpecs.composition,
      })
      .from(racketSpecs)
      .where(eq(racketSpecs.racketModelId, result.racketModelId));

    // 4. Fetch best available price from Korean variants
    const variants = await db
      .select({ retailPriceKrw: racketVariants.retailPriceKrw })
      .from(racketVariants)
      .where(
        and(
          eq(racketVariants.racketModelId, result.racketModelId),
          eq(racketVariants.availableInKorea, true)
        )
      );

    const prices = variants
      .map((v) => v.retailPriceKrw)
      .filter((p): p is number => p != null);
    const retailPriceKrw = prices.length > 0 ? Math.min(...prices) : null;

    // 5. Fetch recommendation run → player profile
    const [run] = await db
      .select()
      .from(recommendationRuns)
      .where(eq(recommendationRuns.id, result.recommendationRunId));

    const [profile] = run
      ? await db
          .select()
          .from(playerProfiles)
          .where(eq(playerProfiles.id, run.playerProfileId))
      : [undefined];

    // 진단 서술은 그 사람에 대한 정보다. 결과 UUID를 아는 것만으로는 열리지
    // 않고, 진단을 한 브라우저이거나 공유 토큰을 제시해야 한다.
    const mayViewNarrative = canViewPersonalNarrative({
      runId: run?.id,
      shareToken: run?.shareToken,
      providedToken: request.nextUrl.searchParams.get("t"),
      ownedRunIds: parseOwnedRunIds(
        request.cookies.get(RUN_OWNER_COOKIE)?.value
      ),
    });

    // 6. Fetch active partner offers for this racket
    const offers = await db
      .select()
      .from(partnerOffers)
      .where(
        and(
          eq(partnerOffers.racketModelId, result.racketModelId),
          eq(partnerOffers.active, true)
        )
      );

    return NextResponse.json({
      racket: {
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
        retailPriceKrw,
      },
      recommendation: {
        rank: result.rank,
        tier: result.tier,
        totalScore: Number(result.totalScore),
        axisScores: result.axisScores,
        explanationFragments: result.explanationFragments,
        antiRecommendation: result.antiRecommendationKo
          ? { textKo: result.antiRecommendationKo }
          : null,
        confidence: {
          level: result.confidenceLevel,
          reasonKo: result.confidenceReasonKo,
        },
      },
      playerSummary:
        profile && mayViewNarrative
          ? {
              summaryKo: profile.summaryKo,
              playstyleArchetype: profile.playstyleArchetype,
              currentRacketProvided:
                (profile.answers as Record<string, unknown>)?.current_racket != null,
            }
          : null,
      partnerOffers: offers.map((o) => ({
        id: o.id,
        partnerName: o.partnerName,
        partnerNameKo: o.partnerNameKo,
        partnerType: o.partnerType,
        location: o.location,
        contactUrl: o.contactUrl,
        offerDescription: o.offerDescription,
      })),
    });
  } catch (err) {
    console.error("[api/recommendations/[id]] failed:", err);
    return NextResponse.json(
      { error: "Failed to load recommendation" },
      { status: 500 }
    );
  }
}
