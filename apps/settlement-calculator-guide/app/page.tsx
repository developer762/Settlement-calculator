"use client";

import { useState } from "react";
import Link from "next/link";
import { states, type USState } from "@/lib/states";
import { SettlementCalculator } from "@/components/SettlementCalculator";

const stateGroups = [
  { label: "A–G", states: states.filter((item) => item.name[0] <= "G") },
  { label: "H–M", states: states.filter((item) => item.name[0] >= "H" && item.name[0] <= "M") },
  { label: "N–R", states: states.filter((item) => item.name[0] >= "N" && item.name[0] <= "R") },
  { label: "S–Z", states: states.filter((item) => item.name[0] >= "S") },
];

function scrollToCalculator() {
  document.getElementById("calculator")?.scrollIntoView({ behavior: "smooth" });
}

const fmt = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export default function Home() {
  // Tabs State
  const [activeFactorTab, setActiveFactorTab] = useState("01");
  const [activeStateGroupTab, setActiveStateGroupTab] = useState("A–G");
  const [selectedState, setSelectedState] = useState<USState | null>(states[0] || null);
  const [activeFaqTab, setActiveFaqTab] = useState(0);

  // Medical Evidence Calc State
  const [medER, setMedER] = useState(5000);
  const [medPT, setMedPT] = useState(3000);
  const [medDiag, setMedDiag] = useState(1500);
  const [medMultiplier, setMedMultiplier] = useState(2.0);

  // Income Proof Calc State
  const [hourlyWage, setHourlyWage] = useState(35);
  const [hoursMissed, setHoursMissed] = useState(80);
  const [capacityLoss, setCapacityLoss] = useState(15);
  const [capacityYears, setCapacityYears] = useState(5);

  // Liability Evidence Calc State
  const [libPolice, setLibPolice] = useState(true);
  const [libPhotos, setLibPhotos] = useState(true);
  const [libWitness, setLibWitness] = useState(false);
  const [libAdmission, setLibAdmission] = useState(false);

  // Recovery Duration Calc State
  const [recoveryDays, setRecoveryDays] = useState(90);
  const [permanentImpairment, setPermanentImpairment] = useState(false);

  // Insurance Limits Calc State
  const [estLosses, setEstLosses] = useState(45000);
  const [defLimit, setDefLimit] = useState(25000);
  const [uimLimit, setUimLimit] = useState(50000);

  // State Law Negligence Calc State
  const [stateFaultRule, setStateFaultRule] = useState("modified-51");
  const [stateFaultPct, setStateFaultPct] = useState(20);
  const [stateBaseClaim, setStateBaseClaim] = useState(50000);

  return (
    <main>
      <header className="site-header">
        <a className="brand" href="#top" aria-label="Settlement Calculator Guide home">
          <span className="brand-mark">SC</span>
          <span>Settlement Calculator<span className="brand-domain">.guide</span></span>
        </a>
        <nav aria-label="Primary navigation">
          <a href="#method">Method</a>
          <a href="#factors">Claim factors</a>
          <a href="#states">State guides</a>
          <a href="#faq">FAQ</a>
        </nav>
        <button className="header-action" onClick={scrollToCalculator}>Estimate a claim</button>
      </header>

      <section className="hero" id="top" aria-labelledby="page-title">
        <div className="hero-copy">
          <p className="eyebrow"><span>Independent methodology</span> · Updated July 2026</p>
          <h1 id="page-title">Personal Injury Settlement Calculator</h1>
          <p className="hero-lede">
            Build a documented settlement range from the costs you know, the impact of the injury,
            and your share of fault. See the reasoning—not a mystery number.
          </p>
          <div className="hero-proof">
            <div><strong>5</strong><span>damage inputs</span></div>
            <div><strong>2</strong><span>range scenarios</span></div>
            <div><strong>0</strong><span>contact details required</span></div>
          </div>
          <p className="byline">Concept and information architecture by <strong>Koray Tuğberk Gübür</strong></p>
        </div>

        <SettlementCalculator />
      </section>

      <section className="method-strip" aria-label="Methodology summary">
        <p>THE RANGE, EXPOSED</p>
        <div><span>Known losses</span><b>+</b><span>Human impact</span><b>−</b><span>Responsibility</span><b>=</b><strong>Planning range</strong></div>
      </section>

      <section className="section method" id="method" aria-labelledby="method-heading">
        <div className="section-heading">
          <p className="eyebrow">Method before marketing</p>
          <h2 id="method-heading">How a personal injury settlement estimate is calculated</h2>
          <p>Most claim values cannot be reduced to one precise number. We publish the assumptions so you can challenge them, replace them, or take them to a qualified lawyer.</p>
        </div>
        <div className="method-cards">
          <article><span>Input</span><h3>Add documented economic damages</h3><p>Medical bills, future care, missed earnings, damaged property, and other receipts create the economic base.</p></article>
          <article><span>Range</span><h3>Estimate pain and suffering impact</h3><p>An impact band creates low and high scenarios. It is intentionally broad because injuries and evidence differ.</p></article>
          <article><span>Adjustment</span><h3>Apply a comparative fault adjustment</h3><p>A possible fault share reduces the range. Your jurisdiction may cap damages or apply different negligence rules.</p></article>
        </div>
        <div className="editorial-note">
          <div className="note-index">K / 01</div>
          <blockquote>“The useful answer is not the biggest number. It is the clearest model of what could change the number.”</blockquote>
          <p>— Editorial principle, SettlementCalculator.guide</p>
        </div>
      </section>

      <section className="section factors" id="factors" aria-labelledby="factors-heading">
        <div className="section-heading">
          <p className="eyebrow">Value drivers</p>
          <h2 id="factors-heading">What factors affect a personal injury settlement value?</h2>
          <p>The calculator covers a starting model. Real negotiations also turn on evidence quality, coverage, causation, and local law.</p>
        </div>

        <div className="factors-tabs-container">
          {/* Left side: Vertical Tabs */}
          <div className="factors-tab-list" role="tablist" aria-label="Value drivers">
            {[
              { id: "01", title: "Medical evidence" },
              { id: "02", title: "Income proof" },
              { id: "03", title: "Liability evidence" },
              { id: "04", title: "Recovery duration" },
              { id: "05", title: "Insurance limits" },
              { id: "06", title: "State law" },
            ].map((tab) => (
              <button
                key={tab.id}
                role="tab"
                aria-selected={activeFactorTab === tab.id}
                className={`factors-tab-button ${activeFactorTab === tab.id ? "active" : ""}`}
                onClick={() => setActiveFactorTab(tab.id)}
              >
                <span className="tab-index">{tab.id}</span>
                <span className="tab-title">{tab.title}</span>
              </button>
            ))}
          </div>

          {/* Right side: Active Tab Panel */}
          <div className="factors-tab-panel" role="tabpanel">
            {activeFactorTab === "01" && (
              <div className="tab-detail-content">
                <div className="detail-header">
                  <h3>01 / Medical Evidence Continuity</h3>
                  <p>Consistent, immediate records connect your accident directly to your physical diagnosis and treatment plan.</p>
                </div>
                <div className="stats-grid">
                  <div className="stat-card">
                    <span className="stat-num">78%</span>
                    <p className="stat-desc">of claims settle faster when treatment begins within 72 hours of injury.</p>
                  </div>
                  <div className="stat-card">
                    <span className="stat-num">30–50%</span>
                    <p className="stat-desc">typical reduction in initial insurance offers when care gaps exceed 14 days.</p>
                  </div>
                </div>
                <div className="compensation-explanation">
                  <h4>How it impacts compensation</h4>
                  <p>Insurers look for immediate care and consistent treatment. Gaps or stopping care early suggests you recovered or that the injuries were not severe. Medical costs form the core of your economic damages, which directly multiplies your pain and suffering compensation.</p>
                </div>
                <div className="mini-calculator-box">
                  <h4>Medical Bill & Pain/Suffering Simulator</h4>
                  <div className="mini-calc-form">
                    <div className="calc-row">
                      <label>Emergency Room Bill ($)</label>
                      <input
                        type="number"
                        value={medER}
                        onChange={(e) => setMedER(Number(e.target.value))}
                      />
                    </div>
                    <div className="calc-row">
                      <label>Physical Therapy / Chiropractic ($)</label>
                      <input
                        type="number"
                        value={medPT}
                        onChange={(e) => setMedPT(Number(e.target.value))}
                      />
                    </div>
                    <div className="calc-row">
                      <label>Diagnostics (MRI, X-Rays) ($)</label>
                      <input
                        type="number"
                        value={medDiag}
                        onChange={(e) => setMedDiag(Number(e.target.value))}
                      />
                    </div>
                    <div className="calc-row">
                      <label>Pain/Suffering Multiplier: <strong>{medMultiplier.toFixed(1)}x</strong></label>
                      <input
                        type="range"
                        min="1.5"
                        max="5.0"
                        step="0.5"
                        value={medMultiplier}
                        onChange={(e) => setMedMultiplier(Number(e.target.value))}
                      />
                    </div>
                  </div>
                  <div className="mini-calc-results">
                    <div>Total Medical Base: <strong>{fmt.format(medER + medPT + medDiag)}</strong></div>
                    <div>Simulated Pain & Suffering: <strong>{fmt.format((medER + medPT + medDiag) * medMultiplier)}</strong></div>
                    <div className="total-highlight">Total Medical Case Value: <strong>{fmt.format((medER + medPT + medDiag) * (1 + medMultiplier))}</strong></div>
                  </div>
                </div>
              </div>
            )}

            {activeFactorTab === "02" && (
              <div className="tab-detail-content">
                <div className="detail-header">
                  <h3>02 / Wage Loss & Capacity Verification</h3>
                  <p>Pay stubs, W-2s, and employer letters turn hypothetical missed work into concrete economic damages.</p>
                </div>
                <div className="stats-grid">
                  <div className="stat-card">
                    <span className="stat-num">100%</span>
                    <p className="stat-desc">of claimed lost earnings must be verified with tax returns or employer wage letters.</p>
                  </div>
                  <div className="stat-card">
                    <span className="stat-num">Vocational</span>
                    <p className="stat-desc">assessment reports are required when claiming long-term earning capacity loss.</p>
                  </div>
                </div>
                <div className="compensation-explanation">
                  <h4>How it impacts compensation</h4>
                  <p>Unlike general damages (pain/suffering), lost income is calculated precisely. If your injury prevents you from returning to your prior job tier, you can recover 'loss of earning capacity' projected over your remaining work life expectancy.</p>
                </div>
                <div className="mini-calculator-box">
                  <h4>Lost Wages & Capacity Loss Simulator</h4>
                  <div className="mini-calc-form">
                    <div className="calc-row">
                      <label>Hourly Wage ($)</label>
                      <input
                        type="number"
                        value={hourlyWage}
                        onChange={(e) => setHourlyWage(Number(e.target.value))}
                      />
                    </div>
                    <div className="calc-row">
                      <label>Hours of Work Missed</label>
                      <input
                        type="number"
                        value={hoursMissed}
                        onChange={(e) => setHoursMissed(Number(e.target.value))}
                      />
                    </div>
                    <div className="calc-row">
                      <label>Future Earning Capacity Reduction (%)</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={capacityLoss}
                        onChange={(e) => setCapacityLoss(Number(e.target.value))}
                      />
                    </div>
                    <div className="calc-row">
                      <label>Years of Future Capacity Impact</label>
                      <input
                        type="number"
                        min="1"
                        max="40"
                        value={capacityYears}
                        onChange={(e) => setCapacityYears(Number(e.target.value))}
                      />
                    </div>
                  </div>
                  <div className="mini-calc-results">
                    <div>Current Lost Wages: <strong>{fmt.format(hourlyWage * hoursMissed)}</strong></div>
                    <div>Projected Future Loss (Annualized): <strong>{fmt.format(hourlyWage * 2000 * (capacityLoss / 100))} / year</strong></div>
                    <div className="total-highlight">Total Earning Impact: <strong>{fmt.format((hourlyWage * hoursMissed) + (hourlyWage * 2000 * (capacityLoss / 100) * capacityYears))}</strong></div>
                  </div>
                </div>
              </div>
            )}

            {activeFactorTab === "03" && (
              <div className="tab-detail-content">
                <div className="detail-header">
                  <h3>03 / Establishing Clear Responsibility</h3>
                  <p>Police reports, scene photos, and witness statements establish who is legally responsible for your losses.</p>
                </div>
                <div className="stats-grid">
                  <div className="stat-card">
                    <span className="stat-num">Citation</span>
                    <p className="stat-desc">issued to the other party is the single strongest indicator of clear liability.</p>
                  </div>
                  <div className="stat-card">
                    <span className="stat-num">Visuals</span>
                    <p className="stat-desc">like dashcam or video increase early settlement speed by up to 40%.</p>
                  </div>
                </div>
                <div className="compensation-explanation">
                  <h4>How it impacts compensation</h4>
                  <p>In states with comparative negligence, any percentage of fault assigned to you directly reduces your check. Without solid proof (like a dashcam, witness, or clear police report), insurers will attempt to shift a portion of fault onto you to discount your claim.</p>
                </div>
                <div className="mini-calculator-box">
                  <h4>Liability Strength & Fault Risk Estimator</h4>
                  <div className="mini-calc-form check-group">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={libPolice}
                        onChange={(e) => setLibPolice(e.target.checked)}
                      />
                      Police report explicitly blames defendant
                    </label>
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={libPhotos}
                        onChange={(e) => setLibPhotos(e.target.checked)}
                      />
                      Photo/video evidence of collision points exists
                    </label>
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={libWitness}
                        onChange={(e) => setLibWitness(e.target.checked)}
                      />
                      Independent witness statements support your claim
                    </label>
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={libAdmission}
                        onChange={(e) => setLibAdmission(e.target.checked)}
                      />
                      Defendant admitted fault at scene or in record
                    </label>
                  </div>
                  <div className="mini-calc-results">
                    {(() => {
                      let score = 0;
                      if (libPolice) score += 40;
                      if (libPhotos) score += 20;
                      if (libWitness) score += 20;
                      if (libAdmission) score += 20;
                      let statusText = "Incomplete evidence - expect liability challenges";
                      if (score >= 80) statusText = "Solid liability - low risk of fault reduction";
                      else if (score >= 50) statusText = "Moderate case - insurer may dispute details";
                      return (
                        <>
                          <div>Liability Strength Score: <strong>{score}%</strong></div>
                          <div className="total-highlight">Risk Status: <strong>{statusText}</strong></div>
                        </>
                      );
                    })()}
                  </div>
                </div>
              </div>
            )}

            {activeFactorTab === "04" && (
              <div className="tab-detail-content">
                <div className="detail-header">
                  <h3>04 / Length of Active Recovery</h3>
                  <p>The time spent in active, documented medical care serves as a primary indicator of the injury's impact on your daily life.</p>
                </div>
                <div className="stats-grid">
                  <div className="stat-card">
                    <span className="stat-num">Active Care</span>
                    <p className="stat-desc">The pain multiplier is strongly correlated with the number of months under active treatment.</p>
                  </div>
                  <div className="stat-card">
                    <span className="stat-num">M.M.I.</span>
                    <p className="stat-desc">Maximum Medical Improvement marks the point where your recovery timeline is legally established.</p>
                  </div>
                </div>
                <div className="compensation-explanation">
                  <h4>How it impacts compensation</h4>
                  <p>Longer active treatment demonstrates a more severe disruption to your standard of living, raising the non-economic (pain and suffering) multiplier. Gaps or stopping treatment early suggests recovery is complete.</p>
                </div>
                <div className="mini-calculator-box">
                  <h4>Recovery Duration & Multiplier Suggestor</h4>
                  <div className="mini-calc-form">
                    <div className="calc-row">
                      <label>Days of Active Medical Treatment: <strong>{recoveryDays} days</strong></label>
                      <input
                        type="range"
                        min="10"
                        max="365"
                        step="5"
                        value={recoveryDays}
                        onChange={(e) => setRecoveryDays(Number(e.target.value))}
                      />
                    </div>
                    <div className="calc-row check-group">
                      <label className="checkbox-label">
                        <input
                          type="checkbox"
                          checked={permanentImpairment}
                          onChange={(e) => setPermanentImpairment(e.target.checked)}
                        />
                        Doctor declared permanent impairment
                      </label>
                    </div>
                  </div>
                  <div className="mini-calc-results">
                    {(() => {
                      let range = "1.0x - 1.5x (Minor Impact)";
                      if (permanentImpairment) {
                        range = "4.0x - 6.5x (Catastrophic Impact)";
                      } else if (recoveryDays > 180) {
                        range = "3.0x - 4.5x (Severe Impact)";
                      } else if (recoveryDays > 90) {
                        range = "2.0x - 3.5x (Significant Impact)";
                      } else if (recoveryDays > 30) {
                        range = "1.5x - 2.5x (Moderate Impact)";
                      }
                      return (
                        <>
                          <div>Recovery Classification: <strong>{permanentImpairment ? "Permanent" : `${recoveryDays} days`}</strong></div>
                          <div className="total-highlight">Suggested Multiplier Range: <strong>{range}</strong></div>
                        </>
                      );
                    })()}
                  </div>
                </div>
              </div>
            )}

            {activeFactorTab === "05" && (
              <div className="tab-detail-content">
                <div className="detail-header">
                  <h3>05 / Coverage Caps & Policy Limits</h3>
                  <p>No matter how high your losses, the available insurance policy limit represents a practical ceiling on what is collectable.</p>
                </div>
                <div className="stats-grid">
                  <div className="stat-card">
                    <span className="stat-num">$15k–$25k</span>
                    <p className="stat-desc">Most individual drivers carry state-minimum policies which limit maximum recovery.</p>
                  </div>
                  <div className="stat-card">
                    <span className="stat-num">UM / UIM</span>
                    <p className="stat-desc">Uninsured/Underinsured Motorist coverage provides a secondary source of recovery from your own insurer.</p>
                  </div>
                </div>
                <div className="compensation-explanation">
                  <h4>How it impacts compensation</h4>
                  <p>If your total damages exceed the defendant's liability limits, you cannot collect the difference unless you pursue personal assets or file under your own underinsured motorist policy.</p>
                </div>
                <div className="mini-calculator-box">
                  <h4>Insurance Coverage Limit Checker</h4>
                  <div className="mini-calc-form">
                    <div className="calc-row">
                      <label>Total Estimated Loss ($)</label>
                      <input
                        type="number"
                        value={estLosses}
                        onChange={(e) => setEstLosses(Number(e.target.value))}
                      />
                    </div>
                    <div className="calc-row">
                      <label>Defendant Policy Limit ($)</label>
                      <input
                        type="number"
                        value={defLimit}
                        onChange={(e) => setDefLimit(Number(e.target.value))}
                      />
                    </div>
                    <div className="calc-row">
                      <label>Your UIM Policy Limit ($)</label>
                      <input
                        type="number"
                        value={uimLimit}
                        onChange={(e) => setUimLimit(Number(e.target.value))}
                      />
                    </div>
                  </div>
                  <div className="mini-calc-results">
                    {(() => {
                      const totalAvailable = defLimit + uimLimit;
                      const collectible = Math.min(estLosses, totalAvailable);
                      const deficit = Math.max(0, estLosses - totalAvailable);
                      let statusText = "Fully Covered by Policies";
                      if (deficit > 0) statusText = "Deficit detected - claim exceeds limits!";
                      return (
                        <>
                          <div>Total Coverage Available: <strong>{fmt.format(totalAvailable)}</strong></div>
                          <div>Estimated Collectible Claim: <strong>{fmt.format(collectible)}</strong></div>
                          <div className="total-highlight">Status: <strong>{statusText} (Deficit: {fmt.format(deficit)})</strong></div>
                        </>
                      );
                    })()}
                  </div>
                </div>
              </div>
            )}

            {activeFactorTab === "06" && (
              <div className="tab-detail-content">
                <div className="detail-header">
                  <h3>06 / Jurisdictional Rules & Negligence Standards</h3>
                  <p>Your state's comparative fault rules, damage limits, and deadlines completely dictate what is legally recoverable.</p>
                </div>
                <div className="stats-grid">
                  <div className="stat-card">
                    <span className="stat-num">50% / 51% Bar</span>
                    <p className="stat-desc">In modified comparative fault states, you get $0 if you are 50% or 51% responsible.</p>
                  </div>
                  <div className="stat-card">
                    <span className="stat-num">Contributory</span>
                    <p className="stat-desc">Negligence rules in states like AL, NC, VA, MD mean 1% fault bars all recovery.</p>
                  </div>
                </div>
                <div className="compensation-explanation">
                  <h4>How it impacts compensation</h4>
                  <p>If you share blame, your claim is reduced by that percentage. In contributory negligence states, even 1% of fault completely bars you from receiving any compensation.</p>
                </div>
                <div className="mini-calculator-box">
                  <h4>Negligence Rule & Shared Fault Simulator</h4>
                  <div className="mini-calc-form">
                    <div className="calc-row">
                      <label>State Negligence Framework</label>
                      <select
                        value={stateFaultRule}
                        onChange={(e) => setStateFaultRule(e.target.value)}
                      >
                        <option value="pure">Pure Comparative Negligence (e.g. CA, NY)</option>
                        <option value="modified-50">Modified Comparative - 50% Bar (e.g. CO, GA)</option>
                        <option value="modified-51">Modified Comparative - 51% Bar (e.g. TX, IL)</option>
                        <option value="contributory">Contributory Negligence (e.g. NC, VA, MD)</option>
                      </select>
                    </div>
                    <div className="calc-row">
                      <label>Your Share of Fault: <strong>{stateFaultPct}%</strong></label>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={stateFaultPct}
                        onChange={(e) => setStateFaultPct(Number(e.target.value))}
                      />
                    </div>
                    <div className="calc-row">
                      <label>Base Claim Value ($)</label>
                      <input
                        type="number"
                        value={stateBaseClaim}
                        onChange={(e) => setStateBaseClaim(Number(e.target.value))}
                      />
                    </div>
                  </div>
                  <div className="mini-calc-results">
                    {(() => {
                      let finalVal = 0;
                      let statusMsg = "";
                      const faultFrac = stateFaultPct / 100;
                      if (stateFaultRule === "pure") {
                        finalVal = stateBaseClaim * (1 - faultFrac);
                        statusMsg = `Recovery reduced by ${stateFaultPct}% fault.`;
                      } else if (stateFaultRule === "modified-50") {
                        if (stateFaultPct >= 50) {
                          finalVal = 0;
                          statusMsg = "Recovery barred: Fault is 50% or higher under the 50% Rule.";
                        } else {
                          finalVal = stateBaseClaim * (1 - faultFrac);
                          statusMsg = `Recovery reduced by ${stateFaultPct}% fault.`;
                        }
                      } else if (stateFaultRule === "modified-51") {
                        if (stateFaultPct > 50) {
                          finalVal = 0;
                          statusMsg = "Recovery barred: Fault exceeds 50% under the 51% Rule.";
                        } else {
                          finalVal = stateBaseClaim * (1 - faultFrac);
                          statusMsg = `Recovery reduced by ${stateFaultPct}% fault.`;
                        }
                      } else if (stateFaultRule === "contributory") {
                        if (stateFaultPct > 0) {
                          finalVal = 0;
                          statusMsg = "Recovery barred: Any share of fault (>0%) bars recovery under Contributory Negligence.";
                        } else {
                          finalVal = stateBaseClaim;
                          statusMsg = "Full recovery allowed (0% fault).";
                        }
                      }
                      return (
                        <>
                          <div>Base Claim: <strong>{fmt.format(stateBaseClaim)}</strong></div>
                          <div>Final Recovery: <strong>{fmt.format(finalVal)}</strong></div>
                          <div className="total-highlight">Negligence Status: <strong>{statusMsg}</strong></div>
                        </>
                      );
                    })()}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="section states-section" id="states" aria-labelledby="states-heading">
        <div className="section-heading states-heading">
          <p className="eyebrow">Geographic topic cluster</p>
          <h2 id="states-heading">Personal injury settlement calculators by state</h2>
          <p>Explore the calculation framework in a state context. These guides identify what still requires jurisdiction-specific legal review before any estimate can reflect local law.</p>
        </div>

        <div className="states-interactive-container">
          {/* Left side: Scrollable vertical list of all 50 states */}
          <div className="states-scroll-list" role="tablist" aria-label="All States">
            {states.map((item) => (
              <button
                key={item.code}
                role="tab"
                aria-selected={selectedState?.code === item.code}
                className={`state-tab-btn ${selectedState?.code === item.code ? "active" : ""}`}
                onClick={() => setSelectedState(item)}
              >
                <span>{item.name}</span>
                <small>{item.code}</small>
              </button>
            ))}
          </div>

          {/* Right side: Details & Calculation Angle for the selected state */}
          <div className="state-details-panel">
            {selectedState ? (
              <div className="state-calc-angle-content">
                <h3>{selectedState.name} Calculation Angle</h3>
                <p className="state-panel-lede">
                  Key jurisdictional factors that modify settlement outcomes in the State of {selectedState.name}.
                </p>
                <div className="state-rules-database">
                  {(() => {
                    const ruleDb: Record<string, { deadline: string; rule: string; caps: string; limitText: string }> = {
                      AL: { deadline: "2 years", rule: "Contributory Negligence", caps: "No cap on compensatory damages", limitText: "$100,000 against municipal entities" },
                      AK: { deadline: "2 years", rule: "Pure Comparative Negligence", caps: "Caps on non-economic damages at $400,000 or life expectancy", limitText: "Determined by injury severity" },
                      AZ: { deadline: "2 years", rule: "Pure Comparative Negligence", caps: "Constitutionally barred from capping damages", limitText: "No statutory caps" },
                      AR: { deadline: "3 years", rule: "Modified Comparative (50% Bar)", caps: "No caps on compensatory damages", limitText: "Caps on punitive damages" },
                      CA: { deadline: "2 years", rule: "Pure Comparative Negligence", caps: "No cap on general PI (MICRA limits medmal caps to $350k-$500k)", limitText: "No general caps" },
                      CO: { deadline: "2 years (3 years auto)", rule: "Modified Comparative (50% Bar)", caps: "Caps on non-economic damages (inflation-adjusted)", limitText: "Approx. $613k cap" },
                      CT: { deadline: "2 years", rule: "Modified Comparative (51% Bar)", caps: "No caps on compensatory damages", limitText: "No statutory caps" },
                      DE: { deadline: "2 years", rule: "Modified Comparative (51% Bar)", caps: "No caps on compensatory damages", limitText: "No statutory caps" },
                      FL: { deadline: "2 years", rule: "Modified Comparative (50% Bar)", caps: "No caps on personal injury damages", limitText: "Punitive capped at 3x compensatory" },
                      GA: { deadline: "2 years", rule: "Modified Comparative (50% Bar)", caps: "No caps on compensatory damages", limitText: "No statutory caps" },
                      HI: { deadline: "2 years", rule: "Modified Comparative (51% Bar)", caps: "Pain & suffering capped at $375,000 (exceptions apply)", limitText: "Subject to exceptions" },
                      ID: { deadline: "2 years", rule: "Modified Comparative (50% Bar)", caps: "Inflation-adjusted non-economic caps", limitText: "Approx. $450k cap" },
                      IL: { deadline: "2 years", rule: "Modified Comparative (51% Bar)", caps: "No caps on compensatory damages", limitText: "No statutory caps" },
                      IN: { deadline: "2 years", rule: "Modified Comparative (51% Bar)", caps: "No general cap (medmal capped at $1.8M)", limitText: "Medmal caps exist" },
                      IA: { deadline: "2 years", rule: "Modified Comparative (51% Bar)", caps: "No general cap (medmal caps exist)", limitText: "No general caps" },
                      KS: { deadline: "2 years", rule: "Modified Comparative (50% Bar)", caps: "Non-economic capped at $350,000", limitText: "Active statutory cap" },
                      KY: { deadline: "1 year (auto exceptions)", rule: "Pure Comparative Negligence", caps: "Constitutionally protected from caps", limitText: "No statutory caps" },
                      LA: { deadline: "1 year", rule: "Pure Comparative Negligence", caps: "No general caps (government liability capped at $500k)", limitText: "Government liability cap" },
                      ME: { deadline: "6 years", rule: "Modified Comparative (50% Bar)", caps: "No general caps (wrongful death non-economic capped at $750k)", limitText: "No general caps" },
                      MD: { deadline: "3 years", rule: "Contributory Negligence", caps: "Strict non-economic damage cap", limitText: "Approx. $935k cap (increases annually)" },
                      MA: { deadline: "3 years", rule: "Modified Comparative (50% Bar)", caps: "No general cap (medical malpractice capped at $500k)", limitText: "No general caps" },
                      MI: { deadline: "3 years", rule: "Modified Comparative (51% Bar - non-economic barred if >50%)", caps: "Medical malpractice caps apply", limitText: "No general caps" },
                      MN: { deadline: "6 years (2 years auto)", rule: "Modified Comparative (51% Bar)", caps: "No caps on compensatory damages", limitText: "No statutory caps" },
                      MS: { deadline: "3 years", rule: "Modified Comparative (51% Bar)", caps: "Non-economic damages capped at $1,000,000", limitText: "Statutory cap active" },
                      MO: { deadline: "5 years", rule: "Pure Comparative Negligence", caps: "No general caps (medmal caps apply)", limitText: "No general caps" },
                      MT: { deadline: "3 years", rule: "Modified Comparative (51% Bar)", caps: "No general caps (medical malpractice capped)", limitText: "No general caps" },
                      NE: { deadline: "4 years", rule: "Modified Comparative (50% Bar)", caps: "No general caps", limitText: "No statutory caps" },
                      NV: { deadline: "2 years", rule: "Modified Comparative (51% Bar)", caps: "No general caps (medical malpractice capped at $350k)", limitText: "No general caps" },
                      NH: { deadline: "3 years", rule: "Modified Comparative (51% Bar)", caps: "No caps on compensatory damages", limitText: "No statutory caps" },
                      NJ: { deadline: "2 years", rule: "Modified Comparative (51% Bar)", caps: "No general caps", limitText: "No statutory caps" },
                      NM: { deadline: "3 years", rule: "Pure Comparative Negligence", caps: "No general caps", limitText: "No statutory caps" },
                      NY: { deadline: "3 years", rule: "Pure Comparative Negligence", caps: "No caps on compensatory damages", limitText: "No statutory caps" },
                      NC: { deadline: "3 years", rule: "Contributory Negligence", caps: "No general caps (punitive damages capped)", limitText: "No general caps" },
                      ND: { deadline: "6 years", rule: "Modified Comparative (51% Bar)", caps: "Non-economic capped at $250,000 in medmal", limitText: "No general caps" },
                      OH: { deadline: "2 years", rule: "Modified Comparative (51% Bar)", caps: "Non-economic capped at greater of $250k or 3x economic", limitText: "Statutory cap active" },
                      OK: { deadline: "2 years", rule: "Modified Comparative (51% Bar)", caps: "No general caps (statutory caps ruled unconstitutional)", limitText: "No general caps" },
                      OR: { deadline: "2 years", rule: "Modified Comparative (51% Bar)", caps: "No general caps (wrongful death capped at $500k)", limitText: "No general caps" },
                      PA: { deadline: "2 years", rule: "Modified Comparative (51% Bar)", caps: "No general caps", limitText: "No statutory caps" },
                      RI: { deadline: "3 years", rule: "Pure Comparative Negligence", caps: "No caps on compensatory damages", limitText: "No statutory caps" },
                      SC: { deadline: "3 years", rule: "Modified Comparative (51% Bar)", caps: "No general caps (medmal capped at $350k per defendant)", limitText: "No general caps" },
                      SD: { deadline: "3 years", rule: "Modified Comparative (51% Bar)", caps: "No general caps (medical malpractice capped)", limitText: "No general caps" },
                      TN: { deadline: "1 year", rule: "Modified Comparative (50% Bar)", caps: "Non-economic damages capped at $750,000", limitText: "Statutory cap active" },
                      TX: { deadline: "2 years", rule: "Modified Comparative (51% Bar)", caps: "No general caps (medical malpractice capped)", limitText: "No general caps" },
                      UT: { deadline: "4 years", rule: "Modified Comparative (50% Bar)", caps: "No general caps (medical malpractice capped)", limitText: "No general caps" },
                      VT: { deadline: "3 years", rule: "Simple Comparative (51% Bar)", caps: "No caps on compensatory damages", limitText: "No statutory caps" },
                      VA: { deadline: "2 years", rule: "Contributory Negligence", caps: "No general caps (medical malpractice capped at $2.6M)", limitText: "No general caps" },
                      WA: { deadline: "3 years", rule: "Pure Comparative Negligence", caps: "No caps on compensatory damages", limitText: "No statutory caps" },
                      WV: { deadline: "2 years", rule: "Modified Comparative (51% Bar)", caps: "Non-economic damages capped at $250,000 in general", limitText: "Statutory cap active" },
                      WI: { deadline: "3 years", rule: "Modified Comparative (51% Bar)", caps: "No general caps (medical malpractice capped at $750k)", limitText: "No general caps" },
                      WY: { deadline: "4 years", rule: "Modified Comparative (51% Bar)", caps: "Constitutionally protected from caps", limitText: "No statutory caps" }
                    };

                    const stateStats = ruleDb[selectedState.code] || {
                      deadline: "2 years",
                      rule: "Modified Comparative (51% Bar)",
                      caps: "No general caps",
                      limitText: "No statutory caps"
                    };

                    return (
                      <div className="state-stats-details">
                        <div className="state-stat-row">
                          <strong>Statute of Limitations (Filing Deadline)</strong>
                          <span>{stateStats.deadline}</span>
                        </div>
                        <div className="state-stat-row">
                          <strong>Shared Fault (Negligence Standard)</strong>
                          <span>{stateStats.rule}</span>
                        </div>
                        <div className="state-stat-row">
                          <strong>Damage Limitation Caps</strong>
                          <span>{stateStats.caps}</span>
                        </div>
                        <div className="state-stat-row">
                          <strong>Specific Statutory Limits</strong>
                          <span>{stateStats.limitText}</span>
                        </div>
                        
                        <div className="state-calc-cta">
                          <p>Selecting {selectedState.name} in the main calculator allows you to model comparative fault adjustments manually.</p>
                          <Link href={`/states/${selectedState.slug}`} className="state-link-btn">
                            View full {selectedState.name} Settlement Guide <span>↗</span>
                          </Link>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>
            ) : (
              <p className="no-state-msg">Select a state from the list to view its custom calculation profile details.</p>
            )}
          </div>
        </div>

        <p className="state-disclaimer"><strong>Scope note:</strong> The current estimator is a general educational model. State pages do not yet apply statutes, damage caps, limitation periods, or negligence rules.</p>
      </section>

      <section className="section scope-section" aria-labelledby="interpret-heading">
        <div className="scope-card">
          <p className="eyebrow">Information gain</p>
          <h2 id="interpret-heading">How to interpret your settlement estimate</h2>
          <ol>
            <li><span>Is every loss supported by a record?</span><small>Replace memory with bills, reports, wage statements, and dates.</small></li>
            <li><span>Which facts could weaken causation?</span><small>Prior injuries and treatment gaps often need context, not concealment.</small></li>
            <li><span>What does local law change?</span><small>Check deadlines, comparative fault, caps, and recoverable damages.</small></li>
            <li><span>What coverage is actually available?</span><small>Identify responsible parties and relevant insurance policies.</small></li>
          </ol>
        </div>
        <div className="scope-aside">
          <span className="scope-stamp">NO LEAD FORM</span>
          <h3>Your case facts stay in your browser.</h3>
          <p>This first version sends no calculator inputs to a server and asks for no name, email, or phone number.</p>
          <button onClick={scrollToCalculator}>Recalculate privately <span>↗</span></button>
        </div>
      </section>

      <section className="section faq" id="faq" aria-labelledby="faq-heading">
        <div className="section-heading">
          <p className="eyebrow">Plain answers</p>
          <h2 id="faq-heading">Frequently asked questions about settlement calculators</h2>
        </div>
        
        <div className="faq-tabs-container">
          {/* Left side: FAQ list as vertical tabs */}
          <div className="faq-tab-list" role="tablist" aria-label="FAQ Questions">
            {[
              "Is this settlement estimate accurate?",
              "Why does the calculator give a range?",
              "How are pain and suffering damages estimated?",
              "Does selecting a state apply that state’s settlement law?"
            ].map((question, idx) => (
              <button
                key={idx}
                role="tab"
                aria-selected={activeFaqTab === idx}
                className={`faq-tab-button ${activeFaqTab === idx ? "active" : ""}`}
                onClick={() => setActiveFaqTab(idx)}
              >
                <h3>{question}</h3>
              </button>
            ))}
          </div>

          <div className="faq-tab-panel" role="tabpanel">
            {activeFaqTab === 0 && (
              <div className="faq-answer-content">
                <h3>Is this settlement estimate accurate?</h3>
                <p>It is a planning model, not a prediction. It uses the values you provide and a disclosed impact range. Evidence, insurance, jurisdiction, negotiation, and many case-specific facts can produce a materially different outcome.</p>
                <div className="takeaway-card">
                  <strong>Key Takeaway:</strong>
                  <p>Use the calculator to understand the components of value, not to predict a final checkout amount.</p>
                </div>
              </div>
            )}
            {activeFaqTab === 1 && (
              <div className="faq-answer-content">
                <h3>Why does the calculator give a range?</h3>
                <p>A range makes uncertainty visible. A single dollar result suggests a level of precision that a general-purpose calculator cannot support.</p>
                <div className="takeaway-card">
                  <strong>Key Takeaway:</strong>
                  <p>A range models low-impact and high-impact scenarios to better prepare you for negotiation ranges.</p>
                </div>
              </div>
            )}
            {activeFaqTab === 2 && (
              <div className="faq-answer-content">
                <h3>How are pain and suffering damages estimated?</h3>
                <p>The calculator applies a disclosed impact band to treatment costs for scenario planning. This multiplier is an educational shortcut, not a legal standard or a method that insurers, lawyers, judges, or juries must use.</p>
                <div className="takeaway-card">
                  <strong>Key Takeaway:</strong>
                  <p>Multiplier bands (e.g. 1.5x–5x) are guidelines for organizing arguments, not fixed laws.</p>
                </div>
              </div>
            )}
            {activeFaqTab === 3 && (
              <div className="faq-answer-content">
                <h3>Does selecting a state apply that state’s settlement law?</h3>
                <p>Not yet. The current state field provides context only. State-specific rule modules and cited legal sources are planned for later releases.</p>
                <div className="takeaway-card">
                  <strong>Key Takeaway:</strong>
                  <p>Always verify local damage caps, negligence standards, and filing limits with a local attorney.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="final-cta" aria-labelledby="final-heading">
        <p>Estimate the range. Inspect the assumptions.</p>
        <h2 id="final-heading">Calculate your personal injury settlement range</h2>
        <button onClick={scrollToCalculator}>Open the calculator <span>↑</span></button>
      </section>

      <footer>
        <a className="brand footer-brand" href="#top"><span className="brand-mark">SC</span><span>Settlement Calculator<span className="brand-domain">.guide</span></span></a>
        <p>Independent educational tools for understanding personal injury claim variables.</p>
        <div><a href="#method">Methodology</a><a href="#faq">FAQ</a><span>© 2026</span></div>
      </footer>
    </main>
  );
}
