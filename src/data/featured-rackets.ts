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
    model: "PURE AERO 2026",
    tagline: "공식 Pure Aero 라인의 300g 리테일 모델",
    tags: [
      { icon: "◎", label: "패턴", value: "16×19" },
      { icon: "⚡", label: "무게", value: "300g" },
      { icon: "◇", label: "헤드", value: "100in²" },
    ],
    specs: ["300g", "100sq.in", "16x19"],
    imageUrl: "https://img.tennis-warehouse.com/watermark/rs.php?path=BPAR26-1.jpg&nw=500",
    imageSourceUrl: "https://www.tennis-warehouse.com/Babolat_Pure_Aero_2026/descpageRCBAB-BPAR26.html",
    specSourceUrl: "https://www.babolat.com/us/pure-aero-gen9-unstrung/101569.html",
    verifiedAt: "2026-07-21",
    slug: "babolat-pure-aero-2026",
  },
  {
    brand: "Head",
    model: "SPEED MP 2026",
    tagline: "Speed 라인의 300g 올라운드 리테일 모델",
    tags: [
      { icon: "⊕", label: "패턴", value: "16×19" },
      { icon: "▸", label: "무게", value: "300g" },
      { icon: "◎", label: "헤드", value: "100in²" },
    ],
    specs: ["300g", "100sq.in", "16x19"],
    imageUrl: "https://img.tennis-warehouse.com/watermark/rs.php?path=HSPMP6-1.jpg&nw=500",
    imageSourceUrl: "https://www.tennis-warehouse.com/Head_Speed_MP_2026/descpageRCHEAD-HSPMP6.html",
    specSourceUrl: "https://www.head.com/en_US/product/speed-mp-2026-232026",
    verifiedAt: "2026-07-21",
    slug: "head-speed-mp-2026",
  },
  {
    brand: "Yonex",
    model: "VCORE 100 2026",
    tagline: "VCORE 라인의 300g 스핀 지향 리테일 모델",
    tags: [
      { icon: "⬡", label: "패턴", value: "16×19" },
      { icon: "◎", label: "무게", value: "300g" },
      { icon: "◇", label: "헤드", value: "100in²" },
    ],
    specs: ["300g", "100sq.in", "16x19"],
    imageUrl: "https://img.tennis-warehouse.com/watermark/rs.php?path=VC108G-1.jpg&nw=500",
    imageSourceUrl: "https://www.tennis-warehouse.com/Yonex_VCORE_100_8th_Gen/descpageRCYONEX-VC108G.html",
    specSourceUrl: "https://www.yonex.com/tennis/racquets/vcore",
    verifiedAt: "2026-07-21",
    slug: "yonex-vcore-100-2026",
  },
];
