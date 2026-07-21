import Link from "next/link";
import { knowledgeFacts } from "@/data/knowledge";

export function KnowledgeCards() {
  return (
    <section className="py-12">
      <div className="flex items-end justify-between mb-6">
        <div>
          <p className="text-[10px] font-semibold tracking-[0.15em] text-[var(--color-brand)] uppercase mb-1">Knowledge</p>
          <h2 className="text-xl font-bold tracking-tight">테니스 인사이트</h2>
        </div>
        <Link href="/guide" className="text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text)]">
          전체 보기 →
        </Link>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {knowledgeFacts.map((fact, i) => (
          <article
            key={i}
            className="bg-[var(--color-bg-white)] rounded-xl p-5 shadow-sm hover:shadow-md transition-all duration-200"
          >
            <span className="text-2xl font-black text-[var(--color-brand-light)]/30 leading-none">
              {String(i + 1).padStart(2, "0")}
            </span>
            <h3 className="font-semibold text-sm mt-2 mb-2">{fact.title}</h3>
            <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">{fact.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
