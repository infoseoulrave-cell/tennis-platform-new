import Link from "next/link";
import { Wordmark } from "@/components/wordmark";
import { DATA_VERIFIED_AT } from "@/data/data-freshness";

const productLinks = [
  { href: "/rackets", label: "전체 라켓" },
  { href: "/strings", label: "스트링" },
  { href: "/rackets?sort=newest", label: "신상품" },
  { href: "/rackets?sort=price_asc", label: "가격순" },
  // 상단 메뉴·히어로와 같은 곳으로 보낸다. 같은 라벨이 서로 다른 진단으로
  // 갈리면 안 된다.
  { href: "/start", label: "추천" },
  { href: "/compare", label: "비교" },
];

const guideLinks = [
  { href: "/guide", label: "라켓 가이드" },
  { href: "/guide/strings", label: "스트링 가이드" },
  { href: "/guide/grip", label: "그립 사이즈" },
];

const moreLinks = [
  { href: "/updates", label: "뉴스" },
  { href: "/shops", label: "매장 찾기" },
  { href: "/partners", label: "매장 입점 문의" },
  { href: "/about", label: "About" },
];

export function Footer() {
  return (
    <footer className="bg-[var(--color-bg-footer)] text-[#9C978C] pb-20 md:pb-0">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-8">
          <div className="space-y-4 lg:col-span-2">
            {/* VI 워드마크 + 스윗스팟 도트 — 이 화면(푸터)의 라임 1점은 이 도트다 */}
            <span className="flex items-center gap-2.5">
              <Wordmark on="dark" className="text-xl" />
              <span aria-hidden="true" className="mt-1 h-1.5 w-1.5 rounded-full bg-[var(--color-accent)]" />
            </span>
            <p className="text-xs text-[#6F6A60] tracking-wide mt-1">Read your racket.</p>
            <p className="text-sm leading-relaxed mt-3">
              데이터 기반 5축 분석으로 당신에게 맞는 라켓을 찾아드립니다.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-[#F3F0EA] mb-4">제품</h4>
            <ul className="space-y-2">
              {productLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-[#F3F0EA] mb-4">가이드</h4>
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
            <h4 className="font-semibold text-[#F3F0EA] mb-4">더보기</h4>
            <ul className="space-y-2">
              {moreLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
            <p className="mt-6 text-xs leading-relaxed text-[#6F6A60]">
              스펙 기반 점수는 모델 간 비교를 돕는 추정치이며 의료·구매 적합성을 보증하지 않습니다.
            </p>
          </div>
        </div>

        <div className="border-t border-white/10 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm">&copy; 2026 racket lab. All rights reserved.</p>
          {/* 날짜를 손으로 적어 두면 데이터를 갱신해도 그대로 남아 실제보다
              최신인 것처럼 보인다. 데이터에서 직접 계산한다. */}
          {DATA_VERIFIED_AT && (
            <p className="text-xs text-[#6F6A60]">
              데이터 확인 기준일 {DATA_VERIFIED_AT}
            </p>
          )}
        </div>
      </div>
    </footer>
  );
}
