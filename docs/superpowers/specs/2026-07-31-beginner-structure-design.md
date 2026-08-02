# racket LAB — 초심자 친화 구조 개편 설계

작성일: 2026-07-31
대상 코드베이스: `Documents/Codex/2026-07-21/https-racketlab-omega-vercel-app`
대상 배포: Vercel `prj_wPzKAFzr9oLIrMfLMRBDdJukdMi7` (canonical: `racketlab-one.vercel.app`)

## 배경

회사 직원 피드백 두 가지:

1. 플랫폼 구조가 어렵다 — 초심자 진입점 부재, 용어 난해, 메뉴 과다
2. 스트링·그립 예상 디자인 보기가 부정확하다

## 사전 조사에서 확인된 사실

- 색상 시뮬레이션(`/customizer`, `RacketVisualCustomizer`)은 **운영에 배포된 적이 없다.**
  `racketlab-one.vercel.app/customizer/*` 는 404이며, 라켓 상세에도 진입 CTA가 없다.
  로컬 `main`이 `origin/main`보다 22 커밋 앞서 있고 그 안에 커스터마이저 작업이 들어 있다.
  직원이 본 화면은 Preview 배포(`racketlab-7z7lzmin1-rachel-flower.vercel.app`)다.
- 현재 nav는 7개 항목이다: 라켓 / 스트링 / 추천 / 비교 / 가이드 / 뉴스 / About
- `/recommendation` 은 `/diagnosis` 로 redirect하며, `/diagnosis` 는 6단계 위저드다.
  **1단계가 "현재 사용 중인 라켓이 있나요?"** 로, 초심자에게는 답이 없는 질문으로 시작한다.
- `/api/diagnosis/submit` 의 zod 스키마는 모든 answer 필드가 optional이다.
  따라서 축약된 문항으로도 동일한 추천 엔진을 재사용할 수 있다.

## 왜 시뮬레이션이 부정확한가

`scripts/racket-customizer-mask-geometry.ts`(327KB)에 라켓별 좌표를 **손으로 찍어** 두고,
`buildStringMaskSvg` 가 타원 클리핑 안에 직선 격자를 그려 사진 위에 CSS mask로 덮는 구조다.

1. 스트링: 타원 + 직선 격자라 사진의 원근·프레임 안쪽 가림·실제 스트링 간격과 어긋난다
2. 그립: `mixBlendMode: normal` 불투명 채색이라 원본 음영·하이라이트가 사라지고 스티커처럼 보인다
3. Tennis Warehouse 원본 사진에는 라켓이 2개(정면/측면)인데 스트링은 정면 하나만 칠해진다
4. 이미지 intrinsic 픽셀 크기가 1px만 달라도 `matchesCustomizerDimensions` 가 기능을 통째로 끈다

좌표 보정으로는 1~3이 해결되지 않는다. 색을 입히는 방식 자체를 바꿔야 한다.

## 설계

### A. 색상 시뮬레이션 — 사진 덧칠 → 스펙 기반 도식

사진 위 덧칠을 폐기하고, **DB에 이미 있는 실측 스펙에서 그려내는 벡터 도식**으로 교체한다.

| 도식 요소 | 근거 데이터 | 현재 방식 |
|---|---|---|
| 헤드 크기·형태 | `headSize` (97/100/104 sq.in) | 손으로 찍은 타원 |
| 스트링 가닥 수 | `pattern` (16×19, 18×20) | 라켓 무관 임의 격자 |

16×19 라켓은 정확히 메인 16, 크로스 19가닥으로 그려진다. **구조적으로 어긋날 수 없다.**
도식은 사진이 아니므로 "실물과 다르다"는 오해도 발생하지 않는다.

**구현 중 확인된 사실 두 가지 (설계 수정):**

1. 그립 사이즈는 DB에 없다. `getRacketBySlug` 가 돌려주는 필드는 `headSize` 와 `pattern` 뿐이다.
   따라서 도식은 이 두 값만 근거로 삼고, 그립은 굵기를 표현하지 않는다.
2. 스트링 카탈로그(`src/data/strings.ts`)에 **색상 데이터가 없다.**
   따라서 "이 색 = 이 제품" 스와치는 만들 수 없다. 없는 데이터를 지어내지 않고,
   색 선택기는 조합 비교용임을 명시하고 실제 제품 선택은 `/strings` 로 넘긴다.

삭제 대상: `scripts/racket-customizer-mask-geometry.ts`(327KB),
`public/images/racket-customizer/*.svg`(108개), `racket-customizer-profiles.generated.ts`,
`matchesCustomizerDimensions` 픽셀 검사 경로.

### B. 초심자 진입점 — `/start`

3문항만 묻는 경량 플로우를 신설한다. 기존 6단계 `/diagnosis` 는 "자세히 진단"으로 유지한다.

| 문항 | 선택지 | submit 매핑 |
|---|---|---|
| 1. 테니스 경력 | 1년 미만 / 1-3년 / 3-5년 / 5년 이상 | `play_profile.experience` |
| 2. 주 몇 회 | 주 1-2회 / 주 2-3회 / 주 3회+ | `play_profile.frequency` |
| 3. 가장 중요한 것 | 파워 / 컨트롤 / 스핀 / 편안함 / 안정성 | `priority_tradeoffs.first` |

`current_racket.selection` 은 `"first_purchase"` 로 고정 전송한다.
기존 `/api/diagnosis/submit` 과 `runRecommendation` 을 그대로 재사용하며, 엔진은 수정하지 않는다.
결과는 기존 `/results/[id]` 로 보낸다.

홈 최상단에 `테니스 처음이신가요?` 배너를 두어 `/start` 로 보낸다.

### C. 메뉴 7 → 5

`추천 · 라켓 · 스트링 · 비교 · 가이드`

- `추천` 을 첫 번째·시각적 우선 항목으로 둔다
- `뉴스`, `About` 은 푸터로 이동한다 (푸터에는 이미 두 링크가 있다)
- `가이드` 가 학습 콘텐츠 허브가 된다

제약: 기존 테스트가 `global-nav.tsx` / `footer.tsx` / `mobile-tab-bar.tsx` 각각에
`/strings` 링크 존재를 검사한다. 세 파일 모두 `/strings` 를 유지해야 한다.
`global-nav.tsx` 의 `aria-label="라켓 검색 열기"`, `role="dialog"`, `aria-modal="true"` 도 유지한다.

### D. 용어 풀어쓰기

- `<Term>` 컴포넌트 신설 — 어려운 용어에 탭/호버 설명을 붙인다
  대상: 스윙웨이트, RA 강성, 밸런스, 스트링 패턴(16×19), 5축, 언스트렁
- 점수 표기에 말 라벨을 병기한다: `파워 3/5` → `파워 3/5 · 보통`
- 용어사전 페이지를 `/guide/terms` 에 둔다

## 검증 기준

- 기존 테스트 192개가 모두 통과해야 한다 (회귀 없음)
- `npm run typecheck`, `npm run lint`, `npm run build` 통과
- 신규 동작에 대한 테스트를 추가한다:
  - `/start` 3문항이 submit 스키마를 만족하는 payload를 만드는지
  - nav 항목이 5개이고 세 컴포넌트가 `/strings` 를 유지하는지
  - 도식이 `stringPattern` 을 그대로 반영하는지 (16×19 → 메인 16, 크로스 19)

## 배포 원칙

기존 DEVLOG 관례를 따른다.

- Production 자동 반영을 하지 않는다
- Preview 배포로 확인받은 뒤, 명시적 승인이 있을 때만 Production에 올린다
- DB·migration은 건드리지 않는다

## 범위 밖

- 추천 엔진 스코어링 로직 변경
- 라켓 목록 페이지에서 상품 이미지가 뜨지 않는 문제 (별도 과제로 기록)
- Babolat 상세의 TWU 링크가 `brand=Wilson` 로 고정된 버그 (별도 과제로 기록)
- 갈라진 저장소·배포 정리 (별도 과제)
