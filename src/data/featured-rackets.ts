import type { Scores } from "@/components/radar-chart";
import type { RacketCatalogIdentity, RacketListItem } from "@/lib/queries";
import { formatPublicScore } from "@/lib/score-display";

type ScoreAxis = keyof Scores;

export type FeaturedRacketTag = {
  icon: string;
  label: string;
  value: string;
};

export type FeaturedRacket = {
  brand: string;
  model: string;
  tagline: string;
  scoreAxes: { icon: string; axis: ScoreAxis }[];
  fallbackTags: FeaturedRacketTag[];
  imageUrl: string;
  imageSourceUrl: string;
  specSourceUrl: string;
  verifiedAt: string;
  slug: string;
  scores: Scores | null;
  weight: string | null;
  headSize: string | null;
  pattern: string | null;
};

type FeaturedRacketTemplate = Omit<
  FeaturedRacket,
  "scores" | "weight" | "headSize" | "pattern"
>;

const scoreLabels: Record<ScoreAxis, string> = {
  power: "파워",
  control: "컨트롤",
  spin: "스핀",
  comfort: "편안함",
  stability: "안정성",
};

export const featuredRacketCatalogIdentities = [
  {
    brand: "Babolat",
    model: "Pure Aero 2026",
    year: 2026,
    slug: "babolat-pure-aero-2026",
  },
  {
    brand: "Head",
    model: "Speed MP 2026",
    year: 2026,
    slug: "head-speed-mp-2026",
  },
  {
    brand: "Yonex",
    model: "VCORE 100 2026",
    year: 2026,
    slug: "yonex-vcore-100-2026",
  },
] as const satisfies readonly RacketCatalogIdentity[];

const featuredRacketTemplates: FeaturedRacketTemplate[] = [
  {
    brand: "Babolat",
    model: "PURE AERO GEN 9",
    tagline: "공기를 가르는 새로운 에어로 프레임",
    scoreAxes: [
      { icon: "◎", axis: "spin" },
      { icon: "⚡", axis: "power" },
    ],
    fallbackTags: [
      { icon: "◎", label: "성향", value: "스핀 지향" },
      { icon: "⚡", label: "플레이", value: "공격형" },
      { icon: "◇", label: "정보", value: "공식 자료" },
    ],
    imageUrl: "/images/rackets/babolat-pure-aero-2026.png",
    imageSourceUrl: "https://www.tennis-warehouse.com/Babolat_Pure_Aero_2026/descpageRCBAB-BPAR26.html",
    specSourceUrl: "https://www.babolat.com/us/pure-aero-gen9-unstrung/101569.html",
    verifiedAt: "2026-07-21",
    slug: "babolat-pure-aero-2026",
  },
  {
    brand: "Head",
    model: "SPEED MP 2026",
    tagline: "시너 × 조코비치가 선택한 균형의 정점",
    scoreAxes: [
      { icon: "⊕", axis: "stability" },
      { icon: "◎", axis: "control" },
    ],
    fallbackTags: [
      { icon: "⊕", label: "성향", value: "균형형" },
      { icon: "▸", label: "플레이", value: "스피드 지향" },
      { icon: "◎", label: "정보", value: "공식 자료" },
    ],
    imageUrl: "/images/rackets/head-speed-mp-2026.png",
    imageSourceUrl: "https://www.tennis-warehouse.com/Head_Speed_MP_2026/descpageRCHEAD-HSPMP6.html",
    specSourceUrl: "https://www.head.com/en_US/product/speed-mp-2026-232026",
    verifiedAt: "2026-07-21",
    slug: "head-speed-mp-2026",
  },
  {
    brand: "Yonex",
    model: "VCORE 100 2026",
    tagline: "파워와 스핀, 그 사이의 최적점",
    scoreAxes: [
      { icon: "⬡", axis: "power" },
      { icon: "◎", axis: "spin" },
    ],
    fallbackTags: [
      { icon: "⬡", label: "성향", value: "파워 지향" },
      { icon: "◎", label: "플레이", value: "스핀 지향" },
      { icon: "◇", label: "정보", value: "공식 자료" },
    ],
    imageUrl: "/images/rackets/yonex-vcore-100-2026.png",
    imageSourceUrl: "https://www.tennis-warehouse.com/Yonex_VCORE_100_8th_Gen/descpageRCYONEX-VC108G.html",
    specSourceUrl: "https://www.yonex.com/tennis/racquets/vcore",
    verifiedAt: "2026-07-21",
    slug: "yonex-vcore-100-2026",
  },
];

export function hydrateFeaturedRackets(catalog: RacketListItem[]): FeaturedRacket[] {
  const catalogBySlug = new Map(catalog.map((racket) => [racket.slug, racket]));

  return featuredRacketTemplates.map((template) => {
    const canonical = catalogBySlug.get(template.slug);
    return {
      ...template,
      scores: canonical?.scores ? { ...canonical.scores } : null,
      weight: canonical?.weight ?? null,
      headSize: canonical?.headSize ?? null,
      pattern: canonical?.pattern ?? null,
    };
  });
}

export function featuredRacketTags(racket: FeaturedRacket): FeaturedRacketTag[] {
  if (!racket.scores) return racket.fallbackTags;

  return [
    ...racket.scoreAxes.map(({ icon, axis }) => ({
      icon,
      label: scoreLabels[axis],
      value: formatPublicScore(racket.scores![axis]),
    })),
    { icon: "◇", label: "데이터", value: "카탈로그 연동" },
  ];
}

export function featuredRacketSpecs(racket: FeaturedRacket): string[] {
  const specs = [racket.weight, racket.headSize, racket.pattern].filter(
    (value): value is string => Boolean(value),
  );
  return specs.length > 0 ? specs : ["공식 스펙 링크에서 확인"];
}

export const featuredRackets = hydrateFeaturedRackets([]);
