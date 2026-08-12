# Chapter 21 — 병합 자동화: DEVLOG 분할 · CI · 브랜치 정책

### 목표
"병합할 때마다 수동 개입"을 구조적으로 없앤다. 지난 세션의 병목 네 가지 —
DEVLOG.md 충돌, 스택 브랜치 순서 의존성, PR 자동 검증 부재, gh 계정 혼선 —
를 각각 원인 단위로 제거한다.

### 완료 내용
- **이월 PR 3건 병합·배포**: #1(Ch.18 탭바 아이콘) → #2(Ch.20 홈 개편) →
  #3(Ch.19 이월 과제)을 로컬에서 순서대로 병합. DEVLOG 충돌은 양쪽 챕터를
  모두 보존해 해결(Ch.18→20→19 순). 병합본 검증: 테스트 271/271,
  typecheck·lint·build 전부 통과 후 `main` push(92c5f79).
  #2는 base가 스택 브랜치(feat/tab-bar-icons)라 GitHub이 merged 로 전환하지
  못해 코멘트와 함께 수동 close. 브랜치 3개 원격·로컬 삭제.
- **DEVLOG 분할**: 챕터 20개를 `devlog/chapter-001..020.md`로 분리.
  `DEVLOG.md`는 인덱스로 축소. 브랜치마다 새 파일을 만들므로 챕터 본문
  충돌이 구조적으로 불가능해졌다.
- **`.gitattributes` `DEVLOG.md merge=union`**: 인덱스 한 줄 추가끼리의
  충돌을 흡수. 스크래치 저장소에서 양쪽 append 가 충돌 없이 합쳐지는 것 검증.
- **CI 추가** (`.github/workflows/ci.yml`): PR·main push 마다
  test + typecheck + lint. build 는 Vercel Preview 가 담당.
- **CLAUDE.md 신설**: main 에서만 분기(스택 금지), gh 계정
  `infoseoulrave-cell` 고정, 병합 절차(CI+Preview 초록 → `gh pr merge`) 명문화.

### 검증
- 테스트 271/271, typecheck, lint, build 전부 통과 (병합본 기준)
- merge=union 동작을 실제 병합 시나리오로 재현 검증
- typecheck 에서 stale `.next/types` 에러가 한 번 났으나 build 재생성 후
  통과 — 로컬에서 라우트 파일을 옮긴 직후엔 build → typecheck 순서로 돌 것

### 다음 할 일
- 홈 잔여 크리틱 3건: 프로 선수 면책 문구 9회 반복 축소(효과 대비 최저 비용),
  네 섹션 동일 틀 질감, 잔여 이모지(🐄⚖️🔬 등·히어로 ⚡) 교체
- 프로덕션 icn1 리전 반영 확인 및 노치 아이폰 가로 모드 실기기 확인

*마지막 업데이트: 2026-08-12*
