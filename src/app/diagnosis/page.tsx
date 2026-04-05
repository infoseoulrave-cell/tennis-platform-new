"use client";

import { useState } from "react";
import Link from "next/link";
import { Chip } from "@/components/chip";
import { DIAGNOSIS_STEPS } from "@/lib/mock-data";

const EXPERIENCES = ["1년 미만", "1-3년", "3-5년", "5년 이상"];
const FREQUENCIES = ["주 1-2회 레저", "주 2-3회 클럽/레슨", "주 3회+ 시합 포함"];
const PLAY_STYLES = [
  "안정적인 컨트롤",
  "강한 파워/스핀",
  "균형 잡힌 올라운드",
];
const PAIN_POINTS = [
  "팔꿈치/손목 통증",
  "공이 짧게 떨어짐",
  "컨트롤이 안됨",
  "스핀이 부족함",
  "라켓이 너무 무거움",
  "라켓이 너무 가벼움",
  "발리가 불안정함",
  "특별히 없음 — 업그레이드",
];
const PRIORITIES = ["파워", "컨트롤", "스핀", "편안함 (팔 보호)", "안정성 (미스 허용)"];

const POPULAR_RACKETS = [
  "Babolat Pure Drive",
  "Wilson Blade 98",
  "Yonex EZONE 100",
  "Head Speed MP",
  "Prince Textreme Tour 100P",
  "Wilson Pro Staff 97",
  "Babolat Pure Aero",
  "Head Gravity MP",
];

export default function DiagnosisPage() {
  const [step, setStep] = useState(1);
  const [currentRacket, setCurrentRacket] = useState<string | null>(null);
  const [racketSearch, setRacketSearch] = useState("");
  const [experience, setExperience] = useState<string | null>(null);
  const [frequency, setFrequency] = useState<string | null>(null);
  const [swingSpeed, setSwingSpeed] = useState(50);
  const [playStyle, setPlayStyle] = useState<string | null>(null);
  const [painPoints, setPainPoints] = useState<string[]>([]);
  const [priorities, setPriorities] = useState<string[]>([]);

  const totalSteps = 6;
  const stepInfo = DIAGNOSIS_STEPS[step - 1];

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

  const filteredRackets = racketSearch
    ? POPULAR_RACKETS.filter((r) =>
        r.toLowerCase().includes(racketSearch.toLowerCase()),
      )
    : POPULAR_RACKETS;

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

  return (
    <main className="min-h-screen flex flex-col bg-white">
      {/* Header */}
      <header className="sticky top-0 bg-white/95 backdrop-blur border-b border-gray-100 px-6 py-3 z-10">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <button
            onClick={() => step > 1 && setStep(step - 1)}
            className={`text-sm ${step > 1 ? "text-gray-600" : "text-transparent pointer-events-none"}`}
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
              style={{ width: `${(step / (totalSteps - 1)) * 100}%` }}
            />
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 px-6 pt-8 pb-32">
        <div className="max-w-lg mx-auto">
          <h2 className="text-xl font-bold text-gray-900 mb-1">
            {stepInfo.description}
          </h2>
          {stepInfo.helpText && (
            <p className="text-sm text-gray-400 mb-6 flex items-start gap-1.5">
              <span className="text-blue-400">💡</span>
              {stepInfo.helpText}
            </p>
          )}

          {/* Step 1: Current Racket */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="라켓 이름 검색..."
                  value={racketSearch}
                  onChange={(e) => setRacketSearch(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="space-y-1.5">
                {filteredRackets.map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setCurrentRacket(r)}
                    className={`w-full text-left px-4 py-3 rounded-xl text-sm transition-all border ${
                      currentRacket === r
                        ? "bg-blue-50 border-blue-200 text-blue-700 font-medium"
                        : "bg-white border-gray-100 text-gray-700 active:bg-gray-50"
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
              <div className="flex gap-2 pt-2">
                <Chip
                  label="잘 모르겠어요"
                  selected={currentRacket === "unknown"}
                  onClick={() => setCurrentRacket("unknown")}
                />
                <Chip
                  label="처음 구매합니다"
                  selected={currentRacket === "first"}
                  onClick={() => setCurrentRacket("first")}
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

          {/* Step 6: Complete - redirect */}
          {step === 6 && (
            <div className="text-center py-8">
              <div className="text-4xl mb-4">🎾</div>
              <h3 className="text-lg font-bold mb-2">진단 완료!</h3>
              <p className="text-sm text-gray-500 mb-6">
                당신에게 맞는 라켓을 찾았습니다
              </p>
              <div className="bg-gray-50 rounded-xl p-4 text-left text-sm space-y-1 mb-6">
                <div className="text-gray-500">
                  현재 라켓:{" "}
                  <span className="text-gray-800 font-medium">
                    {currentRacket === "unknown"
                      ? "모름"
                      : currentRacket === "first"
                        ? "첫 구매"
                        : currentRacket || "미선택"}
                  </span>
                </div>
                <div className="text-gray-500">
                  경력:{" "}
                  <span className="text-gray-800 font-medium">
                    {experience}
                  </span>{" "}
                  / {frequency}
                </div>
                <div className="text-gray-500">
                  스타일:{" "}
                  <span className="text-gray-800 font-medium">{playStyle}</span>
                </div>
                <div className="text-gray-500">
                  우선순위:{" "}
                  <span className="text-gray-800 font-medium">
                    {priorities.join(" > ")}
                  </span>
                </div>
              </div>
              <Link
                href="/results"
                className="inline-flex items-center justify-center w-full px-6 py-4 bg-blue-600 text-white font-semibold rounded-2xl text-base hover:bg-blue-700 transition-colors"
              >
                추천 결과 보기 →
              </Link>
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
              onClick={() => setStep(step + 1)}
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
