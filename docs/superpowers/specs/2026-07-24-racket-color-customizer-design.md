# 라켓 스트링·그립 컬러 커스터마이저 설계

*작성일: 2026-07-24*  
*대상: canonical `racketlab-one` / `tennis-platform-new`의 라켓 상세 페이지*  
*보호 범위: `racketlab-omega.vercel.app`은 수정·배포 대상이 아니다.*

## 1. 배경

사용자는 라켓 상세 페이지에서 스트링 색상과 그립 색상을 선택하고, 해당 라켓의 실제 프레임 디자인에 조합했을 때의 예상 모습을 즉시 확인하고 싶다.

현재 상세 페이지는 검증된 Tennis Warehouse 제품 사진을 사용한다. 사진은 대체로 500×856~857 계열의 세로형 이미지이며 정면 라켓과 측면 라켓을 함께 보여준다. 로컬 SVG·PNG는 실제 제품 사진으로 검증되지 않았으므로 현재 이미지 resolver가 의도적으로 거부한다. 따라서 프레임 사진은 그대로 유지하고, 제품별로 정렬한 투명 마스크만 브라우저에서 겹치는 방식이 필요하다.

Wilson의 공식 커스텀 장비 경험은 색상·그립·마감 선택을 주요 개인화 요소로 제공한다. 색상 팔레트는 Yonex·Wilson/Luxilon의 실제 스트링 및 오버그립 제품군에서 확인되는 대표 색상을 기준으로 제한한다.

## 2. 확정된 제품 결정

- 시각 정확도: 활성 라켓 54종 각각에 전용 정밀 마스크를 만든다.
- 스트링 팔레트: 검정, 흰색, 내추럴, 실버, 골드, 형광 노랑, 파랑, 빨강.
- 그립 팔레트: 흰색, 검정, 파랑, 빨강, 노랑, 초록, 분홍, 보라.
- 초기 상태: 원본 사진을 그대로 보여준다.
- 변경 대상:
  - 정면 라켓의 스트링 베드
  - 정면 라켓의 그립
  - 측면 라켓의 그립
- 기능 성격: 구매 재고나 실제 주문 옵션이 아닌 시각 시뮬레이션이다.
- 저장 범위: 첫 버전은 현재 상세 페이지 안의 로컬 상태만 사용한다. 계정 저장, URL 공유, 장바구니 연결은 포함하지 않는다.
- 운영 반영: canonical Preview에서 54종 전수 검증 후 별도 승인 전에는 Production으로 배포하지 않는다.

## 3. 목표

1. 프레임 도색과 제품 사진을 바꾸지 않고 스트링·그립 색상만 자연스럽게 바꾼다.
2. 54종 모두에서 마스크가 사진의 스트링과 그립 경계를 벗어나지 않게 한다.
3. 선택 즉시 시각 결과를 갱신하고 레이아웃 이동이나 네트워크 요청을 만들지 않는다.
4. 모바일, 키보드, 스크린리더 환경에서도 색상명과 선택 상태를 이해할 수 있게 한다.
5. 원격 사진 변경이나 마스크 불일치가 감지되면 부정확한 합성을 보여주지 않는다.

## 4. 비목표

- 라켓 프레임 자체의 도색 변경
- 임의 컬러피커와 무제한 색상
- 스트링 브랜드·상품·장력의 구매 옵션 자동 연결
- 사용자 조합의 계정 저장이나 공유 링크
- 서버 측 합성 이미지 생성
- DB 스키마 또는 Supabase 데이터 변경
- Omega 사이트의 코드·배포·도메인 변경

## 5. 사용자 경험

### 5.1 상세 이미지 스튜디오

기존 흰색 정사각형 이미지 영역을 유지한다. 내부에는 다음 순서로 레이어를 쌓는다.

1. 검증된 제품 사진
2. 선택된 스트링 색상 마스크
3. 선택된 그립 색상 마스크

사진과 마스크는 동일한 세로 비율의 내부 스테이지에 `contain`으로 배치한다. 색상을 바꿔도 프레임 사진의 명암, 로고, 배경은 유지된다.

### 5.2 색상 선택기

이미지 바로 아래에 두 개의 `fieldset`을 둔다.

- `스트링 색상`
- `그립 색상`

각 색상은 실제 radio input과 색상 견본, 한글 이름으로 구성한다. 선택된 항목은 체크 표시와 고대비 외곽선으로 구분한다. 색상만으로 선택 상태를 전달하지 않는다.

상단 또는 두 선택기 아래에는 `원본으로 초기화` 버튼을 둔다. 초기화하면 두 오버레이가 모두 사라진다.

### 5.3 안내 문구

선택기 아래에 다음 취지의 짧은 안내를 항상 노출한다.

> 색상 조합을 비교하기 위한 시뮬레이션입니다. 화면·조명·실제 제품 색상에 따라 차이가 날 수 있으며 판매 재고를 의미하지 않습니다.

마스크가 지원되지 않거나 검증에 실패한 경우 색상 선택기를 숨기고 원본 사진만 보여준다.

## 6. 색상 토큰

색상명은 UI와 테스트에서 안정적인 ID를 사용한다. 아래 HEX는 화면 시뮬레이션용 기준색이며 특정 SKU의 정확한 색상값을 주장하지 않는다.

### 6.1 스트링

| ID | 표시명 | 기준색 |
|---|---|---|
| `black` | 검정 | `#171717` |
| `white` | 흰색 | `#F4F2E8` |
| `natural` | 내추럴 | `#D9C69C` |
| `silver` | 실버 | `#A8ADB4` |
| `gold` | 골드 | `#C7A34B` |
| `flash-yellow` | 형광 노랑 | `#D9F22A` |
| `blue` | 파랑 | `#2F65C8` |
| `red` | 빨강 | `#D44747` |

### 6.2 그립

| ID | 표시명 | 기준색 |
|---|---|---|
| `white` | 흰색 | `#F4F2E8` |
| `black` | 검정 | `#171717` |
| `blue` | 파랑 | `#315FA8` |
| `red` | 빨강 | `#C74449` |
| `yellow` | 노랑 | `#E5D33E` |
| `green` | 초록 | `#438A61` |
| `pink` | 분홍 | `#DE88A7` |
| `purple` | 보라 | `#76579C` |

흰색 견본에는 회색 내부 테두리를 추가한다. 선택 외곽선과 키보드 focus ring은 색상 견본 자체와 독립된 고대비 색을 사용한다.

## 7. 기술 설계

### 7.1 컴포넌트 경계

서버 상세 페이지는 데이터 조회와 검증된 이미지 URL 결정을 계속 담당한다. 신규 `RacketVisualCustomizer`만 작은 Client Component로 둔다.

예상 파일:

- `src/components/racket-visual-customizer.tsx`
- `src/data/racket-customizer.ts`
- `public/images/racket-customizer/<slug>-strings.svg`
- `public/images/racket-customizer/<slug>-grip.svg`
- `tests/racket-customizer-data.test.ts`
- `tests/racket-customizer-markup.test.tsx`

상세 페이지는 `slug`, `brand`, `model`, `imageUrl`, `alt`만 커스터마이저에 전달한다. DB와 카탈로그 query 형식은 바꾸지 않는다.

### 7.2 마스크 계약

각 활성 slug는 다음 프로필을 가진다.

```ts
type RacketCustomizerProfile = {
  slug: string;
  expectedProductCode: string;
  sourceLayout: "tw-front-side-v1";
  intrinsicWidth: number;
  intrinsicHeight: number;
  stringMaskUrl: `/images/racket-customizer/${string}-strings.svg`;
  gripMaskUrl: `/images/racket-customizer/${string}-grip.svg`;
};
```

마스크 파일은 원본 사진 픽셀을 포함하지 않는다. 투명 배경 위에 합성 영역의 알파 형태만 저장한다.

- 스트링 마스크: 정면 라켓의 기존 스트링 선을 따라가는 얇은 선 영역
- 그립 마스크: 정면·측면 손잡이 테이프 영역
- 프레임, 버트캡, 로고, 배경은 마스크에서 제외

프로필의 제품 코드가 현재 검증 이미지 URL의 제품 코드와 다르거나 이미지 규격이 예상 범위를 벗어나면 커스터마이저를 비활성화한다.

### 7.3 합성 방식

제품 사진은 기존 `next/image`를 유지한다. 두 마스크는 절대 배치한 장식 레이어로 사용하고 `aria-hidden="true"`를 적용한다.

각 레이어는 SVG 알파를 CSS `mask-image`와 `-webkit-mask-image`로 사용하고 `background-color`에 선택된 토큰을 적용한다. 그립은 원본 사진의 명암이 남도록 제한된 투명도와 blend 방식을 사용한다. 스트링은 가독성을 위해 그립보다 높은 불투명도를 사용한다.

지원 브라우저에서 시각 결과가 달라지지 않도록 CSS mask 미지원 시에는 원본 사진으로 fail-closed 한다. Canvas를 사용하지 않으므로 외부 이미지 CORS와 픽셀 접근 문제를 만들지 않는다.

### 7.4 상태 흐름

```text
상세 서버 데이터
  → 검증된 이미지 URL + slug
  → 프로필·제품 코드 검증
  → 원본 사진 표시
  → 사용자가 스트링/그립 radio 선택
  → 해당 마스크 레이어 색상만 즉시 변경
  → 초기화 시 두 레이어 제거
```

첫 버전의 상태는 `useState`로만 관리한다. 선택 때문에 API, DB, analytics 또는 외부 네트워크 요청을 추가하지 않는다.

## 8. 접근성

- 각 색상 그룹에 `fieldset`과 `legend`를 사용한다.
- 색상 버튼은 실제 radio input의 의미와 키보드 동작을 유지한다.
- 모든 선택지에 한글 색상명을 표시한다.
- 선택 상태는 체크 아이콘, 텍스트, 외곽선으로 함께 표현한다.
- 터치 목표는 최소 44×44px로 한다.
- 키보드 focus ring을 제거하지 않는다.
- 선택 결과 안내는 필요할 때만 짧은 `aria-live="polite"` 영역으로 제공한다.
- 마스크 레이어는 장식이므로 스크린리더 트리에서 제외한다.
- `prefers-reduced-motion`에서는 색상 전환 애니메이션을 제거한다.

## 9. 성능

- 상세 페이지에서 현재 라켓의 마스크 두 개만 요청한다.
- 마스크는 투명 SVG 경로만 포함하고 원본 사진을 복제하지 않는다.
- 색상 변경은 DOM 스타일 변경만 수행한다.
- 이미지 영역의 크기를 고정해 CLS를 만들지 않는다.
- 서버 컴포넌트와 DB query 경로는 유지한다.
- 커스터마이저 Client Component에 카탈로그 전체나 스트링 상품 데이터 전체를 전달하지 않는다.

## 10. 오류 처리와 안전장치

- 이미지 URL이 검증되지 않음: 기존 원본/준비 중 상태 유지
- slug 프로필이 없음: 원본 사진만 표시
- 제품 코드 불일치: 원본 사진만 표시
- 마스크 로딩 실패: 실패한 레이어를 숨기고 선택기를 비활성화
- CSS mask 미지원: 원본 사진만 표시
- 원격 사진의 크롭·규격 변경: 테스트 또는 런타임 검증에서 감지하고 fail-closed
- 흰색·실버가 배경에서 약함: 얇은 중립 outline을 마스크에 더하되 프레임 밖으로 확장하지 않음

## 11. 제작 및 검수 순서

1. 대표 사진 3종으로 스테이지와 합성 방식을 검증한다.
   - Yonex EZONE 100 2025
   - Babolat Pure Aero 2026
   - Head Gravity MP 2025
2. 세 모델의 데스크톱·모바일 결과와 모든 팔레트 색상을 확인한다.
3. 동일한 규격으로 54종의 스트링·그립 마스크를 제작한다.
4. 마스크 프로필과 활성 카탈로그 54종의 1:1 대응을 자동 검사한다.
5. canonical Preview에서 54종을 전수 시각 검수한다.
6. 어긋난 모델은 마스크를 다시 제작하며 공통 근사 마스크로 대체하지 않는다.
7. 리뷰 승인 후에만 Production 반영 여부를 사용자에게 요청한다.

## 12. 테스트 전략

### 12.1 테스트 우선 순서

1. 팔레트 ID·색상명·HEX와 중복 금지를 검증하는 실패 테스트
2. 활성 54 slug가 정확히 하나의 프로필을 갖는지 검증하는 실패 테스트
3. 제품 코드 불일치가 지원되지 않음으로 판정되는 실패 테스트
4. 초기 원본 상태, radio label, 초기화 버튼, 안내 문구를 검증하는 실패 테스트
5. 최소 구현 후 각 테스트를 통과시키고 리팩터링

### 12.2 전체 검증

- `npm test`
- `npm run typecheck`
- `npm run lint`
- `npm run build`
- `git diff --check`
- 데스크톱·모바일에서 54종 전수 시각 검사
- 키보드만으로 색상 선택·초기화
- 가로 overflow, 레이아웃 이동, 브라우저 console error 0건

## 13. 성공 기준

- 활성 라켓 54종에 정밀 스트링·그립 마스크가 하나씩 연결된다.
- 제품 사진의 프레임과 배경은 재색칠되지 않는다.
- 정면 스트링과 정면·측면 그립의 선택 색상이 즉시 반영된다.
- 8개 스트링 색상과 8개 그립 색상, 원본 초기화가 모두 동작한다.
- 모바일 375px에서 가로 overflow가 없다.
- 색상명과 선택 상태를 색상 인지 없이도 이해할 수 있다.
- 마스크·사진 불일치 시 부정확한 시뮬레이션이 노출되지 않는다.
- 기존 상세 정보, 점수, 스트링 추천, 비교, 찜 기능에 회귀가 없다.
- canonical Preview 검수 전 Production 배포가 발생하지 않는다.
- Omega 프로젝트·배포·alias는 변경되지 않는다.

## 14. 리스크와 완화

| 리스크 | 완화 |
|---|---|
| 원격 제품 사진 크롭 변경 | 제품 코드·규격 결합, fail-closed, 전수 회귀 검사 |
| 54종 수작업 마스크의 정렬 편차 | 3종 파일럿으로 규격 고정 후 동일 체크리스트 사용 |
| 실제 제품 색상으로 오인 | 항상 시뮬레이션·재고 비연동 안내 노출 |
| 제3자 사진의 파생 이미지 저장 문제 | 원본 픽셀을 저장·수정하지 않고 알파 마스크만 보관 |
| 상세 페이지 번들 증가 | 현재 slug의 프로필과 두 마스크만 로드 |
| 흰색·실버 대비 부족 | 마스크 내부의 얇은 중립 outline과 명확한 선택 UI |
| 마스크 지원이 불완전한 브라우저 | 원본 사진으로 fail-closed |

## 15. 근거 자료

- Wilson Custom Sports Equipment: <https://www.wilson.com/en-us/explore/custom>
- Yonex Tennis Strings 색상 목록: <https://www.yonex.com/tennis-strings>
- Yonex Super Grap 색상 목록: <https://www.yonex.com/ac102>
- Wilson Pro Overgrip V2 색상 목록: <https://jp.wilson.com/pages/tennis-pro-overgrips-v-2>
- Wilson Korea Luxilon ALU Power Silver: <https://kr.wilson.com/collections/tennis-best/products/wrz995100si>
- Wilson/Luxilon 4G Gold: <https://sg.wilson.com/products/wilson-luxilon-4g-1.25-tennis-string-set-12.2m-gold-co-poly-control-tension-maintenance-wrz997110>
- Next.js Image Component: <https://nextjs.org/docs/app/api-reference/components/image>
