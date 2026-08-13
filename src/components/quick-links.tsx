import Image from "next/image";
import Link from "next/link";

/**
 * 히어로 아래 보조 진입점.
 *
 * 예전에는 첫 칸이 "AI 추천 → /recommendation" 이었다. 바로 위 히어로와
 * 그 위 초심자 배너에도 추천 CTA 가 있어서, 첫 화면에 추천 버튼이 세 개
 * 있고 목적지는 두 곳으로 갈렸다. 추천 진입은 히어로 하나로 모으고
 * 여기는 "추천 말고 직접 볼 사람" 을 위한 길만 남긴다.
 *
 * 아이콘 카드였다가 사진 배너로 바꿨다 — 히어로와 같은 촬영 에셋을
 * 재사용하고, 아래쪽 페이드 위에 텍스트를 얹는다. 스트링 가이드는
 * 같은 사진을 스트링 베드 쪽으로 크롭해 주제를 가리킨다.
 */
const links: {
  href: string;
  title: string;
  subtitle: string;
  image: string;
  /* object-position — 배너 비율에서 사진의 어느 부분을 보여줄지 */
  crop: string;
}[] = [
  {
    href: "/compare",
    title: "비교",
    subtitle: "라켓 나란히 비교",
    image: "/images/rackets/head-radical-mp-2025.png",
    crop: "object-[50%_23%]",
  },
  {
    href: "/guide/dna",
    title: "라켓 DNA",
    subtitle: "5가지 핵심 능력치",
    image: "/images/rackets/wilson-ultra-100-v5.png",
    crop: "object-[50%_30%]",
  },
  {
    href: "/guide/strings",
    title: "스트링 가이드",
    subtitle: "종류별 완벽 정리",
    image: "/images/rackets/wilson-shift-99-v1.png",
    crop: "object-[50%_28%]",
  },
];

export function QuickLinks() {
  return (
    <section className="grid grid-cols-1 gap-3 py-12 sm:grid-cols-3">
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className="group relative block h-32 overflow-hidden rounded-2xl bg-[var(--color-bg-dark)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-brand)] sm:h-44"
        >
          <Image
            src={link.image}
            alt=""
            fill
            sizes="(min-width: 640px) 33vw, 100vw"
            className={`object-cover ${link.crop} transition-transform duration-500 group-hover:scale-[1.04] motion-reduce:transition-none motion-reduce:group-hover:scale-100`}
          />
          {/* 텍스트 가독을 위한 아래쪽 페이드 */}
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent"
          />
          <div className="absolute inset-x-0 bottom-0 p-5">
            <h3 className="text-sm font-semibold text-white">{link.title}</h3>
            <p className="mt-0.5 text-xs text-white/70">{link.subtitle}</p>
          </div>
        </Link>
      ))}
    </section>
  );
}
