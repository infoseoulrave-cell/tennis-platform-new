export { runRecommendation } from "./engine";
export type { RecommendationResult, RunRecommendationResult } from "./engine";

export {
  computeAxisScores,
  computeAndPersistScores,
  computeScoresForRacket,
  SCORING_VERSION,
} from "./scoring";
export type { RacketSpecInput, AxisScore, ComputeResult } from "./scoring";

export {
  generateExplanationFragments,
  getAntiRecommendation,
  computeConfidence,
  AXIS_LABELS_KO,
} from "./explanation-templates";
export type { ExplanationFragment, DiagnosisAnswers } from "./explanation-templates";

export { runEvaluation } from "./evaluation-harness";
