"use client";

import Link from "next/link";
import { useEffect } from "react";

export function reportCustomizerError(error: Error): void {
  console.error(error);
}

export default function RacketCustomizerError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    reportCustomizerError(error);
  }, [error]);

  return (
    <div
      role="alert"
      className="mx-auto max-w-3xl px-6 py-20 text-center"
    >
      <p className="text-xs font-semibold tracking-[0.18em] text-[var(--color-text-muted)] uppercase">
        Color Lab
      </p>
      <h1 className="mt-3 text-2xl font-bold tracking-tight">
        커스터마이저를 불러오지 못했습니다
      </h1>
      <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-[var(--color-text-secondary)]">
        일시적인 오류일 수 있습니다. 다시 시도하거나 라켓 목록으로 돌아가
        주세요.
      </p>
      <div className="mt-7 flex flex-col items-stretch justify-center gap-3 sm:flex-row">
        <button
          type="button"
          onClick={unstable_retry}
          className="inline-flex min-h-11 items-center justify-center rounded-lg bg-[var(--color-text)] px-5 text-sm font-semibold text-[var(--color-bg)] hover:opacity-85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-text)] focus-visible:ring-offset-2"
        >
          다시 시도
        </button>
        <Link
          href="/rackets"
          className="inline-flex min-h-11 items-center justify-center rounded-lg border border-[var(--color-border)] px-5 text-sm font-semibold text-[var(--color-text)] hover:border-[var(--color-text-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-text)] focus-visible:ring-offset-2"
        >
          라켓 목록으로 돌아가기
        </Link>
      </div>
    </div>
  );
}
