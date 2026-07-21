export type FeaturedRacket = {
  brand: string;
  model: string;
  tagline: string;
  tags: { icon: string; label: string; value: string }[];
  specs: string[];
  imageUrl: string;
  imageSourceUrl: string;
  specSourceUrl: string;
  verifiedAt: string;
  slug: string;
};

export const featuredRackets: FeaturedRacket[] = [
  {
    brand: "Babolat",
    model: "PURE AERO GEN 9",
    tagline: "공기를 가르는 새로운 에어로 프레임",
    tags: [
      { icon: "◎", label: "스핀", value: "MAX" },
      { icon: "⚡", label: "파워", value: "+3" },
      { icon: "◇", label: "에어로", value: "GEN 9" },
    ],
    specs: ["300g", "100sq.in", "16x19"],
    imageUrl: "/images/rackets/babolat-pure-aero-2026.png",
    imageSourceUrl: "https://www.tennis-warehouse.com/Babolat_Pure_Aero_2026/descpageRCBAB-BPAR26.html",
    specSourceUrl: "https://www.babolat.com/us/pure-aero-gen9-unstrung/101569.html",
    verifiedAt: "2026-07-21",
    slug: "babolat-pure-aero-2026-300g",
  },
  {
    brand: "Head",
    model: "SPEED MP 2026",
    tagline: "시너 × 조코비치가 선택한 균형의 정점",
    tags: [
      { icon: "⊕", label: "밸런스", value: "PERFECT" },
      { icon: "▸", label: "스피드", value: "+4" },
      { icon: "◎", label: "컨트롤", value: "+4" },
    ],
    specs: ["300g", "100sq.in", "16x19"],
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
    tags: [
      { icon: "⬡", label: "파워", value: "+4" },
      { icon: "◎", label: "스핀", value: "+3" },
      { icon: "◇", label: "이소메트릭", value: "NEW" },
    ],
    specs: ["300g", "100sq.in", "16x19"],
    imageUrl: "/images/rackets/yonex-vcore-100-2026.png",
    imageSourceUrl: "https://www.tennis-warehouse.com/Yonex_VCORE_100_8th_Gen/descpageRCYONEX-VC108G.html",
    specSourceUrl: "https://www.yonex.com/tennis/racquets/vcore",
    verifiedAt: "2026-07-21",
    slug: "yonex-vcore-100-2026",
  },
];
