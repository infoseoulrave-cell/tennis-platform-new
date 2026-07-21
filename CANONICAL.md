# Racket LAB Canonical Reference

이 문서는 버전 혼선을 막기 위한 현재 운영 기준이다. 배포와 개발은 아래 대상에만 수행한다.

## 1. 참조 전용 Omega

- URL: `https://racketlab-omega.vercel.app/`
- 역할: 시각 디자인 비교용 기준
- 상태: 이번 작업에서 변경하거나 배포하지 않았으며 2026-07-21 마지막 읽기 확인은 HTTP 200이었다.
- 금지: 프로젝트 연결, 소스 변경, 재배포, 도메인 alias 변경

## 2. 유일한 Git source of truth

- 저장소: `https://github.com/infoseoulrave-cell/tennis-platform-new.git`
- 브랜치: `main`
- 기능 기준 커밋: `2dbd67f` (`complete Omega catalog and string storefront`)
- Vercel Git 연결도 기존 `tennis-platform`에서 이 저장소로 교체해 확인했다.
- 세션 시작 전 `git checkout main`과 `git pull`을 실행하고, 종료 시 커밋과 푸시를 완료한다.
- `redesign/omega-port`, `wip/recovery`, 이전 `tennis-platform` 저장소는 개발·배포 소스로 사용하지 않는다.

## 3. 유일한 Vercel 배포 대상

- 팀/프로젝트: `rachel-flower/racketlab`
- 프로덕션: `https://racketlab-one.vercel.app/`
- 프로덕션 배포 ID: `dpl_AqYWUxkx36ybLVXHyq3aNs7m7Pj3`
- 검증된 프리뷰: `https://racketlab-e80doc5jl-rachel-flower.vercel.app/`
- 배포는 프리뷰 검증 후 동일 배포를 프로덕션으로 승격하며 Omega에는 어떤 변경도 가하지 않는다.

## 4. 데이터베이스 기준

- Supabase 마이그레이션 5개가 적용됐으며 `offers`와 `partner_inquiries` 테이블이 존재한다.
- `DATABASE_URL`은 Supabase transaction pooler의 포트 6543 연결을 사용한다.
- Production, Preview, Development에서 동일한 pooler 연결을 확인했다.
- 이미 적용된 마이그레이션을 추정으로 재실행하지 말고 마이그레이션 상태를 먼저 조회한다.
- 환경 변수와 데이터베이스 비밀값은 문서, 로그, Git에 기록하지 않는다.

## 5. 제품 및 경로 불변식

- 홈 히어로와 `/rackets/[slug]` 상세는 동일한 canonical 라켓 데이터를 사용한다.
- 점수가 없는 라켓에는 숫자를 만들어 표시하지 않고 비수치 설명을 사용한다.
- 스트링 상품 offer key는 `string:<product-slug>` 형식을 사용하며 `/admin/offers`에서 실제 판매처를 관리한다.
- 판매처 미등록은 `판매처 준비 중`으로 표시하고, DB 장애는 별도의 불가 상태로 처리하며 가짜 가격이나 구매 버튼을 노출하지 않는다.
- `/strings`, `/knowledge`, 브랜드 404와 legacy 308 리디렉션은 유지한다.

## 6. 검증된 상태

- 자동화 테스트: 74/74 통과
- TypeScript typecheck: 통과
- ESLint: 오류 0건, 기존 비관련 경고 2건
- 프로덕션 build: 29/29 통과
- 코드 리뷰: `APPROVE`, P0/P1/P2 0건
- 프로덕션 smoke: 핵심 경로 200, legacy 308→대상 200, 비로그인 `/admin` 계열 307, 미등록 경로 404
- 데이터 일치: 홈과 상세의 spin `+1`, power `-1` 표시가 일치
- 스트링 판매 상태: 실제 offer 미등록으로 판매처 준비 중이며 가짜 구매 정보는 노출하지 않음

## 7. 운영 후속 작업

- `/admin/offers`에서 실제 어필리에이트 링크를 등록하고 `/strings`의 외부 이동을 확인한다.
- 과거 노출 이력이 있는 GitHub PAT를 폐기하고 새 토큰으로 교체한다.
