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

## Chapter 2 — Omega 기능 완성 및 canonical 배포

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

## Chapter 3 — 라켓 근거 데이터와 고정 공개 점수 체계 준비

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

## Chapter 4 — 정수 공개 점수 계약과 선수 콘텐츠 정밀화

### 목표
내부 v3 점수의 해상도는 보존하면서 공개 5축과 총점의 관계를 정수로 명확히 만들고, 선수 사진·장비·기능성 카피의 신뢰성을 높인다.

### 완료 내용
- 내부 raw v3 5축은 각각 `0..100`으로 보존하고 정렬·추천이 이 값을 계속 사용하도록 공개 표시와 분리했다.
- 공개 5축을 각각 정수 `0..5`로 고정하고 raw 합으로 목표 총점 `round(10 + rawSum / 100)`을 계산해 정수 `10..15`를 보장했다.
- bounded projection과 deterministic largest-remainder를 적용해 공개 5축 정수의 합이 목표 총점과 정확히 일치하도록 했다.
- 동률 배분은 remainder 내림차순, raw 내림차순, canonical 축 순서로 고정해 같은 입력이 항상 같은 결과를 내도록 했다.
- 모든 공개 UI를 축 `N/5`, 총 `N/15`, 소수점 없음으로 통일했다.
- Wikimedia Commons 선수 사진을 안정적인 `250px` 썸네일로 정규화하고 출처·크레딧·라이선스 메타데이터를 유지했다.
- 공개 선수 20명의 카피를 플레이 스타일과 시판 라켓 line을 연결하는 기능성 두 문장으로 정리했다.
- 최신 공식 출처를 기준으로 선수 장비 line을 정밀화하고 프로 사용 장비와 시판 line의 관계를 명시했다.
- 코드 기준 테스트 120/120, typecheck, lint, build 29/29와 diff-check를 통과했다.

### 다음 할 일
- 현재 변경은 `로컬 미커밋`이며 프로덕션과 DB에는 미반영이고 새 프리뷰 검증 예정이다.
- 새 프리뷰에서 데스크톱·모바일 목록·상세·비교·가이드·선수 카드의 정수 점수, 총합, 사진과 line 연결을 확인한다.
- 사용자 승인 전에는 Git push, 프로덕션 배포, DB 적용을 수행하지 않는다.
- Omega URL과 배포 ID는 불변 상태로 유지한다.

*마지막 업데이트: 2026-07-24*

## Chapter 5 — v3 읽기 폴백과 최종 프리뷰 검증

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

## Chapter 6 — 카탈로그 확장·성능 최적화와 통합 프리뷰 검증

### 목표
페이지 전환 지연을 줄이면서 라켓과 스트링 카탈로그의 범위·근거·궁합 추천 품질을 높이고, 운영 반영 전 안전한 프리뷰에서 통합 검증한다.

### 완료 내용
- 스트리밍·캐시·이미지 최적화와 외부 폰트 제거를 적용해 페이지 전환과 초기 자산 부담을 줄였다.
- 스트링 카탈로그를 제조사 공식 근거가 있는 24종으로 확장하고, 제품 사실과 편집 장력 방법론을 분리해 표시했다.
- 라켓 스펙과 5축 점수를 함께 사용하는 공유 궁합 엔진을 도입하고, 근거 부족 시 추천하지 않는 fail-closed 정책과 팔 보호 조건의 폴리에스터 제외 안전 게이트를 적용했다.
- 공식 제조사와 Tennis Warehouse 근거로 라켓 15종을 추가 준비해 활성 카탈로그 목표를 39종에서 54종으로 설정했지만 canonical DB에는 적용하지 않았다.
- 테스트 147/147, typecheck, lint, build를 모두 통과했다.
- 인앱 브라우저 한 차례 측정에서 홈→라켓 전환은 501ms였고, 스트링 카드 24개와 최적화 이미지, 콘솔 warning/error 각 0건을 확인했다.
- 이전 404 대상 5개 경로가 각각 유효한 H1과 함께 렌더링되는 것을 확인했다.
- 프리뷰 `https://racketlab-1sk0fqne6-rachel-flower.vercel.app`의 배포 ID `dpl_AZpyYKhcsTvTso18osFkUbZgWQpN`가 `READY`임을 확인했다.
- 로컬 기능 커밋은 `48d9c03`이며, Omega 프로덕션, canonical 운영 alias, GitHub 원격 저장소, canonical DB는 변경하지 않았다.

### 다음 할 일
- 사용자가 정확히 `canonical 운영 반영 승인`이라고 승인하기 전에는 Git push, 라켓 카탈로그 DB 적용, Production 배포를 실행하지 않는다.
- 승인 후 canonical `main`과 DB 적용 결과를 검증한 다음 운영 alias만 배포하고 Omega 불변 상태를 재확인한다.

*마지막 업데이트: 2026-07-24*

## Chapter 7 — canonical 운영 반영과 54종 카탈로그 공개

### 목표
사용자의 명시적 승인을 근거로 검증된 성능·카탈로그 변경을 canonical Git, DB, Vercel Production에 안전하게 반영하고 Omega 불변성을 확인한다.

### 완료 내용
- 사용자가 정확히 `canonical 운영 반영 승인`이라고 승인한 뒤 `git checkout main`과 `git pull`을 수행했다.
- 기능 커밋 `6f43be9`와 환경변수 로더 수정 커밋 `698f256`을 push했으며 최종 `HEAD=origin/main`이고 작업 트리는 깨끗하다.
- 전체 사전 검증은 테스트 147/147을 통과했고 환경변수 회귀 테스트 추가 후 148/148, typecheck, lint, 37페이지 build를 모두 통과했다.
- 기존 라켓 DB 백필을 원자적으로 적용해 출처 78개, 결정 273개, 5개 축, v3 점수 195개를 반영했으며 적용 후 dry-run의 수정 대상은 0개다.
- 라켓 확장을 원자적으로 적용해 모델 15종, 출처 30개, 결정 120개, v3 점수 75개를 추가했고 활성 카탈로그는 54종이 됐다.
- 첫 확장 적용 시 프로세스 전용 승인 환경변수가 전달되지 않아 카탈로그 쓰기 0건으로 안전하게 거부됐고, 로더를 수정한 뒤 리뷰 결과 `APPROVE`를 확인하고 재적용했다.
- 커밋 `698f256`의 기능 Production 배포 `dpl_H5uh1gjKUxXfTMfxZhcyLcmB37Ta`가 `READY`이고 canonical 3개 alias에만 연결된 상태로 `https://racketlab-one.vercel.app` 운영 반영을 확인했다.
- 브라우저에서 라켓 54종, 스트링 24종, 신규 라켓 상세, 라켓 목록 3페이지 구성 `24+24+6`, 이전 404 경로, 모바일 오버플로 없음과 콘솔 warning/error 각 0건을 확인했다.
- 홈→라켓 전환은 warm 431ms, cold 3064ms로 측정했으며 현재 배포의 Vercel warning, error, 5xx는 모두 0건이다.
- Omega 배포와 alias는 한 번도 대상으로 지정하지 않았고 공개 Omega는 기존 시각 상태를 유지하며 canonical 프로젝트 alias 목록에도 포함되지 않는다.
- 최종 리뷰 결과는 `APPROVE`이며, 이전 프리뷰의 Supabase timeout은 운영 차단이 아닌 모니터링 전용 nit로 남겼다.

### 다음 할 일
- cold start와 Supabase pooler timeout 지표를 지속 모니터링한다.
- `/admin/offers`에서 실제 어필리에이트 판매 링크를 등록해 스트링·라켓 구매 위젯을 활성화한다.

*마지막 업데이트: 2026-07-24*
