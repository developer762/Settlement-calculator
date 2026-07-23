import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getState, states } from "@/lib/states";
import { getCitiesForState } from "@/lib/cities";
import { siteUrl } from "@/lib/site-url";
import { SettlementCalculator } from "@/components/SettlementCalculator";

type StatePageProps = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return states.map((state) => ({ slug: state.slug }));
}

export async function generateMetadata({ params }: StatePageProps): Promise<Metadata> {
  const state = getState((await params).slug);
  if (!state) return {};

  const title = `${state.name} Personal Injury Settlement Calculator Guide`;
  const description = `Understand the inputs behind a personal injury settlement estimate in ${state.name}, including documented losses, injury impact, fault, evidence, and state-law review.`;

  return {
    title,
    description,
    alternates: { canonical: `${siteUrl}/states/${state.slug}/` },
    openGraph: { title, description, url: `${siteUrl}/states/${state.slug}/`, type: "article" },
  };
}

export default async function StateGuide({ params }: StatePageProps) {
  const state = getState((await params).slug);
  if (!state) notFound();

  const relatedStates = states.filter((item) => item.code !== state.code).slice(0, 8);
  const stateCities = getCitiesForState(state.code);

  return (
    <main className="state-page">
      <header className="site-header state-site-header">
        <Link className="brand" href="/" aria-label="Settlement Calculator Guide home">
          <span className="brand-mark">SC</span>
          <span>Settlement Calculator<span className="brand-domain">.guide</span></span>
        </Link>
        <nav aria-label="State guide navigation">
          <Link href="/#method">Method</Link>
          <Link href="/#states">All states</Link>
          <Link href="/#faq">FAQ</Link>
        </nav>
        <a className="header-action" href="#calculator">Open calculator</a>
      </header>

      <nav className="state-breadcrumb" aria-label="Breadcrumb">
        <Link href="/">Home</Link><span>/</span><strong>{state.name}</strong>
      </nav>

      <section className="state-tool-hero" aria-labelledby="state-title">
        <div className="state-tool-context">
          <p className="eyebrow"><span>State guide</span> · {state.code}</p>
          <h1 id="state-title">{state.name} Personal Injury Settlement Calculator</h1>
          <p>Use a transparent planning model to organize documented losses, injury impact, and possible fault before reviewing the {state.name}-specific rules that may change a claim.</p>
          <aside className="state-status" aria-labelledby="review-status-heading">
            <p>MODEL ANNOTATION</p>
            <h2 id="review-status-heading">{state.name} context, general formula</h2>
            <p>The state is preselected, but its statutes, deadlines, damage caps, and negligence rules are not yet applied.</p>
          </aside>
        </div>
        <SettlementCalculator initialState={state.name} stateCode={state.code} />
      </section>

      <section className="state-guide-content" aria-labelledby="value-heading">
        <div className="state-guide-main">
          <p className="eyebrow">Calculation inputs</p>
          <h2 id="value-heading">What can affect a personal injury settlement in {state.name}?</h2>
          <p>Claim value is case-specific. A useful starting model separates the losses you can document from assumptions about human impact, responsibility, coverage, and applicable law.</p>
          <div className="state-factor-list">
            <article><span>01</span><h3>Economic damages</h3><p>Medical expenses, expected care, lost income, damaged property, and other supported costs form the documented base.</p></article>
            <article><span>02</span><h3>Injury impact</h3><p>Recovery duration, treatment intensity, permanent limitations, and daily-life disruption can influence non-economic damages.</p></article>
            <article><span>03</span><h3>Liability and evidence</h3><p>Reports, photographs, witnesses, records, and competing explanations can affect how responsibility and causation are evaluated.</p></article>
            <article><span>04</span><h3>{state.name} law and coverage</h3><p>Local fault rules, filing deadlines, recoverable damages, insurance limits, and case law require authoritative, current legal sources.</p></article>
          </div>
        </div>

        <aside className="state-checklist" aria-labelledby="checklist-heading">
          <p className="eyebrow">Before relying on a number</p>
          <h2 id="checklist-heading">{state.name} review checklist</h2>
          <ul>
            <li>Confirm the applicable filing deadline.</li>
            <li>Review the state&apos;s negligence framework.</li>
            <li>Check whether damage caps may apply.</li>
            <li>Identify all available insurance coverage.</li>
            <li>Verify every claimed loss with records.</li>
          </ul>
          <p>This checklist identifies research questions; it does not answer them or replace advice from a qualified {state.name} lawyer.</p>
        </aside>
      </section>

      <section className="related-cities" aria-labelledby="cities-heading">
        <div className="city-section-heading">
          <p className="eyebrow"><span>Local guides</span> · {state.code}</p>
          <h2 id="cities-heading">Cities in {state.name}</h2>
          <p>Open a city page while keeping the calculator and legal research context tied to {state.name}.</p>
        </div>
        <div className="city-guide-links">
          {stateCities.map((city, index) => (
            <Link href={`/states/${state.slug}/${city.slug}`} key={city.slug}>
              <span>0{index + 1}</span>
              <strong>{city.name}</strong>
              <small>{state.code} city guide ↗</small>
            </Link>
          ))}
        </div>
      </section>

      <section className="related-states" aria-labelledby="related-heading">
        <div><p className="eyebrow">Continue exploring</p><h2 id="related-heading">Other state settlement guides</h2></div>
        <div className="related-state-links">
          {relatedStates.map((item) => <Link href={`/states/${item.slug}`} key={item.code}>{item.name}<span>{item.code} ↗</span></Link>)}
          <Link className="all-states-link" href="/#states">View all 50 states<span>Directory →</span></Link>
        </div>
      </section>

      <footer>
        <Link className="brand footer-brand" href="/"><span className="brand-mark">SC</span><span>Settlement Calculator<span className="brand-domain">.guide</span></span></Link>
        <p>Independent educational tools for understanding personal injury claim variables.</p>
        <div><Link href="/#method">Methodology</Link><Link href="/#states">State guides</Link><span>© 2026</span></div>
      </footer>
    </main>
  );
}
