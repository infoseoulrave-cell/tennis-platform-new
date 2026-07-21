import Link from "next/link";

const links = [
  {
    href: "/recommendation",
    title: "AI 추천",
    subtitle: "나에게 맞는 라켓",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z" />
      </svg>
    ),
  },
  {
    href: "/compare",
    title: "비교",
    subtitle: "라켓 나란히 비교",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 7.5 7.5 3m0 0L12 7.5M7.5 3v13.5m13.5 0L16.5 21m0 0L12 16.5m4.5 4.5V7.5" />
      </svg>
    ),
  },
  {
    href: "/guide/dna",
    title: "라켓 DNA",
    subtitle: "5가지 핵심 능력치",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5 9 8.25 13.5 12.75 21 5.25M21 5.25H15.75M21 5.25v5.25" />
      </svg>
    ),
  },
  {
    href: "/guide/strings",
    title: "스트링 가이드",
    subtitle: "종류별 완벽 정리",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5M3.75 17.25h16.5" />
      </svg>
    ),
  },
];

export function QuickLinks() {
  return (
    <section className="grid grid-cols-2 md:grid-cols-4 gap-3 py-12">
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className="group p-5 bg-[var(--color-bg-white)] rounded-xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
        >
          <div className="text-[var(--color-brand)] mb-3">{link.icon}</div>
          <h3 className="font-semibold text-sm">{link.title}</h3>
          <p className="text-xs text-[var(--color-text-muted)] mt-1">{link.subtitle}</p>
        </Link>
      ))}
    </section>
  );
}
