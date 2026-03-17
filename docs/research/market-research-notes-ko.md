# 한국 테니스 장비 플랫폼 리서치 노트

작성일: 2026-03-17

## 1. 핵심 인사이트 요약

- 한국에는 이미 브랜드 공식몰과 전문 테니스몰이 충분히 존재한다.
- 따라서 신규 서비스의 승부처는 "판매 자체"보다 "추천과 해석"이다.
- 라켓 DB는 공식몰만으로 부족하고, 전문몰과 쇼핑 API를 함께 써야 국내 판매 현실을 반영할 수 있다.
- 웨어러블은 상품 탐색/구매 연결은 가능하지만, 실데이터 연동은 웹앱 우선 전략과 잘 맞지 않는다.
- 국내 테니스 플랫폼 경쟁사는 코트 예약/대회/커뮤니티 쪽이 강하고 장비 중심 플랫폼은 아직 비어 있다.

## 2. 확인한 시장/경쟁 환경

### 브랜드/공식 유통 채널

- HEAD Korea는 한국 공식 수입업체 사이트에서 테니스 카테고리와 라켓 제품 페이지를 직접 운영하고 있다.
- Yonex Korea는 요넥스몰을 별도 운영하고 있다.
- Wilson Korea도 공식몰 구조가 존재하며 국내 신제품 출시 소식이 이어지고 있다.
- Dunlop Sports Korea도 공식몰 및 이벤트 페이지를 운영 중이다.

### 전문 판매 채널

- 국제스포츠(tennisracket.co.kr)는 윌슨, 바볼랏, 요넥스, 헤드, 던롭, 프린스 등 다수 브랜드를 함께 판매한다.
- 스포닥은 초보/여성/시니어 추천 라켓처럼 해석형 카테고리를 일부 사용하고 있다.

### 경쟁 서비스 성격

- 베이스라인은 테니스장 예약, 대회, 랭킹, 매칭 등 "테니스 라이프 플랫폼" 포지션이 강하다.
- 장비 추천과 장비 DB를 중심에 둔 플랫폼 포지션은 상대적으로 비어 있다.

## 3. 데이터 확보 전략에 준 영향

### 왜 공식몰만으로 부족한가

- 공식몰은 스펙과 이미지 품질은 좋지만 국내 유통 SKU 전체를 빠짐없이 보여주지 않을 수 있다.
- 브랜드마다 상품명과 시리즈 표기 방식이 다르다.

### 왜 전문몰이 필요한가

- 실제 판매 중인 모델과 가격대, 행사 모델, 병행/정발 여부의 단서를 얻기 쉽다.
- 다브랜드 비교 데이터가 한 곳에 모여 있다.

### 왜 쇼핑 API가 필요한가

- 판매처 수를 넓힐 수 있다.
- 가격 비교와 수요 탐색을 보조할 수 있다.
- 단, 검색 결과 성격이 강하므로 정규화와 검수가 반드시 필요하다.

## 4. 웨어러블 전략에 준 영향

- Apple은 HealthKit 중심으로 iPhone, iPad, Apple Watch 생태계에서 건강/피트니스 데이터를 제공한다.
- Samsung은 Samsung Health Sensor SDK와 파트너 등록 절차가 필요하다.
- Garmin은 Garmin Connect Developer Program과 Health API/SDK 구조를 분리해 제공한다.

결론적으로 웹앱 선출시 단계에서는 웨어러블 실연동보다 "상품 큐레이션과 구매 연결"이 더 현실적이다.

## 5. 바로 실행 가능한 운영 결론

### 라켓 DB

- 초기 소스는 공식몰 4~6곳 + 전문몰 3~5곳 + 네이버 계열 API 조합이 적절하다.
- 런칭 전에는 운영자 검수 프로세스를 반드시 넣어야 한다.

### 이미지

- 대표 이미지와 상세 이미지는 제휴/허가 기반 확보가 가장 안전하다.
- 비제휴 상태에서는 사용 허용 범위를 먼저 검토해야 한다.

### 추천

- "입문자 추천", "팔 편한 라켓", "스핀형", "복식형" 등 한국 동호인 언어 기반의 해석 태그가 중요하다.
- 초기에는 머신러닝보다 규칙 기반 추천이 설명 가능성과 운영 효율 측면에서 유리하다.

## 6. 참고 소스

- HEAD Korea: https://headkorea.kr/
- 요넥스몰: https://www.yonexmall.co.kr/
- 국제스포츠: https://www.tennisracket.co.kr/
- 스포닥: https://www.spodaq.co.kr/
- 베이스라인: https://baceline.io/
- 네이버 쇼핑 검색 API: https://developers.naver.com/docs/serviceapi/search/shopping/shopping.md
- 네이버 커머스 플랫폼 제휴 API: https://api.commerce.naver.com/partner
- Apple Health & Fitness: https://developer.apple.com/health-fitness/
- Samsung Health Sensor SDK: https://developer.samsung.com/health/sensor
- Garmin Connect Developer Program: https://developer.garmin.com/gc-developer-program/overview/
- Garmin Health API: https://developer.garmin.com/gc-developer-program/health-api/
