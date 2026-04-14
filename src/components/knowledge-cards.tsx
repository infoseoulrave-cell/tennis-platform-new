import Link from "next/link";
import { knowledgeFacts } from "@/data/knowledge";

export function KnowledgeCards() {
  return (
    <section className="py-12">
      <div className="flex items-end justify-between mb-6">
        <div>
          <p className="text-[10px] font-semibold tracking-[0.15em] text-[var(--color-brand-dark)] uppercase mb-1">Knowledge</p>
          <h2 className="text-xl font-bold tracking-tight">알면 달라지는 테니스 상식</h2>
        </div>
        <Link href="/knowledge" className="text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text)]">
          전체 보기 →
        </Link>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {knowledgeFacts.map((fact, i) => (
          <article
            key={i}
            className="bg-[var(--color-bg-white)] rounded-xl p-5 shadow-sm hover:shadow-md transition-all duration-200"
          >
            <div className="text-3xl mb-3">{fact.emoji}</div>
            <h3 className="font-semibold text-sm mb-2">{fact.title}</h3>
            <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">{fact.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
