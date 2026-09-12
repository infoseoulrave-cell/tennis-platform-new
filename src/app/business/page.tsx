import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Digital partnerships for racket brands",
  description: "A proposed Korean-market pilot connecting racket selection to dealer conversations, with a path to a dedicated brand tool.",
  openGraph: {
    title: "Racketlab for brands and distributors",
    description: "Evaluate a paid Korean-market pilot, then scope a dedicated racket selection tool.",
    locale: "en_US",
  },
};

const pilotScope = [
  ["One market, one campaign", "A Korean-language campaign page featuring up to five agreed models from the current catalogue."],
  ["Selection to dealer conversation", "Links into existing recommendation and comparison flows, then to your approved product, dealer or enquiry destination."],
  ["A defined evaluation", "Campaign links and QR codes, four weekly summaries and one final report. Agree the measures before launch."],
];

export default function BusinessPage() {
  return (
    <div lang="en" className="mx-auto max-w-5xl px-6 py-12 md:py-20">
      <header className="max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-text-muted)]">Racketlab · Business partnerships</p>
        <h1 className="mt-5 text-4xl font-extrabold leading-tight tracking-tight md:text-6xl">From racket choice<br />to a dealer conversation.</h1>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-[var(--color-text-secondary)]">Work with us to test a Korean-market customer journey for your brand. Help players understand their shortlist and reach the right product or dealer.</p>
        <a href="#contact" className="mt-7 inline-flex min-h-12 items-center rounded-full bg-[var(--color-accent)] px-6 font-semibold text-[var(--color-text)]">Discuss a B2B pilot →</a>
      </header>

      <section className="mt-14 grid gap-6 border-y border-[var(--color-border)] py-8 md:grid-cols-3" aria-label="Current service">
        <div><p className="text-3xl font-bold">70 models</p><p className="mt-2 text-sm text-[var(--color-text-secondary)]">Published catalogue across seven brands. Catalogue snapshot: 13 September 2026.</p></div>
        <div><p className="text-3xl font-bold">Explainable choices</p><p className="mt-2 text-sm text-[var(--color-text-secondary)]">Specification-based guidance and side-by-side comparison.</p></div>
        <div><p className="text-3xl font-bold">Korea first</p><p className="mt-2 text-sm text-[var(--color-text-secondary)]">The current consumer service is in Korean. This page introduces the business proposal in English.</p></div>
      </section>

      <section className="mt-14">
        <p className="text-sm font-semibold text-[var(--color-text-muted)]">Proposed first engagement</p>
        <h2 className="mt-2 text-3xl font-bold tracking-tight">A four-week paid pilot.</h2>
        <p className="mt-4 max-w-3xl leading-relaxed text-[var(--color-text-secondary)]">Use your existing customer channels to evaluate a local selection and dealer hand-off journey. We can complement a brand’s existing product finder with agreed Korean-market content and an evaluation of the next customer step.</p>
        <div className="mt-7 grid gap-4 md:grid-cols-3">
          {pilotScope.map(([title, body], index) => (
            <article key={title} className="rounded-2xl border border-[var(--color-border)] p-6">
              <span className="text-sm text-[var(--color-text-muted)]">0{index + 1}</span>
              <h3 className="mt-4 text-lg font-semibold">{title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-[var(--color-text-secondary)]">{body}</p>
            </article>
          ))}
        </div>
        <div className="mt-5 rounded-2xl bg-[var(--color-bg-subtle)] p-6">
          <p className="text-xl font-bold">Indicative fee: KRW 2,500,000</p>
          <p className="mt-2 text-sm leading-relaxed text-[var(--color-text-secondary)]">Applicable tax, final scope, preparation period and start date are confirmed in a written proposal. Your team provides approved product assets, customer distribution and dealer operations. Paid media, equipment, events and travel are outside this scope.</p>
        </div>
      </section>

      <section className="mt-14 grid gap-8 md:grid-cols-2">
        <div>
          <h2 className="text-2xl font-bold">Measure a useful next step.</h2>
          <p className="mt-4 leading-relaxed text-[var(--color-text-secondary)]">Review recorded visits, selection activity, outgoing clicks and received enquiries. Report demo attendance or purchases only when confirmed by the partner. Internal testing is excluded from campaign reporting.</p>
          <p className="mt-3 text-sm leading-relaxed text-[var(--color-text-secondary)]">Racketlab is at the early partnership stage. We do not promise an existing audience, a sales uplift or a minimum number of leads. Recommendation scores remain independent of paid placement.</p>
        </div>
        <div>
          <h2 className="text-2xl font-bold">Build toward repeat use.</h2>
          <p className="mt-4 leading-relaxed text-[var(--color-text-secondary)]">If the pilot supports a continuing need, scope a dedicated brand selection tool and a non-exclusive software license. Additional languages, markets, integrations and ongoing support are separately agreed.</p>
          <p className="mt-3 text-sm leading-relaxed text-[var(--color-text-secondary)]">The current service does not include a ready-made white-label API, stock synchronization, checkout or automated demo booking. A dedicated deployment requires a technical and rights review.</p>
        </div>
      </section>

      <section id="contact" className="mt-14 rounded-3xl bg-[var(--color-bg-footer)] p-7 text-[#F3F0EA] md:p-10">
        <p className="text-sm text-[#BDB8AD]">For digital commerce, business development and distributor teams</p>
        <h2 className="mt-3 text-3xl font-bold">Choose one market.<br />Define one useful outcome.</h2>
        <p className="mt-4 max-w-2xl leading-relaxed text-[#D3CEC4]">Tell us your target market, product line, existing customer journey and the outcome that would justify a pilot. We will prepare a scoped proposal for review.</p>
        <a href="mailto:info.seoulrave@gmail.com?subject=Racketlab%20B2B%20partnership" className="mt-6 inline-flex min-h-12 items-center rounded-full bg-[var(--color-accent)] px-5 font-semibold text-[#171914]">Email the Racketlab team →</a>
        <p className="mt-4 text-sm text-[#D3CEC4]">Racketlab / Seoul Rave · info.seoulrave@gmail.com</p>
      </section>

      <nav aria-label="Explore the current Korean service" className="mt-8 flex flex-wrap gap-6 text-sm underline underline-offset-4">
        <Link className="inline-flex min-h-11 items-center" href="/start">Try the current Korean selection flow →</Link>
        <Link className="inline-flex min-h-11 items-center" href="/rackets">Browse the catalogue →</Link>
        <Link className="inline-flex min-h-11 items-center" href="/advertise">Korean partnership information →</Link>
      </nav>
    </div>
  );
}
