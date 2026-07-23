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
- 기능 검증·수동 승격 배포 ID: `dpl_AqYWUxkx36ybLVXHyq3aNs7m7Pj3`
- 검증된 프리뷰: `https://racketlab-e80doc5jl-rachel-flower.vercel.app/`
- 배포는 프리뷰 검증 후 동일 배포를 프로덕션으로 승격하며 Omega에는 어떤 변경도 가하지 않는다.
- `main` push마다 새 Production ID가 생성되므로 최신 ID는 `vercel ls`/`vercel inspect`로 확인하고 문서의 ID를 불변 기준으로 사용하지 않는다.

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

## 8. 2026-07-23 LOCAL/PREVIEW 후보 상태

이 절은 검증된 다음 후보를 기록하며 프로덕션 반영 완료를 뜻하지 않는다.

- Omega URL `https://racketlab-omega.vercel.app/`와 배포 ID `dpl_GmX79sYrsM78DpRFmLLnoktrtYXv`는 불변이며 이번 후보에서 건드리지 않았다.
- canonical Git은 `https://github.com/infoseoulrave-cell/tennis-platform-new.git`의 `main`이다.
- 후보 커밋 `073ed40032d4bf45b13a1e5be1c66245ad4b83c4`는 로컬에만 있고 아직 원격에 푸시하지 않았다.
- canonical Vercel 대상은 프로젝트 `prj_wPzKAFzr9oLIrMfLMRBDdJukdMi7`, 팀 `team_B761Aj9bfMMOo5L3FJIVAMU3`, 프로덕션 alias `https://racketlab-one.vercel.app/`이다.
- 최종 프리뷰는 `https://racketlab-n35r2x6jj-rachel-flower.vercel.app/`이며 배포 ID `dpl_FPbxRqKh9MwUbuZaMg7E9NR4yo3z`가 `READY`임을 확인했다.
- 현재 후보는 Git push, 프로덕션 배포, DB `--apply`를 수행하지 않았으며 세 작업 모두 명시적 사용자 승인을 기다린다.

### 라켓 데이터 불변식

- 공개 점수는 항상 `10.0..15.0`이며 raw v3 `0..100`을 `10 + raw / 20`으로 표시한다.
- 활성 한국 라켓 정체성은 정확히 39개이며 각 라켓은 제조사와 Tennis Warehouse 출처를 하나씩 가져 총 78개 출처를 이룬다.
- 정규화 결정은 273개, v3 점수는 5축 × 39개인 195개다.
- 제조사 출처는 언스트링 정적 스펙을, Tennis Warehouse 출처는 스트링 상태의 swing weight와 stiffness RA를 담당한다.
- 정체성 교정 2건은 canonical 백필에 포함하며 기존 이름은 검색 호환을 위한 alias로 보존한다.
- 이전 카탈로그 mutator는 실행하지 않고 `scripts/backfill-racket-evidence.ts`만 기본 dry-run 후 정확한 `--apply`로 사용한다.
- 은퇴한 중복 라켓은 active-only 상세 가드로 공개 상세에 노출하지 않는다.

### 검증 및 승인 후 실행 순서

- 현재 검증은 테스트 111/111, typecheck 통과, 린트 오류 0건, 29페이지 build 통과, diff-check 통과다.
- 데스크톱·모바일의 목록·상세·비교·가이드에서 오버플로와 콘솔 오류가 없고, 이미지 프레임은 순백 배경으로 통일했으며 불필요한 흰 사각 테두리 아티팩트가 없음을 확인했다.
- DB dry-run 결과는 mutation 0이며 `--apply`는 실행하지 않았다.
- 승인 후 로컬 커밋을 canonical `main`에 푸시하고 최종 프리뷰와 동일한 소스인지 확인한 뒤 canonical 프로젝트에만 프로덕션 반영한다.
- 승인 후 백필을 정확한 `--apply`로 한 번 실행하며, 트랜잭션 내부 post-apply 검증이 출처 78개, 결정 273개, 축 정의 5개, v3 점수 195개와 일치해야 한다.
- 적용 후 프로덕션 목록·상세·비교·가이드, 공개 점수 범위, 은퇴 중복 차단, DB 집계와 Omega 무변경 상태를 다시 검증한다.
- 후속 P2는 은퇴 중복 데이터의 DB·관리자 수집 처리와 미래 후보의 evidence role 강제다.
