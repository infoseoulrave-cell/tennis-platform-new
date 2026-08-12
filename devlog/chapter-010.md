# Chapter 10 — 라켓 색상 시뮬레이터 전용 페이지 분리

### 목표
라켓 상세의 정보 흐름을 가볍게 유지하면서 스트링·그립 색상 시뮬레이션을 별도 페이지에서 안정적으로 제공한다.

### 완료 내용
- 상세 페이지의 인라인 시뮬레이터를 top-level `/customizer/[slug]` 전용 경로로 옮겨 상위 loading boundary의 스트리밍 응답이 HTTP 상태를 흐리지 않게 했다.
- 정확한 커스터마이저 프로필이 있는 라켓 상세에만 전용 페이지 CTA를 표시해 지원하지 않는 조합은 fail-closed로 처리했다.
- canonical alias는 지원되는 canonical 경로로 308 응답하고, 미지원 slug와 기존 중첩 주소는 404를 반환하도록 경로 해석을 분리했다.
- 전용 error boundary에 재시도와 라켓 목록 복귀 동선을 추가해 데이터 로드 실패를 빈 화면으로 남기지 않게 했다.
- 캐시·하이드레이션 시점에도 이미지 객체 ref와 load/error/poll guard로 readiness를 판정해 색상 컨트롤이 준비 상태에 멈추지 않게 했다.

### 검증
- 데스크톱과 모바일에서 스트링 8색·그립 8색, 초기화와 선택 상태, 가로 오버플로 부재를 확인했다.
- 전체 테스트 192/192, typecheck, lint, production build, diff-check를 통과했다.
- canonical 경로 200, alias 308, 미지원·구주소 404를 실제 HTTP 응답으로 확인했다.

### 경계 및 상태
- Git push, Vercel 배포, DB 및 migration, Omega 사이트 변경은 수행하지 않았다.

### 다음 할 일
- 사용자의 별도 승인 후 canonical Vercel 프로젝트에 Preview로 배포하고 실제 배포 환경에서 최종 검수한다.

*마지막 업데이트: 2026-07-25*
