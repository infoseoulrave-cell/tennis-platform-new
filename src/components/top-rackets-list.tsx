import Link from "next/link";
import { getTopRackets, type RacketListItem } from "@/lib/queries";
import { formatRacketName } from "@/lib/racket-name";

type TopRacket = Pick<
  RacketListItem,
  "id" | "brand" | "model" | "year" | "weight" | "headSize" | "priceKrw"
> & { slug?: string };

export const topRacketsFallback: TopRacket[] = [
  {
    id: "fallback-yonex-ezone-100-2025",
    brand: "Yonex",
    model: "EZONE 100 2025",
    year: 2025,
    weight: "300g",
    headSize: '100"',
    priceKrw: 345000,
  },
  {
    id: "fallback-dunlop-cx-200-2025",
    brand: "Dunlop",
    model: "CX 200 2025",
    year: 2025,
    weight: "305g",
    headSize: '98"',
    priceKrw: 280000,
  },
  {
    id: "fallback-yonex-vcore-100l-2026",
    brand: "Yonex",
    model: "VCORE 100L 2026",
    year: 2026,
    weight: "280g",
    headSize: '100"',
    priceKrw: 315000,
  },
  {
    id: "fallback-yonex-ezone-98-2025",
    brand: "Yonex",
    model: "EZONE 98 2025",
    year: 2025,
    weight: "305g",
    headSize: '98"',
    priceKrw: 345000,
  },
  {
    id: "fallback-dunlop-fx-500-2025",
    brand: "Dunlop",
    model: "FX 500 2025",
    year: 2025,
    weight: "300g",
    headSize: '100"',
    priceKrw: 280000,
  },
];

function formatPrice(price: number | null): string {
  if (!price) return "";
  return `₩${Math.round(price / 1000)}K`;
}

export function formatTopRacketName(racket: TopRacket): string {
  return formatRacketName(racket.model, racket.year);
}

export function topRacketHref(racket: TopRacket): string {
  if (racket.id.startsWith("fallback-")) {
    const params = new URLSearchParams({ brand: racket.brand, q: racket.model });
    return `/rackets?${params.toString()}`;
  }

  return racket.slug ? `/rackets/${racket.slug}` : "/rackets";
}

export async function TopRacketsList() {
  let rackets: TopRacket[];
  try {
    rackets = await getTopRackets(5);
  } catch {
    rackets = topRacketsFallback;
  }

  if (!rackets.length) rackets = topRacketsFallback;

  return (
    <section className="py-12">
      <div className="flex items-end justify-between mb-6">
        <div>
          <p className="text-[10px] font-semibold tracking-[0.15em] text-[var(--color-brand)] uppercase mb-1">Popular</p>
          <h2 className="text-xl font-bold tracking-tight">인기 라켓 TOP 5</h2>
        </div>
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
                href={topRacketHref(racket)}
                className="font-semibold text-sm hover:underline block truncate"
              >
                {formatTopRacketName(racket)}
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
