import Link from "next/link";
import { newsItems } from "@/data/news";

export function NewsFeed() {
  return (
    <section className="py-12">
      <div className="flex items-end justify-between mb-6">
        <div>
          <p className="text-[10px] font-semibold tracking-[0.15em] text-[var(--color-brand)] uppercase mb-1">Updates</p>
          <h2 className="text-xl font-bold tracking-tight text-[var(--color-text)]">코트 업데이트</h2>
        </div>
        <Link
          href="/updates"
          className="text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
        >
          전체 보기 →
        </Link>
      </div>

      <div className="space-y-6">
        {newsItems.map((item) => (
          <article
            key={item.id}
            className="flex gap-6 pb-6 border-b border-[var(--color-border)] last:border-0"
          >
            <time className="text-xs text-[var(--color-text-muted)] w-12 shrink-0 pt-0.5">
              {item.date}
            </time>
            <div className="flex-1">
              <span className="inline-block text-xs px-2 py-0.5 rounded mb-2 bg-[var(--color-bg-subtle)] text-[var(--color-text-secondary)] border border-[var(--color-border)]">
                {item.categoryEmoji} {item.category}
              </span>
              <h3 className="font-semibold text-sm text-[var(--color-text)]">
                {item.title}
              </h3>
              <p className="text-xs text-[var(--color-text-secondary)] mt-1">
                {item.summary}
              </p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
