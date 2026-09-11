import type { Metadata } from "next";
import Link from "next/link";
import { PartnerInquiryForm } from "@/components/partner-inquiry-form";

export const metadata: Metadata = {
  title: "브랜드 제휴·광고 안내",
  description:
    "racket lab 의 브랜드 제휴·광고 지면과 원칙. 점수와 추천 순위는 판매하지 않고, 모든 유료 노출은 '광고'로 표기합니다.",
  openGraph: {
    title: "브랜드 제휴·광고 안내 | racket lab",
    description:
      "히어로 포스터 슬롯, 신제품 런칭 페이지, 진단 결과 슬롯, 스트링 가이드 스폰서. 점수·순위는 비매품입니다.",
  },
};

/**
 * 브랜드·유통사용 미디어 키트.
 *
 * 숫자를 적지 않는다. 방문·이용 수치는 시점마다 달라지고, 여기 적어 두면
 * 갱신되지 않은 채 남아 실제보다 커 보인다. 데이터는 문의 시 최신 값으로 준다.
 */

const PRINCIPLES = [
  {
    title: "점수와 순위는 팔지 않습니다",
    body: "5축 점수, 총점, 추천 순위는 스펙과 근거 데이터로만 정해집니다. 광고·제휴 여부는 계산에 들어가지 않습니다.",
  },
  {
    title: "모든 유료 노출에는 '광고'를 붙입니다",
    body: "유료 슬롯에는 광고 배지와 광고주 표기를 함께 그립니다. 사용자가 자연 노출과 구분하지 못하는 지면은 팔지 않습니다.",
  },
  {
    title: "스펙 출처를 공개합니다",
    body: "라켓마다 스펙 확인 링크와 확인일을 답니다. 브랜드가 공식 자료를 주면 그 출처를 그대로 표기합니다.",
  },
];

const PLACEMENTS = [
  {
    name: "홈 히어로 포스터 슬롯",
    where: "홈 첫 화면, 6초 로테이션 3자리 중 1자리",
    fit: "신제품 런칭. 촬영 이미지가 포스터처럼 배경에 깔립니다.",
    marking: "라켓명 옆 '광고' 배지 + 광고주 표기",
  },
  {
    name: "신제품 런칭 페이지",
    where: "브랜드 전용 페이지 + 코트 업데이트 뉴스 1건",
    fit: "출시일에 맞춰 상세 데이터·5축 점수·커스터마이저를 함께 공개합니다.",
    marking: "페이지 상단 '광고' 표기, 점수는 동일 기준",
  },
  {
    name: "진단 결과 '함께 보면 좋은 라켓' 슬롯",
    where: "3분 진단 결과 하단, 추천 목록과 분리된 영역",
    fit: "추천 순위 밖에서 한 모델을 더 보여줍니다. 순위 안에는 넣지 않습니다.",
    marking: "슬롯 전체 '광고' 표기",
  },
  {
    name: "스트링 가이드 스폰서",
    where: "스트링 가이드·스트링 상세 상단",
    fit: "스트링·장력 콘텐츠와 같이 가는 브랜드에 맞습니다.",
    marking: "'광고' 배지 + 스폰서 표기",
  },
];

const DATA_PARTNERSHIP = [
  "공식 스펙 검증 — 브랜드가 확인한 스펙을 출처와 함께 반영합니다.",
  "이미지 제공 — 공식 촬영 이미지를 받으면 출처 표기와 함께 씁니다.",
  "시타 라켓 대여 — 커스터마이저 실사진과 근거 데이터 보강에 씁니다.",
];

export default function AdvertisePage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-12 md:py-16">
      <header className="mb-12">
        <p className="text-sm font-medium text-[var(--color-text-muted)]">
          racketlab
        </p>
        <h1 className="mt-2 text-3xl font-bold text-[var(--color-text)]">
          브랜드 제휴·광고 안내
        </h1>
        <p className="mt-4 text-[var(--color-text-secondary)] leading-relaxed">
          racket lab 은 한국에서 실제 판매 중인 테니스 라켓을 5축 점수로 읽고
          비교하는 곳입니다. 브랜드·유통사와는 두 가지로 만납니다 — 유료 광고
          지면, 그리고 무상 데이터 파트너십.
        </p>
        <p className="mt-2 text-sm text-[var(--color-text-muted)]">
          월간 이용 데이터는 문의 시 최신 수치로 공유합니다.
        </p>
      </header>

      <section className="mb-12">
        <h2 className="text-lg font-semibold text-[var(--color-text)] mb-4">
          지키는 원칙
        </h2>
        <ol className="space-y-4">
          {PRINCIPLES.map((principle, i) => (
            <li
              key={principle.title}
              className="rounded-2xl border border-[var(--color-border)] p-5"
            >
              <h3 className="font-semibold text-[var(--color-text)]">
                <span className="mr-2 text-[var(--color-text-muted)]">{i + 1}</span>
                {principle.title}
              </h3>
              <p className="mt-2 text-sm text-[var(--color-text-secondary)] leading-relaxed">
                {principle.body}
              </p>
            </li>
          ))}
        </ol>
      </section>

      <section className="mb-12">
        <h2 className="text-lg font-semibold text-[var(--color-text)] mb-4">
          광고 지면
        </h2>
        <div className="overflow-x-auto rounded-2xl border border-[var(--color-border)]">
          <table className="w-full min-w-[640px] text-sm">
            <thead className="bg-[var(--color-bg-subtle)] text-left text-xs text-[var(--color-text-secondary)]">
              <tr>
                <th className="px-4 py-3 font-medium">지면</th>
                <th className="px-4 py-3 font-medium">위치</th>
                <th className="px-4 py-3 font-medium">맞는 용도</th>
                <th className="px-4 py-3 font-medium">표기</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)]">
              {PLACEMENTS.map((placement) => (
                <tr key={placement.name} className="align-top">
                  <th scope="row" className="px-4 py-3 font-semibold text-[var(--color-text)]">
                    {placement.name}
                  </th>
                  <td className="px-4 py-3 text-[var(--color-text-secondary)]">{placement.where}</td>
                  <td className="px-4 py-3 text-[var(--color-text-secondary)]">{placement.fit}</td>
                  <td className="px-4 py-3 text-[var(--color-text-secondary)]">{placement.marking}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs text-[var(--color-text-muted)]">
          단가와 기간은 문의 시 안내합니다. 어떤 지면도 점수·순위를 바꾸지 않습니다.
        </p>
      </section>

      <section className="mb-12">
        <h2 className="text-lg font-semibold text-[var(--color-text)] mb-3">
          데이터 파트너십 (무상)
        </h2>
        <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
          광고와 별개로, 데이터가 정확해지는 일은 무상으로 합니다. 브랜드가
          아래를 주면 우리는 신제품 상세를 출시일에 맞춰 공개합니다.
        </p>
        <ul className="mt-4 space-y-2">
          {DATA_PARTNERSHIP.map((item) => (
            <li
              key={item}
              className="rounded-xl border border-[var(--color-border)] px-4 py-3 text-sm text-[var(--color-text-secondary)]"
            >
              {item}
            </li>
          ))}
        </ul>
      </section>

      <section className="mb-12 rounded-2xl bg-[var(--color-bg-subtle)] p-5">
        <h2 className="text-base font-semibold text-[var(--color-text)]">
          테니스샵·코치라면
        </h2>
        <p className="mt-2 text-sm text-[var(--color-text-secondary)] leading-relaxed">
          매장 소개는 무료입니다. 확인된 매장만 등록하고, 등록 여부는 점수와
          순위에 반영하지 않습니다.
        </p>
        <Link
          href="/partners"
          className="mt-3 inline-flex min-h-11 items-center text-sm font-semibold text-[var(--color-text)] underline underline-offset-4"
        >
          매장 입점 문의로 가기 →
        </Link>
      </section>

      <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-white)] p-6">
        <h2 className="text-lg font-bold text-[var(--color-text)]">브랜드 제휴 문의</h2>
        <p className="mt-2 mb-5 text-sm leading-relaxed text-[var(--color-text-secondary)]">
          원하는 지면이나 데이터 파트너십 내용을 적어 주세요. 확인 후 입력하신
          연락처로 회신드립니다.
        </p>
        <PartnerInquiryForm defaultType="brand" source="advertise_page" />
      </section>
    </div>
  );
}
