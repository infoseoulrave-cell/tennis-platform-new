# 프로젝트 메모리

최종 갱신일: 2026-03-17

## 현재 프로젝트 정의

한국 시장을 타깃으로 한 온라인 기반 테니스 장비 웹앱 서비스를 기획 중이다.

핵심 방향

- 한국에서 실제 판매되는 테니스 라켓 DB 구축
- 플레이스타일 진단 기반 라켓 추천
- 고화질 이미지 중심의 상세 탐색 경험
- 공, 스트링, 웨어러블로 확장 가능한 구조
- 웹앱 우선 출시

## 지금까지 정리된 문서

- 기획서: `docs/planning/tennis-platform-prd-ko.md`
- MVP 백로그: `docs/planning/mvp-backlog-ko.md`
- 시장 리서치: `docs/research/market-research-notes-ko.md`
- DB/추천 설계: `docs/specs/racket-db-and-recommendation-plan-ko.md`
- 라켓 해석 프레임워크: `docs/specs/racket-interpretation-framework-ko.md`
- AI 라켓 스코어링 방법론: `docs/specs/ai-racket-scoring-methodology-ko.md`
- 5축 스코어링 기준서: `docs/specs/five-axis-scoring-rubric-ko.md`
- 웹앱 IA/사용자 흐름: `docs/planning/webapp-ia-and-user-flow-ko.md`
- 라켓 상세 페이지 명세: `docs/specs/racket-detail-page-spec-ko.md`
- DB 스키마 초안: `docs/specs/database-schema-draft-ko.md`
- AI 추천 설문 명세: `docs/specs/recommendation-questionnaire-spec-ko.md`
- 초기 데이터 소스 매트릭스: `docs/research/initial-racket-data-source-matrix-ko.md`

## 현재 핵심 판단

- 이 서비스의 차별점은 판매 채널 자체가 아니라 "장비 해석 + 추천 + 구매 연결"에 있다.
- 라켓의 직구력, 컨트롤, 충격흡수 등을 우리 언어로 점수화한 해석 체계가 핵심 제품 자산이다.
- 사용자 노출 라켓 점수는 직구력, 컨트롤, 스핀 잠재력, 충격흡수, 안정감의 5축으로 제한한다.
- 해석과 분류의 주체는 사람보다 AI이며, 사람은 데이터 QA와 예외 처리 역할로 제한한다.
- MVP 웹앱은 비로그인 상태에서도 탐색, 추천, 비교, 구매 연결이 가능해야 한다.
- 라켓 상세는 반드시 5축 점수, 주의 포인트, 스트링/그립 추천, 구매 CTA를 한 페이지에서 제공해야 한다.
- 추천 설문은 8문항 이내로 유지하고, 각 응답은 추천 엔진 가중치에 직접 연결되어야 한다.
- 라켓 DB는 공식몰, 전문몰, 쇼핑 API를 함께 쓰는 하이브리드 구조가 적합하다.
- 추천 기능은 초기에는 규칙 기반으로 시작하는 것이 가장 현실적이다.
- 웨어러블은 우선 상품 탐색/구매 연결까지만 포함하고, 실데이터 연동은 후속 단계가 적절하다.

## 다음 우선순위

1. 관리자 운영 플로우 설계
2. 첫 대표 라켓 샘플 세트 선정
3. 5축 AI 점수 예시 데이터 생성
4. 상세 페이지 와이어프레임 제작
5. 초기 데이터 수집 규칙서 작성
6. 브랜드별 공식 URL 확정

## 작업 방식 메모

- 앞으로 진행되는 기획안, 조사 메모, 결정 사항, 작업 로그는 모두 `docs/` 아래에 저장한다.
- 사용자가 다시 요청하면 이 메모와 관련 문서를 기준으로 이어서 작업한다.
