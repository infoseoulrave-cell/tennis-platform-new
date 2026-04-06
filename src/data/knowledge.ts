export type KnowledgeFact = {
  emoji: string;
  title: string;
  description: string;
};

export const knowledgeFacts: KnowledgeFact[] = [
  {
    emoji: "🐄",
    title: "내추럴 거트는 소 내장으로 만든다",
    description: "가장 비싸고 성능 좋은 스트링. 프로 선수의 60%가 하이브리드 세팅의 메인 스트링으로 사용합니다. 가격은 한 벌에 5~8만원.",
  },
  {
    emoji: "⚖️",
    title: "라켓 무게 10g 차이가 체감 30%",
    description: "295g과 305g은 스펙 차이가 작아 보이지만, 실제로 스윙하면 안정감과 기동성이 완전히 달라집니다. 라켓 선택에서 무게는 가장 먼저 확인할 스펙.",
  },
  {
    emoji: "🔬",
    title: "스트링 장력이 높을수록 파워는 줄어든다",
    description: "직관과 정반대! 높은 장력 = 트램폴린 효과 감소 = 파워↓ 컨트롤↑. 파워를 원하면 장력을 낮추세요.",
  },
  {
    emoji: "🎭",
    title: "프로 선수 라켓은 시판품과 다르다",
    description: "\"프로 스톡\"이라는 별도 사양이 존재합니다. 페인트만 최신 모델이고 속은 5년 전 모델인 경우도 흔합니다. 선수가 쓴다고 같은 라켓이 아닙니다.",
  },
  {
    emoji: "💪",
    title: "그립 사이즈 1mm가 테니스 엘보를 만든다",
    description: "작은 그립 → 과도한 악력 → 전완근 긴장 → 팔꿈치 통증. 자가 측정법: 라켓을 잡았을 때 검지와 손바닥 사이에 검지 한 마디가 들어가야 적정.",
  },
];
