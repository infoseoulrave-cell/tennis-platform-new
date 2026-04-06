# Tennis Platform Frontend Rebuild — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the racketlab frontend in the existing Next.js codebase, matching the deployed reference (app-pi-seven-15.vercel.app) with a minimal-premium visual tone, and adding high-quality racket/player images.

**Architecture:** Next.js 15 App Router with React Server Components for data fetching, client components for interactive elements (carousel, filters, charts). Drizzle ORM queries the existing PostgreSQL schema. Static data (players, news, knowledge) lives in TypeScript files alongside the DB.

**Tech Stack:** Next.js 15, React 19, Tailwind CSS 4, Drizzle ORM, PostgreSQL, TypeScript

**Reference:** https://app-pi-seven-15.vercel.app

---

## File Structure

### New files to create

```
src/
├── app/
│   ├── layout.tsx                    (rewrite — global nav + mobile tab bar)
│   ├── page.tsx                      (rewrite — home page)
│   ├── globals.css                   (rewrite — design tokens)
│   ├── rackets/
│   │   ├── page.tsx                  (new — racket listing with filters)
│   │   └── [slug]/
│   │       └── page.tsx              (new — racket detail)
│   ├── recommendation/
│   │   ├── page.tsx                  (move from diagnosis/)
│   │   └── result/
│   │       └── [id]/page.tsx         (move from results/[id])
│   ├── compare/
│   │   └── page.tsx                  (rewrite)
│   ├── updates/
│   │   └── page.tsx                  (new — news feed)
│   └── api/
│       └── rackets/
│           └── route.ts              (new — racket list/filter API)
├── components/
│   ├── global-nav.tsx                (new)
│   ├── mobile-tab-bar.tsx            (new)
│   ├── footer.tsx                    (new)
│   ├── radar-chart.tsx               (new — SVG pentagon)
│   ├── axis-bars.tsx                 (new — horizontal bar chart)
│   ├── radar-bar-combo.tsx           (new — radar + bars side by side)
│   ├── racket-card.tsx               (new — used in lists/grids)
│   ├── hero-carousel.tsx             (new — home hero)
│   ├── player-synergy-card.tsx       (new — pro player section)
│   ├── top-rackets-list.tsx          (new — TOP 5 section)
│   ├── quick-links.tsx               (new — 4 feature cards)
│   ├── news-feed.tsx                 (new — court updates)
│   ├── knowledge-cards.tsx           (new — tennis trivia)
│   ├── string-guide.tsx              (new — string type cards)
│   └── compare-slot.tsx              (new — floating compare bar)
├── data/
│   ├── players.ts                    (new — pro player static data)
│   ├── news.ts                       (new — court updates)
│   ├── knowledge.ts                  (new — tennis trivia facts)
│   └── featured-rackets.ts           (new — hero carousel data)
└── lib/
    └── queries.ts                    (new — Drizzle query helpers)

public/
├── images/
│   ├── rackets/                      (new — product photos)
│   └── players/                      (new — player photos)
```

### Files to delete
- `src/app/diagnosis/` (moved to recommendation/)
- `src/app/results/` (moved to recommendation/result/)
- `src/app/partners/`
- `src/app/api/partners/`
- `src/lib/mock-data.ts`
- `src/components/` (all old components — replaced)

### Files to keep (untouched)
- `src/db/` (schema, migrations, seeds)
- `src/modules/` (recommendation engine, catalog)
- `src/events/` (taxonomy, tracking)
- `src/env.ts`
- `src/app/admin/` (admin pages)
- `src/app/api/admin/` (admin APIs)
- `src/app/api/diagnosis/` (keep — used by recommendation page)
- `src/app/api/recommendations/` (keep)
- `src/app/api/events/` (keep)

---

## Task 1: Design Tokens & Layout Shell

**Files:**
- Rewrite: `src/app/globals.css`
- Rewrite: `src/app/layout.tsx`
- Create: `src/components/global-nav.tsx`
- Create: `src/components/mobile-tab-bar.tsx`
- Create: `src/components/footer.tsx`

- [ ] **Step 1: Update globals.css with design tokens**

```css
@import "tailwindcss";

@theme {
  --color-bg: #ffffff;
  --color-bg-subtle: #f9fafb;
  --color-bg-dark: #111111;
  --color-text: #111111;
  --color-text-secondary: #6b7280;
  --color-text-muted: #9ca3af;
  --color-border: #e5e7eb;
  --color-accent: #111111;
  --font-sans: "Pretendard", -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
}
```

- [ ] **Step 2: Create GlobalNav component**

Desktop: `racketlab` logo left, links right (라켓, 추천, 비교, 가이드, 뉴스, About).
Minimal style: no background, thin bottom border, font-medium links with hover:text-black.
Include Pretendard font link in head.

- [ ] **Step 3: Create MobileTabBar component**

Fixed bottom bar, 4 tabs: 홈(🏠), 찾기(🔍), 비교(⇄), 찜(♡).
Show on mobile (md:hidden), hide on desktop.

- [ ] **Step 4: Create Footer component**

Dark background (#1a1a1a). 4 columns: racketlab description, 라켓 links, 가이드 links, 더보기 links.
Social icons (Twitter, Instagram, GitHub). Copyright + legal links at bottom.
Match the racketlab reference structure exactly.

- [ ] **Step 5: Rewrite layout.tsx**

```tsx
import type { Metadata } from "next";
import "./globals.css";
import { GlobalNav } from "@/components/global-nav";
import { MobileTabBar } from "@/components/mobile-tab-bar";
import { Footer } from "@/components/footer";

export const metadata: Metadata = {
  title: "racketlab | 한국 테니스 라켓 플랫폼",
  description: "한국에서 실제 판매 중인 테니스 라켓을 이해하고, 비교하고, 추천받고, 구매까지 연결하는 서비스입니다.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className="bg-white text-[var(--color-text)] antialiased font-sans">
        <GlobalNav />
        <main className="min-h-screen">{children}</main>
        <Footer />
        <MobileTabBar />
      </body>
    </html>
  );
}
```

- [ ] **Step 6: Verify layout renders**

Run: `npm run dev`
Open: http://localhost:3000
Expected: Nav bar at top, footer at bottom, empty main area.

- [ ] **Step 7: Commit**

```bash
git add src/app/globals.css src/app/layout.tsx src/components/global-nav.tsx src/components/mobile-tab-bar.tsx src/components/footer.tsx
git commit -m "feat: add layout shell with global nav, mobile tabs, footer"
```

---

## Task 2: Chart Components (Radar + Bars)

**Files:**
- Create: `src/components/radar-chart.tsx`
- Create: `src/components/axis-bars.tsx`
- Create: `src/components/radar-bar-combo.tsx`

- [ ] **Step 1: Create RadarChart component**

SVG-based pentagon chart. Props: `scores: { power: number; control: number; spin: number; comfort: number; stability: number }`, `size?: number`, `className?: string`.
Scores range from -5 to +5 (map to polygon vertices).
Black stroke, light fill. Labels at each vertex showing axis name + score.
Reference: the racketlab detail page's left-side pentagon.

- [ ] **Step 2: Create AxisBars component**

Props: same `scores` object. Horizontal bars with label left, score right, bar below.
Bar fill: black (#111). Background: #f0f0f0. Heights: 6px rounded.
5 bars: 직구력, 컨트롤, 스핀, 충격흡수, 안정감.
Score range -5 to +5 mapped to 0-100% width.

- [ ] **Step 3: Create RadarBarCombo component**

Side-by-side layout: RadarChart on left (120px), AxisBars on right (flex-1).
Props: same `scores` object.
Responsive: on mobile stack vertically, on desktop side-by-side.

- [ ] **Step 4: Verify charts render**

Create a temporary test page or check in browser dev tools.

- [ ] **Step 5: Commit**

```bash
git add src/components/radar-chart.tsx src/components/axis-bars.tsx src/components/radar-bar-combo.tsx
git commit -m "feat: add radar chart, axis bars, and combo components"
```

---

## Task 3: RacketCard + Static Data Files

**Files:**
- Create: `src/components/racket-card.tsx`
- Create: `src/data/players.ts`
- Create: `src/data/news.ts`
- Create: `src/data/knowledge.ts`
- Create: `src/data/featured-rackets.ts`

- [ ] **Step 1: Create RacketCard component**

Card for use in lists/grids. Props: `racket: { slug: string; brand: string; model: string; year: number; weight: string; headSize: string; pattern: string; priceKrw: number; imageUrl?: string; scores: Scores }`.
Layout: Image placeholder top, brand (small grey), model name (bold), spec badges, price.
Link wraps the whole card → `/rackets/${slug}`.

- [ ] **Step 2: Create players.ts**

Export `players` array with 18 entries (9 male, 9 female) matching the reference site exactly:
- Sinner, Alcaraz, Djokovic, Zverev, Medvedev, Fritz, Ruud, de Minaur, Rublev, Dimitrov
- Swiatek, Sabalenka, Gauff, Paolini, Zheng, Rybakina, Pegula, Navarro, Kasatkina, Andreeva

Each entry: `{ name, nameKo, country, countryFlag, initial, tags: string[], racket: { brand, model, year, specs, scores }, synergy: string, imageUrl?: string }`.

- [ ] **Step 3: Create news.ts**

Export `newsItems` array with 3 sample entries matching reference:
- Babolat Pure Aero 2026 출시 (03/19, 신제품)
- Head Speed MP 2026 출시 (03/18, 신제품)
- 폴리 장력 팁 (03/17, 팁)

- [ ] **Step 4: Create knowledge.ts**

Export `knowledgeFacts` array with 5 entries from reference:
- 내추럴 거트는 소 내장으로 만든다
- 라켓 무게 10g 차이가 체감 30%
- 스트링 장력이 높을수록 파워는 줄어든다
- 프로 선수 라켓은 시판품과 다르다
- 그립 사이즈 1mm가 테니스 엘보를 만든다

- [ ] **Step 5: Create featured-rackets.ts**

Export `featuredRackets` array with 3 hero carousel entries:
- Babolat Pure Aero 2026 (스핀 MAX, 파워 +3)
- Head Speed MP 2026 (밸런스 PERFECT, 스피드 +4, 컨트롤 +4)
- Yonex VCORE 100 2026 (파워 +4, 스핀 +3)

- [ ] **Step 6: Commit**

```bash
git add src/components/racket-card.tsx src/data/
git commit -m "feat: add racket card component and static data files"
```

---

## Task 4: Home Page

**Files:**
- Rewrite: `src/app/page.tsx`
- Create: `src/components/hero-carousel.tsx`
- Create: `src/components/quick-links.tsx`
- Create: `src/components/top-rackets-list.tsx`
- Create: `src/components/news-feed.tsx`
- Create: `src/components/player-synergy-card.tsx`
- Create: `src/components/knowledge-cards.tsx`
- Create: `src/components/string-guide.tsx`
- Create: `src/lib/queries.ts`

- [ ] **Step 1: Create Drizzle query helpers**

`src/lib/queries.ts` — functions to query the racket DB:
- `getTopRackets(limit: number)` — join racketModels + racketSpecs + brands, order by popularity/id, return top N
- `getRacketBySlug(slug: string)` — single racket with specs, brand, variant, scores
- `getRackets(filters)` — filtered list with pagination

These use the existing Drizzle schema and `src/db/index.ts` connection.

- [ ] **Step 2: Create HeroCarousel**

Client component ("use client"). Dark background (#111). Auto-rotating slides (5s interval).
Each slide: brand name (small caps), "2026 NEW" badge, model name (large), tagline, stat tags (e.g. ◎ 스핀 MAX), spec badges (300g, 100sq.in, 16x19), racket image right side.
Navigation dots at bottom. Manual prev/next arrows.
Uses `featuredRackets` data.

- [ ] **Step 3: Create QuickLinks**

4 cards in a row: AI 추천, 비교, 라켓 DNA, 스트링 가이드.
Each: icon + title + subtitle. Links to respective pages.
Minimal style: subtle border, hover effect.

- [ ] **Step 4: Create TopRacketsList**

Server component. Fetches top 5 rackets from DB via `getTopRackets(5)`.
Numbered list (1-5). Each row: rank number, brand (grey), model name (bold), spec summary, price.
"전체 보기 →" link at top right.

- [ ] **Step 5: Create NewsFeed**

Uses `newsItems` data. Date column left, tag badge + title + description right.
"전체 보기 →" link at top right.

- [ ] **Step 6: Create PlayerSynergyCard**

Card for one player: initial avatar (colored circle with letter + country flag), name (KR + EN), playstyle tags (연두색 pills), racket info card with 5-axis bar chart, synergy analysis text, "자세히 보기 →" link.
Full section renders all 18 players in a scrollable list.

- [ ] **Step 7: Create KnowledgeCards**

5 fact cards with emoji icon, title, description paragraph.
Horizontal scroll on mobile.

- [ ] **Step 8: Create StringGuide**

Intro text + "가이드 읽기 →" button.
4 string type cards: 폴리에스터, 멀티필라멘트, 내추럴 거트, 하이브리드.
Each: icon, name, pros, cons.

- [ ] **Step 9: Compose home page**

```tsx
// src/app/page.tsx
import { HeroCarousel } from "@/components/hero-carousel";
import { QuickLinks } from "@/components/quick-links";
import { TopRacketsList } from "@/components/top-rackets-list";
import { NewsFeed } from "@/components/news-feed";
import { PlayerSynergySection } from "@/components/player-synergy-card";
import { KnowledgeCards } from "@/components/knowledge-cards";
import { StringGuide } from "@/components/string-guide";

export default function Home() {
  return (
    <>
      <HeroCarousel />
      <div className="max-w-6xl mx-auto px-6">
        <QuickLinks />
        <TopRacketsList />
        <NewsFeed />
      </div>
      <PlayerSynergySection />
      <div className="max-w-6xl mx-auto px-6">
        <KnowledgeCards />
        <StringGuide />
      </div>
    </>
  );
}
```

- [ ] **Step 10: Verify home page**

Run: `npm run dev`, visit http://localhost:3000
Expected: Full home page matching racketlab reference structure. Sections in correct order. No broken layouts.

- [ ] **Step 11: Commit**

```bash
git add src/app/page.tsx src/components/hero-carousel.tsx src/components/quick-links.tsx src/components/top-rackets-list.tsx src/components/news-feed.tsx src/components/player-synergy-card.tsx src/components/knowledge-cards.tsx src/components/string-guide.tsx src/lib/queries.ts
git commit -m "feat: rebuild home page with all racketlab sections"
```

---

## Task 5: Racket List API + Racket Listing Page

**Files:**
- Create: `src/app/api/rackets/route.ts`
- Create: `src/app/rackets/page.tsx`

- [ ] **Step 1: Create racket list API**

`GET /api/rackets` — returns rackets with filters.
Query params: `brand`, `minWeight`, `maxWeight`, `minHead`, `maxHead`, `segment`, `sort` (popular, price_asc, price_desc, power, control, spin), `page`, `limit`.
Joins racketModels + racketSpecs + brands + racketVariants.
Returns JSON: `{ rackets: [...], total: number, page: number }`.

- [ ] **Step 2: Create rackets listing page**

Server component with client filter sidebar.
Layout: filter panel on left (desktop) / expandable on mobile, card grid on right.
Filters: brand checkboxes, weight range, head size range, segment tags.
Sort dropdown. Pagination.
Uses `RacketCard` component for each result.
Large hero placeholder area at top (matching racketlab's beige area — will be replaced by banner image later).

- [ ] **Step 3: Verify racket listing**

Visit http://localhost:3000/rackets
Expected: Grid of racket cards with filter sidebar. Should show 80 rackets from seed data.

- [ ] **Step 4: Commit**

```bash
git add src/app/api/rackets/route.ts src/app/rackets/page.tsx
git commit -m "feat: add racket listing page with filters and API"
```

---

## Task 6: Racket Detail Page

**Files:**
- Create: `src/app/rackets/[slug]/page.tsx`

- [ ] **Step 1: Create racket detail page**

Server component. Fetches racket by slug via `getRacketBySlug(slug)`.
Slug format: `{brand}-{model}-{year}` lowercased, spaces to hyphens.

Layout (matching racketlab reference):
- Top: back link (←) + breadcrumb (브랜드 > 모델명)
- Main: left = large racket image, right = info panel
  - Brand (grey), model name (bold h1), tagline
  - Spec badges row (weight, head size, pattern)
  - RadarBarCombo component (pentagon left + bars right)
  - "정직한 능력 분석" section — strengths with descriptions
  - "대가 있음" trade-off warning (pink background)
  - Price + "구매처 보기" CTA button
- Tab section below: 상세 스펙 | 추천 대상 | 스트링&그립 | 구매처 | 유사 라켓
  - 상세 스펙: table with 헤드사이즈, 스트링 패턴, 강성(RA), 길이, 프레임 두께
  - Other tabs: placeholder content for now

- [ ] **Step 2: Generate slugs for seed data**

Add a helper function `generateSlug(brand: string, model: string, year: number)` in `queries.ts`.

- [ ] **Step 3: Verify detail page**

Visit http://localhost:3000/rackets/head-speed-mp-2026
Expected: Full detail page with image area, stats, analysis, spec table.

- [ ] **Step 4: Commit**

```bash
git add src/app/rackets/[slug]/page.tsx src/lib/queries.ts
git commit -m "feat: add racket detail page with radar/bar combo and specs"
```

---

## Task 7: Compare Page

**Files:**
- Rewrite: `src/app/compare/page.tsx`
- Create: `src/components/compare-slot.tsx`

- [ ] **Step 1: Create CompareSlot floating bar**

Client component. Fixed bottom bar (above mobile tab bar). Shows selected rackets (up to 3) as small chips.
"비교하기" button navigates to `/compare?ids=id1,id2,id3`.
State managed via URL search params or localStorage.

- [ ] **Step 2: Rewrite compare page**

Client component. Reads racket IDs from URL search params.
Fetches racket data for each. Displays:
- Side-by-side racket images + names
- Overlapping radar charts (different colors per racket)
- Spec comparison table (horizontal scroll on mobile)
- Price comparison row

- [ ] **Step 3: Verify compare page**

Visit http://localhost:3000/compare?ids=<id1>,<id2>
Expected: Two rackets side by side with overlapping radar charts.

- [ ] **Step 4: Commit**

```bash
git add src/app/compare/page.tsx src/components/compare-slot.tsx
git commit -m "feat: rebuild compare page with overlapping radar charts"
```

---

## Task 8: AI Recommendation (Move + Restyle)

**Files:**
- Create: `src/app/recommendation/page.tsx`
- Create: `src/app/recommendation/result/[id]/page.tsx`

- [ ] **Step 1: Move diagnosis → recommendation**

Copy the core logic from `src/app/diagnosis/page.tsx` to `src/app/recommendation/page.tsx`.
Restyle to minimal-premium tone: white background, black accents, clean typography.
Keep the API calls to `/api/diagnosis/` endpoints.

- [ ] **Step 2: Move results → recommendation/result**

Copy from `src/app/results/[id]/page.tsx`. Restyle.
Add RadarBarCombo for each recommended racket.
Add "비교에 담기" buttons.

- [ ] **Step 3: Verify recommendation flow**

Complete the recommendation flow end-to-end.

- [ ] **Step 4: Commit**

```bash
git add src/app/recommendation/
git commit -m "feat: move and restyle recommendation flow"
```

---

## Task 9: Collect & Add High-Quality Images

**Files:**
- Create: `public/images/rackets/*.webp`
- Create: `public/images/players/*.webp`
- Update: `src/data/players.ts` (add imageUrl)
- Update: `src/data/featured-rackets.ts` (add imageUrl)

- [ ] **Step 1: Download racket product images**

Source high-quality racket images for the major models:
- Search Unsplash/Pexels for tennis racket product photos
- For specific models, use brand official product shots where available
- Save as WebP format to `public/images/rackets/`
- Naming: `{brand}-{model}-{year}.webp` (e.g., `head-speed-mp-2026.webp`)

Priority rackets (featured + top 5 + player rackets):
- Head Speed MP 2026, Speed Pro 2026
- Babolat Pure Aero 2026, Pure Drive 2025
- Yonex VCORE 100 2026, EZONE 100 2025
- Wilson Blade 98 V9, Pro Staff 97 V14
- Dunlop FX 500 2026
- Tecnifibre TF-40 305
- Head Gravity MP 2025, Boom MP 2026

- [ ] **Step 2: Download player photos**

Source player headshots/action photos.
Save to `public/images/players/` as `{lastname}.webp`.
18 players: sinner, alcaraz, djokovic, zverev, medvedev, fritz, ruud, deminaur, rublev, dimitrov, swiatek, sabalenka, gauff, paolini, zheng, rybakina, pegula, navarro, kasatkina, andreeva.

- [ ] **Step 3: Update data files with image paths**

Update `players.ts` entries: `imageUrl: "/images/players/sinner.webp"`.
Update `featured-rackets.ts` entries: `imageUrl: "/images/rackets/babolat-pure-aero-2026.webp"`.

- [ ] **Step 4: Update components to use images**

- HeroCarousel: show racket image instead of placeholder
- PlayerSynergyCard: show player photo instead of initial avatar
- RacketCard: show racket thumbnail
- Racket detail page: show large racket image

Use Next.js `<Image>` component with proper sizing and lazy loading.

- [ ] **Step 5: Verify images load correctly**

Check home page, detail pages, player section.

- [ ] **Step 6: Commit**

```bash
git add public/images/ src/data/ src/components/
git commit -m "feat: add high-quality racket and player images"
```

---

## Task 10: Cleanup & Deploy

**Files:**
- Delete: `src/app/diagnosis/` (replaced by recommendation/)
- Delete: `src/app/results/` (replaced by recommendation/result/)
- Delete: `src/app/partners/`
- Delete: `src/app/api/partners/`
- Delete: `src/lib/mock-data.ts`
- Delete: old `src/components/` (axis-bar, chip, etc.)

- [ ] **Step 1: Delete old files**

Remove all replaced/unused files listed above.

- [ ] **Step 2: Run typecheck**

```bash
npm run typecheck
```

Fix any TypeScript errors.

- [ ] **Step 3: Run build**

```bash
npm run build
```

Fix any build errors. Ensure all pages render correctly.

- [ ] **Step 4: Test all pages locally**

- `/` — home with all sections
- `/rackets` — listing with filters
- `/rackets/head-speed-mp-2026` — detail page
- `/compare` — comparison view
- `/recommendation` — questionnaire flow
- Mobile responsive check on all pages

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "chore: cleanup old files and verify build"
```

- [ ] **Step 6: Push and deploy**

```bash
git push origin main
```

Verify Vercel auto-deploys. Check production URL.

- [ ] **Step 7: Final verification on production**

Visit deployed URL. Check all pages, images load, mobile layout works.

---

## Summary

| Task | Description | Estimated Complexity |
|------|-------------|---------------------|
| 1 | Design tokens, layout, nav, footer | Medium |
| 2 | Chart components (radar + bars) | Medium |
| 3 | RacketCard + static data files | Light |
| 4 | Home page (all sections) | Heavy |
| 5 | Racket list API + listing page | Medium |
| 6 | Racket detail page | Heavy |
| 7 | Compare page | Medium |
| 8 | Recommendation (move + restyle) | Light |
| 9 | High-quality images | Medium |
| 10 | Cleanup + deploy | Light |
