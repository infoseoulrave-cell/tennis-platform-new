# 마켓플레이스 C조각(주문·결제) 설계

작성일: 2026-08-03
근거: 2026-08-02 브레인스토밍 확정 사항 (민호 결정)

## 0단계 — 매장 소개 (2026-08-03 민호 결정으로 선행)

결제보다 **매장 소개를 먼저** 연다. 행정 선결조건(중개업 신고·에스크로·PG
계약)이 전부 불필요해지고, 필요한 것은 매장 섭외 하나다. 소개 단계에서
관계를 맺은 매장이 이후 C조각의 판매 매장이 된다.

- 기존 `partner_offers`(shop 행) + `partner_leads` 를 그대로 사용. 신규 테이블 없음.
- `/admin/shops` — 매장 CRUD. **등록 직후엔 비활성**, 검수 후 활성 전환.
- 활성 매장이 생기는 즉시: `/shops` 디렉토리와 라켓 상세 "취급 매장" 섹션에
  노출. 0건이면 아무것도 렌더하지 않는다 (fail-closed).
- 연락·위치 클릭은 `partner_leads`(`shop_contact_click`) 로 기록 —
  이후 판매 연동 영업의 근거 데이터.
- 소개는 무료로 시작한다. "무료 노출 → 반응 좋으면 판매 연동" 이 섭외 멘트다.

아래 C조각 설계는 0단계에서 매장·수요 데이터가 쌓인 뒤의 2단계로 밀린다.

## 확정된 전제 (재론하지 않는다)

| 항목 | 결정 |
|---|---|
| 방향 | 매장 입점 마켓플레이스 (어필리에이트 아님) — 멘탈 모델은 오늘의집, 단 배송이 아니라 **픽업** |
| 깊이 | 사이트에서 결제까지 |
| 첫 조각 | **C(결제)부터**. 매장은 오프라인으로 직접 섭외 |
| 정산 | 우리가 결제 수취 → 지급대행으로 자동 정산 |
| 판매 단위 | 라켓 + 스트링 + 장착 공임 **패키지** |
| 수령 | 매장 픽업만 (배송 서브시스템 없음) |
| 매장 인터페이스 | **매직링크 콘솔** — 계정·로그인 없이 주문마다 서명된 링크로 수락·거절·장착완료 |
| 기존 테이블 | 거래용 테이블은 새로 세우고 `partner_offers` 는 손대지 않는다 |

## 코드 밖 선결조건 (병행 필수, 코드로 대체 불가)

1. **통신판매중개업 신고** — maison_rachel은 직판(통신판매업)이라 범주가 다르다.
2. **결제대금예치(에스크로) 의무** — 우리가 대금을 먼저 받는 중개 구조이므로
   전자상거래법 §13·§24 적용 검토. PG 에스크로 옵션 또는 지급대행으로 충족.
3. **PG 서브머천트 계약** — TossPayments 지급대행(서브몰) 계약. maison_rachel의
   일반 가맹 계약과 별개다.
4. **매장 섭외** — 최소 1곳의 파일럿 매장. 섭외 전에는 실주문을 열지 않는다.

> 이 넷이 갖춰지기 전까지 코드는 **전 구간 테스트 모드**(Toss 테스트 키)로만 동작한다.

## 1. 데이터 모델 (신규 스키마 `src/db/schema/marketplace.ts`)

기존 `partner_offers`(발견·거리 검색용)와 분리된 거래용 테이블 4개.

### stores — 매장 실체
```
id            uuid PK
name          varchar(255) NOT NULL
slug          varchar(100) UNIQUE NOT NULL
business_no   varchar(20)            -- 사업자등록번호 (정산·계산서용)
contact_phone varchar(30) NOT NULL   -- 매직링크를 보낼 채널 (카톡/SMS)
address       text NOT NULL
lat / lng     numeric                -- partner_offers 하버사인 패턴 재사용
open_hours    jsonb                  -- {mon:[["10:00","20:00"]],...} 표시 전용
settlement_bank / settlement_account varchar  -- 지급대행 등록 정보
pg_submall_id varchar(100)           -- Toss 서브몰 ID (계약 후 기입)
active        boolean DEFAULT false  -- 섭외·계약 완료 전에는 비활성
created_at / updated_at
```

### store_packages — 매장이 파는 패키지 (라켓+스트링+장착)
```
id              uuid PK
store_id        uuid FK -> stores NOT NULL
racket_model_id uuid FK -> racket_models NOT NULL   -- 검수된 카탈로그만
string_name     varchar(255) NOT NULL               -- 자유 입력 (스트링 카탈로그 FK는 2단계)
price_krw       integer NOT NULL                    -- 패키지 총액 (장착 공임 포함)
labor_krw       integer                             -- 내역 표시용 (선택)
in_stock        boolean DEFAULT true
active          boolean DEFAULT true
created_at / updated_at
UNIQUE(store_id, racket_model_id, string_name)
```

### orders — 주문 (상태 기계의 중심)
```
id              uuid PK
order_no        varchar(20) UNIQUE NOT NULL  -- 사람이 읽는 번호 (RL240803-0001)
package_id      uuid FK -> store_packages NOT NULL
store_id        uuid FK -> stores NOT NULL   -- 패키지 스냅샷과 별개로 고정
racket_snapshot jsonb NOT NULL   -- 주문 시점의 {racketName, stringName, priceKrw, laborKrw}
                                 -- 패키지가 나중에 바뀌어도 주문 내역은 불변
buyer_name      varchar(100) NOT NULL
buyer_phone     varchar(30) NOT NULL         -- 픽업 안내 채널
status          order_status NOT NULL DEFAULT 'pending_payment'
grip_size       varchar(10)                  -- 선택 옵션 (G2 등)
tension_note    varchar(100)                 -- 희망 텐션 메모 (매장 참고용)
paid_at / accepted_at / ready_at / picked_up_at / cancelled_at  timestamp
cancel_reason   text
created_at / updated_at
```

`order_status` enum:
```
pending_payment → paid → accepted → ready → picked_up
                   │        │
                   │        └→ declined (매장 거절 → 자동 전액 환불)
                   └→ cancelled (결제 후 수락 전 구매자 취소 → 전액 환불)
```
- 상태 전이는 단방향이며 허용 전이 외에는 서버가 거부한다 (fail-closed).
- `declined`/`cancelled` 는 환불 완료가 확인된 뒤에만 기록한다 —
  "환불했습니다"를 결제사 응답 없이 주장하지 않는다 (할루시네이션 금지 원칙).

### payments — 결제 기록 (Toss 응답의 원본 보관)
```
id             uuid PK
order_id       uuid FK -> orders UNIQUE NOT NULL
provider       varchar(20) NOT NULL DEFAULT 'toss'
payment_key    varchar(200) UNIQUE   -- Toss paymentKey
amount_krw     integer NOT NULL
status         varchar(30) NOT NULL  -- ready | done | cancelled | partial_cancelled
raw            jsonb                 -- 승인/취소 응답 원문 (감사 추적)
approved_at / cancelled_at
created_at / updated_at
```

### magic_link_tokens — 매장 콘솔 접근 토큰
```
id         uuid PK
order_id   uuid FK -> orders NOT NULL
token_hash varchar(64) UNIQUE NOT NULL  -- sha256(token). 원문은 저장하지 않는다
purpose    varchar(20) NOT NULL         -- console (주문 처리용)
expires_at timestamp NOT NULL           -- 발급 + 14일
used_count integer DEFAULT 0            -- 열람 횟수 (감사용, 재사용 허용)
revoked    boolean DEFAULT false
created_at
```
- 토큰 원문은 URL에만 존재: `/store/orders/[token]`. DB에는 해시만.
- 진단 결과의 httpOnly 쿠키 + share token 패턴(Ch11 `recommendation-access.ts`)과
  같은 계열이므로 검증 유틸을 재사용한다.

## 2. 흐름

### 구매자
1. 라켓 상세 → "이 라켓 사기" (활성 매장의 패키지가 있을 때만 노출 — fail-closed)
2. `/buy/[packageId]` — 패키지 내역(라켓·스트링·공임·총액), 매장 위치·영업시간,
   그립/텐션 옵션, 이름·연락처 입력
3. Toss 결제위젯 승인 → `paid`
4. 매장 수락 시 카톡/SMS로 안내, `ready` 되면 픽업 안내
5. `/orders/[orderNo]?t=<구매자토큰>` 로 주문 상태 조회 (전화번호 뒷자리 검증 병행)

### 매장 (매직링크 콘솔)
1. `paid` 진입 시 서버가 토큰 발급 → 매장 연락처로 링크 발송
   (1단계: **운영자가 수동 전달**. 알림 자동화는 범위 밖)
2. `/store/orders/[token]` — 주문 내역 + 버튼 3개: 수락 / 거절 / 장착 완료
3. 각 버튼은 서버 액션으로 상태 전이. 거절 시 사유 입력 → 자동 전액 환불

### 운영자 (admin)
- `/admin/marketplace` — 매장 CRUD, 패키지 CRUD, 주문 목록·상태 모니터,
  토큰 재발급. 기존 `/admin` 인증 패턴 재사용.

## 3. 결제 통합

- **TossPayments 결제위젯** (maison_rachel의 `TossPaymentWidget.tsx` 패턴 이식,
  계약·키는 별도)
- 승인 흐름: 클라이언트 승인 요청 → `/api/checkout/confirm` 에서 서버 승인
  (amount를 서버가 재계산해 위변조 차단) → `payments` 기록 → `paid` 전이
- 환불: `/api/checkout/cancel` — Toss 취소 API 호출 성공 응답을 받은 뒤에만
  주문 상태 갱신
- 지급대행(서브몰 정산)은 **2단계**. 1단계는 결제 수취까지만 하고 정산은
  수동(운영자 이체)으로 시작한다 — 파일럿 매장 1곳 규모에서는 수동이 병목이 아니다.

## 4. 단계 나누기

| 단계 | 내용 | 게이트 |
|---|---|---|
| C-1 | 스키마 4종 + migration, 매장·패키지 admin CRUD | 테스트·타입·빌드 |
| C-2 | 구매 페이지 + Toss 테스트 결제 + 주문 상태 기계 | 테스트 키로 전 구간 실측 |
| C-3 | 매직링크 콘솔 (수락/거절/장착완료 + 자동 환불) | 토큰 보안 테스트 |
| C-4 | 구매자 주문 조회 + 운영자 주문 모니터 | E2E 실측 |
| 실전환 | 선결조건 4종 완료 확인 후 라이브 키 전환 + 파일럿 매장 1곳 | 민호 승인 |

각 단계는 독립 배포 가능하며, `stores.active=false` 인 동안 공개 화면에는
아무 것도 노출되지 않는다.

## 5. 명시적 비범위 (1단계에서 안 한다)

- 배송, 장바구니(주문 = 패키지 1개), 회원 계정, 리뷰, 재고 수량 관리
- 카톡 알림 자동화 (운영자 수동 전달로 시작)
- 지급대행 자동 정산 (수동 정산으로 시작)
- 스트링 카탈로그 FK (자유 입력으로 시작)
- `offers`(어필리에이트)·`partner_offers` 테이블 변경

## 6. 열린 질문 (민호 컨펌 필요)

1. Toss 신규 가맹 계약을 racket LAB 명의로 새로 할지, maison_rachel 사업자를
   공유할지 — **정산·세금 구조에 직결되므로 코드보다 먼저 결정 필요**
2. 파일럿 매장 후보와 섭외 일정
3. 취소 정책 문안 (수락 전 100% 환불은 확정, 수락 후~장착 전 취소 규정 필요)

## 위험

- **가장 큰 위험은 코드가 아니라 선결조건이다.** C-1~C-4를 다 만들어도
  통신판매중개업 신고와 PG 계약 없이는 실주문을 열 수 없다. 코드와 행정을
  병렬로 진행해야 총 리드타임이 줄어든다.
- 사진 기반 커스터마이저와 달리 여기는 돈이 오간다 — 모든 상태 전이·환불은
  외부 응답 확인 후 기록 원칙을 코드 리뷰 체크리스트에 넣는다.
