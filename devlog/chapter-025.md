# Chapter 25 — VI 적용: Ink · Court Lime · Chalk

### 목표
민호가 확정한 VI(로고 시안11)를 인터페이스에 적용한다. 라이트 기조 유지
(민호 결정) — Ink 60%는 다크 밴드로 해석하고 지면은 Chalk.
스펙 문서: `docs/superpowers/specs/2026-08-13-vi-application-design.md`

### 완료 내용
- **토큰 교체**: 지면 Chalk `#F3F0EA`, 카드 초크화이트 `#FBFAF6`, 밴드
  `#ECE8DF`, 다크·푸터 Ink `#141414`, 액센트 Court Lime `#D8F34E`,
  텍스트·보더 웜 그레이. 네이비 브랜드 폐기(토큰 이름은 유지, 값만 잉크로).
  코트 3색은 콘텐츠 의미색이라 유지.
- **타이포**: next/font 로 Archivo 400/500/800 + Instrument Serif Italic.
  --font-sans 맨 앞이 Archivo → 라틴·숫자는 Archivo, 한글은 Pretendard.
- **워드마크** (`src/components/wordmark.tsx`): `racket`(800, -0.02em) +
  `lab`(Instrument Serif Italic). 나브·푸터의 "racket LAB" 텍스트 교체.
  다크에서는 racket 초크 / lab 라임. 브랜드 표기 전면 `racket lab` 으로.
- **시그니처**: 히어로 다크 면에 16×19 스트링 그리드 텍스처(초크 5%,
  라디얼 마스크). 라임 도트(스윗스팟)는 푸터에 1점 — 히어로의 라임 1점은
  주 CTA 이므로 겹치지 않게 (화면당 라임 1점 원칙).
- **정리**: 선수 카드 amber 시너지 박스 → 초크 톤, 푸터 blue-200 잔재 →
  웜 그레이, 파비콘·앱아이콘 신설(제공된 앱아이콘 시트에서 잉크 아이콘
  추출, 기존 파비콘 없었음).

### 검증
- 테스트 271/271 · typecheck · lint 통과 (hero 문자열·h1 규칙 유지)
- dev 실측: 워드마크, 그리드 텍스처, 초크 지면, Archivo 숫자, 푸터 도트 확인

### 후속 조정 (민호 피드백, 같은 날)
- 로고 lab 은 배경과 무관하게 **항상 라임** (primary-dark lockup 느낌).
- 히어로 스트링 그리드 제거 → **현재 캐러셀 라켓의 광고 촬영 사진**을
  배경에 포스터처럼 (opacity 55 + 좌측·하단 그라데이션, 슬라이드와 함께 회전).
- 지면이 누렇다는 피드백 → Chalk 원색은 로고·인쇄용으로 남기고 UI 지면은
  뉴트럴 오프화이트(#F7F7F5 계열)로 냉각.

### 남은 것
- OG 이미지(공유 카드)를 VI 로 제작하는 것은 후속
- racketlab.kr 을 canonical URL 로 승격할지 민호와 결정 (도메인은 연결 완료)

*마지막 업데이트: 2026-08-13*
