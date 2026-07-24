export type StringOfferKey = `string:${string}`;

export type StringMaterialType =
  | "polyester"
  | "multifilament"
  | "natural_gut"
  | "synthetic_gut";

export type StringEditorialTag =
  | "balanced"
  | "beginner-friendly"
  | "comfort"
  | "control"
  | "durability"
  | "fast-swing"
  | "hybrid"
  | "power"
  | "soft-poly"
  | "spin";

export type OfficialStringTrait = {
  text: string;
  evidence: "fact" | "manufacturer_claim";
};

export type StringProduct = {
  offerKey: StringOfferKey;
  brand: string;
  name: string;
  material: string;
  materialType: StringMaterialType;
  gaugeMm: number;
  officialTraits: OfficialStringTrait[];
  editorialTags: StringEditorialTag[];
  startTensionLbs: {
    min: number;
    max: number;
    evidence: "editorial";
    rationale: string;
    sourceUrl: `https://${string}`;
  };
  sourceUrl: `https://${string}`;
  verifiedAt: `${number}-${number}-${number}`;
};

const claim = (text: string): OfficialStringTrait => ({
  text,
  evidence: "manufacturer_claim",
});

export const STRING_TENSION_METHODOLOGY = {
  evidence: "editorial",
  sourceUrl:
    "https://www.wilson.com/en-gb/blog/tennis/what-string-tension-should-i-use-my-tennis-racket",
  summary:
    "Wilson 일반 가이드의 폴리에스터 44–54 lbs, 나일론·거트 50–60 lbs 범위 안에서 제품별 소재와 공식 포지셔닝에 따라 좁힌 편집 시작 구간입니다. 제품 제조사가 지정한 장력이 아니며 라켓에 표시된 허용 범위를 우선합니다.",
} as const;

function editorialTension(min: number, max: number) {
  return {
    min,
    max,
    evidence: "editorial" as const,
    rationale:
      "소재별 일반 범위 안에서 제품의 공식 포지셔닝을 반영해 좁힌 비교용 시작 구간",
    sourceUrl: STRING_TENSION_METHODOLOGY.sourceUrl,
  };
}

export const stringProducts: StringProduct[] = [
  {
    offerKey: "string:luxilon-alu-power-125",
    brand: "Luxilon",
    name: "ALU POWER 125",
    material: "PEE + aluminum polyester monofilament",
    materialType: "polyester",
    gaugeMm: 1.25,
    officialTraits: [claim("파워"), claim("스피드")],
    editorialTags: ["power", "fast-swing"],
    startTensionLbs: editorialTension(44, 49),
    sourceUrl: "https://jp.wilson.com/products/tennis-strings-bb-alu-power-125-string-silver",
    verifiedAt: "2026-07-24",
  },
  {
    offerKey: "string:luxilon-4g-125",
    brand: "Luxilon",
    name: "4G 125",
    material: "Co-polyester monofilament",
    materialType: "polyester",
    gaugeMm: 1.25,
    officialTraits: [claim("컨트롤"), claim("장력 유지"), claim("내구성")],
    editorialTags: ["control", "durability"],
    startTensionLbs: editorialTension(44, 48),
    sourceUrl: "https://sg.wilson.com/products/wilson-luxilon-4g-1.25-tennis-string-set-12.2m-gold-co-poly-control-tension-maintenance-wrz997110",
    verifiedAt: "2026-07-24",
  },
  {
    offerKey: "string:luxilon-element-125",
    brand: "Luxilon",
    name: "ELEMENT 125",
    material: "Polyester/composite monofilament",
    materialType: "polyester",
    gaugeMm: 1.25,
    officialTraits: [claim("부드러운 타구감"), claim("터치"), claim("파워")],
    editorialTags: ["comfort", "power", "soft-poly"],
    startTensionLbs: editorialTension(46, 50),
    sourceUrl: "https://jp.wilson.com/products/tennis-strings-element-125-set",
    verifiedAt: "2026-07-24",
  },
  {
    offerKey: "string:wilson-nxt-16",
    brand: "Wilson",
    name: "NXT 16",
    material: "Nylon/PU multifilament",
    materialType: "multifilament",
    gaugeMm: 1.3,
    officialTraits: [
      claim("편안함"),
      claim("파워"),
      claim("장력 유지"),
      claim("충격 감소"),
    ],
    editorialTags: ["beginner-friendly", "comfort", "power"],
    startTensionLbs: editorialTension(52, 55),
    sourceUrl: "https://au.wilson.com/products/nxt-16-tennis-string-reel",
    verifiedAt: "2026-07-24",
  },
  {
    offerKey: "string:wilson-sensation-16",
    brand: "Wilson",
    name: "Sensation 16",
    material: "Nylon multifilament",
    materialType: "multifilament",
    gaugeMm: 1.3,
    officialTraits: [claim("편안함"), claim("파워"), claim("진동 완화")],
    editorialTags: ["beginner-friendly", "comfort", "power"],
    startTensionLbs: editorialTension(52, 55),
    sourceUrl: "https://au.wilson.com/products/sensation-16-tennis-string-reel",
    verifiedAt: "2026-07-24",
  },
  {
    offerKey: "string:wilson-natural-gut-16",
    brand: "Wilson",
    name: "Natural Gut 16",
    material: "Natural gut",
    materialType: "natural_gut",
    gaugeMm: 1.3,
    officialTraits: [
      claim("편안함"),
      claim("타구감"),
      claim("파워"),
      claim("컨트롤"),
      claim("장력 유지"),
    ],
    editorialTags: ["balanced", "comfort", "control", "power"],
    startTensionLbs: editorialTension(52, 56),
    sourceUrl: "https://au.wilson.com/products/natural-gut-16-tennis-string-set",
    verifiedAt: "2026-07-24",
  },
  {
    offerKey: "string:wilson-synthetic-gut-power-16",
    brand: "Wilson",
    name: "Synthetic Gut Power 16",
    material: "Nylon solid-core synthetic gut",
    materialType: "synthetic_gut",
    gaugeMm: 1.3,
    officialTraits: [
      claim("파워"),
      claim("선명한 타구감"),
      claim("컨트롤"),
      claim("팔 친화적"),
    ],
    editorialTags: ["balanced", "beginner-friendly", "comfort", "control", "power"],
    startTensionLbs: editorialTension(50, 55),
    sourceUrl: "https://au.wilson.com/products/synthetic-gut-power-16-tennis-string-reel",
    verifiedAt: "2026-07-24",
  },
  {
    offerKey: "string:babolat-rpm-blast-12m",
    brand: "Babolat",
    name: "RPM Blast 12M",
    material: "Co-polyester monofilament",
    materialType: "polyester",
    gaugeMm: 1.25,
    officialTraits: [claim("스핀"), claim("내구성"), claim("컨트롤")],
    editorialTags: ["control", "durability", "spin"],
    startTensionLbs: editorialTension(44, 49),
    sourceUrl: "https://www.babolat.com/us/rpm-blast-12m/105-241101.html",
    verifiedAt: "2026-07-24",
  },
  {
    offerKey: "string:babolat-touch-vs-12m",
    brand: "Babolat",
    name: "Touch VS 12M",
    material: "Natural gut",
    materialType: "natural_gut",
    gaugeMm: 1.3,
    officialTraits: [
      claim("타구감"),
      claim("탄성 파워"),
      claim("편안함"),
      claim("장력 유지"),
    ],
    editorialTags: ["balanced", "comfort", "power"],
    startTensionLbs: editorialTension(52, 56),
    sourceUrl: "https://www.babolat.com/us/touch-vs-12m/128-201031.html",
    verifiedAt: "2026-07-24",
  },
  {
    offerKey: "string:yonex-polytour-pro",
    brand: "Yonex",
    name: "POLYTOUR PRO 125 - SET",
    material: "Polyester monofilament",
    materialType: "polyester",
    gaugeMm: 1.25,
    officialTraits: [
      claim("부드러운 올라운드 성향"),
      claim("편안함"),
      claim("파워"),
      claim("내구성"),
      claim("컨트롤"),
    ],
    editorialTags: ["balanced", "comfort", "control", "durability", "power", "soft-poly"],
    startTensionLbs: editorialTension(46, 50),
    sourceUrl: "https://us.yonex.com/products/polytour-pro-125-set",
    verifiedAt: "2026-07-24",
  },
  {
    offerKey: "string:yonex-polytour-rev-125",
    brand: "Yonex",
    name: "POLYTOUR REV 125 - SET",
    material: "Octagonal polyester monofilament",
    materialType: "polyester",
    gaugeMm: 1.25,
    officialTraits: [claim("스핀"), claim("볼 바이트"), claim("컨트롤"), claim("정밀성")],
    editorialTags: ["control", "spin"],
    startTensionLbs: editorialTension(44, 49),
    sourceUrl: "https://us.yonex.com/products/polytour-rev-125-set",
    verifiedAt: "2026-07-24",
  },
  {
    offerKey: "string:yonex-polytour-strike-125",
    brand: "Yonex",
    name: "POLYTOUR STRIKE 125 - SET",
    material: "Polyester monofilament",
    materialType: "polyester",
    gaugeMm: 1.25,
    officialTraits: [claim("파워"), claim("정밀성"), claim("장력 유지")],
    editorialTags: ["control", "durability", "power"],
    startTensionLbs: editorialTension(44, 49),
    sourceUrl: "https://us.yonex.com/products/polytour-strike-125-set",
    verifiedAt: "2026-07-24",
  },
  {
    offerKey: "string:yonex-rexis-comfort-130",
    brand: "Yonex",
    name: "REXIS COMFORT 130 - REEL",
    material: "Nylon multifilament with FORTIMO",
    materialType: "multifilament",
    gaugeMm: 1.3,
    officialTraits: [claim("편안함"), claim("볼 포켓팅"), claim("내구성"), claim("컨트롤")],
    editorialTags: ["balanced", "comfort", "control", "durability"],
    startTensionLbs: editorialTension(50, 55),
    sourceUrl: "https://us.yonex.com/products/rexis-comfort-130-reel",
    verifiedAt: "2026-07-24",
  },
  {
    offerKey: "string:head-lynx-tour-125",
    brand: "HEAD",
    name: "Lynx Tour",
    material: "Six-edge co-polyester monofilament",
    materialType: "polyester",
    gaugeMm: 1.25,
    officialTraits: [claim("컨트롤"), claim("스핀")],
    editorialTags: ["control", "spin"],
    startTensionLbs: editorialTension(44, 49),
    sourceUrl: "https://www.head.com/en_US/product/lynx-tour-4",
    verifiedAt: "2026-07-24",
  },
  {
    offerKey: "string:head-hawk-touch-125",
    brand: "HEAD",
    name: "Hawk Touch",
    material: "Round monofilament",
    materialType: "polyester",
    gaugeMm: 1.25,
    officialTraits: [claim("터치"), claim("컨트롤"), claim("내구성"), claim("빠른 스윙용 포지셔닝")],
    editorialTags: ["control", "durability", "fast-swing"],
    startTensionLbs: editorialTension(44, 49),
    sourceUrl: "https://www.head.com/en_CA/product/hawk-touch-3",
    verifiedAt: "2026-07-24",
  },
  {
    offerKey: "string:head-velocity-mlt-130",
    brand: "HEAD",
    name: "Velocity MLT",
    material: "Round multifilament",
    materialType: "multifilament",
    gaugeMm: 1.3,
    officialTraits: [claim("파워"), claim("편안함"), claim("클럽 플레이어용 포지셔닝")],
    editorialTags: ["beginner-friendly", "comfort", "power"],
    startTensionLbs: editorialTension(50, 55),
    sourceUrl: "https://www.head.com/en_US/product/velocity-mlt-4",
    verifiedAt: "2026-07-24",
  },
  {
    offerKey: "string:tecnifibre-x-one-biphase-12m",
    brand: "Tecnifibre",
    name: "X-ONE BIPHASE - 12M SET",
    material: "Polyamide/PU multifilament",
    materialType: "multifilament",
    gaugeMm: 1.3,
    officialTraits: [claim("파워"), claim("컨트롤"), claim("편안함"), claim("성능 유지")],
    editorialTags: ["balanced", "comfort", "control", "power"],
    startTensionLbs: editorialTension(50, 55),
    sourceUrl: "https://b2b.tecnifibre.com/en/p/01GXO130XR.html",
    verifiedAt: "2026-07-24",
  },
  {
    offerKey: "string:tecnifibre-nrg2-132",
    brand: "Tecnifibre",
    name: "NRG² NATURAL SET",
    material: "Elastyl/PU multifilament",
    materialType: "multifilament",
    gaugeMm: 1.32,
    officialTraits: [claim("파워"), claim("편안함"), claim("강도")],
    editorialTags: ["comfort", "durability", "power"],
    startTensionLbs: editorialTension(50, 55),
    sourceUrl: "https://www.tecnifibre.com/en/products/garniture-nrg2-naturel",
    verifiedAt: "2026-07-24",
  },
  {
    offerKey: "string:tecnifibre-razor-soft-125",
    brand: "Tecnifibre",
    name: "RAZOR SOFT - 12M SET",
    material: "Co-polyester/PU monofilament",
    materialType: "polyester",
    gaugeMm: 1.25,
    officialTraits: [
      claim("정밀성"),
      claim("편안함"),
      claim("내구성"),
      claim("300g 초과 라켓용 포지셔닝"),
    ],
    editorialTags: ["comfort", "control", "durability", "soft-poly"],
    startTensionLbs: editorialTension(49, 52),
    sourceUrl: "https://b2b.tecnifibre.com/en/p/04GRAS120L.html",
    verifiedAt: "2026-07-24",
  },
  {
    offerKey: "string:tecnifibre-black-code-124",
    brand: "Tecnifibre",
    name: "BLACK CODE - 12M SET",
    material: "Pentagonal co-polyester monofilament",
    materialType: "polyester",
    gaugeMm: 1.24,
    officialTraits: [
      claim("스핀"),
      claim("유연성"),
      claim("컨트롤"),
      claim("내구성"),
    ],
    editorialTags: ["control", "durability", "spin"],
    startTensionLbs: editorialTension(49, 52),
    sourceUrl: "https://www.tecnifibre.com/en/products/garniture-black-code",
    verifiedAt: "2026-07-24",
  },
  {
    offerKey: "string:solinco-hyper-g-125",
    brand: "Solinco",
    name: "Hyper-G",
    material: "Shaped co-polyester",
    materialType: "polyester",
    gaugeMm: 1.25,
    officialTraits: [claim("스핀"), claim("파워"), claim("컨트롤"), claim("장력 유지")],
    editorialTags: ["control", "durability", "power", "spin"],
    startTensionLbs: editorialTension(44, 49),
    sourceUrl: "https://solincosports.com/equipment/hyper-g/",
    verifiedAt: "2026-07-24",
  },
  {
    offerKey: "string:solinco-confidential-125",
    brand: "Solinco",
    name: "Confidential",
    material: "Shaped co-polyester monofilament",
    materialType: "polyester",
    gaugeMm: 1.25,
    officialTraits: [
      claim("파워"),
      claim("컨트롤"),
      claim("스핀"),
      claim("타구감과 편안함"),
      claim("장력 유지"),
    ],
    editorialTags: ["balanced", "comfort", "control", "durability", "power", "spin"],
    startTensionLbs: editorialTension(44, 49),
    sourceUrl: "https://solincosports.com/equipment/confidential/",
    verifiedAt: "2026-07-24",
  },
  {
    offerKey: "string:solinco-tour-bite-125",
    brand: "Solinco",
    name: "Tour Bite",
    material: "Shaped co-polyester monofilament",
    materialType: "polyester",
    gaugeMm: 1.25,
    officialTraits: [claim("파워"), claim("스핀과 볼 바이트"), claim("내구성"), claim("스핀 컨트롤")],
    editorialTags: ["control", "durability", "power", "spin"],
    startTensionLbs: editorialTension(44, 48),
    sourceUrl: "https://solincosports.com/equipment/tour-bite/",
    verifiedAt: "2026-07-24",
  },
  {
    offerKey: "string:solinco-vanquish-130",
    brand: "Solinco",
    name: "Vanquish",
    material: "Polyamide multifilament",
    materialType: "multifilament",
    gaugeMm: 1.3,
    officialTraits: [
      claim("팔 친화적"),
      claim("터치"),
      claim("컨트롤"),
      claim("편안함"),
      claim("하이브리드 호환"),
    ],
    editorialTags: ["beginner-friendly", "comfort", "control", "hybrid"],
    startTensionLbs: editorialTension(50, 55),
    sourceUrl: "https://solincosports.com/equipment/vanquish/",
    verifiedAt: "2026-07-24",
  },
];

export const STRING_OFFER_KEYS = stringProducts.map((product) => product.offerKey);

const productsByOfferKey = new Map(
  stringProducts.map((product) => [product.offerKey, product]),
);

export function getStringProduct(offerKey: StringOfferKey): StringProduct {
  const product = productsByOfferKey.get(offerKey);
  if (!product) throw new Error(`Unknown string product: ${offerKey}`);
  return product;
}

export function stringOfferId(offerKey: StringOfferKey): string {
  return offerKey.replace(/[^a-z0-9_-]+/gi, "-");
}

export function isStringOfferKey(value: string): value is StringOfferKey {
  return productsByOfferKey.has(value as StringOfferKey);
}
