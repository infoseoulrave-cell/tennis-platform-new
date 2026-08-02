import type { Metadata } from "next";
import Link from "next/link";
import { GLOSSARY } from "@/data/glossary";

export const metadata: Metadata = {
  title: "용어사전",
  description:
    "스윙웨이트, RA 강성, 밸런스, 스트링 패턴처럼 스펙표에서 마주치는 말을 쉬운 말로 풀어 설명합니다.",
};

export default function GuideTermsPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-12 md:py-16">
      <nav className="mb-8 text-sm text-[var(--color-text-secondary)]">
        <Link href="/guide" className="hover:text-[var(--color-text)]">
          가이드
        </Link>
        <span className="mx-2" aria-hidden="true">
          /
        </span>
        <span className="text-[var(--color-text)]">용어사전</span>
      </nav>

      <header className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight text-[var(--color-text)]">
          용어사전
        </h1>
        <p className="mt-3 leading-relaxed text-[var(--color-text-secondary)]">
          스펙표에서 마주치는 말을 쉬운 말로 풀었습니다. 숫자가 크면 무엇이
          좋아지고 무엇이 나빠지는지까지 함께 적었습니다.
        </p>
      </header>

      <nav aria-label="용어 목록" className="mb-12">
        <ul className="flex flex-wrap gap-2">
          {GLOSSARY.map((entry) => (
            <li key={entry.id}>
              <a
                href={`#${entry.id}`}
                className="inline-flex min-h-9 items-center rounded-full border border-[var(--color-border)] bg-[var(--color-bg-subtle)] px-3 text-sm text-[var(--color-text)] transition-colors hover:border-[var(--color-text-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-text)] focus-visible:ring-offset-2"
              >
                {entry.term}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <div className="space-y-10">
        {GLOSSARY.map((entry) => (
          <section
            key={entry.id}
            id={entry.id}
            /* 상단 고정 헤더에 제목이 가리지 않도록 앵커 여백을 둔다 */
            className="scroll-mt-24 border-t border-[var(--color-border)] pt-8 first:border-t-0 first:pt-0"
          >
            <h2 className="text-xl font-bold tracking-tight text-[var(--color-text)]">
              {entry.term}
            </h2>
            {entry.reading && (
              <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                {entry.reading}
              </p>
            )}
            <div className="mt-4 space-y-3">
              {entry.detail.map((paragraph) => (
                <p
                  key={paragraph}
                  className="text-sm leading-relaxed text-[var(--color-text-secondary)]"
                >
                  {paragraph}
                </p>
              ))}
            </div>
          </section>
        ))}
      </div>

      <p className="mt-14 border-t border-[var(--color-border)] pt-6 text-sm leading-relaxed text-[var(--color-text-secondary)]">
        5축 점수를 읽는 법은{" "}
        <Link
          href="/guide/dna"
          className="underline underline-offset-4 hover:text-[var(--color-text)]"
        >
          라켓 DNA
        </Link>
        에서, 스트링 소재와 장력은{" "}
        <Link
          href="/guide/strings"
          className="underline underline-offset-4 hover:text-[var(--color-text)]"
        >
          스트링 가이드
        </Link>
        에서 더 볼 수 있습니다.
      </p>
    </div>
  );
}
