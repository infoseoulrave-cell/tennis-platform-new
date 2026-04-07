"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/rackets", label: "라켓" },
  { href: "/recommendation", label: "추천" },
  { href: "/compare", label: "비교" },
  { href: "/guide", label: "가이드" },
  { href: "/updates", label: "뉴스" },
  { href: "/about", label: "About" },
];

export function GlobalNav() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-[var(--color-border)]">
      <nav className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="text-lg font-bold tracking-tight text-[var(--color-text)]">
          racketlab
        </Link>
        <div className="hidden md:flex items-center gap-8">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm font-medium transition-colors ${
                pathname?.startsWith(link.href)
                  ? "text-[var(--color-text)]"
                  : "text-[var(--color-text-secondary)] hover:text-[var(--color-text)]"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </nav>
    </header>
  );
}
