# Chapter 14 — 마켓플레이스 C조각 설계·입점 문의 배너

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
