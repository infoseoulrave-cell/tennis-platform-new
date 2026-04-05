export type AxisScores = {
  power: number;
  control: number;
  spin: number;
  comfort: number;
  stability: number;
};

export type Racket = {
  id: string;
  brand: string;
  model: string;
  imageUrl: string;
  scores: AxisScores;
  priceKrw: number;
  headSize: number;
  weight: number;
  balance: number;
  stiffness: number;
  stringPattern: string;
};

export type RecommendationResult = {
  racket: Racket;
  matchPercent: number;
  tier: "best-fit" | "safe-alternative" | "challenge-pick";
  tierLabel: string;
  tierEmoji: string;
  fitSummary: string;
  reasons: string[];
  tradeoffs: string[];
  forWhom: string[];
  notForWhom: string[];
  suggestedString: string;
  suggestedStringTension: string;
  confidence: "high" | "medium" | "exploratory";
};

export type PlayerProfile = {
  currentRacket: string | null;
  experience: string;
  frequency: string;
  swingSpeed: number;
  playStyle: string;
  painPoints: string[];
  priorities: [string, string];
};

export const MOCK_RACKETS: Racket[] = [
  {
    id: "blade-98-v8",
    brand: "Wilson",
    model: "Blade 98 v8",
    imageUrl: "/rackets/blade-98.png",
    scores: { power: 80, control: 92, spin: 82, comfort: 85, stability: 88 },
    priceKrw: 289000,
    headSize: 98,
    weight: 305,
    balance: 323,
    stiffness: 62,
    stringPattern: "16x19",
  },
  {
    id: "gravity-mp",
    brand: "Head",
    model: "Gravity MP",
    imageUrl: "/rackets/gravity-mp.png",
    scores: { power: 84, control: 87, spin: 80, comfort: 82, stability: 86 },
    priceKrw: 299000,
    headSize: 100,
    weight: 295,
    balance: 325,
    stiffness: 64,
    stringPattern: "16x20",
  },
  {
    id: "vcore-98",
    brand: "Yonex",
    model: "VCORE 98",
    imageUrl: "/rackets/vcore-98.png",
    scores: { power: 78, control: 90, spin: 94, comfort: 78, stability: 82 },
    priceKrw: 268000,
    headSize: 98,
    weight: 305,
    balance: 325,
    stiffness: 66,
    stringPattern: "16x19",
  },
];

export const MOCK_CURRENT_RACKET: Racket = {
  id: "pure-drive",
  brand: "Babolat",
  model: "Pure Drive",
  imageUrl: "/rackets/pure-drive.png",
  scores: { power: 90, control: 75, spin: 78, comfort: 72, stability: 80 },
  priceKrw: 289000,
  headSize: 100,
  weight: 300,
  balance: 320,
  stiffness: 71,
  stringPattern: "16x19",
};

export const MOCK_RECOMMENDATIONS: RecommendationResult[] = [
  {
    racket: MOCK_RACKETS[0],
    matchPercent: 92,
    tier: "best-fit",
    tierLabel: "Best Fit",
    tierEmoji: "🏆",
    fitSummary:
      "컨트롤과 안정성을 높이면서 파워 손실은 최소화하는 선택입니다",
    reasons: [
      "컨트롤 향상이 가장 큰 목표에 부합",
      "스윙 스피드에 맞는 적절한 무게",
      "팔꿈치 부담 적은 편안한 타구감",
    ],
    tradeoffs: ["순수 파워는 현재 라켓보다 약간 감소할 수 있음"],
    forWhom: [
      "랠리 안정성을 높이고 싶은 클럽 플레이어",
      "컨트롤 위주로 게임을 풀어가는 스타일",
    ],
    notForWhom: ["파워/스핀 극대화가 최우선이면 VCORE 98 참고"],
    suggestedString: "Luxilon ALU Power",
    suggestedStringTension: "52lbs",
    confidence: "high",
  },
  {
    racket: MOCK_RACKETS[1],
    matchPercent: 87,
    tier: "safe-alternative",
    tierLabel: "안전한 대안",
    tierEmoji: "💚",
    fitSummary: "현재 라켓과 비슷한 파워에 컨트롤만 개선하는 안전한 전환",
    reasons: [
      "현재 라켓 대비 컨트롤 +12 향상",
      "파워 감소 최소화 (-6 수준)",
      "넓은 헤드 사이즈로 미스 허용 범위 유지",
    ],
    tradeoffs: ["스핀 잠재력은 평균 수준", "스윙웨이트 적응 기간 필요"],
    forWhom: [
      "큰 변화보다 점진적 업그레이드를 원하는 플레이어",
      "올라운드 밸런스를 선호하는 스타일",
    ],
    notForWhom: ["극단적 컨트롤이나 스핀을 원하면 다른 선택 추천"],
    suggestedString: "Wilson NXT Power",
    suggestedStringTension: "50lbs",
    confidence: "high",
  },
  {
    racket: MOCK_RACKETS[2],
    matchPercent: 83,
    tier: "challenge-pick",
    tierLabel: "도전적 선택",
    tierEmoji: "🔥",
    fitSummary: "스핀과 컨트롤을 극대화하지만 적응 기간이 필요한 선택",
    reasons: [
      "스핀 성능 최상위 — 탑스핀 플레이어에 최적",
      "컨트롤 집중형 설계로 정밀 배치 가능",
      "가격 대비 성능 우수",
    ],
    tradeoffs: [
      "편안함 점수가 낮아 팔 부담 가능성",
      "파워가 적어 스윙 스피드로 보완 필요",
    ],
    forWhom: ["빠른 스윙으로 스핀을 적극 활용하는 공격형"],
    notForWhom: [
      "팔꿈치 통증이 있는 플레이어는 피할 것",
      "안정감을 최우선으로 하는 스타일",
    ],
    suggestedString: "Yonex Poly Tour Pro",
    suggestedStringTension: "48lbs",
    confidence: "medium",
  },
];

export const MOCK_PROFILE: PlayerProfile = {
  currentRacket: "Babolat Pure Drive",
  experience: "3년",
  frequency: "주 2-3회",
  swingSpeed: 65,
  playStyle: "안정적인 컨트롤",
  painPoints: ["팔꿈치/손목 통증", "컨트롤이 안됨"],
  priorities: ["컨트롤", "편안함"],
};

export const AXIS_LABELS: Record<keyof AxisScores, string> = {
  power: "파워",
  control: "컨트롤",
  spin: "스핀",
  comfort: "편안함",
  stability: "안정성",
};

export const DIAGNOSIS_STEPS = [
  {
    id: 1,
    title: "현재 라켓 파악",
    description: "현재 사용 중인 라켓이 있나요?",
    helpText: "현재 라켓과 비교해서 어떤 점이 나아지는지 보여드립니다",
  },
  {
    id: 2,
    title: "플레이 프로필",
    description: "테니스 경력과 플레이 빈도를 알려주세요",
    helpText: "경력과 빈도에 맞는 무게와 밸런스를 추천합니다",
  },
  {
    id: 3,
    title: "스윙과 스타일",
    description: "스윙 스피드와 플레이 성향을 알려주세요",
    helpText: "정확하지 않아도 괜찮아요. 대략적인 느낌으로 충분합니다",
  },
  {
    id: 4,
    title: "불편함과 개선 목표",
    description: "현재 불편하거나 개선하고 싶은 점을 선택해주세요",
    helpText: "선택한 항목이 추천 결과의 핵심 근거가 됩니다",
  },
  {
    id: 5,
    title: "우선순위 선택",
    description: "가장 중요한 2가지를 선택해주세요",
    helpText: "이 선택이 추천 결과에 가장 큰 영향을 줍니다",
  },
  {
    id: 6,
    title: "결과 확인",
    description: "진단이 완료되었습니다!",
    helpText: "",
  },
];
