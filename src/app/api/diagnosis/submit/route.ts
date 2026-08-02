import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { runRecommendation } from "@/modules/recommendation";
import {
  appendOwnedRunId,
  ownedRunsCookieOptions,
  RUN_OWNER_COOKIE,
} from "@/lib/recommendation-access";

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

    const response = NextResponse.json(
      {
        success: true,
        playerProfile: result.playerProfile,
        recommendationRunId: result.recommendationRunId,
        recommendations: result.recommendations,
      },
      { status: 200 }
    );

    // 이 브라우저가 방금 만든 결과라는 표시. 계정이 없으므로 자기 진단의
    // 개인 서술을 다시 열어 볼 수 있는 유일한 근거다.
    response.cookies.set(
      RUN_OWNER_COOKIE,
      appendOwnedRunId(
        request.cookies.get(RUN_OWNER_COOKIE)?.value,
        result.recommendationRunId,
      ),
      ownedRunsCookieOptions(),
    );

    return response;
  } catch (err) {
    console.error("[diagnosis/submit] runRecommendation failed:", err);
    // 엔진 내부 메시지를 그대로 돌려주면 스키마와 테이블 구조가 밖으로 샌다.
    // 클라이언트는 이 문자열을 사용자에게 그대로 보여 주므로 한국어로 둔다.
    return NextResponse.json(
      { error: "추천을 만들지 못했습니다. 잠시 후 다시 시도해 주세요." },
      { status: 500 }
    );
  }
}
