# DB 스키마 초안

작성일: 2026-03-17
문서 목적: 테니스 장비 플랫폼 MVP의 라켓 중심 데이터 구조를 실제 구현 가능한 수준으로 정의한다.

## 1. 설계 원칙

- 라켓을 중심으로 설계하되 공, 스트링, 그립, 웨어러블 확장이 가능해야 한다.
- 상품 원본 데이터와 사용자 노출 데이터를 분리한다.
- AI 점수와 설명은 재생성 가능하게 저장한다.
- 가격/판매처 데이터는 별도 오퍼 테이블로 분리한다.

## 2. 핵심 엔티티

- `sources`
- `rackets`
- `racket_specs`
- `racket_scores`
- `racket_recommendation_profiles`
- `gear_pairings`
- `media_assets`
- `offers`
- `content_links`
- `diagnosis_sessions`
- `diagnosis_answers`

## 3. 테이블 초안

## 3-1. `sources`

용도

- 데이터 출처 관리

필드

- `id` UUID PK
- `name` VARCHAR(120) NOT NULL
- `source_type` VARCHAR(40) NOT NULL
- `base_url` TEXT NOT NULL
- `country_code` CHAR(2) DEFAULT 'KR'
- `reliability_score` NUMERIC(3,2) NOT NULL DEFAULT 0.50
- `image_policy` VARCHAR(40)
- `active` BOOLEAN NOT NULL DEFAULT TRUE
- `created_at` TIMESTAMP NOT NULL
- `updated_at` TIMESTAMP NOT NULL

## 3-2. `rackets`

용도

- 라켓의 대표 엔티티

필드

- `id` UUID PK
- `brand` VARCHAR(80) NOT NULL
- `series` VARCHAR(120)
- `model_name` VARCHAR(180) NOT NULL
- `model_name_ko` VARCHAR(180)
- `slug` VARCHAR(220) UNIQUE NOT NULL
- `release_year` SMALLINT
- `status` VARCHAR(30) NOT NULL DEFAULT 'ACTIVE'
- `segment_weight` VARCHAR(40)
- `segment_head` VARCHAR(40)
- `segment_level` VARCHAR(40)
- `description_short` TEXT
- `description_long` TEXT
- `recommendation_summary` TEXT
- `caution_summary` TEXT
- `confidence_score` NUMERIC(4,3) DEFAULT 0.500
- `hero_image_url` TEXT
- `launch_priority` INTEGER DEFAULT 0
- `created_at` TIMESTAMP NOT NULL
- `updated_at` TIMESTAMP NOT NULL

인덱스

- `INDEX brand`
- `INDEX series`
- `INDEX status`
- `INDEX release_year`
- `INDEX segment_weight`

## 3-3. `racket_specs`

용도

- 정규화된 스펙 저장

필드

- `racket_id` UUID PK FK -> `rackets.id`
- `weight_grams_unstrung` NUMERIC(5,1)
- `weight_grams_strung` NUMERIC(5,1)
- `balance_mm_unstrung` NUMERIC(5,1)
- `balance_mm_strung` NUMERIC(5,1)
- `head_size_sq_in` NUMERIC(5,1)
- `length_in` NUMERIC(4,2)
- `beam_mm_min` NUMERIC(5,1)
- `beam_mm_mid` NUMERIC(5,1)
- `beam_mm_max` NUMERIC(5,1)
- `string_pattern_mains` SMALLINT
- `string_pattern_crosses` SMALLINT
- `stiffness_ra` NUMERIC(5,1)
- `swing_weight` NUMERIC(5,1)
- `grip_sizes_available_kr` VARCHAR(120)
- `recommended_tension_min` NUMERIC(4,1)
- `recommended_tension_max` NUMERIC(4,1)
- `spec_source_id` UUID FK -> `sources.id`
- `created_at` TIMESTAMP NOT NULL
- `updated_at` TIMESTAMP NOT NULL

## 3-4. `racket_scores`

용도

- AI 계산 결과 저장

필드

- `racket_id` UUID PK FK -> `rackets.id`
- `internal_penetration_score` NUMERIC(5,2)
- `internal_control_score` NUMERIC(5,2)
- `internal_spin_score` NUMERIC(5,2)
- `internal_comfort_score` NUMERIC(5,2)
- `internal_stability_score` NUMERIC(5,2)
- `public_score_penetration` SMALLINT
- `public_score_control` SMALLINT
- `public_score_spin` SMALLINT
- `public_score_comfort` SMALLINT
- `public_score_stability` SMALLINT
- `internal_maneuverability_signal` NUMERIC(5,2)
- `internal_forgiveness_signal` NUMERIC(5,2)
- `internal_arm_risk_signal` NUMERIC(5,2)
- `score_version` VARCHAR(40) NOT NULL
- `scored_at` TIMESTAMP NOT NULL

## 3-5. `racket_recommendation_profiles`

용도

- 사용자에게 보여줄 해석 결과와 추천 프로필

필드

- `racket_id` UUID PK FK -> `rackets.id`
- `best_for_level` VARCHAR(40)
- `best_for_play_style` VARCHAR(60)
- `best_for_swing_speed` VARCHAR(40)
- `arm_friendly_label` VARCHAR(40)
- `strength_1` VARCHAR(40)
- `strength_2` VARCHAR(40)
- `caution_1` VARCHAR(120)
- `caution_2` VARCHAR(120)
- `recommended_for_text` TEXT
- `not_recommended_for_text` TEXT
- `generated_at` TIMESTAMP NOT NULL

## 3-6. `gear_pairings`

용도

- 라켓과 잘 맞는 스트링/그립 연결

필드

- `id` UUID PK
- `racket_id` UUID NOT NULL FK -> `rackets.id`
- `gear_category` VARCHAR(30) NOT NULL
- `profile_type` VARCHAR(50) NOT NULL
- `brand_name` VARCHAR(120)
- `product_name` VARCHAR(180)
- `fit_reason` TEXT
- `recommended_tension_range` VARCHAR(40)
- `priority` SMALLINT NOT NULL DEFAULT 1
- `active` BOOLEAN NOT NULL DEFAULT TRUE
- `created_at` TIMESTAMP NOT NULL
- `updated_at` TIMESTAMP NOT NULL

인덱스

- `INDEX racket_id`
- `INDEX gear_category`

## 3-7. `media_assets`

용도

- 대표 이미지와 상세 이미지 저장

필드

- `id` UUID PK
- `racket_id` UUID NOT NULL FK -> `rackets.id`
- `asset_type` VARCHAR(40) NOT NULL
- `asset_url` TEXT NOT NULL
- `source_id` UUID FK -> `sources.id`
- `license_type` VARCHAR(40)
- `usage_allowed` BOOLEAN DEFAULT FALSE
- `width` INTEGER
- `height` INTEGER
- `sort_order` SMALLINT DEFAULT 0
- `created_at` TIMESTAMP NOT NULL
- `updated_at` TIMESTAMP NOT NULL

## 3-8. `offers`

용도

- 판매처/가격 저장

필드

- `id` UUID PK
- `racket_id` UUID NOT NULL FK -> `rackets.id`
- `seller_name` VARCHAR(120) NOT NULL
- `seller_type` VARCHAR(40)
- `source_id` UUID FK -> `sources.id`
- `source_url` TEXT NOT NULL
- `price_krw` INTEGER NOT NULL
- `list_price_krw` INTEGER
- `discount_rate` NUMERIC(5,2)
- `stock_status` VARCHAR(30)
- `shipping_policy_summary` VARCHAR(200)
- `collected_at` TIMESTAMP NOT NULL
- `active` BOOLEAN NOT NULL DEFAULT TRUE

인덱스

- `INDEX racket_id`
- `INDEX seller_name`
- `INDEX price_krw`

## 3-9. `content_links`

용도

- 라켓과 콘텐츠 연결

필드

- `id` UUID PK
- `racket_id` UUID NOT NULL FK -> `rackets.id`
- `content_slug` VARCHAR(220) NOT NULL
- `link_type` VARCHAR(40) NOT NULL
- `priority` SMALLINT DEFAULT 1

## 3-10. `diagnosis_sessions`

용도

- 추천 설문 세션 저장

필드

- `id` UUID PK
- `session_token` VARCHAR(120) UNIQUE NOT NULL
- `user_id` UUID NULL
- `result_profile` JSONB
- `top_racket_ids` JSONB
- `created_at` TIMESTAMP NOT NULL
- `updated_at` TIMESTAMP NOT NULL

## 3-11. `diagnosis_answers`

용도

- 설문 답변 저장

필드

- `id` UUID PK
- `diagnosis_session_id` UUID NOT NULL FK -> `diagnosis_sessions.id`
- `question_key` VARCHAR(60) NOT NULL
- `answer_key` VARCHAR(60) NOT NULL
- `answer_value` VARCHAR(120)
- `weight_modifier` NUMERIC(5,2)
- `created_at` TIMESTAMP NOT NULL

## 4. JSON 필드 사용 원칙

아래는 JSONB 사용이 적절하다.

- 추천 결과 스냅샷
- 설문 결과 프로필
- 향후 실험용 피처 로그

아래는 JSONB보다 컬럼 분리가 낫다.

- 5축 점수
- 스펙
- 가격
- 판매처

## 5. 상태값 권장안

### `rackets.status`

- `ACTIVE`
- `COMING_SOON`
- `DISCONTINUED`
- `HIDDEN`

### `offers.stock_status`

- `IN_STOCK`
- `LOW_STOCK`
- `OUT_OF_STOCK`
- `UNKNOWN`

## 6. 최소 구현 우선순위

1. `sources`
2. `rackets`
3. `racket_specs`
4. `racket_scores`
5. `gear_pairings`
6. `media_assets`
7. `offers`
8. `diagnosis_sessions`
9. `diagnosis_answers`

## 7. 추후 확장 방향

- `products` 슈퍼타입 도입
- 공, 스트링, 그립, 웨어러블 통합
- 사용자 리뷰, 클릭 로그, 추천 개선 피처 추가
