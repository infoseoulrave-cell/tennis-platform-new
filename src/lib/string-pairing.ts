import {
  stringProducts,
  type StringEditorialTag,
  type StringOfferKey,
  type StringProduct,
} from "@/data/strings";
import type { RawAxisScores100 } from "@/lib/score-display";

export type StringPairingMode = "comfort" | "balanced" | "spin-control";

export type StringPairingInput = {
  stiffnessRa?: number | null;
  weightG?: number | null;
  headSizeSqIn?: number | null;
  stringPattern?: string | null;
  segment?: string | null;
  rawScores?: Partial<RawAxisScores100> | null;
  beginner?: boolean;
  armSensitive?: boolean;
};

export type StringPairingRecommendation = {
  mode: StringPairingMode;
  modeLabel: string;
  product: StringProduct;
  reason: string;
  tradeoff: string;
  tensionLbs: {
    min: number;
    max: number;
  };
};

type PairingSignals = {
  stiffnessRa: number | null;
  weightG: number | null;
  headSizeSqIn: number | null;
  pattern: string | null;
  openPattern: boolean;
  densePattern: boolean;
  highStiffness: boolean;
  heavy: boolean;
  largeHead: boolean;
  smallHead: boolean;
  lowComfort: boolean;
  lowPower: boolean;
  highPower: boolean;
  highControl: boolean;
  highSpin: boolean;
  highStability: boolean;
  beginner: boolean;
  armSensitive: boolean;
  safetyGate: boolean;
};

const MODE_LABELS: Record<StringPairingMode, string> = {
  comfort: "편안함 우선",
  balanced: "균형형",
  "spin-control": "스핀·컨트롤",
};

const MODE_PRIORITIES: Record<StringPairingMode, readonly StringOfferKey[]> = {
  comfort: [
    "string:tecnifibre-x-one-biphase-12m",
    "string:wilson-nxt-16",
    "string:yonex-rexis-comfort-130",
    "string:head-velocity-mlt-130",
    "string:tecnifibre-nrg2-132",
    "string:wilson-sensation-16",
    "string:solinco-vanquish-130",
    "string:wilson-natural-gut-16",
    "string:babolat-touch-vs-12m",
  ],
  balanced: [
    "string:yonex-polytour-pro",
    "string:wilson-synthetic-gut-power-16",
    "string:wilson-natural-gut-16",
    "string:tecnifibre-x-one-biphase-12m",
    "string:yonex-rexis-comfort-130",
    "string:solinco-confidential-125",
    "string:luxilon-element-125",
  ],
  "spin-control": [
    "string:babolat-rpm-blast-12m",
    "string:solinco-hyper-g-125",
    "string:yonex-polytour-rev-125",
    "string:head-lynx-tour-125",
    "string:solinco-tour-bite-125",
    "string:tecnifibre-black-code-124",
    "string:solinco-confidential-125",
    "string:tecnifibre-razor-soft-125",
  ],
};

const DENSE_CONTROL_PRIORITIES: readonly StringOfferKey[] = [
  "string:yonex-polytour-strike-125",
  "string:luxilon-4g-125",
  "string:head-hawk-touch-125",
  "string:tecnifibre-razor-soft-125",
  "string:solinco-confidential-125",
];

function finite(value: number | null | undefined): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function axisScore(
  scores: Partial<RawAxisScores100> | null | undefined,
  axis: keyof RawAxisScores100,
): number | null {
  return finite(scores?.[axis]);
}

function patternDensity(pattern: string | null | undefined): {
  open: boolean;
  dense: boolean;
} {
  const match = pattern?.match(/(\d{1,2})\s*[x×]\s*(\d{1,2})/i);
  if (!match) return { open: false, dense: false };
  const mains = Number(match[1]);
  const crosses = Number(match[2]);
  return {
    open: mains <= 16 && crosses <= 19,
    dense: mains >= 18 || crosses >= 20,
  };
}

function pairingSignals(input: StringPairingInput): PairingSignals {
  const stiffnessRa = finite(input.stiffnessRa);
  const weightG = finite(input.weightG);
  const headSizeSqIn = finite(input.headSizeSqIn);
  const comfort = axisScore(input.rawScores, "comfort");
  const power = axisScore(input.rawScores, "power");
  const control = axisScore(input.rawScores, "control");
  const spin = axisScore(input.rawScores, "spin");
  const stability = axisScore(input.rawScores, "stability");
  const density = patternDensity(input.stringPattern);
  const beginner = input.beginner === true || input.segment === "beginner";
  const armSensitive = input.armSensitive === true;
  const highStiffness = stiffnessRa !== null && stiffnessRa >= 67;
  const lowComfort = comfort !== null && comfort <= 45;

  return {
    stiffnessRa,
    weightG,
    headSizeSqIn,
    pattern: input.stringPattern?.trim() || null,
    openPattern: density.open,
    densePattern: density.dense,
    highStiffness,
    heavy: weightG !== null && weightG >= 305,
    largeHead: headSizeSqIn !== null && headSizeSqIn >= 102,
    smallHead: headSizeSqIn !== null && headSizeSqIn <= 98,
    lowComfort,
    lowPower: power !== null && power <= 45,
    highPower: power !== null && power >= 70,
    highControl: control !== null && control >= 70,
    highSpin: spin !== null && spin >= 70,
    highStability: stability !== null && stability >= 70,
    beginner,
    armSensitive,
    safetyGate: highStiffness || lowComfort || beginner || armSensitive,
  };
}

export function requiresComfortSafetyGate(input: StringPairingInput): boolean {
  return pairingSignals(input).safetyGate;
}

export function isSafetyCompatibleString(product: StringProduct): boolean {
  return product.materialType !== "polyester";
}

function isCompatibleWithSignals(
  product: StringProduct,
  signals: PairingSignals,
): boolean {
  return !signals.safetyGate || isSafetyCompatibleString(product);
}

function hasTag(product: StringProduct, tag: StringEditorialTag): boolean {
  return product.editorialTags.includes(tag);
}

function priorityScore(
  product: StringProduct,
  mode: StringPairingMode,
  signals: PairingSignals,
): number {
  const priorities = mode === "spin-control" && signals.densePattern
    ? DENSE_CONTROL_PRIORITIES
    : MODE_PRIORITIES[mode];
  const position = priorities.indexOf(product.offerKey);
  return position === -1 ? 0 : Math.max(2, 28 - position * 3);
}

function modeScore(
  product: StringProduct,
  mode: StringPairingMode,
  signals: PairingSignals,
): number {
  let score = priorityScore(product, mode, signals);

  if (mode === "comfort") {
    if (hasTag(product, "comfort")) score += 55;
    if (hasTag(product, "beginner-friendly")) score += signals.beginner ? 24 : 8;
    if (hasTag(product, "power") && (signals.lowPower || signals.densePattern || signals.smallHead)) {
      score += 22;
    }
    if (hasTag(product, "control") && (signals.largeHead || signals.highPower)) {
      score += 8;
    }
  }

  if (mode === "balanced") {
    if (hasTag(product, "balanced")) score += 45;
    if (hasTag(product, "power")) score += signals.lowPower ? 30 : 9;
    if (hasTag(product, "control")) score += signals.highControl || signals.highPower ? 18 : 9;
    if (hasTag(product, "comfort")) score += 8;
    if (hasTag(product, "durability") && (signals.heavy || signals.highStability)) score += 9;
    if (hasTag(product, "spin") && signals.openPattern) score += 5;
  }

  if (mode === "spin-control") {
    if (hasTag(product, "spin")) {
      score += signals.densePattern
        ? 5
        : signals.openPattern || signals.highSpin
          ? 55
          : 24;
    }
    if (hasTag(product, "control")) {
      score += signals.densePattern || signals.highControl || signals.highPower ? 40 : 24;
    }
    if (hasTag(product, "power") && signals.lowPower) score += 18;
    if (hasTag(product, "durability") && (signals.heavy || signals.highStability)) score += 9;
  }

  if (signals.safetyGate) {
    if (product.materialType !== "polyester") score += 25;
  }

  return score;
}

function chooseProduct(
  mode: StringPairingMode,
  signals: PairingSignals,
  excluded: ReadonlySet<StringOfferKey>,
): StringProduct | null {
  const candidates = stringProducts
    .filter((product) => !excluded.has(product.offerKey))
    .filter((product) => isCompatibleWithSignals(product, signals))
    .filter((product) => {
      if (mode === "comfort") return hasTag(product, "comfort");
      if (mode === "spin-control") {
        return hasTag(product, "spin") || hasTag(product, "control");
      }
      return true;
    })
    .sort((left, right) => {
      const scoreDifference = modeScore(right, mode, signals)
        - modeScore(left, mode, signals);
      return scoreDifference !== 0
        ? scoreDifference
        : left.offerKey.localeCompare(right.offerKey);
    });

  return candidates[0] ?? null;
}

function roundedAxis(
  scores: Partial<RawAxisScores100> | null | undefined,
  axis: keyof RawAxisScores100,
): string | null {
  const value = axisScore(scores, axis);
  return value === null ? null : `${Math.round(value)}점`;
}

function groundedReason(
  mode: StringPairingMode,
  product: StringProduct,
  input: StringPairingInput,
  signals: PairingSignals,
): string {
  const specs = [
    signals.stiffnessRa === null ? null : `RA ${Math.round(signals.stiffnessRa)}`,
    signals.weightG === null ? null : `${Math.round(signals.weightG)}g`,
    signals.headSizeSqIn === null ? null : `${signals.headSizeSqIn}in²`,
    signals.pattern,
  ].filter((value): value is string => value !== null);

  const axes = mode === "comfort"
    ? [["편안함", roundedAxis(input.rawScores, "comfort")]]
    : mode === "balanced"
      ? [
          ["파워", roundedAxis(input.rawScores, "power")],
          ["안정성", roundedAxis(input.rawScores, "stability")],
        ]
      : [
          ["스핀", roundedAxis(input.rawScores, "spin")],
          ["컨트롤", roundedAxis(input.rawScores, "control")],
        ];
  const axisText = axes
    .filter((entry): entry is [string, string] => entry[1] !== null)
    .map(([label, value]) => `${label} ${value}`);
  const evidence = [...specs, ...axisText];
  const basis = evidence.length > 0 ? evidence.join(" · ") : "확인 가능한 라켓 스펙";

  if (mode === "comfort" && signals.safetyGate) {
    return `${basis}을 고려해 풀 폴리 기본값을 피하고 ${product.name}을 편안함 비교 후보로 골랐습니다.`;
  }
  if (mode === "spin-control" && signals.openPattern) {
    return `${basis}의 오픈 패턴 성향을 기준으로 ${product.name}의 스핀·컨트롤 조합을 비교합니다.`;
  }
  if (mode === "spin-control" && signals.densePattern) {
    return `${basis}의 촘촘한 패턴을 기준으로 ${product.name}의 컨트롤 성향을 비교합니다.`;
  }
  return `${basis}을 기준으로 ${product.name}을 ${MODE_LABELS[mode]} 시타 후보로 골랐습니다.`;
}

function productTradeoff(product: StringProduct): string {
  if (product.materialType === "polyester") {
    if (hasTag(product, "soft-poly")) {
      return "‘부드러운 폴리’는 제조사 성향 표현입니다. 멀티필라멘트와 같은 타구감을 보장하지 않으므로 편안함을 함께 확인하세요.";
    }
    return "폴리에스터 풀베드는 편안함을 함께 확인하고, 통증 이력이 있다면 전문점·의료 전문가 상담을 우선하세요.";
  }
  if (product.materialType === "natural_gut") {
    return "폴리에스터 후보와 비교할 때 타구감·스핀·관리 조건의 차이를 함께 확인하세요.";
  }
  return "폴리에스터 후보와 비교할 때 타구감·스핀·내구성 체감의 차이를 함께 확인하세요.";
}

export function recommendStringPairings(
  input: StringPairingInput,
): StringPairingRecommendation[] {
  const signals = pairingSignals(input);
  const hasRacketEvidence = [
    signals.stiffnessRa,
    signals.weightG,
    signals.headSizeSqIn,
    signals.pattern,
    input.segment?.trim() || null,
    ...([
      "power",
      "control",
      "spin",
      "comfort",
      "stability",
    ] as const).map((axis) => axisScore(input.rawScores, axis)),
  ].some((value) => value !== null);
  if (!hasRacketEvidence) return [];

  const excluded = new Set<StringOfferKey>();
  const modes: StringPairingMode[] = ["comfort", "balanced", "spin-control"];
  const recommendations: StringPairingRecommendation[] = [];

  for (const mode of modes) {
    const product = chooseProduct(mode, signals, excluded);
    if (!product) continue;
    excluded.add(product.offerKey);
    recommendations.push({
      mode,
      modeLabel: MODE_LABELS[mode],
      product,
      reason: groundedReason(mode, product, input, signals),
      tradeoff: productTradeoff(product),
      tensionLbs: {
        min: product.startTensionLbs.min,
        max: product.startTensionLbs.max,
      },
    });
  }

  return recommendations;
}
