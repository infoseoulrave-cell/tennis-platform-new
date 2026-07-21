"use client";

import Link from "next/link";
import Image from "next/image";
import { useWishlist } from "@/lib/wishlist";
import { resolveRacketImage } from "@/lib/racket-images";
import { formatRacketName } from "@/lib/racket-name";

export default function WishlistPage() {
  const { items, remove } = useWishlist();

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <header className="mb-8">
        <h1 className="text-3xl font-bold">찜한 라켓</h1>
        <p className="text-sm text-[var(--color-text-secondary)] mt-2">
          관심 있는 라켓을 모아보세요. 데이터는 브라우저에 저장됩니다.
        </p>
      </header>

      {items.length === 0 ? (
        <div className="text-center py-20">
          <span className="text-5xl block mb-4">♡</span>
          <p className="text-[var(--color-text-muted)] mb-6">아직 찜한 라켓이 없습니다</p>
          <Link
            href="/rackets"
            className="inline-block px-5 py-2.5 bg-[var(--color-text)] text-white text-sm font-medium rounded-lg"
          >
            라켓 찾기 →
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => {
            const verifiedImage = resolveRacketImage(item.imageUrl, item.slug);

            return <div
              key={item.slug}
              className="flex items-center gap-4 p-4 border border-[var(--color-border)] rounded-xl"
            >
              <div className="relative w-16 h-16 bg-[var(--color-bg-subtle)] rounded-lg flex items-center justify-center shrink-0 overflow-hidden">
                {verifiedImage ? (
                  <Image
                    src={verifiedImage.url}
                    alt={`${item.brand} ${item.model}`}
                    fill
                    sizes="64px"
                    unoptimized
                    className="object-contain p-2"
                  />
                ) : (
                  <span className="px-1 text-center text-[9px] text-[var(--color-text-muted)]">이미지 검증 중</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-[var(--color-text-muted)]">{item.brand}</p>
                <Link href={`/rackets/${item.slug}`} className="text-sm font-semibold hover:underline block truncate">
                  {formatRacketName(item.model, item.year)}
                </Link>
                {item.priceKrw && (
                  <p className="text-xs font-medium mt-0.5">₩{item.priceKrw.toLocaleString()}</p>
                )}
              </div>
              <button
                onClick={() => remove(item.slug)}
                className="text-sm text-red-400 hover:text-red-600 px-3 py-1 shrink-0"
              >
                삭제
              </button>
            </div>;
          })}
        </div>
      )}
    </div>
  );
}
