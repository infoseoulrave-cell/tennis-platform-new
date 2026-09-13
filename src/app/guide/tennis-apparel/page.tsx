import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "테니스 스커트·원피스 고르는 법",
  description:
    "이너의 부착 방식, 테니스공 수납, 신체 사이즈와 제품 기장의 차이부터 색상·사이즈별 구매 가능 여부와 배송·반품까지 확인하는 테니스 의류 가이드.",
  alternates: { canonical: "https://racketlab.kr/guide/tennis-apparel" },
};

const sourceLinkClass =
  "underline decoration-[var(--color-border)] underline-offset-4 hover:text-[var(--color-text)] focus-visible:outline-2 focus-visible:outline-offset-4";

export default function TennisApparelGuidePage() {
  return (
    <article className="mx-auto max-w-3xl break-keep px-6 py-12 md:py-16">
      <nav aria-label="현재 위치" className="mb-8 text-sm text-[var(--color-text-secondary)]">
        <Link href="/guide" className={sourceLinkClass}>가이드</Link>
        <span className="mx-2" aria-hidden="true">/</span>
        <span aria-current="page" className="text-[var(--color-text)]">테니스 의류</span>
      </nav>

      <header className="mb-10">
        <p className="mb-3 text-xs font-semibold tracking-wide text-[var(--color-text-secondary)]">테니스 의류 가이드</p>
        <h1 className="text-balance text-3xl font-bold leading-tight tracking-tight text-[var(--color-text)] md:text-4xl">
          테니스 스커트·원피스 고르는 법
        </h1>
        <p className="mt-4 leading-7 text-[var(--color-text-secondary)]">
          마음에 드는 디자인을 찾았다면, 코트에서 입을 때 필요한 구조를 살펴보세요.
          이너가 어떻게 붙어 있는지, 공을 어디에 넣는지, 기장을 어떻게 잰 것인지 확인하면 선택이 한결 쉬워집니다.
        </p>
      </header>

      <div className="space-y-12 text-base leading-7 text-[var(--color-text-secondary)]">
        <section aria-labelledby="inner-title">
          <h2 id="inner-title" className="mb-4 text-xl font-semibold tracking-tight text-[var(--color-text)]">1. 이너는 포함 여부와 부착 방식을 따로 보세요</h2>
          <p>
            상품명에 스커트나 원피스라고 적혀 있어도 구성은 다를 수 있습니다.
            상세 설명과 구성품에서 이너 쇼츠·팬티·레오타드의 포함 여부를 먼저 찾고, 겉옷과 연결되어 있는지 확인하세요.
          </p>
          <dl className="mt-5 divide-y divide-[var(--color-border)] border-y border-[var(--color-border)]">
            <div className="py-4 sm:grid sm:grid-cols-[7rem_1fr] sm:gap-4">
              <dt className="font-semibold text-[var(--color-text)]">일체형</dt>
              <dd>겉옷에 부착된 구조입니다. 어디가 연결되어 있는지와 탈착 가능 여부를 확인하세요.</dd>
            </div>
            <div className="py-4 sm:grid sm:grid-cols-[7rem_1fr] sm:gap-4">
              <dt className="font-semibold text-[var(--color-text)]">분리형</dt>
              <dd>겉옷과 따로 입는 구조입니다. 별도 이너가 구성품에 포함되는지, 따로 구매해야 하는지 확인하세요.</dd>
            </div>
            <div className="py-4 sm:grid sm:grid-cols-[7rem_1fr] sm:gap-4">
              <dt className="font-semibold text-[var(--color-text)]">설명 미확인</dt>
              <dd>설명이 없다는 이유로 이너가 없다고 판단하지 마세요. 사진만으로 구조가 불분명하면 상품 번호를 적어 판매자에게 문의하세요.</dd>
            </div>
          </dl>
        </section>

        <section aria-labelledby="storage-title">
          <h2 id="storage-title" className="mb-4 text-xl font-semibold tracking-tight text-[var(--color-text)]">2. 포켓이 있다고 모두 공 수납용은 아닙니다</h2>
          <p>
            휴대전화나 소지품을 넣는 일반 포켓, 공 수납용으로 명시된 포켓, 이너 쇼츠 밑단 아래에 공을 끼우는 방식은 구분해서 보세요.
            포켓의 위치나 모양만 보고 테니스공을 넣을 수 있다고 단정하기는 어렵습니다.
          </p>
          <p className="mt-3">
            실제로 공은 쇼츠 밑단 아래에 보관하고, 별도 포켓은 소지품용으로 안내하는 상품도 있습니다.
            공 수납 방식은 해당 상품의 설명으로 확인하세요.{" "}
            <a href="https://www.nike.com/kr/t/나이키코트-슬램-여성-하이웨이스트-테니스-스커트-BKXo9vYH/IM9424-010" className={sourceLinkClass}>
              나이키 공식 상품 설명의 수납 방식 예시
            </a>
          </p>
        </section>

        <section aria-labelledby="size-title">
          <h2 id="size-title" className="mb-4 text-xl font-semibold tracking-tight text-[var(--color-text)]">3. 신체 사이즈와 옷의 기장을 나누어 확인하세요</h2>
          <p>
            허리·엉덩이·가슴둘레를 기준으로 한 신체 사이즈표는 어떤 사이즈를 선택할지 돕는 표입니다.
            옷을 펼쳐 잰 허리 단면이나 총기장과는 다릅니다.
            원피스는 가슴둘레도 함께 대조하고, 평소 입는 사이즈의 이름만으로 고르지 마세요.{" "}
            <a href="https://www.lacoste.com/kr/sizeguide" className={sourceLinkClass}>라코스테 공식 신체 사이즈표</a>
          </p>
          <p className="mt-3">
            원하는 길이는 선택할 사이즈의 제품 실측에서 확인하세요. 앞·뒤 기장인지, 허리밴드를 포함했는지처럼 측정 기준도 함께 보세요.
            가지고 있는 옷과 비교할 때도 같은 방식으로 재야 합니다. 모델의 키와 착용 사진만으로 내게 맞는 길이를 확정하기는 어렵습니다.
          </p>
          <p className="mt-3">
            실측이 없다면 판매자에게 사이즈별 총기장과 측정 기준을 요청하세요. 다른 상품의 기장이나 일반 사이즈표의 수치를 대신 쓰지 마세요.
          </p>
        </section>

        <section aria-labelledby="before-buying-title">
          <h2 id="before-buying-title" className="mb-4 text-xl font-semibold tracking-tight text-[var(--color-text)]">4. 결제 전에는 선택한 옵션과 판매 조건을 확인하세요</h2>
          <ol className="list-decimal space-y-3 pl-5 marker:font-semibold marker:text-[var(--color-text)]">
            <li>상품 번호와 원하는 색상을 확인한 뒤 사이즈를 선택하세요. 사이즈 이름이 보이는 것과 그 옵션을 주문할 수 있는 것은 다릅니다.</li>
            <li>선택한 옵션의 구매 가능 여부를 공식몰에서 확인하세요. 검색 결과나 이전에 본 화면의 재고를 현재 상태로 보지 마세요.</li>
            <li>배송 국가·주소에 맞는 배송 가능 지역, 배송비와 예상 일정을 확인하세요. 국내 배송 여부가 불분명하면 주문 전에 판매자에게 문의하세요.</li>
            <li>반품 신청 기한, 상품 상태와 택·구성품 조건, 반품 비용과 접수 경로를 읽어보세요. 사이즈 교환이 가능한지도 따로 확인하세요.</li>
          </ol>
          <p className="mt-4">
            구매와 배송·반품은 이동한 판매처에서 진행합니다. 조건은 판매처마다 다르므로 해당 공식몰의 배송·반품 안내를 확인하세요.
          </p>
        </section>
      </div>

      <aside className="mt-10 border-t border-[var(--color-border)] pt-5 text-xs leading-6 text-[var(--color-text-secondary)]">
        <p>공식 설명 확인일: 2026년 9월 13일. 출처는 구조와 확인 방법을 설명하기 위한 참고 자료입니다. 특정 상품 추천이나 브랜드와의 제휴를 의미하지 않습니다.</p>
      </aside>

      <section aria-labelledby="browse-title" className="mt-10 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-subtle)] p-6">
        <h2 id="browse-title" className="text-lg font-semibold tracking-tight text-[var(--color-text)]">확인할 기준을 정했다면, 컬렉션을 둘러보세요</h2>
        <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">스커트·원피스를 포함한 브랜드 공식몰 컬렉션을 모았습니다. 각 상품의 구성과 사이즈는 공식몰에서 확인하세요.</p>
        <Link href="/gear?subcategory=skirts_dresses" className="mt-5 inline-flex min-h-11 items-center gap-4 rounded-lg bg-[var(--color-text)] px-5 py-3 text-sm font-semibold text-[var(--color-bg)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-text)]">
          스커트·원피스 컬렉션 보기 <span aria-hidden="true">→</span>
        </Link>
      </section>
    </article>
  );
}
