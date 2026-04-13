"use client";

import Link from "next/link";
import { useCompare } from "@/lib/compare";
import { usePathname } from "next/navigation";

export function CompareTray() {
  const { items, remove, clear } = useCompare();
  const pathname = usePathname();

  if (items.length === 0 || pathname === "/compare") return null;

  const slugs = items.map((i) => i.slug).join(",");

  return (
    <div className="fixed bottom-16 md:bottom-6 left-1/2 -translate-x-1/2 z-[60] w-[calc(100%-2rem)] max-w-lg">
      <div className="bg-[var(--color-text)] text-white rounded-2xl px-4 py-3 flex items-center gap-3 shadow-2xl">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <span className="text-sm font-semibold shrink-0">{items.length}/3</span>
          <div className="flex gap-1.5 overflow-hidden">
            {items.map((item) => (
              <span
                key={item.slug}
                className="inline-flex items-center gap-1 text-xs bg-white/20 px-2 py-1 rounded-full truncate max-w-[120px]"
              >
                {item.brand} {item.model}
                <button
                  onClick={() => remove(item.slug)}
                  className="text-white/60 hover:text-white ml-0.5"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button onClick={clear} className="text-xs text-white/60 hover:text-white">
            초기화
          </button>
          <Link
            href={`/compare?slugs=${slugs}`}
            className="px-4 py-2 bg-white text-[var(--color-text)] text-xs font-semibold rounded-lg hover:bg-gray-100 transition-colors"
          >
            비교하기
          </Link>
        </div>
      </div>
    </div>
  );
}
