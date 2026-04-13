export const dynamic = "force-dynamic";

import { newsItems } from "@/data/news";

export default function UpdatesPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-12 md:py-16">
      <header className="mb-10">
        <h1 className="text-3xl font-bold text-[var(--color-text)]">
          코트 업데이트
        </h1>
        <p className="mt-3 text-[var(--color-text-secondary)]">
          신제품 소식과 코트 팁을 모았습니다.
        </p>
      </header>

      <ol className="relative border-s border-[var(--color-border)] ms-3 space-y-0">
        {newsItems.map((item, index) => (
          <li key={item.id} className="mb-10 ms-8 last:mb-0">
            <span
              className="absolute flex items-center justify-center w-6 h-6 rounded-full -start-3 bg-[var(--color-bg-subtle)] border border-[var(--color-border)] text-xs"
              aria-hidden
            >
              {item.categoryEmoji}
            </span>
            <time className="block text-xs text-[var(--color-text-muted)] mb-1">
              {item.date}
              {index === 0 ? (
                <span className="ms-2 text-[var(--color-text-secondary)]">
                  · 최신
                </span>
              ) : null}
            </time>
            <span className="inline-block text-xs px-2 py-0.5 rounded mb-2 bg-[var(--color-bg-subtle)] text-[var(--color-text-secondary)] border border-[var(--color-border)]">
              {item.category}
            </span>
            <h2 className="text-lg font-semibold text-[var(--color-text)]">
              {item.title}
            </h2>
            <p className="mt-2 text-sm text-[var(--color-text-secondary)] leading-relaxed">
              {item.summary}
            </p>
          </li>
        ))}
      </ol>
    </div>
  );
}
