import type { Metadata } from "next";
import Link from "next/link";
import { PartnerInquiryForm } from "@/components/partner-inquiry-form";

export const metadata: Metadata = {
  title: "테니스 브랜드 협업·스폰서십",
  description: "테니스 의류·용품의 상품 정보 협력, 구매처 연결, 판매 성과 제휴와 광고·스폰서십을 논의합니다.",
};

const formats = [
  { title: "상품 정보·구매처 연결", label: "먼저 확인할 협력", body: "판매 가능한 품목, 공식 자료와 이미지 사용 범위, 국내 배송 및 사이즈·재고 갱신 방법을 맞춥니다. 기본 자료 검토와 연결 협의는 무료입니다." },
  { title: "확인된 판매에 따른 제휴", label: "추적·정산 합의 후", body: "제휴 링크나 합의한 식별 방식으로 실제 주문을 확인합니다. 취소·반품을 제외할 기준과 수수료·정산 주기를 먼저 정합니다. 일반 링크 이동에는 수수료가 발생하지 않습니다." },
  { title: "컬렉션 협업·스폰서십", label: "관심 수요와 운영 범위 확인 후", body: "시즌 의류 컬렉션, 공·그립 선택 가이드, 신제품 체험 등 주제에 맞춰 구성합니다. 확인된 도달 규모, 제작 범위, 측정 항목과 기간을 기준으로 가격을 협의합니다." },
];

export default function AdvertisePage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-12 md:py-16">
      <header className="max-w-3xl">
        <p className="text-xs font-semibold tracking-widest text-[var(--color-text-muted)]">BRAND COLLABORATIONS</p>
        <h1 className="mt-3 text-3xl font-bold leading-tight md:text-5xl">테니스를 고르는 사람과<br />브랜드가 만나는 곳.</h1>
        <p className="mt-5 leading-relaxed text-[var(--color-text-secondary)]">라켓랩은 라켓 추천·비교에서 테니스 의류, 공, 가방과 액세서리 탐색으로 확장하고 있습니다. 플레이어의 관심과 실제 구매 연결을 확인하며 협업을 시작합니다.</p>
        <p className="mt-3 text-sm leading-relaxed text-[var(--color-text-muted)]">초기 파트너 모집 단계입니다. 브랜드가 기존 고객을 라켓랩으로 보내는 것을 협업 조건으로 요구하지 않으며, 확보되지 않은 고객 수나 매출을 약속하지 않습니다.</p>
        <Link href="/business" lang="en" className="mt-3 inline-flex min-h-11 items-center text-sm underline underline-offset-4">For global brands · English partnership brief →</Link>
      </header>
      <section className="mt-10 grid gap-4 md:grid-cols-3" aria-label="협업 방식">
        {formats.map((format) => (
          <article key={format.title} className="rounded-2xl border border-[var(--color-border)] p-6">
            <p className="text-xs font-semibold text-[var(--color-text-muted)]">{format.label}</p>
            <h2 className="mt-3 text-xl font-bold">{format.title}</h2>
            <p className="mt-4 text-sm leading-relaxed text-[var(--color-text-secondary)]">{format.body}</p>
          </article>
        ))}
      </section>
      <section className="mt-10 rounded-3xl bg-[var(--color-bg-footer)] p-7 text-[#F3F0EA]">
        <h2 className="text-2xl font-bold">한 품목, 한 구매 경로부터.</h2>
        <p className="mt-4 leading-relaxed text-[#D3CEC4]">예를 들어 테니스 스커트 컬렉션이나 주말 경기용 공처럼 범위를 좁힙니다. 브랜드는 정확한 상품 자료와 판매·배송 대응을, 라켓랩은 품목 탐색과 구매처 연결·관심 집계를 맡는 방식으로 협의합니다.</p>
        <p className="mt-3 text-sm leading-relaxed text-[#D3CEC4]">필터 선택과 링크 클릭은 주문이 아닙니다. 구매 실적은 판매자 확인이 있어야 집계하고, 스폰서십은 지면·기간·제작물·측정 범위가 합의된 경우에만 진행합니다.</p>
      </section>
      <section className="mt-10">
        <h2 className="text-2xl font-bold">신뢰를 지키는 기준</h2>
        <ul className="mt-5 space-y-3 text-sm leading-relaxed text-[var(--color-text-secondary)]">
          <li>유료 노출에는 광고주와 ‘광고’를 표시하고 자연 탐색과 구분합니다.</li>
          <li>공식몰 링크만 있다고 입점·스폰서·어필리에이트 계약이 체결된 것은 아닙니다.</li>
          <li>라켓 점수·추천 순위는 스펙과 근거를 따르며 협찬금으로 바꾸지 않습니다.</li>
          <li>상품 이미지·설명은 사용 범위를 확인하고, 가격·사이즈·재고는 확인한 범위만 표시합니다.</li>
        </ul>
      </section>
      <section id="inquiry" className="mt-10 rounded-2xl border border-[var(--color-border)] bg-white p-6 md:p-8">
        <h2 className="text-2xl font-bold">브랜드 협업 문의</h2>
        <p className="mb-6 mt-3 text-sm leading-relaxed text-[var(--color-text-secondary)]">대상 품목, 판매 시장, 해결하고 싶은 문제와 원하는 협업 방식을 알려 주세요.</p>
        <PartnerInquiryForm defaultType="brand" collectCategories source="tennis_brand_collaboration" messagePlaceholder="공식몰 주소, 대상 품목, 한국 판매·배송 여부, 상품 자료 제공 범위, 판매 연결 또는 스폰서십 목표" />
        <p className="mt-5 text-sm"><a className="underline underline-offset-4" href="mailto:info.seoulrave@gmail.com">info.seoulrave@gmail.com</a></p>
      </section>
      <Link href="/partners" className="mt-5 inline-flex min-h-11 items-center text-sm underline underline-offset-4">판매점·브랜드 입점 과정 보기 →</Link>
    </div>
  );
}
