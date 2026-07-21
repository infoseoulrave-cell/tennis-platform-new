# Racket LAB Development Log

## Chapter 1 — Omega 기준 고정과 배포 경로 복구

### 목표
라이브 Omega 디자인을 변경하지 않는 기준점으로 고정하고, 최신 `main`에서만 별도 소유 Vercel 프로젝트로 배포할 수 있는 단일 작업 경로를 확립한다.

### 완료 내용
- 시각 기준은 `https://racketlab-omega.vercel.app/` 및 배포 ID `dpl_GmX79sYrsM78DpRFmLLnoktrtYXv`로 고정했으며, Omega는 수정·재배포 대상에서 제외했다.
- Git의 유일한 기준을 `infoseoulrave-cell/tennis-platform-new`의 `main`으로 정하고, 현재 작업을 `f5726b9` 위에서 진행했다.
- 홈 화면의 히어로, 인기 라켓 폴백, 선수 쇼케이스를 Omega 기준에 맞추면서 최신 수익화 기능은 유지했다.
- 배포 대상을 소유 프로젝트 `rachel-flower/racketlab`과 도메인 `racketlab-one.vercel.app`으로 분리했다.
- 자동화 테스트 61개 통과를 재확인했으며, 타입 검사·빌드 통과와 린트 오류 0건 및 리뷰어 `APPROVE` 결과를 확인했다.
- 재발 방지를 위한 기준·금지 경로·마이그레이션 규칙을 `CANONICAL.md`에 기록했다.

### 다음 할 일
- GitHub 인증을 복구한 뒤 변경 사항을 `main`에 커밋하고 푸시한다.
- Vercel Production 환경의 `DATABASE_URL`을 명시적으로 사용해 `0004_ambitious_unus.sql` 마이그레이션을 한 번 실행한다.
- 소유 프로젝트에 프리뷰 배포하고 Omega와 비교 검증한 뒤 `racketlab-one.vercel.app`에만 프로덕션 반영한다.
- 배포 후 `/admin/offers`에서 실제 어필리에이트 링크를 등록하고 동작을 확인한다.

*마지막 업데이트: 2026-07-21*
