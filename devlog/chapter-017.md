# Chapter 17 — Dunlop/Prince/Tecnifibre 16종 재활성화 (54 → 70)

### 목표
민호 지시로 폐기 저장소(`~/tennis-platform-app`)에서 검증한 17종
(Dunlop 5·Prince 5·Tecnifibre 7)을 canonical 카탈로그로 포팅한다.

### 조사 결과
- 17종 전부 canonical DB에 `discontinued=true` 로 이미 존재했다 (published
  strung 스펙·KR variant·이미지 포함, v2 점수만 있고 v3 없음). 신규 삽입이
  아니라 **재활성화 + 캐노니컬 기준 재정규화** 작업이다.
- `TF40 305 16x19` 는 활성 `TF-40 305 2024` 와 동일 제품(TW 코드 TF40R1)이라
  제외 → **16종**.
- 활성 54종의 스펙 기준은 제조사 unstrung 정적 필드 + TW 실측 SW/RA. 16종의
  기존 strung 스펙을 같은 기준으로 재정규화했다.

### 완료 내용
- `src/data/racket-catalog-reactivation-2026-08.ts` — 매니페스트
  (`racket-catalog-reactivation-2026-08-06-v1`). 제조사 페이지 검증:
  Dunlop 5종 us.dunlopsports.com 라이브, Tecnifibre 6종
  tecnifibre.com/b2b.tecnifibre.com 라이브, Prince 는 공식 스토어 폐쇄로
  Phantom 100X/100P·Tour 100 은 web.archive.org 의 공식 페이지 스냅샷.
  Ripstick 98/100 은 해당 세대의 제조사 페이지가 존재하지 않아 TW 단일
  소스(총 소스 30 = 14×2 + 2×1).
- `scripts/reactivate-rackets-2026-08.ts` — expand-racket-catalog 패턴의
  가드 스크립트 (dry-run 기본, `RACKETLAB_CATALOG_REACTIVATION_APPROVAL`
  승인 필수, advisory lock 트랜잭션, after-verify 70 미달 시 롤백).
  주의: pooler(6543)에서 postgres.js 병렬 쿼리 파이프라인이 멈추므로
  preflight 쿼리는 순차 실행한다.
- `src/lib/racket-images.ts` — TW 코드→슬러그 허용목록 16종 추가.
- `tests/racket-catalog-reactivation.test.ts` 신설 + legacy mutator 인벤토리에
  canonical 가드 예외 추가. 테스트 255/255, typecheck·lint 통과.
- 신규 라켓은 커스터마이저 사진·컬러웨이 산출물이 없어도 스키매틱/기본
  도색으로 안전 폴백함을 확인.

### 반영 결과 (2026-08-06)
- `--apply` 실행 완료: `APPLIED atomically: 16 models reactivated, 30 sources,
  128 decisions, 80 v3 scores; 70 active KR rackets.`
- 라이브 스모크: `/rackets` 200 · 총 70종 표기, 신규 상세 5종 표본 200,
  unstrung 스펙(310g/95in²)·v3 점수 렌더·TW 이미지 허용목록 통과 확인.

### 다음 할 일
- 커스터마이저 사진 생성 스크립트 재실행 (54 → 70). GPU 작업이라 별도 세션.
- 폐기 저장소의 후속 커밋(a8e9859)은 참고용 — 운영 반영은 이 저장소 기준.

*마지막 업데이트: 2026-08-06*
