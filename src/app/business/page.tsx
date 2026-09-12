import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Tennis retail and brand partnerships",
  description: "Work with Racketlab on tennis apparel, balls, accessories and racket discovery for the Korean market.",
  openGraph: { title: "Racketlab for tennis brands", description: "Product information, retail referrals and measurable brand collaborations.", locale: "en_US" },
};

const formats = [
  ["Start with verified supply", "Choose a small range. Agree product information and image permissions, Korean availability, size and stock updates, delivery and returns, and an approved retail destination."],
  ["Agree referral economics", "Where tracking is available, define attributable orders, cancellations, returns, commission and settlement before a paid referral arrangement. Ordinary store links do not earn commission."],
  ["Develop a focused collaboration", "Use observed shopper interest to scope a collection feature, seasonal guide or product trial. Paid sponsorship requires an agreed audience basis, deliverables, placement, period and measurement."],
];

export default function BusinessPage() {
  return (
    <div lang="en" className="mx-auto max-w-5xl px-6 py-12 md:py-20">
      <header className="max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-text-muted)]">Racketlab · Tennis partnerships</p>
        <h1 className="mt-5 text-4xl font-extrabold leading-tight tracking-tight md:text-6xl">From racket choice<br />to everything on court.</h1>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-[var(--color-text-secondary)]">We are expanding Korean-language racket comparison into multi-brand discovery of tennis apparel, balls, bags and accessories. Help players find relevant collections and reach a verified place to buy.</p>
        <a href="#contact" className="mt-7 inline-flex min-h-12 items-center rounded-full bg-[var(--color-accent)] px-6 font-semibold">Discuss a supply or brand partnership →</a>
      </header>
      <section className="mt-12 grid gap-6 border-y border-[var(--color-border)] py-8 md:grid-cols-3" aria-label="Current scope">
        <div><h2 className="text-xl font-bold">Rackets</h2><p className="mt-3 text-sm leading-relaxed text-[var(--color-text-secondary)]">Existing specification-based recommendations and side-by-side comparisons.</p></div>
        <div><h2 className="text-xl font-bold">Apparel & equipment</h2><p className="mt-3 text-sm leading-relaxed text-[var(--color-text-secondary)]">Category and brand discovery linking to official Korean storefront collections.</p></div>
        <div><h2 className="text-xl font-bold">Early partnership stage</h2><p className="mt-3 text-sm leading-relaxed text-[var(--color-text-secondary)]">We are validating shopper needs and supply. Listed store links do not imply a commercial partnership.</p></div>
      </section>
      <section className="mt-12">
        <h2 className="text-3xl font-bold">One useful range. One measurable next step.</h2>
        <p className="mt-4 max-w-3xl leading-relaxed text-[var(--color-text-secondary)]">Our goal is to originate useful demand through cross-brand discovery. We do not require you to redirect your existing customers to us, and we have not yet established an audience or sales uplift to promise.</p>
        <div className="mt-7 grid gap-4 md:grid-cols-3">
          {formats.map(([title, body], i) => (
            <article key={title} className="rounded-2xl border border-[var(--color-border)] p-6">
              <p className="text-sm text-[var(--color-text-muted)]">0{i + 1}</p>
              <h3 className="mt-4 text-xl font-bold">{title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-[var(--color-text-secondary)]">{body}</p>
            </article>
          ))}
        </div>
      </section>
      <section className="mt-12 grid gap-8 md:grid-cols-2">
        <div><h2 className="text-2xl font-bold">For headquarters and local teams</h2><p className="mt-4 leading-relaxed text-[var(--color-text-secondary)]">We welcome product-content and digital-commerce teams at headquarters, together with the authorized seller responsible for Korean inventory and fulfillment. Apparel and accessories are areas for demand testing, not categories we assume are underperforming.</p></div>
        <div><h2 className="text-2xl font-bold">Evidence before expansion</h2><p className="mt-4 leading-relaxed text-[var(--color-text-secondary)]">Category interest and store clicks are distinct from orders. Purchases need seller confirmation, and internal tests are excluded. Rates and fees depend on agreed scope and evidence; recommendation rankings are independent of payment.</p></div>
      </section>
      <p className="mt-8 rounded-2xl bg-[var(--color-bg-subtle)] p-5 text-sm leading-relaxed text-[var(--color-text-secondary)]">The current consumer service is Korean. Collection discovery does not provide live item-level inventory, checkout or returns handling. A dedicated software integration or license can be evaluated separately if there is a verified need; it is not a ready-made product included in this offer.</p>
      <section id="contact" className="mt-12 rounded-3xl bg-[var(--color-bg-footer)] p-7 text-[#F3F0EA] md:p-10">
        <h2 className="text-3xl font-bold">Bring one category.<br />Define the opportunity together.</h2>
        <p className="mt-4 max-w-2xl leading-relaxed text-[#D3CEC4]">Tell us your product range, Korean retail availability, catalogue-sharing options and partnership objective. We will review a small starting scope and the information needed to evaluate it.</p>
        <a href="mailto:info.seoulrave@gmail.com?subject=Racketlab%20tennis%20retail%20partnership" className="mt-6 inline-flex min-h-12 items-center rounded-full bg-[var(--color-accent)] px-5 font-semibold text-[#171914]">Email the Racketlab team →</a>
        <p className="mt-4 text-sm text-[#D3CEC4]">Racketlab / Seoul Rave · info.seoulrave@gmail.com</p>
      </section>
      <nav aria-label="Explore the current Korean service" className="mt-8 flex flex-wrap gap-6 text-sm underline underline-offset-4">
        <Link className="inline-flex min-h-11 items-center" href="/gear">Explore apparel and equipment →</Link>
        <Link className="inline-flex min-h-11 items-center" href="/rackets">Compare rackets →</Link>
        <Link className="inline-flex min-h-11 items-center" href="/partners">Korean partner intake →</Link>
      </nav>
    </div>
  );
}
