import Link from "next/link";

const racketLinks = [
  { href: "/rackets", label: "전체 라켓" },
  { href: "/rackets?sort=newest", label: "신상품" },
  { href: "/rackets?sort=price_asc", label: "가격순" },
  { href: "/recommendation", label: "추천" },
  { href: "/compare", label: "비교" },
];

const guideLinks = [
  { href: "/guide", label: "라켓 가이드" },
  { href: "/guide/strings", label: "스트링 가이드" },
  { href: "/guide/grip", label: "그립 사이즈" },
];

const moreLinks = [
  { href: "/updates", label: "뉴스" },
  { href: "/about", label: "About" },
];

export function Footer() {
  return (
    <footer className="bg-[var(--color-bg-footer)] text-blue-200/70 pb-20 md:pb-0">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-8">
          <div className="space-y-4 lg:col-span-2">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-5 rounded-sm bg-[var(--color-brand)]" />
              <span className="text-lg font-bold tracking-tight text-white">racketlab</span>
            </span>
            <p className="text-sm leading-relaxed">
              한국에서 실제 판매 중인 테니스 라켓을 이해하고, 비교하고, 추천받고, 구매까지 연결하는 서비스입니다.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-blue-100 mb-4">라켓</h4>
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
            <h4 className="font-semibold text-blue-100 mb-4">가이드</h4>
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
            <h4 className="font-semibold text-blue-100 mb-4">더보기</h4>
            <ul className="space-y-2">
              {moreLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
            <p className="mt-6 text-xs leading-relaxed text-blue-200/50">
              스펙 기반 점수는 모델 간 비교를 돕는 추정치이며 의료·구매 적합성을 보증하지 않습니다.
            </p>
          </div>
        </div>

        <div className="border-t border-white/10 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm">&copy; 2026 racketlab. All rights reserved.</p>
          <p className="text-xs text-blue-200/50">데이터 확인 기준일 2026-07-21</p>
        </div>
      </div>
    </footer>
  );
}
