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

## Chapter 8 — 라켓 컬러 커스터마이저 완성 및 Preview 승인 대기

### 목표
54개 라켓 상세페이지에 실제로 많이 쓰이는 스트링 8색과 그립 8색의 예상 비주얼을 제공한다.

### 완료 내용
- 접근 가능한 클라이언트 아일랜드를 구현해 두 개의 `fieldset`, 라디오 16개, 초기화 버튼, live status를 제공했다.
- 정확한 slug, code, URL, 이미지 dimension이 모두 일치할 때만 동작하는 fail-closed 프로필을 적용했다.
- 54개 프로필과 108개 결정론적 로컬 SVG 마스크를 완성했다.
- 브라우저에서 마스크가 보이지 않던 원인이 SVG의 `xmlns` 누락임을 확인하고 생성기 소스를 수정해 전체 산출물에 반영했다.
- 관련 커밋은 `ad92d13`과 `8320db5`이다.

### 검증
- 집중 테스트 18/18과 전체 테스트 177/177을 통과했다.
- typecheck, lint, build를 모두 통과했다.
- 로컬 브라우저에서 라켓 상세 경로 54/54를 확인했고 콘솔 오류는 0건이며 초기화 동작도 통과했다.
- 선택 상태와 원본의 차이는 19,494픽셀이며 변경 영역이 라켓 안에만 있음을 확인했다.
- 모든 독립 리뷰 결과는 `APPROVE`다.

### 경계 및 상태
- 명시적인 제3자 소스 업로드 승인 후 `HEAD d330cd6`을 지정된 Vercel 프로젝트에 Preview로 배포했고, `READY`와 canonical domain 불변을 확인했다.
- Production, `racketlab-one` alias, `racketlab-omega`, Git push, DB 및 migration 변경은 수행하지 않았다.

### 다음 할 일
- 사용자가 검증된 Preview에서 기능과 시각 결과를 최종 검토한다.
- Production 반영과 canonical alias 승격은 별도 승인이 있을 때만 진행한다.

### Preview 배포 및 검증 결과
- 사용자가 `HEAD d330cd6`을 Vercel `rachel-flower/racketlab` 프로젝트 `prj_wPzKAFzr9oLIrMfLMRBDdJukdMi7`에 업로드하도록 명시적으로 승인했다.
- 첫 `--target=preview --skip-domain` 명령은 설치된 CLI가 `skip-domain`을 Production에만 허용해 업로드 전에 거부됐고 최신 배포는 그대로 유지됐다.
- Preview 전용·Production 미변경 의도에 맞춰 `--target=preview`만으로 재시도했다.
- 배포 `dpl_CK9CwFbPgGGPyVeq3ZdEpP2C3uXs`는 `https://racketlab-7z7lzmin1-rachel-flower.vercel.app`에서 `READY`이며 target은 `null`인 Preview, source는 `cli`이고 자동 개인 Preview alias는 `racketlab-infoseoulrave-9470-rachel-flower.vercel.app`이다.
- 빌드는 433개 파일과 Next.js 16.2.10을 사용해 compile·typecheck와 정적 페이지 37개 생성을 통과했고 22초에 완료됐으며 CLI 전체 시간은 약 42초였다.
- 프로젝트 canonical domain은 정확히 `racketlab-one.vercel.app`, `racketlab-rachel-flower.vercel.app`, `racketlab-git-main-rachel-flower.vercel.app`으로 유지됐고 Omega는 포함되지 않았다.
- 브라우저 QA에서 홈이 정상 로드됐고 정확한 생성 상세 경로 54/54 모두 커스터마이저 표시, `fieldset` 2개, 라디오 16개, 깨끗한 초기·초기화 상태, 이미지 로드, 가로 오버플로 없음 조건을 통과했다.
- 실제 선택 비주얼은 Yonex EZONE의 flash-yellow/pink, Wilson Shift의 red/black, Babolat Pure Aero의 gold/blue 조합에서 통과했다.
- 핵심 경로 8개가 유효했고 `/recommendation` → `/diagnosis`는 소스에 정의된 의도적 redirect임을 확인했으며 콘솔 warning/error는 0건이었다.
- 해당 배포 범위 Vercel 로그는 error/warning/fatal, 4xx, 5xx가 모두 0건이었다.
- 프로젝트 전체 runtime 집계의 Production 배포 `dpl_Gss...` `/api/events` Supabase pooler `CONNECT_TIMEOUT` 1건은 기존 오류로 이 Preview와 무관하다.
- Production 승격, canonical alias 변경, Omega 변경, Git push, DB 및 migration 변경은 수행하지 않았으며 다음 단계는 사용자 Preview 검토이고 Production은 별도 승인 아래에서만 진행한다.

*마지막 업데이트: 2026-07-24*

## Chapter 9 — 그립 오버레이 실물 정렬 및 회귀 잠금

### 목표
54개 라켓의 108개 뷰에서 그립 오버레이를 실제 그립 영역에 정렬한다.

### 완료 내용
- 샤프트, 마감 collar, 분리 그림자를 그립 판정에서 제외해 실제 그립 영역만 남겼다.
- flare-seeded 8-connected terminal 기준으로 경계를 결정해 라켓별 형태 차이를 일관되게 처리했다.
- geometry와 54개 grip SVG를 갱신하고 golden fixture SHA를 `3A2D788E6DB65996512B9B3C71A9A16EEA3D75E05BBC7EFC73F0EDFF1D5C782E`로 고정했다.
- 그립 정렬이 다시 어긋나는 변경을 차단하도록 regression test를 추가했다.

### 검증
- terminal 432행은 최대 오차 1.5px였고 100%가 2px 이내였다.
- full source gate는 `max p95=2 / min95.622` 기준을 통과했다.
- 전체 테스트 182/182, typecheck, lint, 37페이지 build를 통과했다.
- 데스크톱·모바일 rect delta는 모두 0이었고 reviewer 결과는 `APPROVE`다.

### 경계 및 상태
- string SVG, component, Omega, Git push, Vercel deploy, DB는 변경하지 않았다.

### 다음 할 일
- 사용자가 새 exact commit을 승인한 뒤에만 Preview 배포할 수 있다.
- Production과 Omega 변경은 각각 별도 승인이 있을 때만 진행한다.

*마지막 업데이트: 2026-07-24*

## Chapter 10 — 라켓 색상 시뮬레이터 전용 페이지 분리

### 목표
라켓 상세의 정보 흐름을 가볍게 유지하면서 스트링·그립 색상 시뮬레이션을 별도 페이지에서 안정적으로 제공한다.

### 완료 내용
- 상세 페이지의 인라인 시뮬레이터를 top-level `/customizer/[slug]` 전용 경로로 옮겨 상위 loading boundary의 스트리밍 응답이 HTTP 상태를 흐리지 않게 했다.
- 정확한 커스터마이저 프로필이 있는 라켓 상세에만 전용 페이지 CTA를 표시해 지원하지 않는 조합은 fail-closed로 처리했다.
- canonical alias는 지원되는 canonical 경로로 308 응답하고, 미지원 slug와 기존 중첩 주소는 404를 반환하도록 경로 해석을 분리했다.
- 전용 error boundary에 재시도와 라켓 목록 복귀 동선을 추가해 데이터 로드 실패를 빈 화면으로 남기지 않게 했다.
- 캐시·하이드레이션 시점에도 이미지 객체 ref와 load/error/poll guard로 readiness를 판정해 색상 컨트롤이 준비 상태에 멈추지 않게 했다.

### 검증
- 데스크톱과 모바일에서 스트링 8색·그립 8색, 초기화와 선택 상태, 가로 오버플로 부재를 확인했다.
- 전체 테스트 192/192, typecheck, lint, production build, diff-check를 통과했다.
- canonical 경로 200, alias 308, 미지원·구주소 404를 실제 HTTP 응답으로 확인했다.

### 경계 및 상태
- Git push, Vercel 배포, DB 및 migration, Omega 사이트 변경은 수행하지 않았다.

### 다음 할 일
- 사용자의 별도 승인 후 canonical Vercel 프로젝트에 Preview로 배포하고 실제 배포 환경에서 최종 검수한다.

*마지막 업데이트: 2026-07-25*

## Chapter 11 — 초심자 개편 완성·보안 정합성·컬러웨이 파이프라인

### 목표
7월 31일에 시작해 커밋되지 않은 채 멈춰 있던 초심자 구조 개편을 마무리하고, 프로덕션에 열려 있던 개인정보 노출과 데이터 정합성 문제를 닫으며, 도식에 실제 라켓 색을 입힌다.

### 배경 — 시작 시점 상태
- 프로덕션은 `origin/main` = `3a5b17c`(2026-07-24)에 멈춰 있었고 이후 9일간 배포가 없었다.
- 로컬 `main` 이 22커밋 앞서 있었고(라켓 컬러 커스터마이저), 그 위에 미커밋 작업 트리(삭제 117 / 수정 13 / 신규 12)가 얹혀 있었다. `/customizer/*` 와 `/start` 는 라이브에서 404였다.
- 미커밋 작업은 typecheck·lint 통과에 테스트 189/189 통과 상태였고 삭제된 파일을 참조하는 코드도 0건이었다. 깨진 상태가 아니라 범위가 덜 끝난 상태였다.

### 완료 내용
- **저장소 혼선 정리.** 같은 계보의 저장소 3개 중 canonical을 `.vercel/project.json`, `CANONICAL.md` §2–3, `/strings`·`/knowledge` 라우트 유무로 교차 확인했다. 폐기된 `tennis-platform-app` 과 `tennis-omega-port` 에 `DEPRECATED.md` 를 넣었다.
- **배포 경로 정정.** 프로덕션 배포에 `racketlab-git-main-...` alias가 붙어 있어 `main` 푸시가 곧 Production 배포임을 확인했다. CANONICAL.md §3 원칙을 지키기 위해 `feat/beginner-structure` 브랜치로 작업하고 Vercel 자동 Preview에서 검수하는 경로로 바꿨다.
- **초심자 개편 마무리(설계 §D).** `<Term>` 인라인 용어 설명과 `/guide/terms` 용어사전을 신설하고 두 곳이 `src/data/glossary.ts` 하나를 함께 쓰게 했다. 점수 말 라벨을 축 막대·비교표·라켓 DNA로 넓히고 표기를 `3/5 · 보통` 으로 통일했다. 라켓 카드의 5열 그리드와 레이더 차트 라벨은 글자가 들어갈 자리가 없어 숫자만 두었다.
- **커스터마이저 진입 버그.** 라우트는 사진 의존을 없앴는데 상세 CTA가 `racket.imageUrl ?` 분기 안에 남아 있어, 스펙이 멀쩡한데 사진만 없는 라켓은 들어갈 수 없었다. 분기 밖으로 빼고 회귀 테스트를 붙였다.
- **IDOR 차단.** `/api/recommendations/[id]`, `/compare`, `/results/[id]` 에 인증도 소유권 검사도 없어 UUID만 알면 타인의 진단 서사와 플레이스타일이 읽혔다. 라켓 추천 내용은 공개로 두고 개인 서술만 가린다. 본인 증명은 (1) 진단 제출 시 심는 httpOnly 쿠키, (2) 이미 스키마에 있던 share token 두 경로다.
- **공개면·엔진 정의 일치.** `queries.ts` 에 `ingestion_state` 필터가 아예 없어 미검수 스펙이 공개 화면에 뜰 수 있었다. 적용 전 운영 DB를 읽기 전용으로 확인했다 — raw 80 / published 54, 공개 대상 54종은 전부 published, 미검수 0건, 스펙 없는 모델 0건. 보이는 카탈로그는 그대로이며 앞으로의 유출만 막는다. embedded 필터가 실제로 걸리도록 `racket_specs!inner` 로 바꾸고, 필터 없는 질의와 비교해 미검수 80건이 실제로 제거되는 것까지 확인했다.
- **라우트 하드닝.** `racket-search` 의 limit에 하한이 없어 `?limit=-5` 가 500을 냈다(상단 검색창이 쓰는 경로다). ILIKE 와일드카드도 이스케이프하지 않아 `?q=%` 하나로 전체가 매칭됐다. uuid 형식 검증을 붙여 Postgres 캐스트 오류가 500으로 새던 것을 400/404로 바꿨다.
- **컬러웨이 파이프라인.** `paint` 를 아무도 넘기지 않아 54종이 전부 같은 회색으로 렌더됐다. 놀고 있던 세그멘테이션 모듈을 소비해 사진에서 프레임 대표색을 뽑고, 정렬을 (빈도 내림차순, 버킷 키 오름차순)으로 고정해 결정성을 확보했다. 54/54 추출됐고 `--check` 재실행 결과가 동일하다. 실제 색과도 맞다 — Pure Aero 라임, VCORE 레드, Blade 그린, Boom 시안, Gravity 블랙. `sharp` 는 devDependency 로만 두고 그걸 지키는 테스트를 넣었다.
- **위생.** 푸터의 하드코딩된 데이터 기준일을 데이터에서 계산하도록 바꿨다(가장 이른 확인일을 쓴다 — 일부만 최근에 확인했는데 그 날짜를 내걸면 과장이다). 모든 라켓 상세의 TWU 링크가 `brand=Wilson` 으로 고정돼 Babolat 상세에서도 Wilson으로 가던 것을 고쳤다. 도달 불가능한 `/admin/login` 을 지웠다. `src/env.ts` 는 아무도 import 하지 않아 검증이 한 번도 실행되지 않았고 Supabase 키 2개는 선언조차 없었다 — 실제로 호출되는 형태로 바꾸고 `@t3-oss/env-nextjs` 의존성을 제거했다.

### 검증
- 테스트 189 → **228 통과**, 실패 0
- typecheck 통과, lint 오류 0건, production build 38페이지 통과
- 로컬 프로덕션 서버 실측: 공개 경로 14개 200, `?limit=-5` 500→200, `?q=%` 전체 매칭→0건, 잘못된 UUID 500→400, 카탈로그 54종 유지
- 커스터마이저 실측: 라켓별 프레임 색이 실제로 렌더됨을 HTML에서 확인

### 알려진 미해결
- `/results/[id]` 와 `/rackets/[slug]` 는 `loading.tsx` 스트리밍 때문에 `notFound()` 전에 HTTP 200이 커밋된다. 본문은 정상 404 페이지가 나오지만 상태 코드가 200이라 크롤러에 잘못 보인다. Chapter 10에서 커스터마이저를 전용 경로로 옮겨 해결한 것과 같은 문제이며, 고치려면 스트리밍 경계를 손대야 해서 별도 과제로 남긴다.
- Vercel 함수 리전이 `iad1`(미국 동부)이다. 한국 사용자 + Supabase 조합에서 cold 3초대가 관측된 바 있다(Ch.7). `icn1` 이전 검토는 별도 과제.

### 경계 및 상태
- Omega URL과 배포 ID는 건드리지 않았다. DB와 migration도 변경하지 않았다.
- `main` 에는 push하지 않았다. 작업은 `feat/beginner-structure` 브랜치에 있다.

### 다음 할 일
- Preview에서 최종 검수 후, 명시적 승인이 있을 때만 `main` 병합(= Production 배포).
- `/admin/offers` 에 실제 어필리에이트 링크 등록 (Ch.7부터 이월).

*마지막 업데이트: 2026-08-02*

## Chapter 12 — Chapter 11 프로덕션 롤아웃

### 목표
`feat/beginner-structure`(Chapter 11)를 Preview 검수 후 승인 하에 프로덕션에 반영한다.

### 완료 내용
- Preview(`racketlab-git-feat-beginner-structure-...`, 커밋 `acfb355` 일치)에서 최종 검수:
  공개 경로 6개 200, `limit=-5` 200, `q=%` 0건, 잘못된 UUID 400, 커스터마이저 200,
  구 중첩 주소·미지원 slug 404, Pure Aero 라임(`#D2FD54`) 컬러웨이 렌더 확인.
- 민호 승인 후 `origin/main`(`3a5b17c`)에 `acfb355`를 fast-forward 병합·푸시.
  Vercel Production 빌드 33초 만에 Ready.
- 라이브(`racketlab-one.vercel.app`, `dpl_DK2YVvaCgePWSy3yL59KNW5eY2DX`)에서 동일 항목 재검증 — 전부 통과.
  `/start`, `/guide/terms`, `/customizer/[slug]` 가 프로덕션에서 처음으로 공개됐다.
- 동결된 `racketlab-omega.vercel.app` 은 `dpl_GmX79sYrsM78DpRFmLLnoktrtYXv` 그대로임을 확인.

### 다음 할 일
- 마켓플레이스 C조각(주문·결제) 설계 착수 — 2026-08-02 브레인스토밍 결정 사항 기준.
- `/admin/offers` 어필리에이트 링크 등록은 마켓플레이스 방향 확정으로 우선순위 재검토.
- 이월 과제: `/results/[id]`·`/rackets/[slug]` 스트리밍 200 문제, `iad1`→`icn1` 리전 검토.

*마지막 업데이트: 2026-08-03*

## Chapter 13 — 커스터마이저 실제 사진 전환

### 목표
"색상 커스터마이저의 라켓 모양이 이상하다"는 민호의 지적에 따라, 도식 대신
실제 제품 사진 위에서 스트링·그립 색을 입히도록 바꾼다.

### 핵심 발견
- Tennis Warehouse 제품 사진의 라켓은 **스트링이 없는(unstrung) 판매 상태**다.
  "스트링 픽셀을 검출해 색을 입힌다"는 전제가 성립하지 않아, 빈 베드 위에
  스펙 패턴대로 **합성 스트링을 그려 넣는** 설계로 바꿨다.
- 이전 실패(손좌표 327KB)의 교훈대로 좌표는 전부 사진에서 자동 검출한다.
  Ch11의 `racket-photo-segmentation.ts` 를 그대로 소비했다.

### 완료 내용
- **오프라인 파이프라인** `scripts/generate-racket-customizer-photos.ts`:
  사진을 로컬로 복사(마스크와 픽셀 정렬 보장)하고 베드·그립 알파 마스크 PNG와
  매니페스트를 생성한다. 총 2.4MB, 결정적(`--check` 통과).
- **베드 검출 정제** (`scripts/lib/racket-photo-overlays.ts`): 클로징이 후프
  안쪽과 스로트 창을 이어붙이는 문제를 클로징 **전** 최대 성분 선택으로 풀고,
  워터마크 구멍은 구멍 메우기(경계 무손상)로 채웠다. 종횡비 1.05–1.55와
  채움비 ≥0.72 게이트로 흰 프레임 오검출을 걸러낸다.
- **그립 검출 정제**: 행별 실루엣 run 틈 메움(흰 그립 내부 복원), run 개수
  증가 지점에서 스로트 절단, 전장 대비 그립 길이 상한(27인치 중 ~28%).
- **UI** `racket-photo-customizer.tsx`: 실제 사진 + CSS mask 로 자른 SVG
  스트링(메인·크로스 가닥 수는 DB 패턴) + 그립 색 오버레이. 그립은 색을
  고르기 전에는 원본 사진 그대로 둔다.
- **fail-closed 유지**: 검출 품질 미달 6종(Pure Aero Lite·Team, Speed 3종,
  VCORE 100)은 기존 스펙 도식으로 렌더되고 안내 문구도 모드별로 나뉜다.
- 산출물마다 디버그 합성 이미지를 만들어 마스크 정렬을 눈으로 확인했다
  (베드가 후프 안쪽만, 그립이 손잡이만 덮는 것을 4종 표본에서 검증).

### 검증
- 테스트 228 → **241 통과**(overlays 단위 13개 + 매니페스트·에셋 정합 포함), 실패 0
- typecheck·lint·production build 통과, 생성 스크립트 `--check` 결정성 통과
- 로컬 실측: 사진 모드 페이지 200, 스트링 35가닥(16x19) 렌더, 에셋 3종 200,
  미달 라켓 도식 fallback, 브라우저에서 색 선택 동작 스크린샷 확인
- Preview(`racketlab-git-feat-customizer-photo-...`) 실측: 동일 항목 전부 통과

### 경계 및 상태
- `main` 에는 push하지 않았다. 작업은 `feat/customizer-photo` 브랜치에 있다.
- DB·migration·Omega 무변경. 사진은 TW 원본을 로컬 사본으로 서빙한다(워터마크
  유지). 라이선스 관점은 기존 핫링크와 동일 선상이나 재호스팅이므로 민호 인지 필요.

### 다음 할 일
- 민호 승인 시 `main` 병합(= Production 배포). → 승인되어 배포 완료 (2026-08-03)

*마지막 업데이트: 2026-08-03*

## Chapter 14 — 마켓플레이스 C조각 설계·입점 문의 배너

### 목표
2026-08-02 확정된 매장 입점 마켓플레이스의 첫 조각(주문·결제) 설계를 문서로
고정하고, 매장 섭외 진입점(입점 문의 배너)을 연다.

### 완료 내용
- **설계 문서** `docs/superpowers/specs/2026-08-03-marketplace-c-piece-design.md`:
  신규 스키마 4종(stores / store_packages / orders / payments / magic_link_tokens),
  주문 상태 기계(환불은 결제사 응답 확인 후에만 기록), Toss 결제위젯 통합,
  C-1~C-4 단계와 게이트, 명시적 비범위. `partner_offers` 는 손대지 않는다.
- **입점 문의 배너** (`partner-banner.tsx`): 홈 하단에서 기존 `/partners`
  문의 폼으로 연결. 입점 절차가 없으므로 "신청"이 아닌 "문의"로 표현.
- 배포: 테스트 241/241·빌드 통과, Preview 검증 후 민호 승인으로 `main` 병합,
  라이브에서 배너 노출 확인.

### 민호 결정 대기 (설계 문서 §6)
1. Toss 가맹 계약 명의 (racket LAB 신규 vs maison_rachel 공유)
2. 파일럿 매장 후보·섭외 일정
3. 수락 후~장착 전 취소 정책 문안

### 다음 할 일
- C-1 착수: `src/db/schema/marketplace.ts` + migration + admin CRUD.
  코드와 병행해 통신판매중개업 신고·PG 서브머천트 계약 진행 필요.
  → **2026-08-03 민호 결정으로 0단계(매장 소개) 선행. C조각은 2단계로 이월.**

*마지막 업데이트: 2026-08-03*

## Chapter 15 — 마켓플레이스 0단계: 매장 소개 인프라

### 목표
민호 결정("처음엔 대리점 소개부터")에 따라 결제 대신 매장 소개를 먼저 연다.
섭외된 매장이 아직 없으므로, admin 등록 화면까지 만들어 두고 매장이 생기는
즉시 노출되는 구조로 준비한다.

### 완료 내용
- 기존 `partner_offers`(shop) + `partner_leads` 재사용 — 신규 테이블·migration 없음.
- `/admin/shops`: 매장 CRUD. 등록 직후 **비활성** 시작, 검수 후 활성 전환.
  `attributionTag` 자동 생성, 좌표·URL 검증.
- `/shops` 디렉토리: 활성 매장 목록(매장명·주소·소개·연락 링크, 중복 상호 합침).
  0건이면 "등록 매장 준비 중" + 입점 문의 CTA — 임시 정보를 지어내지 않는다.
- 라켓 상세 "취급 매장" 섹션: 해당 라켓 취급 매장 우선, 0건이면 미렌더
  (PriceComparison 과 같은 fail-closed 패턴).
- 연락·위치 클릭을 `partner_leads`(`shop_contact_click`) 로 기록 —
  이후 판매 연동(C조각) 영업의 근거 데이터.
- 푸터에 "매장 찾기"·"매장 입점 문의" 추가. 설계 문서에 0단계 명시.

### 검증
- 테스트 241 → 247 통과, typecheck·lint·build 통과
- Preview·라이브 실측: `/shops` 200 + 준비 중 안내, 상세 페이지 섹션 미렌더
  (매장 0건 fail-closed), 푸터 링크 노출
- 매장 데이터가 있는 상태의 노출은 운영 DB라 실측하지 않았다 — admin 첫 등록
  때 확인한다.

### 다음 할 일
- 매장 섭외 (입점문의 배너 + 오프라인). 첫 매장 등록·활성 시 노출 실측.
- 리드가 쌓이면 C조각(결제) 착수 판단.

*마지막 업데이트: 2026-08-03*

## Chapter 16 — 커스터마이저 사진 6종 누락 복구 (54/54)

### 목표
`/customizer/head-speed-mp-2026` 처럼 일부 라켓이 제품 사진 대신 스펙 도식으로
떨어져 "형편없는 이미지"로 보인다는 지적. 라켓 메뉴에 나오는 실제 제품 사진
위에서 색을 입힐 수 있게 만든다.

### 원인
Chapter 13 의 검출 파이프라인이 6종을 fail-closed 로 제외하고 있었다.
`head-speed-mp/mp-l/pro-2026`, `babolat-pure-aero-lite/team-2026`,
`yonex-vcore-100-2026`.

배경 임계 `backgroundLuma: 232` 가 원인이다. 카탈로그 사진의 배경은 정확히
**255** 인데, 흰 그립의 실측 luma 는 **231~246** 이라 임계 위에 있었다. 그래서
테두리 flood fill 이 그립을 통째로 배경으로 빨아들였고(그립 커버리지 55%),
speed MP L 은 후프의 흰 도색 구간으로 바깥이 새어 들어와 정면 베드 자체를
못 잡았다.

### 완료 내용
- `OVERLAY_SEGMENTATION` 신설 — 오버레이 마스크 전용 설정.
  `backgroundLuma: 248` 로 배경값에 붙인다. 54종 실측상 246~250 이 전부 통과하는
  안전 구간이다.
- 임계를 배경에 붙이면 JPEG 잡음이 실루엣 티끌로 남아 실루엣 맨 아랫줄을
  밀어내고 그립 구간 검출이 통째로 어긋난다. `dropSilhouetteSpecks` 로
  `minSilhouettePixels: 64` 미만 성분을 제거한다. 실측 근거: 진짜 성분은
  57,000px 이상, 잡티는 8px 이하로 경계가 뚜렷하다.
- `generate-racket-customizer-photos.ts` 만 새 설정을 쓴다.
  **프레임 대표색 추출은 `DEFAULT_SEGMENTATION`(232) 그대로 둔다** — 거기서는
  흰 그립이 어차피 하이라이트로 버려지는데, 임계를 옮기면 눈으로 확인해 둔
  색 16종이 흔들린다(pure strike 보조색이 빨강 → 회색으로 죽는 등).
- 산출물 재생성: 매니페스트 48 → **54종**. 기존 48종은 베드 박스가 1~7px
  조여졌다(흰 프레임을 덜 삼킨 결과라 개선 방향).

### 검증
- 생성 스크립트 제외 0건, 54/54 통과
- 테스트 247 통과, typecheck·lint 통과
- `colorways:generate` 후 `git diff` 0줄 — 색상 추출 산출물 무변경 확인
  (`colorways:check` 의 실패는 Windows 체크아웃 CRLF 아티팩트로 이 변경과 무관)
- 마스크 오버레이 육안 확인: 신규 6종 + 대조군 6종 모두 베드가 후프 안쪽에,
  그립이 두 컷 모두에 정확히 덮임
- 로컬 실측: 6종 전부 HTTP 200 + 사진 모드로 렌더. 브라우저에서 스트링
  형광노랑 · 그립 파랑 적용까지 확인

### 다음 할 일
- 카탈로그에 라켓이 추가되면 생성 스크립트를 다시 돌려 54 → N 으로 맞춘다.
- 배포는 미실행. `main` 푸시 = 즉시 Production 이므로 민호 컨펌 후 진행.

*마지막 업데이트: 2026-08-04*

## Chapter 17 — Dunlop/Prince/Tecnifibre 16종 재활성화 (54 → 70)

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
