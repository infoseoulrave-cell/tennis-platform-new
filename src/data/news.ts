export type NewsItem = {
  date: string;
  tag: string;
  tagType: "new" | "tip";
  title: string;
  description: string;
};

export const newsItems: NewsItem[] = [
  {
    date: "03/19",
    tag: "신제품",
    tagType: "new",
    title: "Babolat Pure Aero 2026 출시",
    description: "에어로 프레임 완전 재설계. 스핀 잠재력 역대 최고. 알카라스 실전 투입 확인.",
  },
  {
    date: "03/18",
    tag: "신제품",
    tagType: "new",
    title: "Head Speed MP 2026 출시",
    description: "시너/조코비치 사용 모델. 밸런스 재조정으로 안정감 대폭 향상.",
  },
  {
    date: "03/17",
    tag: "팁",
    tagType: "tip",
    title: "폴리 장력, 2lbs 낮추면 뭐가 달라질까?",
    description: "파워와 스핀 모두 체감 변화. 50→48lbs만으로 깊이가 달라집니다.",
  },
];
