"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useWishlist } from "@/lib/wishlist";

const tabs = [
  { href: "/", label: "홈", icon: "🏠" },
  { href: "/rackets", label: "찾기", icon: "🔍" },
  { href: "/strings", label: "스트링", icon: "🧵" },
  { href: "/compare", label: "비교", icon: "⇄" },
  { href: "/wishlist", label: "찜", icon: "♡" },
];

export function MobileTabBar() {
  const pathname = usePathname();
  const { items } = useWishlist();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-[var(--color-border)] safe-bottom">
      <div className="flex items-center justify-around h-14">
        {tabs.map((tab) => {
          const isActive = tab.href === "/" ? pathname === "/" : pathname?.startsWith(tab.href);
          const count = tab.href === "/wishlist" ? items.length : 0;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`relative flex flex-col items-center gap-0.5 text-xs ${
                isActive ? "text-[var(--color-text)]" : "text-[var(--color-text-muted)]"
              }`}
            >
              <span className="text-base">{tab.icon}</span>
              {count > 0 && (
                <span className="absolute -top-0.5 right-[-6px] w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {count}
                </span>
              )}
              <span>{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
