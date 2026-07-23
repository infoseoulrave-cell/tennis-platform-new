# 의사결정 로그

## 2026-03-17

### 결정 1. 문서는 모두 로컬 폴더에 누적 저장한다

- 이유: 언제든지 같은 지점에서 재개할 수 있어야 하기 때문
- 반영 위치: `docs/README.md`, `docs/project-memory.md`, `docs/logs/session-log.md`

### 결정 2. 서비스의 핵심 차별점은 라켓 해석 체계다

- 이유: 한국 시장에는 판매 채널은 이미 많지만, 라켓을 우리 언어로 읽어주는 서비스는 부족하기 때문
- 핵심 요소: 직구력, 컨트롤, 충격흡수, 스핀 잠재력, 안정감, 조작성, 관용성
- 반영 위치: `docs/specs/racket-interpretation-framework-ko.md`

### 결정 3. 라켓 추천은 액세서리 추천과 함께 설계한다

- 이유: 라켓 단독보다 스트링과 그립 조합까지 제안할 때 설득력과 객단가가 함께 올라가기 때문
- 반영 위치: `docs/specs/racket-interpretation-framework-ko.md`, `docs/specs/racket-db-and-recommendation-plan-ko.md`

### 결정 4. 고화질 사진은 핵심 신뢰 요소다

- 이유: 장비 플랫폼은 시각적 품질이 곧 전문성과 전환율에 영향을 주기 때문
- 반영 위치: `docs/specs/racket-interpretation-framework-ko.md`

### 결정 5. 라켓의 해석과 분류는 AI 중심으로 설계한다

- 이유: 객관성과 일관성을 높이기 위해 사람의 주관 태그보다 정규화된 DB와 명시적 계산 기준이 더 중요하기 때문
- 사람의 역할: 데이터 QA, 예외 처리, 라이선스 확인
- 반영 위치: `docs/specs/ai-racket-scoring-methodology-ko.md`

### 결정 6. 사용자 노출 점수는 5개 축만 사용한다

- 항목: 직구력, 컨트롤, 스핀 잠재력, 충격흡수, 안정감
- 이유: 사용자 이해도를 높이고, 중복 항목과 과한 세분화를 피하기 위해
- 보조 신호: 조작성, 관용성 등은 내부 추천용으로만 유지 가능
- 반영 위치: `docs/specs/racket-interpretation-framework-ko.md`, `docs/specs/ai-racket-scoring-methodology-ko.md`

### 결정 7. MVP 웹앱은 비로그인 탐색 우선으로 설계한다

- 이유: 첫 방문 사용자가 바로 추천과 탐색을 경험해야 진입장벽이 낮아지기 때문
- 로그인 없이 가능한 범위: 탐색, 비교, 추천, 판매처 이동
- 반영 위치: `docs/planning/webapp-ia-and-user-flow-ko.md`

### 결정 8. 라켓 상세는 구매 전환형 페이지로 설계한다

- 이유: 상세 페이지가 해석, 설득, 액세서리 추천, 구매 연결의 중심 허브가 되기 때문
- 필수 요소: 5축 점수, 한 줄 총평, 주의 포인트, 추천 스트링, 추천 그립, 판매처 CTA
- 반영 위치: `docs/specs/racket-detail-page-spec-ko.md`

### 결정 9. 추천 설문은 8문항 이내로 유지한다

- 이유: 완주율을 높이고 모바일에서 피로도를 줄이기 위해
- 조건: 모든 응답은 추천 엔진의 필터 또는 가중치에 직접 연결되어야 한다
- 반영 위치: `docs/specs/recommendation-questionnaire-spec-ko.md`

### 결정 10. MVP DB는 라켓 중심 정규화 구조로 시작한다

- 이유: 점수 계산, 가격 오퍼, 이미지, 액세서리 연결을 안정적으로 관리하기 위해
- 핵심 테이블: `rackets`, `racket_specs`, `racket_scores`, `gear_pairings`, `offers`, `media_assets`
- 반영 위치: `docs/specs/database-schema-draft-ko.md`

### 결정 11. 공개 점수 명칭과 정수 척도를 현행 UI 계약으로 통일한다

- 날짜: 2026-07-24
- 현행 공개 축: 파워, 컨트롤, 스핀, 편안함, 안정성
- 현행 표시: 각 축 정수 `N/5`, 다섯 축 합계 정수 `N/15`, 총점 범위 `10~15`, 소수점 없음
- 내부 계약: raw v3 `0~100`은 보존해 정렬·추천에 사용하고, 공개 축은 bounded projection과 deterministic largest-remainder로 합계 불변식을 맞춘다.
- 효력: 결정 2와 결정 6의 과거 명칭 및 이전 공개 척도 설명을 대체하며 과거 항목은 의사결정 이력으로만 보존한다.
- 반영 위치: `CANONICAL.md`, `docs/project-memory.md`, 활성 scoring·detail·recommendation·PRD 문서
