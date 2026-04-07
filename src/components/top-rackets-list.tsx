import Link from "next/link";
import { getTopRackets } from "@/lib/queries";

function formatPrice(price: number | null): string {
  if (!price) return "";
  return `₩${Math.round(price / 1000)}K`;
}

export async function TopRacketsList() {
  let rackets;
  try {
    rackets = await getTopRackets(5);
  } catch (e) {
    return null;
  }

  if (!rackets.length) return null;

  return (
    <section className="py-12">
      <div className="flex items-end justify-between mb-6">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <span>🔥</span>
          <span>인기 라켓 TOP 5</span>
        </h2>
        <Link href="/rackets" className="text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text)]">
          전체 보기 →
        </Link>
      </div>

      <ol className="border border-[var(--color-border)] rounded-xl overflow-hidden">
        {rackets.map((racket, i) => (
          <li
            key={racket.id}
            className={`flex items-center gap-4 px-5 py-4 ${
              i !== rackets.length - 1 ? "border-b border-[var(--color-border)]" : ""
            } hover:bg-[var(--color-bg-subtle)] transition-colors`}
          >
            <span className="text-xl font-bold text-[var(--color-text-muted)] w-6 shrink-0">{i + 1}</span>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-[var(--color-text-muted)]">{racket.brand}</p>
              <Link
                href={`/rackets/${racket.slug}`}
                className="font-semibold text-sm hover:underline block truncate"
              >
                {racket.model}{racket.year ? ` (${racket.year})` : ""}
              </Link>
              <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
                {racket.weight}
                {racket.headSize && ` · ${racket.headSize}`}
              </p>
            </div>
            <span className="text-sm font-semibold shrink-0">{formatPrice(racket.priceKrw)}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}
