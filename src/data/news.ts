export type NewsItem = {
  id: string;
  date: string;
  category: string;
  categoryEmoji: string;
  title: string;
  summary: string;
};

export const newsItems: NewsItem[] = [
  {
    id: "babolat-pure-aero-2026",
    date: "07/21",
    category: "신제품",
    categoryEmoji: "🆕",
    title: "Babolat Pure Aero 2026 출시",
    summary:
      "Babolat 공식 2026 Pure Aero 리테일 라인. 알카라스의 공식 후원 표시는 Pure Aero 98이지만 실제 투어 프레임 사양과 동일하다고 단정하지 않습니다.",
  },
  {
    id: "head-speed-mp-2026",
    date: "07/21",
    category: "신제품",
    categoryEmoji: "🆕",
    title: "Head Speed MP 2026 출시",
    summary:
      "HEAD 공식 2026 Speed 리테일 라인. 시너는 Speed, 조코비치는 Speed Legend 후원 라인이며 실제 투어 프레임은 시판 사양과 다를 수 있습니다.",
  },
  {
    id: "poly-tension-2lbs",
    date: "07/21",
    category: "팁",
    categoryEmoji: "💡",
    title: "폴리 장력, 2lbs 낮추면 뭐가 달라질까?",
    summary:
      "같은 스트링에서 장력을 낮추면 일반적으로 깊이와 편안함이 늘 수 있지만, 프레임·스트링·스윙에 따라 반응이 달라지는 출발점입니다.",
  },
];
