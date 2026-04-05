import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { runRecommendation } from "@/modules/recommendation";

const submitSchema = z.object({
  sessionId: z.string().uuid(),
  answers: z.object({
    current_racket: z
      .object({
        racketModelId: z.string().uuid().nullable().optional(),
        selection: z.enum(["search", "unknown", "first_purchase"]).optional(),
      })
      .optional(),
    play_profile: z
      .object({
        experience: z.string().optional(),
        frequency: z.string().optional(),
      })
      .optional(),
    swing_style: z
      .object({
        swingSpeed: z.number().min(0).max(1).optional(),
        playStyle: z.string().optional(),
      })
      .optional(),
    pain_points: z.array(z.string()).optional(),
    priority_tradeoffs: z
      .object({
        first: z.string().optional(),
        second: z.string().optional(),
      })
      .optional(),
    confirmation: z.boolean().optional(),
  }),
});

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON in request body" },
      { status: 400 }
    );
  }

  const parsed = submitSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Validation failed",
        details: parsed.error.flatten().fieldErrors,
      },
      { status: 422 }
    );
  }

  const { sessionId, answers } = parsed.data;

  try {
    const result = await runRecommendation({
      sessionId,
      answers: answers as Record<string, unknown>,
    });

    return NextResponse.json(
      {
        success: true,
        playerProfile: result.playerProfile,
        recommendationRunId: result.recommendationRunId,
        recommendations: result.recommendations,
      },
      { status: 200 }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unexpected error";
    console.error("[diagnosis/submit] runRecommendation failed:", err);
    return NextResponse.json(
      { error: "Recommendation engine error", message },
      { status: 500 }
    );
  }
}
