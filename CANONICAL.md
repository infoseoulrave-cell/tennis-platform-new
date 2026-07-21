# Racket LAB Canonical Reference

이 문서는 버전 혼선을 막기 위한 운영 기준이다. 아래 규칙은 배포 전에 반드시 확인한다.

## 1. 변경 금지 시각 기준

- 기준 URL: `https://racketlab-omega.vercel.app/`
- 확인된 배포 ID: `dpl_GmX79sYrsM78DpRFmLLnoktrtYXv`
- Omega는 디자인 비교용 기준이며 수정, 재배포, 프로젝트 연결, 도메인 alias 변경을 하지 않는다.

## 2. 유일한 Git source of truth

- 저장소: `https://github.com/infoseoulrave-cell/tennis-platform-new.git`
- 브랜치: `main`
- 현재 작업 기준: `f5726b9` 위 변경
- 세션 시작 전 `git checkout main` 후 `git pull`을 실행하고, 작업 종료 시 커밋과 푸시를 완료한다.

## 3. 유일한 배포 대상

- Vercel 팀/프로젝트: `rachel-flower/racketlab`
- 프로덕션 도메인: `https://racketlab-one.vercel.app/`
- 배포는 이 프로젝트에만 수행하며 Omega에는 어떤 변경도 가하지 않는다.

## 4. 배포 금지 소스

- `redesign/omega-port` 브랜치
- `wip/recovery` 브랜치
- 비공개 `tennis-platform.git` 저장소 또는 그 저장소에서 파생된 디렉터리

## 5. DB 마이그레이션 규칙

- 대상: `src/db/migrations/0004_ambitious_unus.sql`
- Vercel Production 환경의 `DATABASE_URL`을 명시적으로 주입한 상태에서 `npm run db:migrate`를 한 번만 실행한다.
- 개발 DB나 추정한 연결 문자열로 실행하지 않으며, 성공 여부를 확인한 뒤 재실행하지 않는다.

## 6. 검증 기준

- 자동화 테스트: 61개 통과
- TypeScript typecheck: 통과
- ESLint: 오류 0건
- 프로덕션 build: 통과
- 코드 리뷰: `APPROVE`

## 7. 현재 대기 상태

- GitHub 인증 복구 및 커밋·푸시: 대기 중
- Production DB 마이그레이션: 미실행
- Vercel 프리뷰 및 프로덕션 배포: 미실행
