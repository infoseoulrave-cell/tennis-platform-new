# 라켓 DB 및 추천 시스템 설계 초안

작성일: 2026-03-17
적용 범위: 한국 판매 테니스 라켓 중심, 공/웨어러블 확장 가능 구조

## 1. 목표

이 문서의 목적은 한국에서 실제로 판매되는 테니스 라켓 DB를 안정적으로 확보하고, 그 데이터를 추천 시스템에 바로 활용할 수 있도록 구조를 정의하는 것이다.

핵심 원칙은 세 가지다.

1. 국내 구매 가능성이 확인된 제품만 우선 수집한다.
2. 스펙과 이미지는 출처 신뢰도가 높은 소스를 우선 사용한다.
3. 추천과 분류는 AI가 명시된 계산 기준으로 수행한다.
4. 사람의 개입은 데이터 QA와 예외 처리에 집중한다.

라켓의 기능성 점수 체계는 별도 문서 [라켓 해석 프레임워크](/Users/minho/Documents/프로젝트/tennis-platform/docs/specs/racket-interpretation-framework-ko.md) 기준으로 관리한다.
AI 계산 기준은 별도 문서 [AI 라켓 스코어링 방법론](/Users/minho/Documents/프로젝트/tennis-platform/docs/specs/ai-racket-scoring-methodology-ko.md)을 따른다.

## 2. DB 전략 요약

### 권장 전략: 하이브리드 소싱

- 브랜드/공식몰: 정확한 스펙과 고화질 이미지 기준 소스
- 전문 판매처: 국내 판매 여부, 실판매가, 할인 상태 확보
- 쇼핑 API: 판매처 확장, 가격 비교, 검색 유입 대응
- 운영자 검수: 모델명 정규화, 연식 구분, 추천 태그 보정

이 프로젝트는 단일 소스만으로는 품질이 나오기 어렵다. 따라서 "공식 스펙 + 국내 판매처 + 운영 검수"의 3단 구조가 필요하다.

## 3. 데이터 소스 우선순위

## 3-1. Tier 1: 공식 브랜드/공식몰

용도

- 기준 모델명 확보
- 공식 스펙 확보
- 시리즈 체계 확보
- 고화질 이미지 후보 확보

후보 브랜드

- Wilson Korea
- Yonex Korea / Yonex Mall Korea
- Head Korea
- Babolat Korea 또는 국내 공식 유통 채널
- Dunlop Korea 계열 판매처
- Prince Korea 계열 판매처

장점

- 스펙 신뢰도가 높다.
- 신제품 반영이 빠르다.
- 대표 이미지 품질이 가장 좋다.

주의점

- 공식몰도 국내 판매 SKU 전체를 다 담지 않을 수 있다.
- 브랜드마다 표기법이 다르다.
- 이미지 사용은 별도 허용 범위를 확인해야 한다.

## 3-2. Tier 2: 전문 테니스 쇼핑몰

용도

- 국내 실판매 여부 확인
- 가격대 및 세일 상태 확인
- 품절 여부 확인
- 브랜드 누락분 보완

후보 판매처

- 테니스라켓
- 스포닥
- 기타 국내 전문몰

장점

- 한국 유통 현실을 반영하기 쉽다.
- 다브랜드 비교가 가능하다.

주의점

- 스펙 오기입 가능성이 있다.
- 상품명이 판매 목적에 맞게 변형돼 있을 수 있다.
- 이미지 품질 편차가 크다.

## 3-3. Tier 3: 검색/커머스 API

용도

- 판매처 확장
- 가격 비교 보조
- 검색 결과 기반 수요 탐색

후보

- 네이버 검색 API 쇼핑
- 네이버 커머스 API
- 오픈마켓 API는 제휴 상황에 맞춰 후속 검토

장점

- 판매 채널 범위를 넓힐 수 있다.
- 운영 자동화에 유리하다.

주의점

- API 이용약관과 표시 규정을 반드시 따라야 한다.
- 카탈로그 정합성보다 검색 결과 성격이 강한 경우가 있다.

## 4. 추천 DB 구축 방식

### Step 1. 소스 레지스트리 구축

브랜드/판매처별로 아래 정보를 먼저 관리한다.

- source_id
- source_type: official_brand / retailer / marketplace_api
- source_name
- source_url
- crawl_or_api_method
- update_frequency
- image_policy
- reliability_score

### Step 2. 원본 데이터 수집

수집 단위

- 브랜드 카테고리 페이지
- 상품 상세 페이지
- 가격/재고/옵션 정보
- 이미지 URL
- 설명 문구

### Step 3. 정규화

정규화 항목

- 브랜드명 표준화
- 시리즈명 표준화
- 연식 분리
- 무게 단위 통일
- 헤드사이즈 표기 통일
- 밸런스 단위 통일
- 스트링 패턴 통일
- 통화/가격 단위 통일

예시

- "300g", "300 G", "평균무게 300g" -> `weight_grams = 300`
- "100 sq.in", "100", "100inch" -> `head_size_sq_in = 100`
- "16X19", "16x19" -> `string_pattern_mains = 16`, `string_pattern_crosses = 19`

### Step 4. 중복 병합

중복 판별 키 후보

- 브랜드 + 시리즈 + 모델명 + 연식 + 무게
- 보조 키: SKU, EAN, 상품 코드

### Step 5. 운영 검수

운영자가 최종 확정해야 하는 항목

- 모델명 대표 표기
- 연식/세대 구분
- 상충 데이터 정리
- 공식 출처 우선순위 확인
- 이미지 사용 권한 확인

AI가 자동 산출하는 항목

- 입문자 적합도
- 플레이 스타일 태그
- 기능성 해석 점수
- 사용자 노출용 기능성 점수
- 추천 스트링/그립 프로필
- 한 줄 총평과 주의 포인트

### Step 6. 퍼블리시

- 사용자 노출용 카탈로그
- 추천 엔진 피처 테이블
- 가격 오퍼 테이블
- 검색 인덱스

## 5. 권장 데이터 모델

## 5-1. `rackets`

- `id`
- `brand`
- `series`
- `model_name`
- `model_name_ko`
- `release_year`
- `status`
- `description_short`
- `description_long`
- `player_level_min`
- `player_level_max`
- `play_style_primary`
- `play_style_secondary`
- `penetration_score`
- `control_score`
- `spin_score`
- `comfort_score`
- `stability_score`
- `maneuverability_score`
- `arm_friendly_score`
- `forgiveness_score`
- `public_score_penetration`
- `public_score_control`
- `public_score_spin`
- `public_score_comfort`
- `public_score_stability`
- `recommendation_summary`
- `caution_summary`
- `confidence_score`
- `launch_priority`

## 5-2. `racket_specs`

- `racket_id`
- `weight_grams_unstrung`
- `weight_grams_strung`
- `balance_mm_unstrung`
- `balance_mm_strung`
- `head_size_sq_in`
- `length_in`
- `beam_mm_min`
- `beam_mm_mid`
- `beam_mm_max`
- `string_pattern_mains`
- `string_pattern_crosses`
- `stiffness_ra`
- `swing_weight`
- `grip_sizes_available_kr`
- `recommended_tension_min`
- `recommended_tension_max`

## 5-3. `racket_tags`

- `racket_id`
- `tag_type`
- `tag_value`

예시

- `beginner_friendly`
- `spin_friendly`
- `control_focus`
- `arm_comfort`
- `women_popular`
- `junior_transition`
- `baseline`
- `all_court`
- `serve_volley`

## 5-4. `offers`

- `id`
- `racket_id`
- `seller_name`
- `seller_type`
- `source_url`
- `price_krw`
- `list_price_krw`
- `discount_rate`
- `stock_status`
- `shipping_policy_summary`
- `collected_at`
- `availability_confidence`

## 5-5. `media_assets`

- `id`
- `racket_id`
- `asset_type`
- `asset_url`
- `source_name`
- `license_type`
- `usage_allowed`
- `width`
- `height`
- `sort_order`

## 5-6. `gear_pairings`

- `id`
- `racket_id`
- `gear_category`
- `profile_type`
- `product_name`
- `brand_name`
- `fit_reason`
- `priority`
- `active`

예시

- `gear_category = string`
- `profile_type = control_poly`
- `gear_category = grip`
- `profile_type = cushioned_overgrip`

## 5-7. `recommendation_rules`

- `id`
- `rule_name`
- `condition_json`
- `boost_json`
- `exclude_json`
- `reason_template`
- `priority`
- `active`

## 6. 추천용 해석형 메타데이터

상품 스펙만으로는 추천 품질이 부족하다. 운영 검수로 아래 값을 반드시 채워야 한다.

### 필수 해석형 필드

- 적정 사용자 수준
- 스윙 속도 적합도
- 스핀 지향 여부
- 파워 지향 여부
- 컨트롤 지향 여부
- 팔 부담 민감 사용자 적합도
- 첫 라켓 적합도
- 복식 적합도
- 베이스라인 플레이 적합도
- 체격이 작은 사용자 적합도

### 점수화 방식 예시

추천용 내부 점수는 raw v3 `0~100`으로 관리하고 공개 정수 점수는 표시 단계에서 파생한다.

- `power_score`
- `control_score`
- `spin_score`
- `comfort_score`
- `forgiveness_score`
- `advanced_user_score`

초기에는 운영자 점수로 시작하고, 이후 사용자 클릭/구매/찜 데이터로 보정한다.

사용자에게는 각 축 정수 `0~5`와 다섯 축 합계인 정수 `10~15`를 보여준다.
목표 총점은 `round(10 + rawSum / 100)`으로 계산하고 bounded projection과 deterministic largest-remainder로 각 축 정수의 합을 목표 총점과 정확히 맞춘다.
UI는 축 `N/5`, 총점 `N/15`로 표시하며 정렬과 추천은 공개 정수가 아닌 raw v3를 사용한다.
점수 계산의 상세 기준은 [AI 라켓 스코어링 방법론](/Users/minho/Documents/프로젝트/tennis-platform/docs/specs/ai-racket-scoring-methodology-ko.md)에 따른다.
사용자 노출 축은 파워, 컨트롤, 스핀, 편안함, 안정성의 5개로 제한한다.

## 7. 플레이스타일 진단 설문 설계

### 필수 질문

1. 테니스를 친 기간은 얼마나 되나요
2. 평소 스윙은 크게 휘두르는 편인가요
3. 원하는 타구 느낌은 무엇인가요
4. 지금 라켓에서 아쉬운 점은 무엇인가요
5. 팔꿈치/손목 부담이 있나요
6. 주로 어떤 플레이를 하나요
7. 예산은 어느 정도인가요

### 추천 결과에 반영할 변수

- level_bucket
- swing_speed_bucket
- power_vs_control_preference
- spin_preference
- comfort_need
- budget_bucket
- play_pattern

## 8. 추천 알고리즘 권장 구조

### 1단계: 후보군 필터링

- 예산
- 국내 판매 가능 상태
- 사용 레벨 범위
- 무게/헤드사이즈 선호

### 2단계: 규칙 기반 점수화

예시 가중치

- 플레이 스타일 적합도 30%
- 파워/컨트롤 선호 일치 20%
- 스핀 적합도 15%
- 팔 편안함 15%
- 예산 적합도 10%
- 국내 재고/판매 안정성 10%

### 3단계: 운영자 보정

- 화제성 높은 신제품
- 특정 질문 조합에서 만족도가 높았던 제품
- 한국 유통이 안정적인 모델

### 4단계: 설명 생성

추천은 이유가 중요하다. 결과 페이지에는 아래 형태가 적합하다.

- 왜 추천하는지
- 어떤 점은 잘 맞는지
- 어떤 점은 타협해야 하는지
- 비슷한 대안은 무엇인지
- 어떤 스트링/그립과 조합하면 좋은지

## 9. 고화질 이미지 전략

고화질 이미지는 전환율에 매우 중요하지만 저작권 리스크가 크다.

### 권장 원칙

- 브랜드/공식 유통사와 제휴해 제공받는 것을 최우선으로 한다.
- 비제휴 상태에서는 사용 허용 범위를 먼저 확인한다.
- 장기적으로는 자체 촬영 또는 공식 에셋 제공 계약이 가장 안전하다.

### 이미지 운영 방식

- 대표 이미지 1장
- 각도별 상세 이미지 3~6장
- 디테일 확대 이미지
- 비교 카드용 썸네일
- 배경 제거 컷이 있으면 카드형 UI에 유리

이미지 품질 및 컷 구성 기준은 별도 문서 [라켓 해석 프레임워크](/Users/minho/Documents/프로젝트/tennis-platform/docs/specs/racket-interpretation-framework-ko.md)에 정의한다.

## 10. 출시 시점 권장 커버리지

### 최소 런칭 기준

- 라켓 150개 이상
- 브랜드 6개 이상
- 각 라켓에 대해
  - 기본 스펙 90% 이상
  - 해석형 태그 100%
  - 대표 이미지 100%
  - 가격 오퍼 1개 이상

### 권장 런칭 기준

- 라켓 220~300개
- 브랜드 8개 전후
- 상위 인기 모델은 각도별 고화질 이미지 3장 이상
- 추천 시나리오 12개 이상

## 11. 공과 웨어러블 확장 구조

현재 스키마는 라켓에 최적화되어 있으므로, 확장 시 `products` 슈퍼타입을 도입하는 것이 좋다.

### `products`

- `id`
- `category`
- `brand`
- `name`
- `status`
- `description_short`

### `product_attributes`

- `product_id`
- `attribute_key`
- `attribute_value`
- `attribute_value_type`

이 구조를 사용하면 공과 웨어러블도 같은 카탈로그/오퍼/미디어 구조로 관리할 수 있다.

## 12. 웨어러블 데이터 연동 방향

웹앱 우선 출시라면, 웨어러블은 우선 "상품 추천/구매 연결"까지만 넣고 실제 운동 데이터 연동은 후속이 적합하다.

이유

- Apple Health/HealthKit 계열은 Apple 기기 생태계 중심이다.
- Samsung Health 계열도 SDK 기반 접근이 일반적이다.
- Garmin도 개발자/API 체계를 별도 검토해야 한다.

즉, 웹앱만으로는 일관된 연동 경험을 만들기 어렵다. 향후 모바일 앱 또는 하이브리드 전략이 준비된 뒤 연결하는 것이 안정적이다.

## 13. 운영 대시보드 요구사항

운영툴이 없으면 DB 품질이 빠르게 무너진다. 최소한 아래 기능이 필요하다.

- 상품 생성/수정
- 소스별 원본 데이터 확인
- 중복 병합 승인
- 이미지 승인
- 태그/점수 수정
- 가격 오퍼 활성/비활성
- 단종 처리
- 추천 규칙 on/off

## 14. 법무 및 정책 체크포인트

- 이미지 사용 권한
- 브랜드명/로고 사용 범위
- API 이용약관
- 가격 정보 표시 방식
- 제휴 링크/광고 표시 의무

## 15. 바로 실행할 일

### 이번 주 해야 할 일

1. 우선 수집 브랜드 6~8개 확정
2. 판매처 소스 5~10개 확정
3. 라켓 DB 필드 확정
4. 진단 설문 문항 확정
5. 운영 검수 기준서 작성

### 다음 단계 산출물

- DB 스키마 SQL 또는 Prisma 초안
- 추천 규칙 테이블 초안
- 관리자 상품 등록 화면 IA
- 사용자용 라켓 리스트/상세/진단 와이어프레임

## 16. 권장 결론

이 프로젝트의 성패는 라켓 수집량 자체보다 "한국 판매 기준의 정확한 모델 정리"와 "추천 이유의 설득력"에 달려 있다.

따라서 초기에는 아래 원칙이 가장 안전하다.

- 대량 자동수집보다 품질 관리 우선
- 브랜드/전문몰/쇼핑 API를 함께 쓰는 하이브리드 구조
- 추천은 머신러닝보다 규칙 기반부터 시작
- 웨어러블 데이터 연동은 후속
