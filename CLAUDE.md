# racketlab (tennis-platform-new)

Next.js 16 라켓 추천 플랫폼. `main` push = 즉시 프로덕션 배포
(Vercel `rachel-flower/racketlab` → racketlab-one.vercel.app, 리전 icn1).

## 브랜치·병합 정책 (수동 개입 없는 병합을 위한 규칙)

1. **브랜치는 항상 `main`에서 분기한다.** 다른 feature 브랜치 위에 쌓지 않는다
   (스택 브랜치는 병합 순서 의존성과 base 관리 수동 작업을 만든다).
   선행 브랜치의 코드가 필요하면 그 PR을 먼저 병합한 뒤 main에서 분기한다.
2. **GitHub 계정은 `infoseoulrave-cell`을 쓴다.** 이 저장소의 소유자이며 유일하게
   push/admin 권한이 있다. gh 작업 전 `gh auth status`로 활성 계정을 확인하고,
   다르면 `gh auth switch -u infoseoulrave-cell`. git push 자격증명은 credential
   helper로 이미 이 계정에 고정돼 있다.
3. **병합 절차**: PR 생성 → CI(test·typecheck·lint) 초록 + Vercel Preview 성공
   확인 → `gh pr merge <n> --merge --delete-branch`. CI에 build가 없는 이유는
   Vercel이 PR마다 preview build를 돌리기 때문이다 — preview 실패 = build 실패.
4. **main 병합 전 로컬에서 `npm test && npm run typecheck && npm run lint &&
   npm run build`를 돌린 브랜치만 PR을 올린다.**

## 개발일지 (DEVLOG)

- 챕터는 `devlog/chapter-NNN.md`에 **파일 하나당 한 챕터**로 쓴다.
  `DEVLOG.md`는 인덱스만 유지하며, 새 챕터를 만들면 인덱스 끝에 한 줄 추가한다.
- 이 구조는 병렬 브랜치 간 병합 충돌을 없애기 위한 것이다. 챕터 본문을
  `DEVLOG.md`에 직접 이어 쓰지 않는다. 인덱스 줄 충돌은 `.gitattributes`의
  `merge=union`이 흡수한다.
- 현재 상태 파악은 번호가 가장 큰 챕터 파일부터 읽는다.

## 검증 명령

```
npm test          # node --test (tests/*.test.ts, *.test.tsx)
npm run typecheck # tsc --noEmit
npm run lint      # eslint .
npm run build     # next build
```
