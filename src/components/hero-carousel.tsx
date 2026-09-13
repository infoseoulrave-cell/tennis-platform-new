"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  featuredRacketSpecs,
  featuredRacketTags,
  type FeaturedRacket,
} from "@/data/featured-rackets";
import { SponsoredBadge } from "@/components/sponsored-badge";
import { trackEvent } from "@/lib/track-event";

/** 히어로는 홈에 하나뿐이라 지면 이름을 고정한다. 광고 리포트의 키가 된다. */
const HERO_PLACEMENT = "home_hero";

/** 사이트의 약속과 진단 입구. 홈에서 한 번만 렌더하며 h1 은 고정한다. */
export function HeroPitch({ asHeading = false }: { asHeading?: boolean }) {
  return (
    <div className="grid gap-7 md:grid-cols-[1fr_auto] md:items-center md:gap-12">
      <div>
        {asHeading ? (
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
            라켓을 읽습니다
          </h1>
        ) : (
          <p className="text-3xl font-bold tracking-tight md:text-4xl">
            라켓을 읽습니다
          </p>
        )}
        <p className="mt-3 max-w-lg text-sm leading-relaxed text-white/70 md:text-base">
          스펙 다섯 개를 다섯 개의 점수로 옮깁니다.
          숫자마다 어디서 나온 값인지 함께 답니다.
        </p>
      </div>
      <div>
        <div className="flex flex-col items-stretch gap-4 sm:flex-row sm:items-center">
          <Link
            href="/start"
            className="inline-flex min-h-11 items-center justify-center bg-[var(--color-accent)] px-6 text-sm font-bold text-[var(--color-text)] transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)]"
          >
            3분 진단 시작
          </Link>
          <Link
            href="/rackets"
            className="inline-flex min-h-11 items-center justify-center border border-white/25 px-6 text-sm font-medium text-white transition-colors hover:bg-white/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            전체 라켓 보기
          </Link>
        </div>
        <p className="mt-4 text-xs text-white/60">
          이미 쓰는 라켓이 있나요?{" "}
          <Link
            href="/diagnosis"
            className="text-white/80 underline underline-offset-4 hover:text-white"
          >
            정밀 진단으로 →
          </Link>
        </p>
      </div>
    </div>
  );
}

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

  // 진단 입구는 별도 HeroPitch 에 남고, 제품 데이터가 있을 때만 캠페인을 표시한다.
  const racket = rackets[index];

  // 광고 슬롯이 화면에 들어올 때마다 1회. 광고가 아닌 슬라이드는 아무것도
  // 남기지 않는다 — 광고 리포트에 자연 노출이 섞이면 안 된다.
  useEffect(() => {
    if (!racket?.sponsored) return;
    trackEvent("sponsor_impression", {
      slug: racket.slug,
      label: racket.sponsored.label,
      placement: HERO_PLACEMENT,
    });
  }, [racket?.slug, racket?.sponsored]);
  const tags = racket ? featuredRacketTags(racket) : [];
  const specs = racket ? featuredRacketSpecs(racket) : [];

  if (!racket) return null;

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
      className="relative isolate overflow-hidden bg-[var(--color-bg-dark)] text-white"
    >
      {/* 연출 이미지는 이 한 장뿐이다. 실제 제품 사진은 별도 링크로 구분한다. */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <Image
          src={racket.campaignImageUrl}
          alt=""
          fill
          sizes="100vw"
          preload={index === 0}
          className="object-cover object-[80%_top] md:object-top"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/5 to-black/10" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/35 via-transparent to-transparent" />
      </div>

      <div className="mx-auto flex min-h-[640px] max-w-[1600px] flex-col px-5 pb-5 pt-7 sm:px-8 md:min-h-[720px] md:px-12 md:pb-7 md:pt-10 lg:px-16">
        <div className="flex items-center justify-between gap-4 text-[10px] tracking-[0.2em] md:text-xs">
          <p className="font-semibold">{racket.brand.toUpperCase()}</p>
          <p className="text-white/65">RACKET LAB EDITORIAL / 2026</p>
        </div>

        <div className="flex flex-1 flex-col justify-center pb-16 pt-16 md:pb-14 md:pt-16">
          <p
            className="max-w-[900px] text-[clamp(2.75rem,12vw,5.5rem)] font-extrabold leading-[0.88] tracking-[-0.065em] md:text-[clamp(5rem,8.4vw,9rem)]"
          >
            {racket.campaignHeadline.map((line) => (
              <span key={line} className="block whitespace-nowrap">{line}</span>
            ))}
          </p>
          <p className="mt-6 max-w-[18rem] text-sm leading-relaxed text-white/85 md:max-w-md md:text-base">
            {racket.tagline}
          </p>
        </div>

        <div className="border-t border-white/35 pt-4 md:pt-5">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between md:gap-8">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="text-lg font-bold tracking-tight md:text-2xl">{racket.model}</h2>
                {racket.sponsored && <SponsoredBadge on="dark" />}
              </div>
              <p className="mt-1.5 text-xs tracking-wide text-white/75 md:text-sm">
                {specs.join(" / ")}
              </p>
              {racket.sponsored && (
                <p className="mt-2 text-xs leading-relaxed text-white/75">
                  {racket.sponsored.label} · {racket.sponsored.disclosure}
                </p>
              )}
            </div>

            <ul aria-label="라켓 점수" className="flex flex-wrap gap-x-5 gap-y-2 text-xs md:text-sm">
              {tags.map((tag) => (
                <li key={tag.label} className="flex items-baseline gap-2">
                  <span className="text-white/65">{tag.label}</span>
                  <span className="font-semibold tabular-nums">{tag.value}</span>
                </li>
              ))}
            </ul>

            <Link
              href={`/rackets/${racket.slug}`}
              onClick={() => {
                if (!racket.sponsored) return;
                trackEvent("sponsor_click", {
                  slug: racket.slug,
                  label: racket.sponsored.label,
                  placement: HERO_PLACEMENT,
                });
              }}
              className="inline-flex min-h-11 shrink-0 items-center gap-5 self-start border-b border-white pb-1 text-sm font-semibold transition-opacity hover:opacity-70 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white md:self-auto"
            >
              상세 데이터 보기 <span aria-hidden="true">↗</span>
            </Link>
          </div>

          <div className="mt-5 flex flex-col gap-3 border-t border-white/15 pt-3 md:flex-row md:items-end md:justify-between">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[10px] leading-relaxed text-white/60">
              <span>AI 연출 비주얼</span>
              <a
                href={racket.imageUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/80 underline underline-offset-4 hover:text-white"
              >
                실제 제품 사진 보기
              </a>
              <a
                href={racket.imageSourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white hover:underline"
              >
                제품 사진 출처
              </a>
              <a
                href={racket.specSourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white hover:underline"
              >
                스펙 확인 {racket.verifiedAt}
              </a>
            </div>

            <div className="flex shrink-0 items-center justify-between gap-5 md:justify-end">
              <div className="flex gap-2">
                {rackets.map((slide, i) => (
                  <button
                    key={slide.slug}
                    type="button"
                    onClick={() => {
                      setIndex(i);
                      setRotationPaused(true);
                    }}
                    className={`flex min-h-6 min-w-6 items-center justify-center border-b px-2 py-1 text-[10px] tabular-nums transition-colors ${
                      i === index ? "border-white text-white" : "border-white/25 text-white/50 hover:text-white"
                    }`}
                    aria-label={`${i + 1}번째 슬라이드 보기`}
                    aria-current={i === index ? "true" : undefined}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </button>
                ))}
              </div>
              {prefersReducedMotion ? (
                <span role="status" className="text-[10px] text-white/60">자동 회전 꺼짐</span>
              ) : (
                <button
                  type="button"
                  onClick={() => setRotationPaused((paused) => !paused)}
                  aria-label={rotationPaused ? "슬라이드 자동 회전 재생" : "슬라이드 자동 회전 일시정지"}
                  className="min-h-6 px-1 text-[10px] text-white/70 hover:text-white"
                >
                  {rotationPaused ? "재생" : "일시정지"}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
