# VI 적용 — 로고 시안11 기반 인터페이스 톤 조정 (2026-08-13, 민호 승인)

## 방향

라이트 기조 유지 (민호 결정). Ink 60%는 다크 전환이 아니라 다크 밴드(히어로·선수
레일·진단 배너·푸터)로 해석하고, 지면은 Chalk 로 간다. VI 3원칙:
PRECISE(수치) · QUIET(여백·타이포) · PLAYFUL(라임 1점).

## 1. 컬러 토큰 (globals.css @theme — 이름 유지, 값 교체)

| 토큰 | 값 | 비고 |
|---|---|---|
| --color-bg | #F3F0EA | Chalk 지면 |
| --color-bg-subtle | #ECE8DF | 진한 초크 밴드 |
| --color-bg-white | #FBFAF6 | 초크 화이트 카드 |
| --color-bg-dark | #141414 | Ink |
| --color-bg-footer | #141414 | 네이비 회색 폐기 |
| --color-accent | #D8F34E | Court Lime |
| --color-brand | #141414 | 네이비 폐기 — 눈썹 라벨은 잉크로 (QUIET) |
| --color-brand-light | #52514D | 웜 그레이 |
| --color-brand-subtle | #ECE8DF | 초크 |
| --color-text | #141414 / secondary #52514D / muted #9C978C | 웜 그레이 계열 |
| --color-border | #E0DCD2 | 웜 보더 |
| court-blue/clay/grass | 유지 | 브랜드색이 아닌 콘텐츠 의미색 |

## 2. 타이포그래피

- next/font/google: Archivo 400/500/800 (`--font-archivo`), Instrument Serif
  Italic 400 (`--font-instrument`).
- --font-sans 스택 맨 앞에 Archivo → 라틴·숫자는 Archivo, 한글은 Pretendard 분담.
- Instrument Serif Italic 은 로고 lab·시리즈명·인용에만 (VI 규칙, 본문 금지).

## 3. 로고

- `src/components/wordmark.tsx`: `racket`(Archivo 800, -0.02em) +
  `lab`(Instrument Serif Italic, 간격은 소문자 o의 1/4 ≈ 0.07em).
  라이트 배경 = 둘 다 Ink, 다크 배경 = racket 초크 / lab 라임.
- 나브·푸터의 "racket LAB" 텍스트를 워드마크로 교체.
- 파비콘: 로고 SVG가 웹폰트 참조 방식이라 그대로 못 씀 →
  appicons-palette.png 에서 아이콘 크롭 → `src/app/icon.png` (현재 파비콘 없음).

## 4. 시그니처 그래픽

- 다크 히어로 배경: 16×19 스트링 그리드 텍스처 (CSS repeating-linear-gradient,
  초크 4~5% 투명도, pointer-events 없음).
- 라임 도트(스윗스팟) 1점은 푸터에. 히어로의 라임 1점은 주 CTA 이므로
  도트를 히어로에 두지 않는다 (화면당 라임 1점).

## 5. 라임 절제 정비

- 5축 막대 = 데이터 정체성 → 새 라임으로 유지.
- 선수 카드 amber 시너지 박스 → 초크 톤 (VI 밖 색 제거).
- 푸터 text-blue-200 잔재 → 웜 그레이.

## 검증

기존 테스트 271개(hero 문자열·h1 단일 규칙 포함) 통과 유지, dev 스크린샷 검수,
PR → CI → Preview → 병합 → racketlab.kr 배포 확인.
