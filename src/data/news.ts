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
    date: "03/19",
    category: "신제품",
    categoryEmoji: "🆕",
    title: "Babolat Pure Aero 2026 출시",
    summary:
      "에어로 프레임 완전 재설계. 스핀 잠재력 역대 최고. 알카라스 실전 투입 확인.",
  },
  {
    id: "head-speed-mp-2026",
    date: "03/18",
    category: "신제품",
    categoryEmoji: "🆕",
    title: "Head Speed MP 2026 출시",
    summary:
      "시너/조코비치 사용 모델. 밸런스 재조정으로 안정감 대폭 향상.",
  },
  {
    id: "poly-tension-2lbs",
    date: "03/17",
    category: "팁",
    categoryEmoji: "💡",
    title: "폴리 장력, 2lbs 낮추면 뭐가 달라질까?",
    summary:
      "파워와 스핀 모두 체감 변화. 50→48lbs만으로 깊이가 달라집니다.",
  },
];
