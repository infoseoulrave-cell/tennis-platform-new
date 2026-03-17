# AI 추천 설문 명세 초안

작성일: 2026-03-17
문서 목적: 라켓 추천을 위한 MVP 설문 문항, 응답 옵션, 추천 엔진 연결 규칙을 정의한다.

## 1. 설문 원칙

- 3분 이내 완료 가능해야 한다.
- 전문 용어를 최소화한다.
- 질문 수는 6~8문항 내로 제한한다.
- 답변은 추천 엔진의 필터 또는 가중치에 직접 연결되어야 한다.

## 2. 질문 구조

## Q1. 테니스를 친 기간은 얼마나 되나요

키: `experience_level`

옵션

- `starter`: 시작한 지 6개월 미만
- `growing`: 6개월 이상 2년 미만
- `regular`: 2년 이상 꾸준히 플레이
- `competitive`: 경기/대회 지향

영향

- 권장 무게 범위
- 권장 헤드사이즈 범위
- 컨트롤 허용치

## Q2. 스윙은 어느 쪽에 가까운가요

키: `swing_speed`

옵션

- `compact`: 작고 편한 스윙
- `medium`: 보통
- `fast`: 크게 휘두르는 편

영향

- 직구력/컨트롤 가중치
- 적정 무게 범위
- 안정감 허용치

## Q3. 가장 원하는 타구 성향은 무엇인가요

키: `primary_preference`

옵션

- `easy_depth`: 적은 힘으로 길게 뻗는 볼
- `precision`: 방향과 코스 제어
- `spin`: 회전량
- `comfort`: 부드러운 타구감과 팔 편안함
- `stability`: 묵직하게 버텨주는 느낌

영향

- 5축 중 최우선 가중치 설정

## Q4. 지금 가장 아쉬운 점은 무엇인가요

키: `current_pain_point`

옵션

- `short_ball`: 공이 짧다
- `balls_fly`: 공이 자주 길게 뜬다
- `lack_spin`: 스핀이 잘 안 걸린다
- `arm_discomfort`: 팔이 불편하다
- `unstable_impact`: 임팩트가 흔들린다

영향

- 반대 축 보정
- 주의 포인트 생성

## Q5. 팔이나 손목 부담이 있나요

키: `arm_sensitivity`

옵션

- `none`: 거의 없다
- `some`: 가끔 있다
- `high`: 자주 신경 쓰인다

영향

- 충격흡수 최소 기준
- 강성 상한 제한
- 스트링 추천 타입 변경

## Q6. 주로 어떤 플레이를 하나요

키: `play_style`

옵션

- `baseline`: 베이스라인 랠리 중심
- `all_court`: 올라운드
- `doubles`: 복식 중심
- `aggressive`: 공격 전개 중심

영향

- 안정감/스핀/컨트롤 보정
- 대안 라켓 생성

## Q7. 예산은 어느 정도인가요

키: `budget_band`

옵션

- `under_200`: 20만원 미만
- `200_300`: 20만~30만원
- `300_400`: 30만~40만원
- `400_plus`: 40만원 이상

영향

- 후보군 필터링
- 판매처 정렬

## Q8. 추천과 함께 보고 싶은 세팅은 무엇인가요

키: `setup_preference`

옵션

- `string_only`: 스트링 위주
- `grip_only`: 그립 위주
- `full_setup`: 둘 다

영향

- 결과 페이지 모듈 우선순위

## 3. 내부 프로필 매핑

설문이 끝나면 아래 내부 프로필을 만든다.

- `level_bucket`
- `swing_bucket`
- `priority_axis`
- `pain_point_bucket`
- `arm_risk_bucket`
- `play_style_bucket`
- `budget_bucket`
- `setup_bucket`

## 4. 점수 반영 규칙 예시

### 케이스 A

- `primary_preference = easy_depth`
- `swing_speed = compact`

반영

- 직구력 가중치 상승
- 지나치게 낮은 직구력 후보 제거
- 컨트롤 높은 저파워 라켓은 후순위

### 케이스 B

- `primary_preference = comfort`
- `arm_sensitivity = high`

반영

- 충격흡수 최소 점수 기준 설정
- 높은 RA 프레임 감점
- 멀티/소프트폴리 추천 우선

### 케이스 C

- `primary_preference = precision`
- `swing_speed = fast`

반영

- 컨트롤과 안정감 가중치 상승
- 98~100 헤드 중 컨트롤형 후보 우선

## 5. 추천 결과 구성 규칙

결과는 아래 구조로 보여준다.

- `best_match`: 가장 적합한 1개
- `safe_choice`: 실패 확률이 낮은 1개
- `style_pick`: 취향이 강하게 반영된 1개
- `alternative_options`: 대체 후보 2개

## 6. 설문 UX 규칙

- 첫 화면에서 총 질문 수를 알려준다.
- 사용자가 전문 용어를 몰라도 답할 수 있어야 한다.
- 답변할 때마다 예시 문구나 그림을 넣을 수 있다.
- 질문 사이에 결과를 예고하는 문장을 짧게 넣는다.

## 7. 금지 규칙

- 여러 개의 복잡한 스펙 질문을 직접 묻지 않는다.
- NTRP 같은 용어를 전면에 두지 않는다.
- 사용자가 모를 가능성이 높은 라켓 기술명을 그대로 묻지 않는다.

## 8. MVP 완료 기준

- 질문 8개 이하
- 모든 답변이 내부 가중치에 매핑
- 추천 결과 3~5개 산출 가능
- 스트링/그립 추천 분기 가능
