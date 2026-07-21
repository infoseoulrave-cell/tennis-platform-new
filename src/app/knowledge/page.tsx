import type { Metadata } from "next";
import Link from "next/link";
import { knowledgeFacts } from "@/data/knowledge";

export const metadata: Metadata = {
  title: "테니스 상식",
  description: "라켓과 스트링을 고를 때 알아두면 좋은 테니스 장비 상식.",
};

export default function KnowledgePage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12 md:py-16">
      <nav className="mb-8 text-sm text-[var(--color-text-secondary)]">
        <Link href="/" className="hover:text-[var(--color-text)]">← 홈</Link>
      </nav>
      <header className="max-w-2xl mb-10">
        <p className="text-[10px] font-semibold tracking-[0.15em] text-[var(--color-brand)] uppercase mb-2">
          Knowledge
        </p>
        <h1 className="text-3xl font-bold tracking-tight">알면 달라지는 테니스 상식</h1>
        <p className="mt-3 text-sm leading-relaxed text-[var(--color-text-secondary)]">
          장비를 비교할 때 자주 놓치는 핵심 개념을 한곳에 모았습니다.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        {knowledgeFacts.map((fact) => (
          <article
            key={fact.title}
            className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-white)] p-6"
          >
            <div className="text-3xl" aria-hidden="true">{fact.emoji}</div>
            <h2 className="mt-4 text-base font-semibold">{fact.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-[var(--color-text-secondary)]">
              {fact.description}
            </p>
          </article>
        ))}
      </div>
    </div>
  );
}
