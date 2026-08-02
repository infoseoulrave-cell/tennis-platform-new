"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import {
  buildQuickStartAnswers,
  emptyQuickStartSelection,
  isQuickStartComplete,
  QUICK_START_EXPERIENCES,
  QUICK_START_FREQUENCIES,
  QUICK_START_PRIORITIES,
  QUICK_START_STEPS,
  type QuickStartOption,
  type QuickStartSelection,
} from "@/lib/quick-start";
import { getSessionId, trackEvent } from "@/lib/track-event";

const TOTAL_STEPS = QUICK_START_STEPS.length;

export default function QuickStartPage() {
  const router = useRouter();
  const startedAt = useRef<number | null>(null);

  const [step, setStep] = useState(1);
  const [selection, setSelection] = useState<QuickStartSelection>(
    emptyQuickStartSelection,
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    startedAt.current ??= Date.now();
    trackEvent("diagnosis_start", { entryPoint: "quick_start" });
  }, []);

  const stepInfo = QUICK_START_STEPS[step - 1];
  const options: readonly QuickStartOption[] =
    step === 1
      ? QUICK_START_EXPERIENCES
      : step === 2
        ? QUICK_START_FREQUENCIES
        : QUICK_START_PRIORITIES;
  const selectedValue =
    step === 1
      ? selection.experience
      : step === 2
        ? selection.frequency
        : selection.priority;

  function choose(value: string) {
    const next: QuickStartSelection =
      step === 1
        ? { ...selection, experience: value }
        : step === 2
          ? { ...selection, frequency: value }
          : { ...selection, priority: value };

    setSelection(next);
    setSubmitError(null);

    if (step < TOTAL_STEPS) {
      setStep(step + 1);
      return;
    }
    void submit(next);
  }

  async function submit(finalSelection: QuickStartSelection) {
    if (!isQuickStartComplete(finalSelection)) return;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const res = await fetch("/api/diagnosis/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: getSessionId(),
          answers: buildQuickStartAnswers(finalSelection),
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error ?? `추천 생성에 실패했습니다 (${res.status})`);
      }

      const data = await res.json();
      const runId = data.recommendationRunId as string;

      trackEvent("diagnosis_complete", {
        profileId: data.playerProfile?.id ?? "",
        totalSteps: TOTAL_STEPS,
        entryPoint: "quick_start",
        durationMs: startedAt.current ? Date.now() - startedAt.current : 0,
      });

      router.push(`/results/${runId}`);
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : "추천 생성에 실패했습니다",
      );
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-white">
      <header className="sticky top-0 z-10 border-b border-[var(--color-border)] bg-white/95 px-6 py-3 backdrop-blur">
        <div className="mx-auto flex max-w-lg items-center justify-between">
          <button
            type="button"
            onClick={() => step > 1 && setStep(step - 1)}
            disabled={step === 1 || isSubmitting}
            className="min-h-11 text-sm text-[var(--color-text-secondary)] disabled:pointer-events-none disabled:text-transparent"
          >
            ← 이전
          </button>
          <span className="text-xs font-medium text-[var(--color-text-muted)]">
            {step}/{TOTAL_STEPS}
          </span>
          <Link
            href="/"
            className="min-h-11 content-center text-sm text-[var(--color-text-muted)]"
          >
            ✕
          </Link>
        </div>
        <div className="mx-auto mt-2 max-w-lg">
          <div className="h-1 overflow-hidden rounded-full bg-[var(--color-bg-subtle)]">
            <div
              className="h-full rounded-full bg-[var(--color-brand)] transition-all duration-300"
              style={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
            />
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-lg px-6 py-10">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-text-muted)]">
          빠른 추천
        </p>
        <h1 className="mt-3 text-2xl font-bold tracking-tight">
          {stepInfo.title}
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-[var(--color-text-secondary)]">
          {stepInfo.help}
        </p>

        <div className="mt-8 space-y-3">
          {options.map((option) => {
            const selected = selectedValue === option.value;
            return (
              <button
                key={option.value}
                type="button"
                disabled={isSubmitting}
                onClick={() => choose(option.value)}
                aria-pressed={selected}
                className={`flex min-h-16 w-full flex-col items-start justify-center rounded-2xl border px-5 py-3 text-left transition-colors disabled:opacity-50 ${
                  selected
                    ? "border-[var(--color-text)] bg-[var(--color-bg-subtle)]"
                    : "border-[var(--color-border)] hover:border-[var(--color-text-muted)]"
                }`}
              >
                <span className="text-sm font-semibold">{option.value}</span>
                <span className="mt-0.5 text-xs text-[var(--color-text-muted)]">
                  {option.hint}
                </span>
              </button>
            );
          })}
        </div>

        {isSubmitting && (
          <p
            role="status"
            className="mt-8 rounded-xl bg-[var(--color-bg-subtle)] px-4 py-3 text-sm text-[var(--color-text-secondary)]"
          >
            맞는 라켓을 찾고 있습니다…
          </p>
        )}

        {submitError && (
          <div
            role="alert"
            className="mt-8 rounded-xl border border-[var(--color-border)] px-4 py-3 text-sm"
          >
            <p className="text-[var(--color-text)]">{submitError}</p>
            <button
              type="button"
              onClick={() => submit(selection)}
              className="mt-2 min-h-11 text-sm font-medium underline"
            >
              다시 시도
            </button>
          </div>
        )}

        <p className="mt-10 border-t border-[var(--color-border)] pt-6 text-xs leading-relaxed text-[var(--color-text-muted)]">
          더 정확한 추천을 원하시면{" "}
          <Link href="/diagnosis" className="underline">
            자세히 진단
          </Link>
          에서 현재 쓰는 라켓과 불편한 점까지 알려주세요.
        </p>
      </div>
    </main>
  );
}
