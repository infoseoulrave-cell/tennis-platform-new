/**
 * 헤드 형상은 모델이 아니라 브랜드 패밀리의 성질이다.
 *
 * 54종을 하나씩 적으면 예전 마스크 좌표 파일과 같은 실패로 돌아간다.
 * 대신 패밀리 단위로만 적어 두면 신규 모델은 브랜드만 보고 자동으로 붙는다.
 *
 * 초타원 |x/a|^n + |y/b|^n = 1 의 계수다.
 *  - exponent 2 는 일반 타원, 커질수록 모서리가 각져 아이소메트릭에 가까워진다
 *  - aspect 는 세로/가로 비. 작을수록 둥글다
 *  - topBias 는 위쪽 반경 배율. 1보다 크면 티어드롭이 된다
 */
export type HeadShape = {
  readonly exponent: number;
  readonly aspect: number;
  readonly topBias: number;
};

export const DEFAULT_HEAD_SHAPE: HeadShape = {
  exponent: 2,
  aspect: 1.24,
  topBias: 1,
};

/**
 * 패밀리 판정은 브랜드와 모델명 앞부분만 본다.
 * 위에서부터 먼저 맞는 것을 쓴다.
 */
const FAMILY_SHAPES: readonly {
  readonly brand: string;
  readonly model?: RegExp;
  readonly shape: HeadShape;
}[] = [
  // Yonex 아이소메트릭 — 모서리가 각진 형이 이 브랜드의 특징이다.
  { brand: "yonex", shape: { exponent: 2.55, aspect: 1.2, topBias: 1.01 } },

  // Babolat Aero 계열은 위가 넓은 티어드롭에 가깝다.
  {
    brand: "babolat",
    model: /aero/i,
    shape: { exponent: 2.15, aspect: 1.27, topBias: 1.06 },
  },
  { brand: "babolat", shape: { exponent: 2.05, aspect: 1.25, topBias: 1.03 } },

  // Head Gravity·Prestige 는 상대적으로 둥근 형이다.
  {
    brand: "head",
    model: /gravity|prestige/i,
    shape: { exponent: 2, aspect: 1.15, topBias: 1 },
  },
  { brand: "head", shape: { exponent: 2.1, aspect: 1.23, topBias: 1.02 } },

  { brand: "wilson", shape: { exponent: 2.08, aspect: 1.24, topBias: 1.02 } },
  { brand: "dunlop", shape: { exponent: 2.1, aspect: 1.24, topBias: 1.02 } },
  { brand: "tecnifibre", shape: { exponent: 2.05, aspect: 1.26, topBias: 1.03 } },
  { brand: "prince", shape: { exponent: 2.2, aspect: 1.2, topBias: 1 } },
];

export function resolveHeadShape(
  brand: string | null,
  model: string | null,
): HeadShape {
  const normalizedBrand = (brand ?? "").trim().toLowerCase();
  if (!normalizedBrand) return DEFAULT_HEAD_SHAPE;

  for (const entry of FAMILY_SHAPES) {
    if (entry.brand !== normalizedBrand) continue;
    if (entry.model && !entry.model.test(model ?? "")) continue;
    return entry.shape;
  }

  return DEFAULT_HEAD_SHAPE;
}
