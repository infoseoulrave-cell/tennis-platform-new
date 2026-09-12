# Chapter 26 — 스폰서 준비: 계측 · 문의 알림 · 광고 슬롯 · /advertise · 오퍼 시드

### 배경 (2026-09-11 실측)
- `event_log` 43건(7/24~8/15), 이후 0. `partner_inquiries` 0, `offers` 0, `partner_offers` 0.
- Vercel Web Analytics 미설치 → 방문 수를 아무도 모른다. 이 상태로는 브랜드
  스폰서십을 제안할 숫자도, 문의가 왔는지 알 방법도 없다.
- 원칙은 그대로다: **제휴·광고는 점수와 추천 순위에 절대 반영하지 않는다**
  (CANONICAL.md · /partners "광고 없는 진단").

### 완료 내용
1. **계측** — `@vercel/analytics` + `@vercel/speed-insights` 를 루트 레이아웃에
   붙였다. 수집은 Vercel 프로젝트에서 Web Analytics 를 켜야 시작된다(아래 후속).
2. **문의 알림** (`src/lib/inquiry-notify.ts`) — `/api/partner-inquiries` 가 저장
   직후 `after()` 로 텔레그램(`TELEGRAM_BOT_TOKEN` + `TELEGRAM_CHAT_ID`) 또는
   웹훅(`INQUIRY_NOTIFY_WEBHOOK`)에 보낸다. 둘 다 없으면 무동작, 실패해도 접수
   응답은 바뀌지 않는다. 문구 포맷·대상 선택·실패 삼킴 테스트.
3. **광고 슬롯 배관** — `FeaturedRacket.sponsored?: { label, disclosure }`.
   있을 때만 히어로 라켓명 옆 `SponsoredBadge`("광고") 와 고지 문구를 그리고
   `sponsor_impression` / `sponsor_click` 을 남긴다(지면 키 `home_hero`).
   기본값은 없음 — 지금 어떤 라켓도 광고가 아니다. enum 확장 마이그레이션
   `0005_sponsor_events.sql` 동반.
4. **/advertise** — 브랜드·유통사용 미디어 키트. 원칙 3개(점수·순위 비매품 /
   유료 노출 '광고' 표기 / 스펙 출처 공개), 지면 4종 표, 무상 데이터
   파트너십(스펙 검증·이미지·시타 라켓), 매장 소개 무료(/partners), 브랜드가
   기본 선택된 문의 폼. **이용자 수치는 적지 않는다**(테스트로 잠금) — 문의 시
   최신 값으로 준다. 푸터 "브랜드 제휴", /partners 에서 링크.
5. **오퍼 시드** (`scripts/seed-offers.ts`, 기본 dry-run) — 공개 라켓 70종에
   네이버쇼핑 검색 링크(vendor `naver`)를, 쿠팡 파트너스 키가 있으면 딥링크
   API(HMAC 서명, `scripts/lib/coupang-partners.ts`)로 쿠팡 오퍼를 만든다.
   `--apply` 만 DB 에 쓴다. 이번 세션은 dry-run 만 실행(70건 계획, DB 무변경).

### 검증
- 테스트 287/287 · typecheck · lint · build 통과
- `seed-offers.ts` dry-run 실측: 공개 라켓 70종, 계획 70건, 기존 오퍼 겹침 0

### 민호 후속 (코드 밖)
1. Vercel → racketlab → Analytics → **Enable** (Speed Insights 도 함께).
2. 마이그레이션 적용: `npm run db:migrate` (0005, enum 값 2개 추가). 적용 전에는
   sponsor 이벤트 insert 만 조용히 실패하고 나머지는 정상.
3. 알림 env: `vercel env add TELEGRAM_BOT_TOKEN production` / `TELEGRAM_CHAT_ID`
   (또는 `INQUIRY_NOTIFY_WEBHOOK`).
4. 어필리에이트: 쿠팡 파트너스·네이버 쇼핑 커넥트 가입 후 키를 `.env.local` 에
   넣고 `scripts/seed-offers.ts --apply`. 그 전에도 네이버 검색 링크만으로
   "판매처" 위젯을 켤 수 있다(--apply, 키 불필요).

### 남은 것
- 진단 결과 '함께 보면 좋은 라켓' 슬롯과 스트링 가이드 스폰서 자리는 /advertise 에
  지면으로 적었을 뿐 컴포넌트는 아직 없다 — 첫 광고주가 정해지면 만든다.
- OG 이미지(공유 카드)는 여전히 후속.

*마지막 업데이트: 2026-09-11*
