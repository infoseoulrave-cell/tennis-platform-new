export type StringOfferKey = `string:${string}`;

export type StringProduct = {
  offerKey: StringOfferKey;
  brand: string;
  name: string;
  facts: string[];
  description: string;
  sourceUrl: `https://${string}`;
};

export const stringProducts: StringProduct[] = [
  {
    offerKey: "string:luxilon-alu-power-125",
    brand: "Luxilon",
    name: "ALU Power 125",
    facts: ["폴리에스터", "1.25 mm"],
    description: "제조사가 파워와 컨트롤의 조합을 특징으로 설명하는 폴리에스터 스트링입니다.",
    sourceUrl: "https://sg.wilson.com/products/luxilon-bb-alu-power-125-tennis-string-silver",
  },
  {
    offerKey: "string:babolat-rpm-blast-12m",
    brand: "Babolat",
    name: "RPM Blast 12M",
    facts: ["코폴리에스터 모노필라멘트", "12 m"],
    description: "팔각 구조와 스핀·컨트롤 성향을 제조사가 안내하는 코폴리에스터 스트링입니다.",
    sourceUrl: "https://www.babolat.com/us/rpm-blast-12m/105-241101.html",
  },
  {
    offerKey: "string:yonex-polytour-pro",
    brand: "Yonex",
    name: "POLYTOUR PRO",
    facts: ["폴리에스터", "컴포트 지향"],
    description: "Yonex가 편안한 타구감을 중심으로 소개하는 폴리에스터 스트링입니다.",
    sourceUrl: "https://www.yonex.com/polytourpro",
  },
  {
    offerKey: "string:tecnifibre-x-one-biphase-12m",
    brand: "Tecnifibre",
    name: "X-ONE BIPHASE 12M",
    facts: ["멀티필라멘트", "12 m · 1.30 mm"],
    description: "폴리아미드 기반의 멀티필라멘트 구조와 편안한 타구감을 제조사가 안내하는 제품입니다.",
    sourceUrl: "https://b2b.tecnifibre.com/en/p/01GXO130XR.html",
  },
];

export const STRING_OFFER_KEYS = stringProducts.map((product) => product.offerKey);

export function isStringOfferKey(value: string): value is StringOfferKey {
  return STRING_OFFER_KEYS.includes(value as StringOfferKey);
}
