"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { featuredRackets } from "@/data/featured-rackets";

export function HeroCarousel() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % featuredRackets.length);
    }, 6000);
    return () => clearInterval(id);
  }, []);

  const racket = featuredRackets[index];

  return (
    <section className="relative bg-[var(--color-bg-dark)] text-white overflow-hidden">
      <div className="max-w-6xl mx-auto px-6 py-16 md:py-24 min-h-[520px] flex items-center">
        <div className="grid md:grid-cols-2 gap-8 items-center w-full">
          {/* Text side */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <span className="text-xs tracking-[0.2em] text-white/60 font-medium">{racket.brand.toUpperCase()}</span>
              <span className="text-xs px-2 py-0.5 bg-white/10 text-white/80 rounded">2026 NEW</span>
            </div>

            <h1 className="text-4xl md:text-6xl font-bold tracking-tight leading-[1.1]">
              {racket.model}
            </h1>

            <p className="text-base md:text-lg text-white/70 max-w-md">{racket.tagline}</p>

            <div className="flex flex-wrap gap-3 pt-2">
              {racket.tags.map((tag) => (
                <div
                  key={tag.label}
                  className="flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg"
                >
                  <span className="text-white/50 text-sm">{tag.icon}</span>
                  <span className="text-xs text-white/60">{tag.label}</span>
                  <span className="text-sm font-semibold">{tag.value}</span>
                </div>
              ))}
            </div>

            <div className="flex gap-2 pt-4">
              {racket.specs.map((spec) => (
                <span key={spec} className="text-xs text-white/40 px-2 py-1 border border-white/10 rounded">
                  {spec}
                </span>
              ))}
            </div>
          </div>

          {/* Image side */}
          <div className="relative aspect-square flex items-center justify-center">
            {racket.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={racket.imageUrl}
                alt={racket.model}
                className="object-contain max-h-[400px]"
              />
            ) : (
              <div className="w-64 h-64 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-7xl opacity-30">
                🎾
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom bar: dots + CTAs */}
      <div className="border-t border-white/10">
        <div className="max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
          <div className="flex gap-2">
            {featuredRackets.map((_, i) => (
              <button
                key={i}
                onClick={() => setIndex(i)}
                className={`h-1.5 rounded-full transition-all ${
                  i === index ? "w-8 bg-white" : "w-1.5 bg-white/30"
                }`}
                aria-label={`Slide ${i + 1}`}
              />
            ))}
          </div>

          <div className="flex gap-3">
            <Link
              href="/recommendation"
              className="px-5 py-2.5 bg-[var(--color-brand)] text-black text-sm font-semibold rounded-lg hover:brightness-110 transition-all"
            >
              추천 받기
            </Link>
            <Link
              href="/rackets"
              className="px-5 py-2.5 border border-white/20 text-white text-sm font-medium rounded-lg hover:bg-white/5 transition-colors"
            >
              전체 라켓 보기
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
