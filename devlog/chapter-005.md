# Chapter 5 — v3 읽기 폴백과 최종 프리뷰 검증

### 목표
DB 백필 전에도 정확한 라켓 점수를 읽을 수 있는 보수적 폴백을 확립하고, 정수 점수·선수 콘텐츠·주요 경로를 최종 프리뷰에서 전수 검증한다.

### 완료 내용
- 로컬 `main` 기능 커밋은 `c48119e`이며, 기능 커밋 시점에 `origin/main`보다 3개 커밋 앞서 있지만 아직 푸시하지 않았다.
- 점수 읽기 우선순위를 `persisted v3 > reliable DB spec > exact brand/model/year evidence manifest > null`로 고정했다.
- 축 순서 `[파워, 컨트롤, 스핀, 편안함, 안정성]` 기준 HEAD Speed Pro 2026은 `[3,3,1,3,3]`, Speed MP 2026은 `[3,2,2,3,3]`, Speed MP L 2026은 `[3,2,3,3,2]`이며 모두 총점 `13/15`임을 확인했다.
- 최종 프리뷰 `https://racketlab-einla3sf2-rachel-flower.vercel.app/`의 배포 ID `dpl_AZ7bsuMJuzidWcxUtASU68QSjT8g`가 대상 `Preview`, 상태 `Ready`임을 확인했다.
- 브라우저에서 활성 라켓 39종의 195개 공개 축이 모두 유효함을 확인했다.
- 선수 20명의 이미지와 기능 문구, 검증일 `2026-07-24`, 기존 메모 0건을 확인했다.
- `/strings`, `/knowledge`, `/partners`, `/guide/strings`가 404 없이 열리고 모바일 오버플로가 없음을 확인했다.
- 브라우저 콘솔 warning과 error가 각각 0건임을 확인했다.
- 테스트 124/124, typecheck, lint, build 29/29와 코드 diff-check를 통과했으며 리뷰 결과는 `APPROVE`다.
- Omega, 운영 alias `https://racketlab-one.vercel.app/`, DB는 변경하지 않았다.

### 다음 할 일
- 명시적 사용자 승인 전에는 로컬 커밋을 push하지 않고, 백필 `--apply`와 Production 배포를 실행하지 않는다.
- 승인 후에는 canonical `main`, DB 적용 결과, Production 경로와 점수 불변식을 다시 검증한다.

*마지막 업데이트: 2026-07-24*
