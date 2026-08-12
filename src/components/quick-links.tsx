import Link from "next/link";
import { TabIcon, type TabIconName } from "./tab-icons";

/**
 * 히어로 아래 보조 진입점.
 *
 * 예전에는 첫 칸이 "AI 추천 → /recommendation" 이었다. 바로 위 히어로와
 * 그 위 초심자 배너에도 추천 CTA 가 있어서, 첫 화면에 추천 버튼이 세 개
 * 있고 목적지는 두 곳으로 갈렸다. 추천 진입은 히어로 하나로 모으고
 * 여기는 "추천 말고 직접 볼 사람" 을 위한 길만 남긴다.
 *
 * 아이콘은 탭바와 같은 세트를 쓴다. 예전에는 범용 Heroicons 였고
 * "스트링 가이드" 아이콘이 가로줄 3개(햄버거 메뉴)라 아무 의미가 없었다.
 */
const links: { href: string; title: string; subtitle: string; icon: TabIconName }[] = [
  { href: "/compare", title: "비교", subtitle: "라켓 나란히 비교", icon: "compare" },
  { href: "/guide/dna", title: "라켓 DNA", subtitle: "5가지 핵심 능력치", icon: "axes" },
  { href: "/guide/strings", title: "스트링 가이드", subtitle: "종류별 완벽 정리", icon: "strings" },
];

export function QuickLinks() {
  return (
    <section className="grid grid-cols-1 gap-3 py-12 sm:grid-cols-3">
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className="group rounded-xl border border-[var(--color-border)] p-5 transition-colors hover:border-[var(--color-text)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-brand)]"
        >
          <div className="mb-3 text-[var(--color-text)]">
            <TabIcon name={link.icon} size={24} />
          </div>
          <h3 className="text-sm font-semibold">{link.title}</h3>
          <p className="mt-1 text-xs text-[var(--color-text-muted)]">{link.subtitle}</p>
        </Link>
      ))}
    </section>
  );
}
