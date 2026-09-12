/**
 * Event Taxonomy — tennis-platform v0.1
 *
 * Every user-facing action that matters for product analytics,
 * recommendation calibration, or partner attribution is listed here.
 * Events are logged to the event_log table via the track() helper.
 */

export type EventType =
  | "diagnosis_start"
  | "diagnosis_step_complete"
  | "diagnosis_complete"
  | "recommendation_view"
  | "recommendation_detail_view"
  | "compare_add"
  | "compare_view"
  | "save_result"
  | "partner_click"
  | "partner_lead_submit"
  | "page_view"
  | "search"
  | "sponsor_impression"
  | "sponsor_click"
  | "catalog_filter"
  | "store_click";

export interface EventPayloadMap {
  diagnosis_start: { entryPoint: string };
  diagnosis_step_complete: {
    stepNumber: number;
    questionKey: string;
    answerValue: unknown;
  };
  diagnosis_complete: {
    profileId: string;
    totalSteps: number;
    durationMs: number;
  };
  recommendation_view: {
    runId: string;
    resultCount: number;
  };
  recommendation_detail_view: {
    runId: string;
    racketModelId: string;
    rank: number;
  };
  compare_add: {
    racketModelId: string;
    compareListSize: number;
  };
  compare_view: {
    racketModelIds: string[];
  };
  save_result: {
    runId: string;
    racketModelId: string;
  };
  partner_click: {
    partnerOfferId: string;
    racketModelId: string;
    attributionTag: string;
  };
  partner_lead_submit: {
    partnerOfferId: string;
    racketModelId: string;
    leadType: string;
  };
  page_view: {
    path: string;
    pageType: string;
  };
  search: {
    query: string;
    resultCount: number;
  };
  /** 광고 표기된 슬롯이 화면에 들어왔다 (히어로 슬라이드 전환 시 1회). */
  sponsor_impression: { slug: string; label: string; placement: string };
  /** 광고 표기된 슬롯의 링크를 눌렀다. */
  sponsor_click: { slug: string; label: string; placement: string };
  /** 카테고리 탐색 신호이며 구매 의사나 주문 확정이 아니다. */
  catalog_filter: { category: string; brand: string; subcategory: string; resultCount: number; action: "view" | "change" };
  /** 제휴 계약이 없는 공식몰 이동을 affiliate_click과 구분한다. */
  store_click: { collectionId: string; category: string; subcategory: string; collectionCategories: readonly string[]; brand: string; destinationHost: string; commercialRelationship: "none" };
}
