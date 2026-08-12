"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useWishlist } from "@/lib/wishlist";
import { TabIcon, type TabIconName } from "./tab-icons";

export type TabItem = {
  href: string;
  label: string;
  icon: TabIconName;
  /**
   * 이 탭이 대표하는 경로들. 상세·파생 화면에서도 탭이 켜져 있어야 한다.
   * 예전 코드는 `pathname.startsWith(href)` 라서 라켓 상세(`/racket/[id]`)와
   * 커스터마이저에서 아무 탭도 켜지지 않았고, `/racketsXXX` 같은 경로에는
   * 반대로 잘못 켜졌다.
   */
  match: string[];
};

export const TAB_ITEMS: TabItem[] = [
  { href: "/", label: "홈", icon: "home", match: [] },
  { href: "/rackets", label: "찾기", icon: "racket", match: ["/rackets", "/racket", "/customizer"] },
  { href: "/strings", label: "스트링", icon: "strings", match: ["/strings"] },
  { href: "/compare", label: "비교", icon: "compare", match: ["/compare"] },
  { href: "/wishlist", label: "찜", icon: "wishlist", match: ["/wishlist"] },
];

/** 홈은 정확히 일치할 때만, 나머지는 경계(`/`)를 지킨 하위 경로까지 켠다. */
export function isTabActive(pathname: string | null | undefined, tab: TabItem): boolean {
  if (!pathname) return false;
  if (tab.href === "/") return pathname === "/";
  return tab.match.some((base) => pathname === base || pathname.startsWith(`${base}/`));
}

export function MobileTabBar() {
  const pathname = usePathname();
  const { items } = useWishlist();

  return (
    <nav
      aria-label="주요 메뉴"
      className="md:hidden fixed bottom-0 inset-x-0 z-50 bg-[var(--color-bg-white)] border-t border-[var(--color-border)] safe-bottom"
    >
      <ul className="flex items-stretch h-14">
        {TAB_ITEMS.map((tab) => {
          const active = isTabActive(pathname, tab);
          const count = tab.href === "/wishlist" ? items.length : 0;

          return (
            <li key={tab.href} className="flex-1">
              <Link
                href={tab.href}
                aria-current={active ? "page" : undefined}
                data-tab={tab.icon}
                data-tab-state={active ? "on" : "off"}
                className={`relative h-full flex flex-col items-center justify-center gap-1 rounded-lg transition-colors duration-200 motion-reduce:transition-none focus-visible:outline-2 focus-visible:outline-offset-[-3px] focus-visible:outline-[var(--color-brand)] ${
                  active
                    ? "text-[var(--color-text)]"
                    : "text-[var(--color-text-muted)]"
                }`}
              >
                {/* 활성 표시 — 바 윗선에 걸치는 라임 실 한 가닥.
                    라임은 브랜드 규칙상 방향 지시에만 쓴다(.impeccable.md). */}
                <span
                  aria-hidden="true"
                  className={`absolute top-0 h-0.5 w-4 rounded-full bg-[var(--color-accent)] origin-center transition-transform duration-200 ease-out motion-reduce:transition-none ${
                    active ? "scale-x-100" : "scale-x-0"
                  }`}
                />
                <span className="relative">
                  <TabIcon name={tab.icon} active={active} />
                  {count > 0 && (
                    <span
                      aria-hidden="true"
                      className="absolute -top-1 -right-2 min-w-4 h-4 px-1 rounded-full bg-[var(--color-text)] text-[var(--color-bg-white)] text-[10px] font-bold leading-4 text-center"
                    >
                      {count > 99 ? "99+" : count}
                    </span>
                  )}
                </span>
                <span className="text-[11px] font-semibold tracking-tight">
                  {tab.label}
                  {count > 0 && <span className="sr-only"> {count}개 담김</span>}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
