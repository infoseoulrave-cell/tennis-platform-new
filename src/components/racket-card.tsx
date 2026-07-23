import Link from "next/link";
import Image from "next/image";
import { AXIS_LABELS } from "./radar-chart";
import { formatRacketName } from "@/lib/racket-name";
import {
  formatPublicAxisScore,
  formatPublicTotal,
  PUBLIC_AXIS_KEYS,
  type PublicAxisScores5,
  type RawAxisScores100,
} from "@/lib/score-display";

export type RacketCardData = {
  slug: string;
  brand: string;
  model: string;
  year?: number | null;
  weight?: string | null;
  headSize?: string | null;
  pattern?: string | null;
  priceKrw?: number | null;
  imageUrl?: string | null;
  scores?: PublicAxisScores5 | null;
  rawScores?: RawAxisScores100 | null;
};

function formatPrice(price: number): string {
  if (price >= 1000) return `₩${Math.round(price / 1000)}K`;
  return `₩${price.toLocaleString()}`;
}

export function RacketCard({ racket }: { racket: RacketCardData }) {
  const scores = racket.scores;

  return (
    <Link
      href={`/rackets/${racket.slug}`}
      className="group block bg-[var(--color-bg-white)] rounded-xl overflow-hidden shadow-sm hover:shadow-md hover:-translate-y-0.5 hover:ring-1 hover:ring-[var(--color-brand-light)]/30 transition-all duration-200"
    >
      {/* Image area */}
      <div className="relative aspect-[4/3] bg-white flex items-center justify-center">
        {racket.imageUrl ? (
          <Image
            src={racket.imageUrl}
            alt={`${racket.brand} ${racket.model}`}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            unoptimized
            className="object-contain p-4"
          />
        ) : (
          <span className="px-5 text-center text-xs text-[var(--color-text-muted)]">검증된 제품 이미지 준비 중</span>
        )}
      </div>

      {/* Info */}
      <div className="p-4">
        <p className="text-xs text-[var(--color-text-muted)]">{racket.brand}</p>
        <h3 className="text-sm font-semibold mt-0.5 group-hover:underline">
          {formatRacketName(racket.model, racket.year)}
        </h3>

        {/* Spec badges */}
        {(racket.weight || racket.headSize || racket.pattern) && (
          <div className="flex gap-2 mt-2 text-xs text-[var(--color-text-secondary)]">
            {racket.weight && <span>{racket.weight}</span>}
            {racket.headSize && <span>· {racket.headSize}</span>}
            {racket.pattern && <span>· {racket.pattern}</span>}
          </div>
        )}

        {/* Scores */}
        {scores && (
          <div className="mt-3">
            <span className="text-xs px-2 py-0.5 bg-[var(--color-bg-subtle)] rounded-full font-semibold text-[var(--color-text)]">
              총점 {formatPublicTotal(scores)}
            </span>
            <div className="mt-2 grid grid-cols-5 divide-x divide-[var(--color-border)] overflow-hidden rounded-lg bg-[var(--color-bg-subtle)]">
              {PUBLIC_AXIS_KEYS.map((axis) => (
                <div
                  key={axis}
                  data-racket-axis={axis}
                  className="min-w-0 py-1.5 text-center"
                >
                  <span className="block truncate text-[10px] leading-none text-[var(--color-text-muted)]">
                    {AXIS_LABELS[axis]}
                  </span>
                  <span className="mt-1 block text-[11px] font-semibold leading-none tabular-nums text-[var(--color-text)]">
                    {formatPublicAxisScore(scores[axis])}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Price */}
        {racket.priceKrw && (
          <p className="text-sm font-semibold mt-3">{formatPrice(racket.priceKrw)}</p>
        )}
      </div>
    </Link>
  );
}
