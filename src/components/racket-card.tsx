import Link from "next/link";
import { type Scores, AXIS_LABELS } from "./radar-chart";

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
  scores?: Scores | null;
};

function formatPrice(price: number): string {
  if (price >= 1000) return `₩${Math.round(price / 1000)}K`;
  return `₩${price.toLocaleString()}`;
}

function topAxes(scores: Scores, count = 2): { key: keyof Scores; score: number }[] {
  return (Object.entries(scores) as [keyof Scores, number][])
    .sort((a, b) => b[1] - a[1])
    .slice(0, count)
    .map(([key, score]) => ({ key, score }));
}

export function RacketCard({ racket }: { racket: RacketCardData }) {
  return (
    <Link
      href={`/rackets/${racket.slug}`}
      className="group block border border-[var(--color-border)] rounded-xl overflow-hidden hover:border-[var(--color-text-muted)] transition-colors"
    >
      {/* Image area */}
      <div className="aspect-[4/3] bg-[var(--color-bg-subtle)] flex items-center justify-center">
        {racket.imageUrl ? (
          <img src={racket.imageUrl} alt={racket.model} className="object-contain w-full h-full p-4" />
        ) : (
          <span className="text-4xl opacity-20">🎾</span>
        )}
      </div>

      {/* Info */}
      <div className="p-4">
        <p className="text-xs text-[var(--color-text-muted)]">{racket.brand}</p>
        <h3 className="text-sm font-semibold mt-0.5 group-hover:underline">
          {racket.model}{racket.year ? ` (${racket.year})` : ""}
        </h3>

        {/* Spec badges */}
        {(racket.weight || racket.headSize || racket.pattern) && (
          <div className="flex gap-2 mt-2 text-xs text-[var(--color-text-secondary)]">
            {racket.weight && <span>{racket.weight}</span>}
            {racket.headSize && <span>· {racket.headSize}</span>}
            {racket.pattern && <span>· {racket.pattern}</span>}
          </div>
        )}

        {/* Top axes */}
        {racket.scores && (
          <div className="flex gap-2 mt-2">
            {topAxes(racket.scores).map(({ key, score }) => (
              <span
                key={key}
                className="text-xs px-2 py-0.5 bg-[var(--color-bg-subtle)] rounded-full text-[var(--color-text-secondary)]"
              >
                {AXIS_LABELS[key]} {score > 0 ? "+" : ""}{score}
              </span>
            ))}
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
