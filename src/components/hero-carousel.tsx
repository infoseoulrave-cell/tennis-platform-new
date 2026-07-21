"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  featuredRacketSpecs,
  featuredRacketTags,
  type FeaturedRacket,
} from "@/data/featured-rackets";

export function HeroCarousel({ rackets }: { rackets: FeaturedRacket[] }) {
  const [index, setIndex] = useState(0);
  const [rotationPaused, setRotationPaused] = useState(false);
  const [hoverPaused, setHoverPaused] = useState(false);
  const [focusWithinPaused, setFocusWithinPaused] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreference = () => setPrefersReducedMotion(media.matches);
    updatePreference();
    media.addEventListener("change", updatePreference);
    return () => media.removeEventListener("change", updatePreference);
  }, []);

  useEffect(() => {
    if (
      rotationPaused
      || hoverPaused
      || focusWithinPaused
      || prefersReducedMotion
      || rackets.length <= 1
    ) return;
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % rackets.length);
    }, 6000);
    return () => clearInterval(id);
  }, [focusWithinPaused, hoverPaused, prefersReducedMotion, rackets.length, rotationPaused]);

  const racket = rackets[index];
  if (!racket) return null;
  const tags = featuredRacketTags(racket);
  const specs = featuredRacketSpecs(racket);

  return (
    <section
      aria-label="추천 라켓"
      aria-roledescription="carousel"
      onMouseEnter={() => setHoverPaused(true)}
      onMouseLeave={() => setHoverPaused(false)}
      onFocusCapture={() => setFocusWithinPaused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          setFocusWithinPaused(false);
        }
      }}
      className="relative bg-gradient-to-br from-[#0C0C0C] via-[#0f1a2e] to-[var(--color-court-blue)] text-white overflow-hidden"
    >
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
              {tags.map((tag) => (
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
              {specs.map((spec) => (
                <span key={spec} className="text-xs text-white/40 px-2 py-1 border border-white/10 rounded">
                  {spec}
                </span>
              ))}
            </div>

            <Link
              href={`/rackets/${racket.slug}`}
              className="inline-flex text-sm font-medium text-white/80 hover:text-white hover:underline"
            >
              상세 데이터 보기 →
            </Link>
          </div>

          {/* Image side */}
          <div className="relative aspect-square flex items-center justify-center">
            {racket.imageUrl ? (
              <Image
                src={racket.imageUrl}
                alt={racket.model}
                width={500}
                height={500}
                preload={index === 0}
                className="object-contain max-h-[400px]"
              />
            ) : (
              <div className="w-64 h-64 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-7xl opacity-30">
                🎾
              </div>
            )}
            <div className="absolute bottom-1 right-1 flex items-center gap-2 text-[10px] text-white/40">
              <a href={racket.imageSourceUrl} target="_blank" rel="noreferrer" className="hover:text-white/70 hover:underline">
                이미지 출처
              </a>
              <span aria-hidden="true">·</span>
              <a href={racket.specSourceUrl} target="_blank" rel="noreferrer" className="hover:text-white/70 hover:underline">
                스펙 확인 {racket.verifiedAt}
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar: dots + CTAs */}
      <div className="border-t border-white/10">
        <div className="max-w-6xl mx-auto px-6 py-6 flex flex-col items-stretch gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center justify-between gap-3 sm:justify-start">
            <div className="flex gap-0.5">
              {rackets.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    setIndex(i);
                    setRotationPaused(true);
                  }}
                  className="flex min-h-6 min-w-6 items-center justify-center rounded-full"
                  aria-label={`${i + 1}번째 슬라이드 보기`}
                  aria-current={i === index ? "true" : undefined}
                >
                  <span
                    aria-hidden="true"
                    className={`h-1.5 rounded-full transition-all ${
                      i === index ? "w-8 bg-white" : "w-1.5 bg-white/30"
                    }`}
                  />
                </button>
              ))}
            </div>
            {prefersReducedMotion ? (
              <span role="status" className="text-[10px] text-white/50">자동 회전 꺼짐</span>
            ) : (
              <button
                type="button"
                onClick={() => setRotationPaused((paused) => !paused)}
                aria-label={rotationPaused ? "슬라이드 자동 회전 재생" : "슬라이드 자동 회전 일시정지"}
                className="min-h-6 px-1 text-[10px] text-white/60 hover:text-white"
              >
                {rotationPaused ? "재생" : "일시정지"}
              </button>
            )}
          </div>

          <div className="flex gap-3">
            <Link
              href="/recommendation"
              className="flex-1 px-5 py-2.5 text-center bg-white text-[var(--color-brand)] text-sm font-semibold rounded-lg hover:bg-white/90 transition-all sm:flex-none"
            >
              추천 받기
            </Link>
            <Link
              href="/rackets"
              className="flex-1 px-5 py-2.5 text-center border border-white/20 text-white text-sm font-medium rounded-lg hover:bg-white/5 transition-colors sm:flex-none"
            >
              전체 라켓 보기
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
