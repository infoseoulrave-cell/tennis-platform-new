"use client";

import Link from "next/link";
import { Wordmark } from "@/components/wordmark";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { TabIcon } from "./tab-icons";

// 뉴스·About은 푸터로 옮겨 상단 메뉴를 5개로 줄였다.
// 초심자가 먼저 눌러야 할 "추천"을 맨 앞에 둔다.
//
// "추천"은 홈 히어로와 같은 `/start`(3문항)로 보낸다. 예전에는 여기만
// `/recommendation`(12문항)이라, 홈의 큰 버튼과 상단 메뉴가 서로 다른
// 진단으로 갈렸다. 더 자세한 진단으로 가는 길은 `/start` 안에 있다.
const links = [
  { href: "/start", label: "추천" },
  { href: "/rackets", label: "라켓" },
  { href: "/strings", label: "스트링" },
  { href: "/compare", label: "비교" },
  { href: "/guide", label: "가이드" },
];

type SearchResult = {
  slug: string;
  brand: string;
  model: string;
  year: number | null;
};

export function normalizeNavSearchResults(input: unknown): SearchResult[] {
  if (!Array.isArray(input)) return [];
  return input.flatMap((item) => {
    if (!item || typeof item !== "object") return [];
    const row = item as Record<string, unknown>;
    if (
      typeof row.slug !== "string"
      || typeof row.brandName !== "string"
      || typeof row.displayName !== "string"
    ) return [];

    return [{
      slug: row.slug,
      brand: row.brandName,
      model: row.displayName,
      year: typeof row.releaseYear === "number" ? row.releaseYear : null,
    }];
  });
}

export function GlobalNav() {
  const pathname = usePathname();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [settledSearchQuery, setSettledSearchQuery] = useState("");
  const [searchFailed, setSearchFailed] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);
  const normalizedSearchQuery = searchQuery.trim();
  const searchStatusMessage = isSearching
    ? "검색 중"
    : normalizedSearchQuery.length < 2
      || settledSearchQuery !== normalizedSearchQuery
      ? ""
      : searchFailed
        ? "검색을 완료하지 못했습니다"
        : searchResults.length > 0
          ? `검색 결과 ${searchResults.length}개`
          : "검색 결과가 없습니다";

  const closeSearch = useCallback(() => {
    setSearchOpen(false);
    setSearchQuery("");
    setSearchResults([]);
    setSettledSearchQuery("");
    setSearchFailed(false);
    setIsSearching(false);
    requestAnimationFrame(() => {
      if (returnFocusRef.current?.isConnected) returnFocusRef.current.focus();
      returnFocusRef.current = null;
    });
  }, []);

  const openSearch = useCallback(() => {
    if (searchOpen) return;
    const activeElement = document.activeElement;
    returnFocusRef.current = activeElement instanceof HTMLElement ? activeElement : null;
    setSearchOpen(true);
  }, [searchOpen]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        openSearch();
      }
      if (e.key === "Escape" && searchOpen) {
        e.preventDefault();
        closeSearch();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [closeSearch, openSearch, searchOpen]);

  useEffect(() => {
    const dialog = searchRef.current;
    if (!searchOpen || !dialog) return;

    inputRef.current?.focus();
    function trapFocus(e: KeyboardEvent) {
      if (e.key !== "Tab") return;
      const focusable = Array.from(dialog!.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])',
      ));
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && (document.activeElement === first || !dialog!.contains(document.activeElement))) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
    dialog.addEventListener("keydown", trapFocus);
    return () => dialog.removeEventListener("keydown", trapFocus);
  }, [searchOpen]);

  useEffect(() => {
    const query = searchQuery.trim();
    setSearchResults([]);
    setSettledSearchQuery("");
    setSearchFailed(false);
    setIsSearching(false);
    if (query.length < 2) {
      return;
    }

    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(
          `/api/diagnosis/racket-search?q=${encodeURIComponent(query)}&limit=6`,
          { signal: controller.signal },
        );
        if (!res.ok) throw new Error("Search request failed");
        const data = await res.json();
        if (controller.signal.aborted) return;
        setSearchResults(normalizeNavSearchResults(data.results));
        setSettledSearchQuery(query);
      } catch {
        if (controller.signal.aborted) return;
        setSearchResults([]);
        setSearchFailed(true);
        setSettledSearchQuery(query);
      } finally {
        if (!controller.signal.aborted) setIsSearching(false);
      }
    }, 250);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [searchQuery]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        closeSearch();
      }
    }
    if (searchOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [closeSearch, searchOpen]);

  return (
    <>
    {/* 상단 바는 Court Lime 으로 채운다 — 민호 지정 (reversed-lime lockup).
        라임 위 텍스트는 전부 잉크 계열. */}
    <header className="sticky top-0 z-50 bg-[var(--color-accent)]/95 backdrop-blur-sm border-b border-[var(--color-text)]/10">
      <nav className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" aria-label="racket lab 홈">
          <Wordmark on="lime" className="text-xl" />
        </Link>
        <div className="hidden md:flex items-center gap-6">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`relative text-sm font-medium transition-colors py-1 ${
                  pathname?.startsWith(link.href)
                    ? "text-[var(--color-text)] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[var(--color-text)] after:rounded-full"
                    : "text-[var(--color-text)]/60 hover:text-[var(--color-text)]"
                }`}
              >
                {link.label}
              </Link>
            ))}
            <button
              type="button"
              onClick={openSearch}
              aria-label="라켓 검색 열기"
              aria-haspopup="dialog"
              aria-expanded={searchOpen}
              className="flex items-center gap-2 px-3 py-1.5 text-xs text-[var(--color-text)]/70 border border-[var(--color-text)]/25 rounded-lg hover:border-[var(--color-text)]/60 transition-colors"
            >
              <svg aria-hidden="true" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <circle cx={11} cy={11} r={8} /><path d="m21 21-4.3-4.3" />
              </svg>
              검색
              <kbd className="hidden lg:inline text-[10px] px-1 py-0.5 bg-[var(--color-text)]/10 rounded">⌘K</kbd>
            </button>
          </div>
          <button
            type="button"
            onClick={openSearch}
            aria-label="라켓 검색 열기"
            aria-haspopup="dialog"
            aria-expanded={searchOpen}
            className="md:hidden p-2 text-[var(--color-text)]/70"
          >
            <svg aria-hidden="true" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <circle cx={11} cy={11} r={8} /><path d="m21 21-4.3-4.3" />
            </svg>
          </button>
        </nav>
      </header>

      {searchOpen && (
        <div className="fixed inset-0 z-[100] bg-black/40 flex items-start justify-center pt-[15vh]">
          <div
            ref={searchRef}
            role="dialog"
            aria-modal="true"
            aria-label="라켓 검색"
            className="w-full max-w-lg mx-4 bg-white rounded-2xl shadow-2xl overflow-hidden"
          >
            <div className="flex items-center gap-3 px-4 py-3 border-b border-[var(--color-border)]">
              <svg className="w-5 h-5 text-[var(--color-text-muted)] shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <circle cx={11} cy={11} r={8} /><path d="m21 21-4.3-4.3" />
              </svg>
              <input
                ref={inputRef}
                type="text"
                aria-label="브랜드 또는 모델명으로 라켓 검색"
                placeholder="라켓 검색... (브랜드, 모델명)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 text-sm outline-none placeholder:text-[var(--color-text-muted)]"
              />
              {isSearching && (
                <div aria-hidden="true" className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
              )}
              <button type="button" aria-label="검색 닫기" onClick={() => closeSearch()} className="text-xs text-[var(--color-text-muted)] px-2 py-1 bg-[var(--color-bg-subtle)] rounded">
                ESC
              </button>
            </div>
            <p role="status" aria-live="polite" className="sr-only">
              {searchStatusMessage}
            </p>
            {searchResults.length > 0 && (
              <ul className="max-h-80 overflow-y-auto">
                {searchResults.map((r) => (
                  <li key={r.slug}>
                    <Link
                      href={`/rackets/${r.slug}`}
                      onClick={() => closeSearch()}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-[var(--color-bg-subtle)] transition-colors"
                    >
                      <TabIcon
                        name="racket"
                        size={20}
                        className="shrink-0 text-[var(--color-text-muted)]"
                      />
                      <div>
                        <p className="text-xs text-[var(--color-text-muted)]">{r.brand}</p>
                        <p className="text-sm font-medium">
                          {r.model}{r.year && !r.model.includes(String(r.year)) ? ` (${r.year})` : ""}
                        </p>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
            {searchFailed && settledSearchQuery === normalizedSearchQuery && (
              <div className="px-4 py-8 text-center text-sm text-[var(--color-text-muted)]">
                검색을 완료하지 못했습니다. 잠시 후 다시 시도해 주세요.
              </div>
            )}
            {!searchFailed
              && settledSearchQuery === normalizedSearchQuery
              && normalizedSearchQuery.length >= 2
              && !isSearching
              && searchResults.length === 0 && (
              <div className="px-4 py-8 text-center text-sm text-[var(--color-text-muted)]">
                검색 결과가 없습니다
              </div>
            )}
            {!searchQuery && (
              <div className="px-4 py-6 text-center text-xs text-[var(--color-text-muted)]">
                브랜드나 모델명을 입력하세요
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
