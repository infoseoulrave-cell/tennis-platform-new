import Link from "next/link";
import { knowledgeFacts } from "@/data/knowledge";

export function KnowledgeCards() {
  return (
    <section className="py-12">
      <div className="flex items-end justify-between mb-6">
        <div>
          <p className="text-[10px] font-semibold tracking-[0.15em] text-[var(--color-brand)] uppercase mb-1">Knowledge</p>
          <h2 className="text-xl font-bold tracking-tight">알면 달라지는 테니스 상식</h2>
        </div>
        <Link href="/knowledge" className="text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text)]">
          전체 보기 →
        </Link>
      </div>

      {/* 선수 카드·인기 리스트와 질감을 가르기 위해 카드 상자 없이
          에디토리얼 인덱스로 짠다 — 항목마다 진한 상단 룰 하나. */}
      <div className="grid gap-x-8 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
        {knowledgeFacts.map((fact, i) => (
          <article key={i} className="border-t border-[var(--color-text)] pt-4">
            <h3 className="font-semibold text-sm mb-2">{fact.title}</h3>
            <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">{fact.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
