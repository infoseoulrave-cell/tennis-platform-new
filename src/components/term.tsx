"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { findGlossaryEntry, type GlossaryId } from "@/data/glossary";

/**
 * 어려운 스펙 용어에 그 자리에서 뜻을 붙인다.
 *
 * 여는 방식은 탭·클릭·키보드만 지원하고 호버는 쓰지 않는다. 이 제품의 주 사용
 * 환경이 휴대폰이라 호버가 존재하지 않고, 호버와 클릭을 같이 두면 클릭으로
 * 닫아도 포인터가 위에 남아 다시 열리는 상태가 생기기 때문이다.
 *
 * 모르는 id가 오면 설명 없이 글자만 렌더한다(fail-closed). 없는 뜻을 지어내
 * 보여주는 것보다 낫다.
 */
export function Term({
  id,
  children,
}: {
  id: GlossaryId;
  children?: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLSpanElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelId = useId();
  const entry = findGlossaryEntry(id);

  useEffect(() => {
    if (!open) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      setOpen(false);
      buttonRef.current?.focus();
    }

    function handlePointerDown(event: PointerEvent) {
      if (wrapperRef.current?.contains(event.target as Node)) return;
      setOpen(false);
    }

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("pointerdown", handlePointerDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [open]);

  if (!entry) return <>{children ?? id}</>;

  return (
    <span className="relative inline-block" ref={wrapperRef}>
      <button
        type="button"
        ref={buttonRef}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((previous) => !previous)}
        className="cursor-help underline decoration-dotted decoration-from-font underline-offset-4 hover:decoration-solid focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-text)] focus-visible:ring-offset-2 focus-visible:rounded-sm"
      >
        {children ?? entry.term}
        <span className="sr-only"> — 용어 설명 보기</span>
      </button>

      {open && (
        <span
          id={panelId}
          role="status"
          className="absolute left-0 top-[calc(100%+0.5rem)] z-30 block w-[min(20rem,calc(100vw-3rem))] rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-white)] p-4 text-left shadow-lg"
        >
          <span className="block text-sm font-semibold text-[var(--color-text)]">
            {entry.term}
          </span>
          {entry.reading && (
            <span className="mt-0.5 block text-[11px] text-[var(--color-text-muted)]">
              {entry.reading}
            </span>
          )}
          <span className="mt-2 block text-[13px] font-normal leading-relaxed text-[var(--color-text-secondary)]">
            {entry.short}
          </span>
          <Link
            href={`/guide/terms#${entry.id}`}
            className="mt-3 inline-block text-[13px] font-medium text-[var(--color-text)] underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-text)] focus-visible:ring-offset-2 focus-visible:rounded-sm"
          >
            용어사전에서 자세히 →
          </Link>
        </span>
      )}
    </span>
  );
}
