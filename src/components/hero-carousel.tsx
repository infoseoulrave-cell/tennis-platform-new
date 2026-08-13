"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  featuredRacketSpecs,
  featuredRacketTags,
  type FeaturedRacket,
} from "@/data/featured-rackets";

/**
 * 홈 히어로.
 *
 * 예전에는 `<h1>` 이 라켓 모델명이었고, 캐러셀이 6초마다 돌면서 h1 이 함께
 * 바뀌었다. 처음 온 사람에게는 바볼랏 광고로 보였고, 이 사이트가 무엇을
 * 해주는 곳인지는 어디에도 없었다.
 *
 * 그래서 왼쪽은 **회전하지 않는 약속**이고, 오른쪽 라켓은 그 약속의
 * **증거**다. h1 은 고정이고 라켓 이름은 h2 로 내렸다.
 *
 * 다크 면은 유지한다 — `.impeccable.md` 가 "restrained dark hero" 를 Omega
 * 정체성의 일부로 명시하고 있다. 다만 3단 그라데이션은 평평한 잉크로 바꿨다.
 */
/**
 * 히어로의 피치(약속 + 진단 CTA). 데스크톱은 히어로 안에 h1 으로,
 * 모바일은 TOP 5 아래 별도 배너에 일반 텍스트로 들어간다 —
 * h1 은 DOM 에 정확히 하나만 존재해야 한다.
 */
export function HeroPitch({ asHeading = false }: { asHeading?: boolean }) {
  return (
    <div className="space-y-6">
      {asHeading ? (
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight leading-[1.05]">
          라켓을 읽습니다
        </h1>
      ) : (
        <p className="text-3xl font-bold tracking-tight leading-[1.05]">
          라켓을 읽습니다
        </p>
      )}
      <p className="max-w-md text-base md:text-lg leading-relaxed text-white/70">
        스펙 다섯 개를 다섯 개의 점수로 옮깁니다.
        숫자마다 어디서 나온 값인지 함께 답니다.
      </p>

      <div className="flex flex-col items-stretch gap-4 sm:flex-row sm:items-center">
        <Link
          href="/start"
          className="inline-flex min-h-11 items-center justify-center rounded-xl bg-[var(--color-accent)] px-6 text-sm font-bold text-[var(--color-text)] transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)]"
        >
          3분 진단 시작
        </Link>
        <Link
          href="/rackets"
          className="inline-flex min-h-11 items-center justify-center rounded-xl border border-white/25 px-6 text-sm font-medium text-white transition-colors hover:bg-white/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        >
          전체 라켓 보기
        </Link>
      </div>

      {/* 정밀 진단은 이미 라켓을 써 본 사람의 길이다. 초심자와 섞지 않는다.
          `/recommendation` 은 `/diagnosis` 로 가는 307 스텁이라 내부
          링크는 실제 목적지를 바로 가리킨다. */}
      <p className="text-sm text-white/50">
        이미 쓰는 라켓이 있나요?{" "}
        <Link
          href="/diagnosis"
          className="text-white/80 underline underline-offset-4 hover:text-white"
        >
          정밀 진단으로 →
        </Link>
      </p>
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

  // 라켓 데이터가 없어도 약속은 남는다. 예전에는 여기서 히어로 전체가
  // 사라져서 홈 첫 화면이 통째로 비었다.
  const racket = rackets[index];
  const tags = racket ? featuredRacketTags(racket) : [];
  const specs = racket ? featuredRacketSpecs(racket) : [];

  return (
    <section
      aria-label="racket lab 소개"
      className="relative bg-[var(--color-bg-dark)] text-white overflow-hidden"
    >
      {/* VI 그래픽 요소 — 16×19 스트링 그리드 텍스처. 라임 도트(스윗스팟)는
          화면당 라임 1점 원칙상 여기 두지 않는다: 히어로의 1점은 주 CTA 다. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, rgba(243,240,234,0.05) 0 1px, transparent 1px 44px), repeating-linear-gradient(90deg, rgba(243,240,234,0.05) 0 1px, transparent 1px 38px)",
          maskImage:
            "radial-gradient(ellipse 75% 85% at 50% 45%, black 30%, transparent 100%)",
        }}
      />
      <div className="relative max-w-6xl mx-auto px-6 py-10 md:py-24">
        <div className="grid gap-12 md:grid-cols-[1fr_0.85fr] md:items-center">
          {/* 약속 — 회전하지 않는다. 모바일에서는 이 피치를 히어로에서 빼고
              TOP 5 아래 별도 배너(page.tsx 의 HeroPitch)로 내린다 —
              첫 화면을 광고성 문구가 채우지 않게 한다. */}
          <div className="hidden md:block">
            <HeroPitch asHeading />
          </div>

          {/* 증거 — 이번 주의 라켓 */}
          {racket && (
            <div
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
              className="rounded-2xl border border-white/10 bg-white/[0.03] p-6"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="text-[10px] font-medium tracking-[0.2em] text-white/50">
                  {racket.brand.toUpperCase()}
                </span>
                <span className="rounded bg-white/10 px-2 py-0.5 text-[10px] text-white/70">
                  2026 NEW
                </span>
              </div>

              <div className="relative mt-5 flex aspect-[4/3] items-center justify-center">
                <Image
                  src={racket.imageUrl}
                  alt={racket.model}
                  width={500}
                  height={500}
                  preload={index === 0}
                  className="max-h-[260px] object-contain"
                />
              </div>

              <h2 className="mt-5 text-xl font-bold tracking-tight">{racket.model}</h2>
              <p className="mt-1 text-sm leading-relaxed text-white/60">{racket.tagline}</p>

              <div className="mt-4 flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <div
                    key={tag.label}
                    className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5"
                  >
                    <span aria-hidden="true" className="text-sm text-white/50">{tag.icon}</span>
                    <span className="text-xs text-white/60">{tag.label}</span>
                    <span className="text-sm font-semibold">{tag.value}</span>
                  </div>
                ))}
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                {specs.map((spec) => (
                  <span
                    key={spec}
                    className="rounded border border-white/10 px-2 py-1 text-xs text-white/40"
                  >
                    {spec}
                  </span>
                ))}
              </div>

              <Link
                href={`/rackets/${racket.slug}`}
                className="mt-4 inline-flex text-sm font-medium text-white/80 hover:text-white hover:underline"
              >
                상세 데이터 보기 →
              </Link>

              <div className="mt-3 flex items-center gap-2 text-[10px] text-white/40">
                <a
                  href={racket.imageSourceUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-white/70 hover:underline"
                >
                  이미지 출처
                </a>
                <span aria-hidden="true">·</span>
                <a
                  href={racket.specSourceUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-white/70 hover:underline"
                >
                  스펙 확인 {racket.verifiedAt}
                </a>
              </div>

              <div className="mt-4 flex items-center justify-between gap-3 border-t border-white/10 pt-4">
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
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
