/**
 * 초심자용 3문항 빠른 추천.
 *
 * 기존 /diagnosis 는 6단계이고 1단계가 "현재 쓰는 라켓"이라 처음 사는 사람에게는
 * 답이 없는 질문으로 시작한다. 여기서는 초심자가 확실히 답할 수 있는 3가지만 묻고,
 * 추천 엔진은 /api/diagnosis/submit 을 그대로 재사용한다.
 */

import {
  EXPERIENCE_MAP,
  FREQUENCY_MAP,
  PRIORITY_MAP,
} from "@/lib/diagnosis-mappings";

export type QuickStartOption = {
  /** 화면에 보이는 값. diagnosis-mappings 의 키와 정확히 일치해야 한다. */
  readonly value: string;
  /** 초심자가 자기 상황을 고르도록 돕는 한 줄 설명. */
  readonly hint: string;
};

export const QUICK_START_EXPERIENCES: readonly QuickStartOption[] = [
  { value: "1년 미만", hint: "이제 막 시작했어요" },
  { value: "1-3년", hint: "기본기를 익히는 중이에요" },
  { value: "3-5년", hint: "경기를 즐길 수 있어요" },
  { value: "5년 이상", hint: "오래 쳤어요" },
];

export const QUICK_START_FREQUENCIES: readonly QuickStartOption[] = [
  { value: "주 1-2회 레저", hint: "가볍게 즐기는 편" },
  { value: "주 2-3회 클럽/레슨", hint: "꾸준히 배우는 중" },
  { value: "주 3회+ 시합 포함", hint: "시합도 나가요" },
];

export const QUICK_START_PRIORITIES: readonly QuickStartOption[] = [
  { value: "편안함 (팔 보호)", hint: "팔이 아프지 않은 게 제일 중요해요" },
  { value: "안정성 (미스 허용)", hint: "빗맞아도 공이 잘 넘어갔으면 해요" },
  { value: "파워", hint: "공을 더 멀리 강하게 보내고 싶어요" },
  { value: "컨트롤", hint: "원하는 곳에 정확히 보내고 싶어요" },
  { value: "스핀", hint: "공을 많이 회전시키고 싶어요" },
];

export type QuickStartSelection = {
  experience: string | null;
  frequency: string | null;
  priority: string | null;
};

export const emptyQuickStartSelection: QuickStartSelection = {
  experience: null,
  frequency: null,
  priority: null,
};

export function isQuickStartComplete(
  selection: QuickStartSelection,
): boolean {
  return Boolean(
    selection.experience && selection.frequency && selection.priority,
  );
}

/**
 * /api/diagnosis/submit 의 answers 형태로 변환한다.
 *
 * 초심자 경로이므로 current_racket 은 "first_purchase" 로 고정한다.
 * 나머지 항목(스윙 스피드, 불편한 점, 2순위)은 묻지 않으므로 보내지 않는다 —
 * submit 스키마상 모두 optional 이다.
 */
export function buildQuickStartAnswers(
  selection: QuickStartSelection,
): Record<string, unknown> {
  if (!isQuickStartComplete(selection)) {
    throw new Error("3개 문항에 모두 답해야 추천을 만들 수 있습니다");
  }

  const experience = selection.experience as string;
  const frequency = selection.frequency as string;
  const priority = selection.priority as string;

  return {
    current_racket: { selection: "first_purchase" },
    play_profile: {
      experience: EXPERIENCE_MAP[experience] ?? experience,
      frequency: FREQUENCY_MAP[frequency] ?? frequency,
    },
    priority_tradeoffs: {
      first: PRIORITY_MAP[priority] ?? priority,
    },
    confirmation: true,
  };
}

export const QUICK_START_STEPS = [
  {
    id: 1,
    title: "테니스 얼마나 치셨어요?",
    help: "정확하지 않아도 괜찮아요. 대략으로 골라주세요.",
  },
  {
    id: 2,
    title: "보통 주에 몇 번 치세요?",
    help: "자주 칠수록 조금 더 무거운 라켓이 잘 맞습니다.",
  },
  {
    id: 3,
    title: "가장 중요한 게 뭔가요?",
    help: "하나만 고르면 됩니다. 이 선택이 추천에 가장 크게 반영됩니다.",
  },
] as const;
