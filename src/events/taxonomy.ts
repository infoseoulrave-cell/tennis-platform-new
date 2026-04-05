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
  | "search";

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
}
