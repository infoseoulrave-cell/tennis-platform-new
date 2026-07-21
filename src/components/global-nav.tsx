"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";

const links = [
  { href: "/rackets", label: "라켓" },
  { href: "/recommendation", label: "추천" },
  { href: "/compare", label: "비교" },
  { href: "/guide", label: "가이드" },
  { href: "/updates", label: "뉴스" },
  { href: "/about", label: "About" },
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
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
      if (e.key === "Escape") {
        setSearchOpen(false);
        setSearchQuery("");
        setSearchResults([]);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    if (searchOpen && inputRef.current) inputRef.current.focus();
  }, [searchOpen]);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(`/api/diagnosis/racket-search?q=${encodeURIComponent(searchQuery)}&limit=6`);
        if (res.ok) {
          const data = await res.json();
          setSearchResults(normalizeNavSearchResults(data.results));
        }
      } catch { /* silent */ }
      setIsSearching(false);
    }, 250);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchOpen(false);
        setSearchQuery("");
        setSearchResults([]);
      }
    }
    if (searchOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [searchOpen]);

  return (
    <>
    <header className="sticky top-0 z-50 bg-[var(--color-bg-white)]/95 backdrop-blur-sm border-b border-[var(--color-border)]">
      <nav className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-1.5">
          <span className="w-2 h-5 rounded-sm bg-[var(--color-brand)]" />
          <span className="text-lg font-bold tracking-tight text-[var(--color-text)]">racketlab</span>
        </Link>
        <div className="hidden md:flex items-center gap-6">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`relative text-sm font-medium transition-colors py-1 ${
                  pathname?.startsWith(link.href)
                    ? "text-[var(--color-text)] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[var(--color-brand)] after:rounded-full"
                    : "text-[var(--color-text-secondary)] hover:text-[var(--color-text)]"
                }`}
              >
                {link.label}
              </Link>
            ))}
            <button
              onClick={() => setSearchOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 text-xs text-[var(--color-text-muted)] border border-[var(--color-border)] rounded-lg hover:border-[var(--color-text-muted)] transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <circle cx={11} cy={11} r={8} /><path d="m21 21-4.3-4.3" />
              </svg>
              검색
              <kbd className="hidden lg:inline text-[10px] px-1 py-0.5 bg-[var(--color-bg-subtle)] rounded">⌘K</kbd>
            </button>
          </div>
          <button
            onClick={() => setSearchOpen(true)}
            className="md:hidden p-2 text-[var(--color-text-secondary)]"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <circle cx={11} cy={11} r={8} /><path d="m21 21-4.3-4.3" />
            </svg>
          </button>
        </nav>
      </header>

      {searchOpen && (
        <div className="fixed inset-0 z-[100] bg-black/40 flex items-start justify-center pt-[15vh]">
          <div ref={searchRef} className="w-full max-w-lg mx-4 bg-white rounded-2xl shadow-2xl overflow-hidden">
            <div className="flex items-center gap-3 px-4 py-3 border-b border-[var(--color-border)]">
              <svg className="w-5 h-5 text-[var(--color-text-muted)] shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <circle cx={11} cy={11} r={8} /><path d="m21 21-4.3-4.3" />
              </svg>
              <input
                ref={inputRef}
                type="text"
                placeholder="라켓 검색... (브랜드, 모델명)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 text-sm outline-none placeholder:text-[var(--color-text-muted)]"
              />
              {isSearching && (
                <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
              )}
              <button onClick={() => { setSearchOpen(false); setSearchQuery(""); setSearchResults([]); }} className="text-xs text-[var(--color-text-muted)] px-2 py-1 bg-[var(--color-bg-subtle)] rounded">
                ESC
              </button>
            </div>
            {searchResults.length > 0 && (
              <ul className="max-h-80 overflow-y-auto">
                {searchResults.map((r) => (
                  <li key={r.slug}>
                    <Link
                      href={`/rackets/${r.slug}`}
                      onClick={() => { setSearchOpen(false); setSearchQuery(""); setSearchResults([]); }}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-[var(--color-bg-subtle)] transition-colors"
                    >
                      <span className="text-lg">🎾</span>
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
            {searchQuery && !isSearching && searchResults.length === 0 && (
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
