# Chapter 2 — Omega 기능 완성 및 canonical 배포

### 목표
Omega의 시각 정체성을 보존하면서 라켓 데이터 일관성, 스트링 판매 동선, 누락 경로와 접근성을 보완하고 소유한 canonical 환경에 안전하게 배포한다.

### 완료 내용
- 참조 전용 `https://racketlab-omega.vercel.app/`는 변경하지 않았으며 마지막 읽기 확인에서 HTTP 200을 확인했다.
- canonical Git을 `infoseoulrave-cell/tennis-platform-new`의 `main`으로 확정하고 기능 커밋 `2dbd67f`를 반영했다.
- 홈 히어로와 라켓 상세가 동일한 canonical 스탯을 사용하도록 통합해 화면별 수치 불일치를 제거했다.
- `/strings` 상점, 고정 offer key, `/admin/offers` 관리 동선을 추가하고 판매처 미등록 및 DB 오류 상태를 거짓 구매 정보 없이 분리했다.
- `/knowledge`, 브랜드 404, 유효한 대상에 연결되는 legacy 308 리디렉션을 추가하고 메뉴 경로의 404를 전수 점검했다.
- 검색 dialog·live status·요청 취소와 히어로 reduced-motion·hover/focus 정지를 적용해 키보드, 모바일, 모션 접근성을 보완했다.
- Supabase 마이그레이션 5개를 적용해 `offers`와 `partner_inquiries` 테이블을 확인하고, 전 환경의 `DATABASE_URL`을 transaction pooler 6543 연결로 검증했다.
- Vercel Git 연결을 이전 `tennis-platform`에서 canonical `tennis-platform-new`로 교체하고 프리뷰와 프로덕션 배포를 완료했다.
- 테스트 74개, 타입 검사, 29/29 빌드가 통과했으며 린트 오류 0건과 기존 비관련 경고 2건, 최종 리뷰 `APPROVE` 및 P0/P1/P2 0건을 확인했다.
- 프로덕션에서 핵심 경로 200, legacy 308 후 대상 200, 비로그인 관리자 307, 미등록 경로 404와 홈·상세 스탯 일치를 확인했다.

### 다음 할 일
- `/admin/offers`에 실제 어필리에이트 판매처 링크를 등록해 스트링 구매 위젯을 활성화한다.
- 과거 노출 이력이 있는 GitHub PAT를 폐기하고 새 토큰으로 재발급한다.

*마지막 업데이트: 2026-07-21*
