# 테니스 플랫폼 재구축 설계

작성일: 2026-04-05
상태: 설계 확정

## 1. 배경

Paperclip AI가 만든 현재 구현은 "진단 → 추천" Q&A 도구에 불과하다.
원래 PRD는 한국 테니스 장비 특화 커머스형 콘텐츠 플랫폼이다.
기존 코드에서 DB 스키마, 시드 데이터, 추천 엔진은 살리고, UI와 페이지 구조를 전면 재구축한다.

## 2. 기술 스택 (유지)

- Next.js 15 (App Router)
- Drizzle ORM + PostgreSQL
- Tailwind CSS 4
- TypeScript

## 3. 비주얼 방향

**미니멀 프리미엄**
- 화이트/그레이 기반, 넉넉한 여백
- 타이포 중심, 이미지가 주인공
- 블랙(#111) 악센트, 과도한 색상 지양
- Apple/Aesop 계열의 절제된 고급감

## 4. 사이트맵

### 사용자 영역

| 경로 | 페이지 | 우선순위 |
|------|--------|---------|
| `/` | 홈 (에디토리얼형) | MVP |
| `/rackets` | 라켓 찾기 (필터/정렬/카드) | MVP |
| `/rackets/[slug]` | 라켓 상세 | MVP |
| `/recommendation` | AI 추천 시작 (설문) | MVP |
| `/recommendation/result` | AI 추천 결과 | MVP |
| `/compare` | 라켓 비교 | MVP |
| `/content` | 콘텐츠 목록 | 후순위 |
| `/content/[slug]` | 콘텐츠 상세 | 후순위 |
| `/sale` | 세일/신상품 | 후순위 |
| `/balls` | 테니스 공 | 후순위 |
| `/wearables` | 웨어러블 | 후순위 |

### 운영 영역 (기존 유지)

| 경로 | 페이지 |
|------|--------|
| `/admin` | 관리자 대시보드 |
| `/admin/catalog` | 라켓 카탈로그 관리 |
| `/admin/catalog/import` | 데이터 임포트 |
| `/admin/catalog/review` | 검수 큐 |

## 5. 페이지별 설계

### 5-1. 홈 (에디토리얼형)

**구조:**
1. 글로벌 내비게이션 (홈 / 라켓 찾기 / AI 추천 / 비교 / 콘텐츠)
2. 에디터 픽 히어로 — 피처 라켓 대형 이미지 + 5축 요약 + CTA
3. 두 경로 분기 카드 — "AI 추천 (3분 진단)" / "라켓 찾기 (직접 탐색)"
4. 성향별 큐레이션 — 입문자 추천 / 스핀 특화 / 팔 보호 / 파워형
5. 인기 라켓 캐러셀 — 브랜드별 인기 모델 카드
6. 브랜드 바로가기 — Wilson, Yonex, Head, Babolat, Dunlop, Prince, Tecnifibre
7. 최신 콘텐츠 피드 (후순위)
8. 푸터

### 5-2. 라켓 찾기 (`/rackets`)

**필터 사이드바:**
- 브랜드 (체크박스)
- 가격대 (슬라이더)
- 무게 범위
- 헤드사이즈 범위
- 5축 성향 필터 (직구력/컨트롤/스핀/충격흡수/안정감)
- 해석형 태그 (입문자 추천, 팔 편함, 스핀형 등)

**카드 리스트:**
- 모바일: 세로 카드, 강점 2개만 표시
- 데스크톱: 그리드 카드
- 각 카드: 썸네일 + 브랜드 + 모델명 + 가격 + 강점 태그 + 레이더 미니 차트
- 비교 담기 버튼
- 정렬: 인기순, 가격순, 직구력순, 컨트롤순 등

### 5-3. 라켓 상세 (`/rackets/[slug]`)

PRD `racket-detail-page-spec-ko.md` 기반.

**섹션 순서:**
1. 히어로 — 고화질 대표 이미지 + 갤러리 썸네일
2. 모델 정보 — 브랜드/시리즈/모델명 + 한 줄 총평 + 가격대 + 구매 CTA
3. 5축 해석 — **레이더 + 바 콤보** (왼쪽 오각형 차트 + 오른쪽 수평 바, 각 축에 짧은 설명)
4. 추천 대상 — 이런 플레이어에게 추천 / 추천되지 않는 경우 / 주의 포인트
5. AI 세팅 추천 — 추천 스트링 2~3개 + 장력 범위 + 그립 1~2개
6. 상세 스펙 — 무게, 밸런스, 헤드사이즈, 빔 두께, 패턴, 강성, 스윙웨이트
7. 판매처 — 판매처명 + 가격 + 할인 여부 + 구매 링크
8. 비슷한 라켓 — 같은 세그먼트 / 더 파워 / 더 컨트롤 대안
9. 관련 콘텐츠

### 5-4. AI 추천 (`/recommendation`)

기존 diagnosis 로직 재활용. UI만 미니멀 프리미엄 톤으로 교체.
- 한 화면 한 질문, 6~8문항
- 프로그레스 바
- 전문 용어 없이 직관적 표현
- 3분 이내 완료

### 5-5. 추천 결과 (`/recommendation/result`)

- 사용자 프로필 요약
- 추천 라켓 3~5개 (best_match, safe_choice, style_pick)
- 각 라켓: 추천 이유 + 주의 포인트 + 레이더 차트
- 스트링/그립 미리보기
- 비교 담기 → 비교 페이지 연결

### 5-6. 비교 (`/compare`)

- 최대 3개 라켓 비교
- 5축 레이더 차트 겹침 표시
- 스펙 비교표 (가로 스크롤)
- 추천 대상 차이
- 각 라켓 구매 링크

## 6. 공통 컴포넌트

| 컴포넌트 | 용도 |
|---------|------|
| `GlobalNav` | 상단 내비게이션 |
| `RacketCard` | 라켓 리스트/큐레이션 카드 |
| `RadarChart` | 5축 오각형 차트 (SVG) |
| `AxisBars` | 5축 수평 바 차트 |
| `RadarBarCombo` | 레이더 + 바 조합 뷰 |
| `ImageGallery` | 라켓 상세 이미지 갤러리 |
| `FilterSidebar` | 라켓 찾기 필터 패널 |
| `CompareSlot` | 비교 담기 플로팅 바 |
| `PriceTag` | 가격/판매처 표시 |
| `SegmentBadge` | 입문자/중급/상급/프로 태그 |
| `CurationStrip` | 홈 성향별 큐레이션 섹션 |

## 7. 기존 코드 활용 계획

### 유지 (그대로 사용)
- `src/db/schema/` — catalog, recommendation, partner, events 스키마
- `src/db/seed-rackets.ts` — 80개 라켓 시드 데이터
- `src/db/seed-aliases.ts` — 별칭 데이터
- `src/modules/recommendation/` — 스코어링 엔진, 설명 템플릿, 평가 하니스
- `src/modules/catalog/` — 인제스천, 검증, 템플릿
- `src/events/` — 이벤트 택소노미, 트래킹
- `src/db/migrations/` — 기존 마이그레이션
- `src/app/admin/` — 관리자 페이지들
- `src/app/api/admin/` — 관리자 API

### 재작성 (UI 전면 교체)
- `src/app/page.tsx` — 홈페이지 → 에디토리얼형
- `src/app/layout.tsx` — 글로벌 내비게이션 추가
- `src/app/diagnosis/` → `src/app/recommendation/` 으로 이동 + UI 교체
- `src/app/results/` → `src/app/recommendation/result/` 으로 이동 + UI 교체
- `src/app/compare/page.tsx` — 비교 페이지 UI 교체
- `src/app/racket/[id]/` → `src/app/rackets/[slug]/` 으로 변경 + 전면 교체
- `src/components/` — 전부 새 컴포넌트로 교체

### 신규 추가
- `src/app/rackets/page.tsx` — 라켓 찾기 (필터/정렬)
- `src/app/api/rackets/` — 라켓 목록/필터 API
- 공통 컴포넌트 전부 (위 표 참조)
- `src/app/globals.css` — 미니멀 프리미엄 디자인 토큰

### 삭제
- `src/app/partners/` — MVP에 불필요
- `src/app/api/partners/` — MVP에 불필요
- `src/lib/mock-data.ts` — 실제 DB 사용으로 불필요

## 8. 데이터 흐름

```
PostgreSQL (라켓 DB, 80+ 모델)
  ↓
Drizzle ORM
  ↓
Next.js API Routes (/api/rackets, /api/diagnosis, /api/recommendations)
  ↓
Server Components (RSC) + Client Components (필터, 차트 인터랙션)
  ↓
미니멀 프리미엄 UI
```

## 9. MVP 완료 기준

- [ ] 홈페이지: 에디터 픽 + 큐레이션 + 인기 라켓 + 브랜드
- [ ] 라켓 찾기: 필터/정렬/카드 리스트, 80개 라켓 탐색 가능
- [ ] 라켓 상세: 이미지 + 레이더/바 콤보 + 추천 대상 + 스펙 + 판매처
- [ ] AI 추천: 설문 → 결과 3~5개
- [ ] 비교: 최대 3개 라켓 5축 겹침 비교
- [ ] 글로벌 내비게이션
- [ ] 모바일 반응형
- [ ] Vercel 배포
