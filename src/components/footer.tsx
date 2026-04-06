import Link from "next/link";

const racketLinks = [
  { href: "/rackets", label: "전체 라켓" },
  { href: "/new", label: "신상품" },
  { href: "/deals", label: "특가" },
  { href: "/recommendation", label: "추천" },
  { href: "/compare", label: "비교" },
];

const guideLinks = [
  { href: "/knowledge", label: "테니스 상식" },
  { href: "/guide/strings", label: "스트링 가이드" },
  { href: "/guide/grip", label: "그립 사이즈" },
];

const moreLinks = [
  { href: "/updates", label: "뉴스" },
  { href: "/about", label: "About" },
];

export function Footer() {
  return (
    <footer className="bg-[var(--color-bg-footer)] text-[var(--color-text-muted)] pb-20 md:pb-0">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-8">
          <div className="space-y-4 lg:col-span-2">
            <span className="text-lg font-bold tracking-tight text-white">racketlab</span>
            <p className="text-sm leading-relaxed">
              한국에서 실제 판매 중인 테니스 라켓을 이해하고, 비교하고, 추천받고, 구매까지 연결하는 서비스입니다.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-4">라켓</h4>
            <ul className="space-y-2">
              {racketLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-4">가이드</h4>
            <ul className="space-y-2">
              {guideLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-4">더보기</h4>
            <ul className="space-y-2">
              {moreLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="flex gap-3 mt-6">
              <a href="#" className="w-9 h-9 bg-[#333] rounded-lg flex items-center justify-center hover:bg-[#444] transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" /></svg>
              </a>
              <a href="#" className="w-9 h-9 bg-[#333] rounded-lg flex items-center justify-center hover:bg-[#444] transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><rect width={20} height={20} x={2} y={2} rx={5} ry={5} /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1={17.5} x2={17.51} y1={6.5} y2={6.5} /></svg>
              </a>
              <a href="#" className="w-9 h-9 bg-[#333] rounded-lg flex items-center justify-center hover:bg-[#444] transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" /><path d="M9 18c-4.51 2-5-2-7-2" /></svg>
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-[#333] mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm">&copy; 2026 racketlab. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="text-sm hover:text-white transition-colors">개인정보처리방침</a>
            <a href="#" className="text-sm hover:text-white transition-colors">이용약관</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
