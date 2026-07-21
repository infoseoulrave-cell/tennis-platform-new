export const EXPERIENCES = ["1년 미만", "1-3년", "3-5년", "5년 이상"];
export const EXPERIENCE_MAP: Record<string, string> = {
  "1년 미만": "less_1_year",
  "1-3년": "1_3_years",
  "3-5년": "3_5_years",
  "5년 이상": "5_plus_years",
};

export const FREQUENCIES = ["주 1-2회 레저", "주 2-3회 클럽/레슨", "주 3회+ 시합 포함"];
export const FREQUENCY_MAP: Record<string, string> = {
  "주 1-2회 레저": "once_weekly",
  "주 2-3회 클럽/레슨": "2_3_weekly",
  "주 3회+ 시합 포함": "4_5_weekly",
};

export const PLAY_STYLES = [
  "안정적인 컨트롤",
  "강한 파워/스핀",
  "균형 잡힌 올라운드",
];
export const PLAY_STYLE_MAP: Record<string, string> = {
  "안정적인 컨트롤": "control_oriented",
  "강한 파워/스핀": "power_spin",
  "균형 잡힌 올라운드": "all_round",
};

export const PAIN_POINTS = [
  "팔꿈치/손목 통증",
  "공이 짧게 떨어짐",
  "컨트롤이 안됨",
  "스핀이 부족함",
  "라켓이 너무 무거움",
  "라켓이 너무 가벼움",
  "발리가 불안정함",
  "특별히 없음 — 업그레이드",
];
export const PAIN_POINT_MAP: Record<string, string> = {
  "팔꿈치/손목 통증": "elbow_pain",
  "공이 짧게 떨어짐": "short_shots",
  "컨트롤이 안됨": "inconsistent_serve",
  "스핀이 부족함": "low_spin",
  "라켓이 너무 무거움": "heavy_racket",
  "라켓이 너무 가벼움": "light_racket",
  "발리가 불안정함": "unstable_volley",
  "특별히 없음 — 업그레이드": "upgrade_only",
};

export const PRIORITIES = ["파워", "컨트롤", "스핀", "편안함 (팔 보호)", "안정성 (미스 허용)"];
export const PRIORITY_MAP: Record<string, string> = {
  파워: "power",
  컨트롤: "control",
  스핀: "spin",
  "편안함 (팔 보호)": "comfort",
  "안정성 (미스 허용)": "stability",
};
