/**
 * Explanation Templates v1
 *
 * Rules-first, template-driven explanation fragments for recommendations.
 * Each fragment connects a diagnosis answer to a racket characteristic.
 * No LLM-generated prose — every output is traceable to a template rule.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ExplanationFragment {
  type: "positive" | "tradeoff";
  textKo: string;
}

export interface DiagnosisAnswers {
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

// ---------------------------------------------------------------------------
// Korean labels
// ---------------------------------------------------------------------------

export const AXIS_LABELS_KO: Record<string, string> = {
  power: "파워",
  control: "컨트롤",
  spin: "스핀",
  comfort: "편안함",
  stability: "안정성",
};

const PAIN_POINT_FRAGMENTS: Record<string, {
  axisKey: string;
  threshold: number;
  textKo: string;
}> = {
  elbow_pain: {
    axisKey: "comfort",
    threshold: 45,
    textKo: "상대적으로 낮은 강성의 비교 후보입니다. 통증이 지속되면 의료 전문가와 전문점 상담이 우선입니다",
  },
  wrist_pain: {
    axisKey: "comfort",
    threshold: 45,
    textKo: "조작 부담을 비교하기 위한 후보입니다. 손목 증상은 의료 전문가와 전문점에 먼저 상담하세요",
  },
  short_shots: {
    axisKey: "control",
    threshold: 50,
    textKo: "짧은 샷 컨트롤에 유리한 설계입니다",
  },
  inconsistent_serve: {
    axisKey: "control",
    threshold: 45,
    textKo: "서브 일관성 향상에 기여합니다",
  },
  heavy_racket: {
    axisKey: "comfort",
    threshold: 50,
    textKo: "가벼운 취급감으로 피로감을 줄여줍니다",
  },
};

const ANTI_REC_BY_TIER: Record<string, string> = {
  best_fit: "파워/스핀 극대화가 최우선이면 도전적 선택 참고",
  safe_alternative: "더 높은 컨트롤과 편안함을 원한다면 최적 선택 참고",
  adventurous_choice: "안정적인 선택을 원한다면 최적 선택 또는 무난한 선택을 참고",
};

// ---------------------------------------------------------------------------
// Template rules
// ---------------------------------------------------------------------------

/**
 * Rule 1: First-priority axis match.
 * IF user's first priority axis AND racket score > 80 on that axis
 * THEN positive fragment about that axis.
 */
function firstPriorityRule(
  axisScores: Record<string, number>,
  answers: DiagnosisAnswers
): ExplanationFragment | null {
  const first = answers.priority_tradeoffs?.first;
  if (!first || (axisScores[first] ?? 0) <= 55) return null;
  const label = AXIS_LABELS_KO[first] ?? first;
  return {
    type: "positive",
    textKo: `당신이 원한 ${label} 향상에 가장 적합한 밸런스`,
  };
}

/**
 * Rule 2: Second-priority axis support.
 * IF user's second priority AND racket score > 70 on that axis
 * THEN positive fragment.
 */
function secondPriorityRule(
  axisScores: Record<string, number>,
  answers: DiagnosisAnswers
): ExplanationFragment | null {
  const second = answers.priority_tradeoffs?.second;
  if (!second || (axisScores[second] ?? 0) <= 45) return null;
  const label = AXIS_LABELS_KO[second] ?? second;
  return {
    type: "positive",
    textKo: `${label}도 균형 있게 갖추고 있습니다`,
  };
}

/**
 * Rule 3: Swing speed alignment.
 * IF user's swing speed is known AND racket stability/power matches
 * THEN positive fragment about swing speed fit.
 */
function swingSpeedRule(
  axisScores: Record<string, number>,
  answers: DiagnosisAnswers
): ExplanationFragment | null {
  const swingSpeed = answers.swing_style?.swingSpeed;
  if (swingSpeed == null) return null;

  if (swingSpeed >= 0.7 && (axisScores.stability ?? 0) >= 70) {
    return {
      type: "positive",
      textKo: "스윙 스피드에 맞는 적절한 무게와 안정성",
    };
  }
  if (swingSpeed < 0.4 && (axisScores.comfort ?? 0) >= 70) {
    return {
      type: "positive",
      textKo: "느린 스윙에서도 편안한 타구감을 제공합니다",
    };
  }
  return null;
}

/**
 * Rule 4: Pain point resolution.
 * IF user reported pain points AND racket meets axis threshold
 * THEN positive fragment per resolved pain point.
 */
function painPointRules(
  axisScores: Record<string, number>,
  answers: DiagnosisAnswers
): ExplanationFragment[] {
  const painPoints = answers.pain_points ?? [];
  const fragments: ExplanationFragment[] = [];

  for (const pain of painPoints) {
    const mapping = PAIN_POINT_FRAGMENTS[pain];
    if (mapping && (axisScores[mapping.axisKey] ?? 0) >= mapping.threshold) {
      fragments.push({ type: "positive", textKo: mapping.textKo });
    }
  }

  return fragments;
}

/**
 * Rule 5: Delta tradeoff warnings.
 * IF current racket is known AND recommended racket scores lower on an axis by >= 3
 * THEN tradeoff fragment for that axis.
 */
function deltaTradeoffRules(
  axisScores: Record<string, number>,
  currentAxes: Record<string, number> | null
): ExplanationFragment[] {
  if (!currentAxes) return [];
  const fragments: ExplanationFragment[] = [];

  for (const [axisKey, score] of Object.entries(axisScores)) {
    const currentScore = currentAxes[axisKey] ?? 0;
    if (score - currentScore < -3) {
      const label = AXIS_LABELS_KO[axisKey] ?? axisKey;
      fragments.push({
        type: "tradeoff",
        textKo: `순수 ${label}는 현재 라켓보다 약간 감소할 수 있음`,
      });
    }
  }

  return fragments;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Generate all explanation fragments for a recommendation.
 * Each fragment is traceable to a specific template rule and diagnosis answer.
 */
export function generateExplanationFragments(
  axisScores: Record<string, number>,
  answers: DiagnosisAnswers,
  currentAxes: Record<string, number> | null
): ExplanationFragment[] {
  const fragments: ExplanationFragment[] = [];

  const f1 = firstPriorityRule(axisScores, answers);
  if (f1) fragments.push(f1);

  const f2 = secondPriorityRule(axisScores, answers);
  if (f2) fragments.push(f2);

  const f3 = swingSpeedRule(axisScores, answers);
  if (f3) fragments.push(f3);

  fragments.push(...painPointRules(axisScores, answers));
  fragments.push(...deltaTradeoffRules(axisScores, currentAxes));

  return fragments;
}

/**
 * Get the anti-recommendation text for a tier.
 */
export function getAntiRecommendation(tier: string): string {
  return ANTI_REC_BY_TIER[tier] ?? "";
}

/**
 * Compute confidence level from answer count and spec source count.
 */
export function computeConfidence(
  answersCount: number,
  specSourceCount: number
): { level: "high" | "medium" | "low"; labelKo: string; reasonKo: string } {
  if (answersCount >= 6 && specSourceCount >= 3) {
    return {
      level: "high",
      labelKo: "높음",
      reasonKo: "진단 답변과 데이터 커버리지 모두 충분합니다",
    };
  }
  if (answersCount >= 5 && specSourceCount >= 1) {
    return {
      level: "medium",
      labelKo: "보통",
      reasonKo: "대부분의 진단 답변과 스펙이 확인되었습니다",
    };
  }
  return {
    level: "low",
    labelKo: "낮음",
    reasonKo: "일부 답변 또는 스펙 데이터가 부족합니다",
  };
}
