import Link from "next/link";
import { newsItems } from "@/data/news";

export function NewsFeed() {
  return (
    <section className="py-12">
      <div className="flex items-end justify-between mb-6">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <span>📰</span>
          <span>코트 업데이트</span>
        </h2>
        <Link href="/updates" className="text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text)]">
          전체 보기 →
        </Link>
      </div>

      <div className="space-y-6">
        {newsItems.map((item, i) => (
          <article key={i} className="flex gap-6 pb-6 border-b border-[var(--color-border)] last:border-0">
            <time className="text-xs text-[var(--color-text-muted)] w-12 shrink-0 pt-0.5">{item.date}</time>
            <div className="flex-1">
              <span
                className={`inline-block text-xs px-2 py-0.5 rounded mb-2 ${
                  item.tagType === "new"
                    ? "bg-blue-50 text-blue-700"
                    : "bg-amber-50 text-amber-700"
                }`}
              >
                {item.tagType === "new" ? "🆕 " : "💡 "}
                {item.tag}
              </span>
              <h3 className="font-semibold text-sm">{item.title}</h3>
              <p className="text-xs text-[var(--color-text-secondary)] mt-1">{item.description}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
