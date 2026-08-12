# Chapter 3 — 라켓 근거 데이터와 고정 공개 점수 체계 준비

### 목표
Omega를 건드리지 않고 canonical `main`의 라켓 정체성·스펙·점수 근거를 정리해, 프로덕션 반영 전 검증 가능한 로컬 및 프리뷰 후보를 완성한다.

### 완료 내용
- Omega `https://racketlab-omega.vercel.app/`와 배포 ID `dpl_GmX79sYrsM78DpRFmLLnoktrtYXv`는 변경하지 않았다.
- canonical 저장소 `infoseoulrave-cell/tennis-platform-new`의 `main`에서 로컬 커밋 `073ed40032d4bf45b13a1e5be1c66245ad4b83c4`를 만들었으나 아직 푸시하지 않았다.
- raw v3 점수 `0..100`을 내부에 보존하는 기반을 준비했으며 공개 표시 계약은 Chapter 4의 정수 투영 규칙을 따른다.
- 활성 한국 라켓 39개에 대해 근거 출처 78개, 정규화 결정 273개, 5축 점수 195개를 결정론적으로 준비했다.
- 제조사 자료는 언스트링 정적 스펙, Tennis Warehouse 자료는 스트링 상태의 SW·RA 근거로 역할을 분리하고 정체성 오류 2건을 교정 대상으로 확정했다.
- 이전 카탈로그 변경 스크립트를 비활성화하고, 은퇴한 중복 라켓은 active-only 상세 가드로 공개 상세에서 제외했다.
- 최종 프리뷰 `https://racketlab-n35r2x6jj-rachel-flower.vercel.app/`의 배포 ID `dpl_FPbxRqKh9MwUbuZaMg7E9NR4yo3z`가 `READY`임을 확인했다.
- 테스트 111/111, 타입 검사, 린트 오류 0건, 29페이지 빌드와 diff-check를 통과했다.
- 데스크톱·모바일 브라우저에서 목록·상세·비교·가이드를 검증했으며 오버플로와 콘솔 오류가 없고, 이미지 프레임은 순백 배경으로 통일했으며 불필요한 흰 사각 테두리 아티팩트가 없음을 확인했다.
- 보호된 DB 백필 dry-run은 mutation 0으로 종료했으며 실제 변경 플래그 `--apply`는 실행하지 않았다.

### 다음 할 일
- 사용자 승인 후 로컬 커밋을 `main`에 푸시하고 canonical Vercel 프로젝트에만 프로덕션 반영한다.
- 사용자 승인 후 보호된 백필을 정확한 `--apply` 플래그로 한 번 실행하고 78개 출처, 273개 결정, 5개 축, 195개 v3 점수를 트랜잭션 내에서 재검증한다.
- 반영 뒤 프로덕션의 목록·상세·비교·가이드와 축별 `N/5`·총 `N/15` 정수 표시, active-only 가드, Omega 무변경 상태를 다시 확인한다.
- 후속 P2로 은퇴 중복 데이터의 DB·관리자 수집 정책과 향후 후보 라켓의 evidence role 강제를 정리한다.

*마지막 업데이트: 2026-07-23*
