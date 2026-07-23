import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SettlementCalculator } from "@/components/SettlementCalculator";
import { cityGuides, getCitiesForState, getCityGuide } from "@/lib/cities";
import { siteUrl } from "@/lib/site-url";

type CityPageProps = { params: Promise<{ slug: string; city: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return cityGuides.map((city) => ({ slug: city.stateSlug, city: city.slug }));
}

export async function generateMetadata({ params }: CityPageProps): Promise<Metadata> {
  const { slug, city: citySlug } = await params;
  const city = getCityGuide(slug, citySlug);
  if (!city) return {};

  const title = `${city.name}, ${city.stateName} Personal Injury Settlement Calculator`;
  const description = `Organize a personal injury settlement estimate for ${city.name}, ${city.stateName}, with documented losses, injury impact, possible fault, and state-law research checks.`;
  const url = `${siteUrl}/states/${city.stateSlug}/${city.slug}/`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { title, description, url, type: "article" },
  };
}

export default async function CityGuide({ params }: CityPageProps) {
  const { slug, city: citySlug } = await params;
  const city = getCityGuide(slug, citySlug);
  if (!city) notFound();

  const siblingCities = getCitiesForState(city.stateCode).filter((item) => item.slug !== city.slug);

  return (
    <main className="state-page city-page">
      <header className="site-header state-site-header">
        <Link className="brand" href="/" aria-label="Settlement Calculator Guide home">
          <span className="brand-mark">SC</span>
          <span>Settlement Calculator<span className="brand-domain">.guide</span></span>
        </Link>
        <nav aria-label="City guide navigation">
          <Link href={`/states/${city.stateSlug}`}>{city.stateName}</Link>
          <Link href="/#states">All states</Link>
          <Link href="/#faq">FAQ</Link>
        </nav>
        <a className="header-action" href="#calculator">Open calculator</a>
      </header>

      <nav className="state-breadcrumb" aria-label="Breadcrumb">
        <Link href="/">Home</Link><span>/</span>
        <Link href={`/states/${city.stateSlug}`}>{city.stateName}</Link><span>/</span>
        <strong>{city.name}</strong>
      </nav>

      <section className="state-tool-hero city-tool-hero" aria-labelledby="city-title">
        <div className="state-tool-context">
          <p className="eyebrow"><span>City guide</span> · {city.name} / {city.stateCode}</p>
          <h1 id="city-title">{city.name}, {city.stateName} Personal Injury Settlement Calculator</h1>
          <p>Organize the claim inputs connected with a {city.name} incident, then review the controlling {city.stateName} law and the local venue, records, and court context.</p>
          <aside className="state-status" aria-labelledby="city-status-heading">
            <p>LOCAL ANNOTATION</p>
            <h2 id="city-status-heading">{city.name} context, {city.stateName} law</h2>
            <p>The calculator applies a general planning formula. It does not apply local procedure, venue choices, court practices, or current {city.stateName} legal rules.</p>
          </aside>
        </div>
        <SettlementCalculator initialState={city.stateName} stateCode={city.stateCode} />
      </section>

      <section className="city-context" aria-labelledby="city-context-heading">
        <div className="city-context-heading">
          <p className="eyebrow">Local claim context</p>
          <h2 id="city-context-heading">What to organize for a claim connected with {city.name}</h2>
          <p>Location can affect where records are found and where a case may proceed, but the settlement value still depends on evidence, coverage, damages, and controlling law.</p>
        </div>
        <div className="city-context-grid">
          <article><span>Records</span><h3>Preserve local evidence</h3><p>Identify incident reports, medical records, photographs, witnesses, property records, and other materials connected with {city.name}.</p></article>
          <article><span>Forum</span><h3>Confirm venue and procedure</h3><p>Check the proper court, filing procedure, pre-suit requirements, and whether a government or institutional defendant changes the process.</p></article>
          <article><span>Law</span><h3>Verify {city.stateName} rules</h3><p>Use current primary legal sources for deadlines, negligence, damages, insurance, and any claim-specific limitations.</p></article>
        </div>
      </section>

      <section className="city-siblings" aria-labelledby="nearby-cities-heading">
        <div>
          <p className="eyebrow">Within {city.stateName}</p>
          <h2 id="nearby-cities-heading">More city settlement guides</h2>
        </div>
        <div className="city-sibling-links">
          {siblingCities.map((item) => <Link href={`/states/${item.stateSlug}/${item.slug}`} key={item.slug}>{item.name}<span>{item.stateCode} ↗</span></Link>)}
          <Link className="state-return-link" href={`/states/${city.stateSlug}`}>All {city.stateName} guidance<span>State guide →</span></Link>
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
