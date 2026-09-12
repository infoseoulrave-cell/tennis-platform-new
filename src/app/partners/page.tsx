import type { Metadata } from "next";
import Link from "next/link";
import { PartnerInquiryForm } from "@/components/partner-inquiry-form";

export const metadata: Metadata = {
  title: "테니스 브랜드·판매점 입점 상담",
  description: "테니스 의류, 공, 가방, 액세서리와 라켓의 상품 정보·구매처 연결 및 입점 협업을 상담하세요.",
};

const steps = [
  ["판매할 수 있는 상품 확인", "취급 브랜드와 품목, 한국 배송 범위, 사이즈·재고 정보, 교환·반품 기준을 함께 확인합니다."],
  ["상품 정보와 구매처 연결", "사용 가능한 이미지·설명 자료와 공식 판매 링크를 확인하고 작은 상품군부터 연결 범위를 정합니다."],
  ["실제 결과로 다음 협의", "관심과 판매처 이동을 살펴보고 판매자가 확인한 주문·취소 내역을 바탕으로 수수료와 운영 범위를 협의합니다."],
];

export default function PartnersPage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-12 md:py-16">
      <Link href="/gear" className="inline-flex min-h-11 items-center text-sm underline underline-offset-4">의류·용품 둘러보기 →</Link>
      <header className="mt-6 max-w-2xl">
        <p className="text-xs font-semibold tracking-widest text-[var(--color-text-muted)]">RACKETLAB PARTNERS</p>
        <h1 className="mt-3 text-3xl font-bold leading-tight md:text-5xl">테니스 브랜드와 판매점을<br />새로운 선택의 순간에 연결합니다.</h1>
        <p className="mt-5 leading-relaxed text-[var(--color-text-secondary)]">의류, 공, 가방, 액세서리부터 라켓과 스트링까지. 여러 브랜드를 살펴보는 플레이어가 구매 가능한 상품을 찾도록 함께 준비할 파트너를 모집합니다.</p>
        <p className="mt-3 text-sm leading-relaxed text-[var(--color-text-muted)]">현재는 공식몰 컬렉션 탐색과 외부 구매처 연결 단계입니다. 상품별 입점·판매 수수료는 개별 협의하며 사이트 내 결제와 실시간 재고 연동은 아직 제공하지 않습니다.</p>
      </header>
      <section className="mt-10 grid gap-4 md:grid-cols-3" aria-label="입점 협의 순서">
        {steps.map(([title, description], i) => (
          <article key={title} className="rounded-2xl border border-[var(--color-border)] p-5">
            <p className="text-sm text-[var(--color-text-muted)]">0{i + 1}</p>
            <h2 className="mt-3 text-lg font-semibold">{title}</h2>
            <p className="mt-3 text-sm leading-relaxed text-[var(--color-text-secondary)]">{description}</p>
          </article>
        ))}
      </section>
      <section className="mt-8 rounded-2xl bg-[var(--color-bg-subtle)] p-6">
        <h2 className="text-lg font-semibold">소규모 브랜드·테니스 전문점도 함께할 수 있습니다</h2>
        <p className="mt-3 text-sm leading-relaxed text-[var(--color-text-secondary)]">브랜드 규모보다 정확한 상품 정보와 판매·배송 대응이 중요합니다. 문의와 검토에는 비용이 없으며 입점 승인, 판매량이나 매출을 보장하지 않습니다. 제휴와 광고가 라켓 점수·추천 순위를 바꾸지 않습니다.</p>
        <Link href="/advertise" className="mt-3 inline-flex min-h-11 items-center text-sm font-semibold underline underline-offset-4">브랜드 협업·스폰서십 안내 →</Link>
      </section>
      <section id="inquiry" className="mt-8 rounded-2xl border border-[var(--color-border)] bg-white p-6 md:p-8">
        <h2 className="text-2xl font-bold">입점·연결 협업 상담</h2>
        <p className="mb-6 mt-3 text-sm leading-relaxed text-[var(--color-text-secondary)]">판매 중인 품목과 공식몰 주소를 알려 주세요. 주문 처리 주체와 자료 사용 범위를 확인한 뒤 진행 방법을 회신드립니다.</p>
        <PartnerInquiryForm collectCategories source="gear_partner_intake" messagePlaceholder="공식몰 주소, 취급 브랜드, 연결 가능한 상품 수, 사이즈·재고 제공 방법, 배송·반품 기준, 원하시는 협업 방식" />
      </section>
    </div>
  );
}
