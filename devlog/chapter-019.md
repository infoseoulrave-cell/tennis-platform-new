# Chapter 19 — 이월 과제 정리: 커스터마이저 70종 · 404 상태 · icn1 리전

### 목표
Chapter 11·16·17 에서 남긴 이월 과제 네 건을 순서대로 닫는다.

### 1. 커스터마이저 사진 54 → 70

Chapter 17 에서 16종을 재활성화하고 생성 스크립트를 돌리지 않아, 신규 라켓은
커스터마이저에서 스펙 도식으로 떨어지고 있었다.

Chapter 16 이 "GPU 작업이라 별도 세션" 이라고 적어 뒀지만 **사실이 아니다.**
이 파이프라인은 sharp 기반 CPU 세그멘테이션이고 로컬에서 몇 분이면 끝난다.
그대로 실행했다.

- 70/70 검출, fail-closed 제외 0건. Chapter 16 에서 배경값에 붙여 둔
  `OVERLAY_SEGMENTATION`(248) 이 신규 16종에도 그대로 통했다.
- 기존 54종 산출물 무변경. 매니페스트 +16줄, 에셋 +48개(16×3), 총 3.4MB.
- `--check` 재실행 결과 동일 — 결정적이다.
- 마스크 정렬 육안 확인(신규 5종 + 대조군 1종): 베드가 후프 안쪽에만,
  그립이 두 컷 모두 손잡이에만 덮인다.

### 2. 404 가 HTTP 200 으로 나가던 문제

`loading.tsx` 가 있는 세그먼트는 Next 가 Suspense 로 감싸고 page 실행 전에
200 을 커밋한다. 그래서 `notFound()` 를 불러도 본문만 404 이고 상태 코드는
200 이었다.

범인이 두 곳이었고 **성격이 서로 달랐다.**

- `results/[id]/loading.tsx` 는 자기 라우트를 감쌌다.
- `rackets/[slug]` 는 자기 `loading.tsx` 를 지워도 200 이 그대로였다.
  **목록 페이지의 `rackets/loading.tsx` 가 중첩된 `[slug]` 까지 감싸고
  있었다.** loading 경계는 그 세그먼트의 children — 즉 하위 라우트 전체에
  걸린다. 이게 Chapter 11 에서 원인을 못 짚고 넘어간 이유다.

고친 방법

- `rackets/page.tsx` + `loading.tsx` 를 route group `(list)` 로 옮겨 경계를
  목록 자신에게 가뒀다. URL 은 `/rackets` 그대로고 목록의 스트리밍도 그대로다.
- `results/[id]` 는 존재 확인(uuid 형식 + PK 조회 1회)까지만 막고 나머지
  무거운 조회를 page 안 Suspense 로 밀었다. 예전 스켈레톤이 그 fallback 이다.
- `rackets/[slug]` 는 자기 loading.tsx 를 지웠다. 느린 구간(가격 비교·유사
  라켓)은 이미 page 안 Suspense 가 덮고 있어 잃는 게 없다.

회귀 방지로 구조 테스트를 넣었다. 상태를 바꾸는 호출이 있는 page 는 자신과
**모든 조상** 세그먼트에 loading.tsx 가 없어야 한다 — 조상까지 보는 게 핵심.

### 3. 함수 리전 iad1 → icn1

Supabase 가 `ap-northeast-2`(AWS 서울)인데 함수는 기본값 `iad1`(버지니아)에서
돌고 있었다. 요청마다 태평양을 두 번 건넌다 — 사용자→함수, 함수→DB. DB 왕복은
쿼리 수만큼 곱해진다.

`vercel.json` 에 `regions: ["icn1"]` 하나를 넣었다. 한국에서 측정한 결과:

```
                        PROD(iad1)      PREVIEW(icn1)
/rackets        TTFB      262ms            88ms      -66%
/strings        TTFB      260ms            75ms      -71%
/rackets/[slug] TTFB      247ms           154ms      -38%
/rackets/[slug] total   1.64~2.19s     0.20~0.23s    약 9배
```

total 이 크게 준 건 Suspense 구간마다 서울↔버지니아 왕복이 붙어 있었기
때문이다. 참고로 §2 는 DB 쿼리 수를 바꾸지 않았고 `[slug]` 는 오히려 셸을
블로킹하게 만들어 TTFB 에 불리한데도 빨라졌으니, 개선분은 리전이 만든 것이다.

`X-Vercel-Id: icn1::icn1` 로 엣지·함수 모두 서울 실행을 확인했다.

### 4. 마켓플레이스 — 코드로 닫을 수 없는 항목

운영 DB 읽기 전용 조회 결과다.

```
partner_offers    (매장·코치·온라인)   0건
partner_leads     (연락·위치 클릭)     0건
partner_inquiries (입점 문의)          0건   ← 배너 노출 9일째
offers            (판매처 링크)        0건   ← 전 품목 "판매처 준비 중"
recommendation_runs                   10건 (전량 최근 30일)
```

C조각(주문·결제) 착수 게이트는 Chapter 15 에서 "리드가 쌓이면" 으로 잡았는데,
리드가 0 이고 진단 자체가 통산 10건이다. 병목은 코드가 아니라 **유입과 매장
섭외**다. 이 상태에서 결제를 붙이면 쓰는 사람이 없는 기능에 통신판매중개업
신고와 PG 계약을 얹게 된다.

**민호 결정 (2026-08-12): C조각 보류.** "판매가 시작될 때쯤 되면 그때 PG 사를
붙인다." 즉 착수 신호는 리드 건수가 아니라 **실제 판매 개시**다. Chapter 14
§6 의 미결 항목(Toss 가맹 명의, 파일럿 매장, 취소 정책 문안)도 그때까지 함께
보류한다. 설계 문서
(`docs/superpowers/specs/2026-08-03-marketplace-c-piece-design.md`)는 그대로
둔다 — 착수 시점에 다시 꺼내 쓴다.

### 검증
- 테스트 255 → 258 통과, typecheck·lint 통과, build 38/38
- 프로덕션 빌드 실측: 404 대상 5개 전부 404, 200 대상 10개 전부 200,
  alias 308 과 legacy `/racket/[id]` 308 유지
- Preview 실측: 상태 코드 동일, 신규 커스터마이저 200, `icn1::icn1` 확인

### 경계 및 상태
- `main` 에는 push 하지 않았다. 작업은 `fix/carryover-backlog` 브랜치에 있다.
- DB·migration·Omega 무변경. 조회는 전부 읽기 전용이었다.

### 다음 할 일
- 민호 승인 시 `main` 병합(= Production 배포). 병합 후 프로덕션에서
  `X-Vercel-Id` 와 TTFB 를 재측정한다.
- 마켓플레이스 C조각은 민호 결정으로 보류. 판매 개시 시점에 PG 를 붙인다.
- `/admin/offers` 판매처 링크 등록은 Chapter 7 부터 이월 중이며 여전히 0건이다.
  전 품목이 "판매처 준비 중" 이라 커머스 동선이 닫혀 있다 — C조각보다 먼저다.
- 카탈로그 표시: Tecnifibre T-Fight 300s/315s 와 TF40 290/315 는 도색이 같아
  제품 사진만으로 구분되지 않는다. 목록 카드에 무게·패턴을 눈에 띄게 병기하는
  안을 검토한다.

*마지막 업데이트: 2026-08-12*
