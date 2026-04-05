import { NextResponse } from "next/server";
import { asc } from "drizzle-orm";
import { db } from "@/db";
import { diagnosisQuestions } from "@/db/schema";

const TOTAL_STEPS = 6;
const ESTIMATED_MINUTES = 3;

export async function GET() {
  const rows = await db
    .select()
    .from(diagnosisQuestions)
    .orderBy(asc(diagnosisQuestions.sortOrder));

  const questions = rows.map((q) => ({
    stepNumber: q.stepNumber,
    questionKey: q.questionKey,
    questionTextKo: q.questionTextKo,
    questionTextEn: q.questionTextEn ?? undefined,
    inputType: q.inputType,
    options: q.options ?? undefined,
    axisWeightMapping: q.axisWeightMapping ?? undefined,
    required: true,
  }));

  return NextResponse.json({
    questions,
    totalSteps: TOTAL_STEPS,
    estimatedMinutes: ESTIMATED_MINUTES,
  });
}
