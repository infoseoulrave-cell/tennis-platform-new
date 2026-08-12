import Link from "next/link";
import { getTopRackets, type RacketListItem } from "@/lib/queries";
import { formatRacketName } from "@/lib/racket-name";
import { formatKrwPrice } from "@/lib/format-price";
import { MiniAxisBars } from "@/components/mini-axis-bars";
import { formatPublicTotal, type PublicAxisScores5 } from "@/lib/score-display";

type TopRacket = Pick<
  RacketListItem,
  "id" | "brand" | "model" | "year" | "weight" | "headSize" | "priceKrw"
> & { slug?: string; scores?: PublicAxisScores5 | null };

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

const formatPrice = formatKrwPrice;

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
      <div className="mb-6">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-[10px] font-semibold tracking-[0.15em] text-[var(--color-brand)] uppercase mb-1">Popular</p>
            <h2 className="text-xl font-bold tracking-tight">인기 라켓 TOP 5</h2>
          </div>
          <Link href="/rackets" className="text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text)]">
            전체 보기 →
          </Link>
        </div>
        {/* 막대만 있고 범례가 없으면 초록 막대 다섯 개가 무슨 뜻인지 알 수 없다. */}
        <p className="mt-2 text-xs leading-relaxed text-[var(--color-text-muted)]">
          <span className="hidden sm:inline">막대 다섯은 파워·컨트롤·스핀·편안함·안정성이고, </span>
          옆 숫자는 다섯을 더한 총점입니다.
        </p>
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

            {/* 5축 요약과 총점은 한 덩어리다. 점수가 없는 라켓은 그리지
                않는다 — 숫자를 만들지 않는다. 좁은 화면에서는 막대를 접고
                총점만 남긴다. */}
            <div className="flex shrink-0 items-center gap-2">
              <MiniAxisBars scores={racket.scores} className="hidden sm:flex" />
              {racket.scores && (
                <span className="text-xs font-semibold tabular-nums text-[var(--color-text)]">
                  {formatPublicTotal(racket.scores)}
                </span>
              )}
            </div>

            <span className="w-16 shrink-0 text-right text-sm font-semibold tabular-nums">
              {formatPrice(racket.priceKrw)}
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
}
