"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Chip } from "@/components/chip";
import { DIAGNOSIS_STEPS } from "@/lib/mock-data";
import { getSessionId, trackEvent } from "@/lib/track-event";
import {
  EXPERIENCES,
  EXPERIENCE_MAP,
  FREQUENCIES,
  FREQUENCY_MAP,
  PLAY_STYLES,
  PLAY_STYLE_MAP,
  PAIN_POINTS,
  PAIN_POINT_MAP,
  PRIORITIES,
  PRIORITY_MAP,
} from "@/lib/diagnosis-mappings";

// ---------- racket search types ----------

type RacketSearchResult = {
  racketModelId: string;
  displayName: string;
  displayNameKo: string | null;
  brandName: string;
  brandNameKo: string | null;
  segment: string | null;
  thumbnailUrl: string | null;
};

// ---------- component ----------

export default function DiagnosisPage() {
  const router = useRouter();
  const startTime = useRef<number | null>(null);

  useEffect(() => {
    startTime.current ??= Date.now();
  }, []);

  // diagnosis state
  const [step, setStep] = useState(1);
  const [currentRacket, setCurrentRacket] = useState<string | null>(null);
  const [selectedRacketId, setSelectedRacketId] = useState<string | null>(null);
  const [racketSearch, setRacketSearch] = useState("");
  const [searchResults, setSearchResults] = useState<RacketSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [experience, setExperience] = useState<string | null>(null);
  const [frequency, setFrequency] = useState<string | null>(null);
  const [swingSpeed, setSwingSpeed] = useState(50);
  const [playStyle, setPlayStyle] = useState<string | null>(null);
  const [painPoints, setPainPoints] = useState<string[]>([]);
  const [priorities, setPriorities] = useState<string[]>([]);

  // submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [runId, setRunId] = useState<string | null>(null);

  const totalSteps = 6;
  const stepInfo = DIAGNOSIS_STEPS[step - 1];

  // track diagnosis_start on mount
  useEffect(() => {
    trackEvent("diagnosis_start", { entryPoint: "diagnosis_page" });
  }, []);

  // debounced racket search
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleRacketSearch = useCallback((query: string) => {
    setRacketSearch(query);

    if (searchTimer.current) clearTimeout(searchTimer.current);

    if (!query.trim() || query.trim().length < 1) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    searchTimer.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/diagnosis/racket-search?q=${encodeURIComponent(query.trim())}&limit=8`,
        );
        if (res.ok) {
          const data = await res.json();
          setSearchResults(data.results ?? []);
        }
      } catch {
        // silently fail
      } finally {
        setIsSearching(false);
      }
    }, 300);
  }, []);

  function selectRacket(name: string, id: string | null) {
    setCurrentRacket(name);
    setSelectedRacketId(id);
    setRacketSearch("");
    setSearchResults([]);
  }

  function togglePainPoint(p: string) {
    setPainPoints((prev) =>
      prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p],
    );
  }

  function togglePriority(p: string) {
    setPriorities((prev) => {
      if (prev.includes(p)) return prev.filter((x) => x !== p);
      if (prev.length >= 2) return prev;
      return [...prev, p];
    });
  }

  function canNext(): boolean {
    switch (step) {
      case 1:
        return true;
      case 2:
        return !!experience && !!frequency;
      case 3:
        return !!playStyle;
      case 4:
        return painPoints.length > 0;
      case 5:
        return priorities.length === 2;
      default:
        return true;
    }
  }

  // track step completion + advance
  function advanceStep() {
    const questionKeys = [
      "current_racket",
      "play_profile",
      "swing_style",
      "pain_points",
      "priority_tradeoffs",
    ];
    trackEvent("diagnosis_step_complete", {
      stepNumber: step,
      questionKey: questionKeys[step - 1] ?? `step_${step}`,
      answerValue: getStepAnswer(step),
    });
    setStep(step + 1);
  }

  function getStepAnswer(s: number): unknown {
    switch (s) {
      case 1:
        return { racket: currentRacket, racketModelId: selectedRacketId };
      case 2:
        return { experience, frequency };
      case 3:
        return { swingSpeed, playStyle };
      case 4:
        return painPoints;
      case 5:
        return priorities;
      default:
        return null;
    }
  }

  // build answers and submit
  async function submitDiagnosis() {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setSubmitError(null);

    const sessionId = getSessionId();

    // determine current racket selection type
    let selection: "search" | "unknown" | "first_purchase" = "search";
    if (currentRacket === "unknown") selection = "unknown";
    else if (currentRacket === "first") selection = "first_purchase";

    const answers = {
      current_racket: {
        racketModelId: selectedRacketId ?? null,
        selection,
      },
      play_profile: {
        experience: EXPERIENCE_MAP[experience ?? ""] ?? experience,
        frequency: FREQUENCY_MAP[frequency ?? ""] ?? frequency,
      },
      swing_style: {
        swingSpeed: swingSpeed / 100, // normalize to 0-1
        playStyle: PLAY_STYLE_MAP[playStyle ?? ""] ?? playStyle,
      },
      pain_points: painPoints.map((p) => PAIN_POINT_MAP[p] ?? p),
      priority_tradeoffs: {
        first: PRIORITY_MAP[priorities[0]] ?? priorities[0],
        second: PRIORITY_MAP[priorities[1]] ?? priorities[1],
      },
      confirmation: true,
    };

    try {
      const res = await fetch("/api/diagnosis/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, answers }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error ?? `Server error (${res.status})`);
      }

      const data = await res.json();
      const recRunId = data.recommendationRunId as string;
      setRunId(recRunId);

      // track completion
      trackEvent("diagnosis_complete", {
        profileId: data.playerProfile?.id ?? "",
        totalSteps: 5,
        durationMs: startTime.current ? Date.now() - startTime.current : 0,
      });

      // navigate to real results
      router.push(`/results/${recRunId}`);
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : "추천 생성에 실패했습니다",
      );
      setIsSubmitting(false);
    }
  }

  // auto-submit when reaching step 6
  useEffect(() => {
    if (step === 6 && !isSubmitting && !runId) {
      submitDiagnosis();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  return (
    <main className="min-h-screen flex flex-col bg-white">
      {/* Header */}
      <header className="sticky top-0 bg-white/95 backdrop-blur border-b border-gray-100 px-6 py-3 z-10">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <button
            onClick={() => step > 1 && step < 6 && setStep(step - 1)}
            className={`text-sm ${step > 1 && step < 6 ? "text-gray-600" : "text-transparent pointer-events-none"}`}
          >
            ← 이전
          </button>
          <span className="text-xs text-gray-400 font-medium">
            {step < totalSteps ? `${step}/${totalSteps - 1}` : "완료"}
          </span>
          <Link href="/" className="text-sm text-gray-400">
            ✕
          </Link>
        </div>
        {/* Progress bar */}
        <div className="max-w-lg mx-auto mt-2">
          <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 rounded-full transition-all duration-300"
              style={{ width: `${(Math.min(step, 5) / 5) * 100}%` }}
            />
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 px-6 pt-8 pb-32">
        <div className="max-w-lg mx-auto">
          {step < totalSteps && (
            <>
              <h2 className="text-xl font-bold text-gray-900 mb-1">
                {stepInfo.description}
              </h2>
              {stepInfo.helpText && (
                <p className="text-sm text-gray-400 mb-6 flex items-start gap-1.5">
                  <span className="text-blue-400" aria-hidden="true">ℹ️</span>
                  {stepInfo.helpText}
                </p>
              )}
            </>
          )}

          {/* Step 1: Current Racket */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="라켓 이름 검색..."
                  value={racketSearch}
                  onChange={(e) => handleRacketSearch(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {isSearching && (
                  <div className="absolute right-3 top-3">
                    <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
              </div>

              {/* API search results */}
              {searchResults.length > 0 && (
                <div className="space-y-1.5">
                  {searchResults.map((r) => (
                    <button
                      key={r.racketModelId}
                      type="button"
                      onClick={() =>
                        selectRacket(
                          `${r.brandName} ${r.displayName}`,
                          r.racketModelId,
                        )
                      }
                      className={`w-full text-left px-4 py-3 rounded-xl text-sm transition-all border ${
                        selectedRacketId === r.racketModelId
                          ? "bg-blue-50 border-blue-200 text-blue-700 font-medium"
                          : "bg-white border-gray-100 text-gray-700 active:bg-gray-50"
                      }`}
                    >
                      <span className="text-gray-400 text-xs">
                        {r.brandNameKo ?? r.brandName}
                      </span>
                      <br />
                      {r.displayNameKo ?? r.displayName}
                    </button>
                  ))}
                </div>
              )}

              {/* Selected racket indicator */}
              {currentRacket &&
                currentRacket !== "unknown" &&
                currentRacket !== "first" &&
                searchResults.length === 0 &&
                !racketSearch && (
                  <div className="flex items-center gap-2 px-4 py-3 bg-blue-50 border border-blue-200 rounded-xl text-sm text-blue-700 font-medium">
                    <span>🎾</span>
                    <span>{currentRacket}</span>
                    <button
                      type="button"
                      onClick={() => {
                        setCurrentRacket(null);
                        setSelectedRacketId(null);
                      }}
                      className="ml-auto text-blue-400 hover:text-blue-600"
                    >
                      ✕
                    </button>
                  </div>
                )}

              {/* No search, no selection — show prompt */}
              {!racketSearch && !currentRacket && (
                <p className="text-xs text-gray-400">
                  브랜드나 모델명을 검색하세요 (예: Wilson Blade, 바볼랏)
                </p>
              )}

              <div className="flex gap-2 pt-2">
                <Chip
                  label="잘 모르겠어요"
                  selected={currentRacket === "unknown"}
                  onClick={() => selectRacket("unknown", null)}
                />
                <Chip
                  label="처음 구매합니다"
                  selected={currentRacket === "first"}
                  onClick={() => selectRacket("first", null)}
                />
              </div>
            </div>
          )}

          {/* Step 2: Play Profile */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <label className="text-sm font-medium text-gray-600 mb-3 block">
                  테니스 경력
                </label>
                <div className="flex flex-wrap gap-2">
                  {EXPERIENCES.map((e) => (
                    <Chip
                      key={e}
                      label={e}
                      selected={experience === e}
                      onClick={() => setExperience(e)}
                    />
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600 mb-3 block">
                  주로 어떻게 치시나요?
                </label>
                <div className="flex flex-wrap gap-2">
                  {FREQUENCIES.map((f) => (
                    <Chip
                      key={f}
                      label={f}
                      selected={frequency === f}
                      onClick={() => setFrequency(f)}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Swing and Style */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <label className="text-sm font-medium text-gray-600 mb-3 block">
                  스윙 스피드
                </label>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-400">느린</span>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={swingSpeed}
                    onChange={(e) => setSwingSpeed(Number(e.target.value))}
                    className="flex-1 accent-blue-500"
                  />
                  <span className="text-xs text-gray-400">빠른</span>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600 mb-3 block">
                  어떤 플레이를 선호하시나요?
                </label>
                <div className="flex flex-wrap gap-2">
                  {PLAY_STYLES.map((s) => (
                    <Chip
                      key={s}
                      label={s}
                      selected={playStyle === s}
                      onClick={() => setPlayStyle(s)}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Pain Points */}
          {step === 4 && (
            <div>
              <p className="text-xs text-gray-400 mb-4">복수 선택 가능</p>
              <div className="flex flex-wrap gap-2">
                {PAIN_POINTS.map((p) => (
                  <Chip
                    key={p}
                    label={p}
                    selected={painPoints.includes(p)}
                    onClick={() => togglePainPoint(p)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Step 5: Priority Tradeoffs */}
          {step === 5 && (
            <div>
              <p className="text-xs text-gray-400 mb-4">
                탭하여 순서대로 2개 선택
              </p>
              <div className="space-y-2">
                {PRIORITIES.map((p) => {
                  const idx = priorities.indexOf(p);
                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() => togglePriority(p)}
                      className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm border transition-all ${
                        idx >= 0
                          ? "bg-blue-50 border-blue-200 text-blue-700 font-medium"
                          : "bg-white border-gray-200 text-gray-700 active:bg-gray-50"
                      }`}
                    >
                      {idx >= 0 && (
                        <span className="w-6 h-6 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center font-bold">
                          {idx + 1}
                        </span>
                      )}
                      {p}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 6: Submitting / Complete */}
          {step === 6 && (
            <div className="text-center py-8">
              {isSubmitting && (
                <>
                  <div className="w-12 h-12 mx-auto mb-4 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin" />
                  <h3 className="text-lg font-bold mb-2">
                    맞춤 라켓을 찾고 있습니다...
                  </h3>
                  <p className="text-sm text-gray-500">
                    검증된 현재 카탈로그를 분석하고 있습니다
                  </p>
                </>
              )}

              {submitError && (
                <>
                  <div className="text-4xl mb-4">⚠️</div>
                  <h3 className="text-lg font-bold mb-2 text-red-600">
                    추천 생성 실패
                  </h3>
                  <p className="text-sm text-gray-500 mb-4">{submitError}</p>
                  <button
                    type="button"
                    onClick={() => {
                      setSubmitError(null);
                      submitDiagnosis();
                    }}
                    className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors"
                  >
                    다시 시도
                  </button>
                </>
              )}

              {runId && !isSubmitting && !submitError && (
                <>
                  <div className="text-4xl mb-4">🎾</div>
                  <h3 className="text-lg font-bold mb-2">진단 완료!</h3>
                  <p className="text-sm text-gray-500 mb-6">
                    결과 페이지로 이동합니다...
                  </p>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Bottom CTA */}
      {step < totalSteps && (
        <div className="fixed bottom-0 inset-x-0 bg-white border-t border-gray-100 px-6 py-4 safe-bottom">
          <div className="max-w-lg mx-auto">
            <button
              type="button"
              onClick={advanceStep}
              disabled={!canNext()}
              className={`w-full px-6 py-3.5 rounded-xl text-sm font-semibold transition-colors ${
                canNext()
                  ? "bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800"
                  : "bg-gray-100 text-gray-400 cursor-not-allowed"
              }`}
            >
              {step === totalSteps - 1 ? "결과 보기" : "다음으로"}
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
