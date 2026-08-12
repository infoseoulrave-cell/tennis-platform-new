# Chapter 9 — 그립 오버레이 실물 정렬 및 회귀 잠금

### 목표
54개 라켓의 108개 뷰에서 그립 오버레이를 실제 그립 영역에 정렬한다.

### 완료 내용
- 샤프트, 마감 collar, 분리 그림자를 그립 판정에서 제외해 실제 그립 영역만 남겼다.
- flare-seeded 8-connected terminal 기준으로 경계를 결정해 라켓별 형태 차이를 일관되게 처리했다.
- geometry와 54개 grip SVG를 갱신하고 golden fixture SHA를 `3A2D788E6DB65996512B9B3C71A9A16EEA3D75E05BBC7EFC73F0EDFF1D5C782E`로 고정했다.
- 그립 정렬이 다시 어긋나는 변경을 차단하도록 regression test를 추가했다.

### 검증
- terminal 432행은 최대 오차 1.5px였고 100%가 2px 이내였다.
- full source gate는 `max p95=2 / min95.622` 기준을 통과했다.
- 전체 테스트 182/182, typecheck, lint, 37페이지 build를 통과했다.
- 데스크톱·모바일 rect delta는 모두 0이었고 reviewer 결과는 `APPROVE`다.

### 경계 및 상태
- string SVG, component, Omega, Git push, Vercel deploy, DB는 변경하지 않았다.

### 다음 할 일
- 사용자가 새 exact commit을 승인한 뒤에만 Preview 배포할 수 있다.
- Production과 Omega 변경은 각각 별도 승인이 있을 때만 진행한다.

*마지막 업데이트: 2026-07-24*
