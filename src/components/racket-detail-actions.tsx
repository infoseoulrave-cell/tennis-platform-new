"use client";

import { useWishlist } from "@/lib/wishlist";
import { useCompare } from "@/lib/compare";

type Props = {
  slug: string;
  brand: string;
  model: string;
  year: number | null;
  imageUrl: string | null;
  priceKrw: number | null;
};

export function RacketDetailActions({ slug, brand, model, year, imageUrl, priceKrw }: Props) {
  const wishlist = useWishlist();
  const compare = useCompare();
  const isWished = wishlist.has(slug);
  const isCompared = compare.has(slug);

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => wishlist.toggle({ slug, brand, model, year, imageUrl, priceKrw })}
        className={`px-4 py-3 text-sm font-medium rounded-lg border transition-colors ${
          isWished
            ? "border-red-200 bg-red-50 text-red-600"
            : "border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-text-muted)]"
        }`}
      >
        {isWished ? "♥ 찜됨" : "♡ 찜"}
      </button>
      <button
        onClick={() => compare.toggle({ slug, brand, model })}
        className={`px-4 py-3 text-sm font-medium rounded-lg border transition-colors ${
          isCompared
            ? "border-blue-200 bg-blue-50 text-blue-600"
            : "border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-text-muted)]"
        }`}
      >
        {isCompared ? "⇄ 비교 중" : "⇄ 비교"}
      </button>
    </div>
  );
}
