"use client";

import { useMemo, useRef, useState } from "react";
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

const statisticsData = [
  {
    category: "CLAIM VALUE",
    bulletClass: "value",
    items: [
      {
        id: "avg-settlement",
        value: "$30K–$75K",
        label: "Average personal injury settlement amount",
        explanation: "communicates typical recovery value drawn from resolved claims.",
        tooltipText: "Typical payout range across resolved injury claims.",
        icon: (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <path d="M16 8h-6a2 2 0 0 0 0 4h4a2 2 0 0 1 0 4H8" />
            <path d="M12 6v12" />
          </svg>
        )
      },
      {
        id: "median-settlement",
        value: "≈ $24,000",
        label: "Median settlement amount",
        explanation: "communicates the midpoint value across a resolved claim set, reducing distortion from outlier awards.",
        tooltipText: "Midpoint value excluding extreme high or low awards.",
        icon: (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="20" x2="18" y2="10" />
            <line x1="12" y1="20" x2="12" y2="4" />
            <line x1="6" y1="20" x2="6" y2="14" />
          </svg>
        )
      },
      {
        id: "comp-percentage",
        value: "≈ 95%",
        label: "Percentage of claims resulting in compensation",
        explanation: "communicates how often a filed claim ends in payment versus denial or withdrawal.",
        tooltipText: "Share of filed claims resulting in a financial payout.",
        icon: (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
        )
      },
      {
        id: "avg-medical",
        value: "$15K–$35K",
        label: "Average medical expenses per claim",
        explanation: "communicates typical treatment cost carried across a resolved claim.",
        tooltipText: "Typical medical treatment and ER cost per claim.",
        icon: (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="16" />
            <line x1="8" y1="12" x2="16" y2="12" />
          </svg>
        )
      },
      {
        id: "avg-wages",
        value: "$4K–$9K",
        label: "Average lost wages per claim",
        explanation: "communicates typical missed income tied to a resolved claim.",
        tooltipText: "Average lost earnings recovered for missed work time.",
        icon: (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
            <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
          </svg>
        )
      },
      {
        id: "pain-suffering",
        value: "1.5x–5x",
        label: "Typical pain-and-suffering multiplier",
        explanation: "communicates the common range applied toward non-economic loss calculation.",
        tooltipText: "Multiplier range applied to medical bills for pain loss.",
        icon: (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <circle cx="12" cy="12" r="6" />
            <circle cx="12" cy="12" r="2" />
          </svg>
        )
      }
    ]
  },
  {
    category: "PATH TO RESOLUTION",
    bulletClass: "resolution",
    items: [
      {
        id: "time-to-settle",
        value: "9–18 months",
        label: "Average time to settle a claim",
        explanation: "communicates typical duration from filing toward final resolution.",
        tooltipText: "Standard timeframe from claim filing to payout check.",
        icon: (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
        )
      },
      {
        id: "resolved-no-trial",
        value: "≈ 95%",
        label: "Percentage resolved without trial",
        explanation: "communicates how often a claim closes through negotiation rather than a jury verdict.",
        tooltipText: "Ratio of claims settled through negotiation vs trial.",
        icon: (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <polyline points="9 15 11 17 15 13" />
          </svg>
        )
      },
      {
        id: "avg-trial-award",
        value: "$150K+",
        label: "Average trial award",
        explanation: "communicates typical jury verdict value among cases that proceed toward trial.",
        tooltipText: "Average verdict award for cases that go to trial.",
        icon: (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="m14 13-8.3 8.3c-.9.9-2.3.9-3.2 0s-.9-2.3 0-3.2L10.8 10" />
            <path d="m18 2 4 4-8 8-4-4Z" />
            <path d="m20.5 7.5-.5-.5" />
            <path d="m16.5 3.5-.5-.5" />
          </svg>
        )
      },
      {
        id: "fee-range",
        value: "33%–40%",
        label: "Attorney fee range",
        explanation: "communicates the common contingency percentage charged across resolved claims.",
        tooltipText: "Common legal contingency fee percentage range.",
        icon: (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="5" x2="5" y2="19" />
            <circle cx="6.5" cy="6.5" r="2.5" />
            <circle cx="17.5" cy="17.5" r="2.5" />
          </svg>
        )
      }
    ]
  },
  {
    category: "COVERAGE, SEVERITY & RULES",
    bulletClass: "coverage",
    items: [
      {
        id: "policy-caps",
        value: "≈ 1 in 3",
        label: "Insurance policy limit impact",
        explanation: "communicates how often available coverage caps final settlement value.",
        tooltipText: "Frequency where insurance policy limits restrict payout.",
        icon: (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        )
      },
      {
        id: "injury-severity",
        value: "$5K → $250K+",
        label: "Settlement range by injury severity",
        explanation: "communicates how value shifts across minor, moderate, plus severe injury categories.",
        tooltipText: "Value progression from minor to catastrophic injury.",
        icon: (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
        )
      },
      {
        id: "accident-type",
        value: "Varies widely",
        label: "Settlement range by accident type",
        explanation: "communicates how value shifts across different incident categories.",
        tooltipText: "Payout variation across different crash categories.",
        icon: (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2" />
            <circle cx="7" cy="17" r="2" />
            <circle cx="17" cy="17" r="2" />
            <path d="M5 17h10" />
            <path d="M13 10V8H9v2" />
          </svg>
        )
      },
      {
        id: "fault-reduction",
        value: "Reduced pro rata",
        label: "Comparative-fault reduction percentage",
        explanation: "communicates typical value reduction tied to assigned fault.",
        tooltipText: "Proportional value reduction based on assigned fault.",
        icon: (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="3" x2="12" y2="21" />
            <line x1="6" y1="7" x2="18" y2="7" />
            <path d="M6 7A4 4 0 0 0 2 11h8a4 4 0 0 0-4-4z" />
            <path d="M18 7A4 4 0 0 0 14 11h8a4 4 0 0 0-4-4z" />
          </svg>
        )
      },
      {
        id: "caps-deadlines",
        value: "TX: 2-yr deadline",
        label: "State-specific damage caps and deadlines",
        explanation: "communicates jurisdiction specific limits plus filing windows.",
        tooltipText: "State damage limits and statutory filing deadlines.",
        icon: (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
        )
      }
    ]
  }
];

const accidentTabsData: Record<
  string,
  {
    title: string;
    subtitle: string;
    definition: string;
    statistics: string;
    documents: string;
    factors: string;
  }
> = {
  car: {
    title: "Car Accident Settlement Calculator",
    subtitle: "Rear-end, T-bone, and multi-vehicle collisions. Enter your case details below — Sutliff & Stout builds this estimate from documented economic loss, a pain-and-suffering multiplier, and a fault adjustment under Texas law.",
    definition: "A car accident is a collision involving one or more motor vehicles operating across a public roadway, parking area, or private drive. Impact occurs through rear end contact, side impact, head on contact, or a rollover event tied to speed, road condition, or driver conduct. Texas law assigns fault toward a driver whose conduct breaches a duty of care owed toward other roadway users. Police response generates an official crash report documenting vehicle position, damage extent, plus witness statement gathered at the scene.",
    statistics: "Settlement value tied to a car accident claim shifts based on injury severity, fault percentage, plus insurance policy limit carried by an at fault driver. Claims resolved through negotiation settle faster compared toward a claim pursued through litigation. Vehicle damage extent connected to a collision often signals impact force relevant toward injury severity assessment.",
    documents: "Required documents supporting a car accident claim include a police crash report, medical treatment record, repair estimate, plus wage loss verification. Photograph evidence captured near the collision scene supports damage extent plus fault determination reviewed during a claim. An insurance policy declaration page confirms coverage limits available toward compensation pursued through a filed claim.",
    factors: "Settlement factors shifting car accident claim value include injury severity, fault percentage, insurance policy limit, plus treatment consistency documented across a recovery period. Liability clarity strengthens negotiation leverage present during a settlement discussion pursued against an at fault driver, a factor accounted for within the Car Accident Settlement Calculator."
  },
  truck: {
    title: "Truck Accident Settlement Calculator",
    subtitle: "Commercial tractor-trailer, box truck, or delivery vehicle collisions. Enter your case details below — Sutliff & Stout builds this estimate from documented economic loss, a pain-and-suffering multiplier, and a fault adjustment under Texas law.",
    definition: "A truck accident is a collision involving a commercial truck (tractor trailer, delivery vehicle, or box truck among examples) plus another vehicle, pedestrian, or fixed object. Impact severity often exceeds a standard car accident given the size plus weight differential carried by a commercial vehicle. Federal motor carrier regulation governs driver conduct, cargo securement, plus maintenance obligation tied to the trucking company. Police response, combined with a company held event data recorder, documents vehicle speed plus driver action leading toward impact.",
    statistics: "Settlement value tied to a truck accident claim shifts based on injury severity, carrier insurance policy limit, plus liability shared between a driver and a trucking company. Commercial policy limits typically exceed a standard auto policy, raising the achievable settlement ceiling. Cargo load, vehicle maintenance record, plus driver hour of service log often shape fault determination.",
    documents: "Required documents supporting a truck accident claim include a police crash report, driver qualification file, hour of service log, plus vehicle maintenance record. Event data recorder output confirms speed plus braking action recorded near impact. A commercial insurance declaration page confirms coverage limits carried by the trucking company.",
    factors: "Settlement factors shifting truck accident claim value include injury severity, regulatory violation, cargo securement failure, plus driver fatigue documentation. Liability shared between a driver and a company often extends negotiation complexity beyond a standard collision claim, a distinction reflected within the Truck Accident Settlement Calculator."
  },
  motorcycle: {
    title: "Motorcycle Accident Settlement Calculator",
    subtitle: "Two-wheeler, sport bike, and cruiser collisions. Enter your case details below — Sutliff & Stout builds this estimate from documented economic loss, a pain-and-suffering multiplier, and a fault adjustment under Texas law.",
    definition: "A motorcycle accident is a collision involving a motorcycle plus another vehicle, fixed object, or roadway hazard, frequently resulting in a rider ejected from the vehicle. Impact occurs through a left turn violation, lane change failure, or rear end contact tied to reduced rider visibility. Injury severity often exceeds a standard car accident given limited physical protection carried by a rider. Police response generates a crash report documenting point of impact plus rider position following the collision.",
    statistics: "Settlement value tied to a motorcycle accident claim shifts based on injury severity, fault percentage, plus insurance policy limit carried by an at fault driver. Bias against a rider during adjuster review sometimes lowers an initial settlement offer absent strong documentation. Road condition, visibility factor, plus helmet use often influence injury severity assessment.",
    documents: "Required documents supporting a motorcycle accident claim include a police crash report, medical treatment record, repair or total loss estimate, plus witness statement. Photograph evidence capturing point of impact plus roadway condition supports fault determination reviewed during a claim. Protective gear condition following impact supports injury causation argument presented during negotiation.",
    factors: "Settlement factors shifting motorcycle accident claim value include injury severity, fault percentage, insurance policy limit, plus adjuster bias countered through strong documentation. Liability clarity carries added weight given a common presumption of rider fault, a factor addressed within the Motorcycle Accident Settlement Calculator."
  },
  bicycle: {
    title: "Bicycle Accident Settlement Calculator",
    subtitle: "Commuter, road bike, and cyclist collisions. Enter your case details below — Sutliff & Stout builds this estimate from documented economic loss, a pain-and-suffering multiplier, and a fault adjustment under Texas law.",
    definition: "A bicycle accident is a collision involving a cyclist plus a motor vehicle, fixed object, or roadway hazard, occurring across a public roadway, bike lane, or intersection. Impact occurs through a right hook turn, dooring event, or failure to yield tied toward driver inattention. Injury severity often reflects direct exposure carried by a cyclist absent a protective vehicle frame. Police response generates a crash report documenting cyclist position, vehicle position, plus applicable traffic violation.",
    statistics: "Settlement value tied to a bicycle accident claim shifts based on injury severity, fault percentage, plus insurance policy limit carried by an at fault driver. Claims involving a clear traffic violation (a dooring citation among examples) often settle faster given stronger liability clarity. Helmet use plus bike lane presence often factor into comparative fault arguments raised by an insurer.",
    documents: "Required documents supporting a bicycle accident claim include a police crash report, medical treatment record, bicycle damage estimate, plus witness statement. Photograph evidence capturing bike lane markings plus vehicle position supports fault determination reviewed during a claim. Traffic camera footage, where available, strengthens liability proof presented during negotiation.",
    factors: "Settlement factors shifting bicycle accident claim value include injury severity, fault percentage, insurance policy limit, plus roadway infrastructure detail (bike lane presence or signage among examples). Comparative fault argument tied toward cyclist conduct often requires active challenge, a consideration built into the Bicycle Accident Settlement Calculator."
  },
  pedestrian: {
    title: "Pedestrian Accident Settlement Calculator",
    subtitle: "Crosswalk, sidewalk, and walking collision events. Enter your case details below — Sutliff & Stout builds this estimate from documented economic loss, a pain-and-suffering multiplier, and a fault adjustment under Texas law.",
    definition: "A pedestrian accident is a collision involving a motor vehicle plus a person traveling on foot across a crosswalk, sidewalk, or roadway shoulder. Impact occurs through a failure to yield, backing vehicle event, or driver inattention tied toward reduced pedestrian visibility. Injury severity frequently reaches a severe level given direct exposure carried by a pedestrian absent protective structure. Police response generates a crash report documenting crosswalk position, signal timing, plus applicable traffic violation.",
    statistics: "Settlement value tied to a pedestrian accident claim shifts based on injury severity, fault percentage, plus insurance policy limit carried by an at fault driver. Claims involving a marked crosswalk violation often settle faster given stronger liability clarity. Nighttime incidents plus low visibility conditions frequently raise disputed fault arguments during adjuster review.",
    documents: "Required documents supporting a pedestrian accident claim include a police crash report, medical treatment record, traffic signal timing record, plus witness statement. Photograph evidence capturing crosswalk markings plus lighting condition supports fault determination reviewed during a claim. Surveillance or traffic camera footage, where available, strengthens liability proof presented during negotiation.",
    factors: "Settlement factors shifting pedestrian accident claim value include injury severity, fault percentage, insurance policy limit, plus visibility condition present at incident time. Comparative fault argument tied toward jaywalking or signal disregard often requires active rebuttal, a factor reflected within the Pedestrian Accident Settlement Calculator."
  },
  rideshare: {
    title: "Rideshare Accident Settlement Calculator",
    subtitle: "Uber, Lyft, and commercial fare collisions. Enter your case details below — Sutliff & Stout builds this estimate from documented economic loss, a pain-and-suffering multiplier, and a fault adjustment under Texas law.",
    definition: "A rideshare accident is a collision involving a transportation network vehicle (a driver actively logged into a rideshare application) plus another vehicle, pedestrian, or fixed object. Insurance coverage tier shifts based on driver application status at incident time (offline, waiting for a match, or actively transporting a passenger). Impact liability follows standard traffic fault rules layered against a rideshare company's contingent coverage policy. Police response generates a crash report documenting driver status plus applicable coverage tier.",
    statistics: "Settlement value tied to a rideshare accident claim shifts based on driver application status, injury severity, plus the applicable coverage tier carried by the rideshare company. A driver actively transporting a passenger typically triggers the highest available coverage tier. Claims involving a passenger injured mid ride often carry broader coverage access compared toward a claim filed against an offline driver.",
    documents: "Required documents supporting a rideshare accident claim include a police crash report, medical treatment record, rideshare trip log, plus driver application status confirmation. The trip log confirms driver status at incident time, directly shaping coverage tier availability. An insurance policy declaration page from both a personal and a rideshare carrier confirms combined coverage limits.",
    factors: "Settlement factors shifting rideshare accident claim value include driver application status, injury severity, fault percentage, plus coverage tier confirmation. Layered coverage between a personal policy and a company policy often extends negotiation complexity, a distinction addressed within the Rideshare Accident Settlement Calculator."
  },
  bus: {
    title: "Bus Accident Settlement Calculator",
    subtitle: "Public transit, charter, and school bus collisions. Enter your case details below — Sutliff & Stout builds this estimate from documented economic loss, a pain-and-suffering multiplier, and a fault adjustment under Texas law.",
    definition: "A bus accident is a collision involving a public transit, school, or charter bus plus another vehicle, pedestrian, or fixed object. Impact liability sometimes involves a governmental entity, triggering a shorter notice deadline plus a potential damage cap under sovereign immunity law. Injury frequently involves multiple passengers given the vehicle's occupancy capacity. Police response, combined with an internal transit authority report, documents driver conduct plus vehicle condition at incident time.",
    statistics: "Settlement value tied to a bus accident claim shifts based on injury severity, fault percentage, plus whether a governmental or private carrier operates the vehicle. Claims filed against a governmental entity often carry a lower damage cap compared toward a claim filed against a private charter company. Multiple passenger claims connected to a single incident frequently divide against a shared policy limit.",
    documents: "Required documents supporting a bus accident claim include a police crash report, medical treatment record, transit authority incident report, plus a notice of claim filed within a governmental deadline where applicable. Onboard camera footage, where available, strengthens liability proof presented during a claim. An insurance or self insurance declaration confirms coverage limits carried by the operating entity.",
    factors: "Settlement factors shifting bus accident claim value include injury severity, fault percentage, governmental immunity application, plus policy limit shared across multiple passenger claims. Notice deadline compliance carries added weight given a shortened filing window, a consideration built into the Bus Accident Settlement Calculator."
  },
  boating: {
    title: "Boating Accident Settlement Calculator",
    subtitle: "Lake, river, and coastal waterway collisions. Enter your case details below — Sutliff & Stout builds this estimate from documented economic loss, a pain-and-suffering multiplier, and a fault adjustment under Texas law.",
    definition: "A boating accident is a collision or capsizing event involving a vessel plus another vessel, a fixed structure, or a swimmer across a lake, river, or coastal water. Impact occurs through operator inattention, excessive speed, or alcohol impairment tied toward maritime or state boating law. Injury severity frequently includes drowning risk, given water exposure following an initial impact. A law enforcement marine unit generates an incident report documenting vessel position plus operator conduct.",
    statistics: "Settlement value tied to a boating accident claim shifts based on injury severity, fault percentage, plus watercraft insurance policy limit carried by an at fault operator. Claims involving alcohol impairment often carry stronger liability clarity given documented citation history. Jurisdiction (state waterway versus federal navigable water) shapes applicable law governing the claim.",
    documents: "Required documents supporting a boating accident claim include a marine incident report, medical treatment record, vessel registration record, plus witness statement. Photograph evidence capturing vessel damage plus water condition supports fault determination reviewed during a claim. A watercraft insurance declaration page confirms coverage limits available toward compensation.",
    factors: "Settlement factors shifting boating accident claim value include injury severity, fault percentage, insurance policy limit, plus jurisdiction specific maritime law application. Operator impairment evidence carries significant weight during negotiation, a factor accounted for within the Boating Accident Settlement Calculator."
  },
  aviation: {
    title: "Aviation Accident Settlement Calculator",
    subtitle: "Commercial, charter, and private aircraft incidents. Enter your case details below — Sutliff & Stout builds this estimate from documented economic loss, a pain-and-suffering multiplier, and a fault adjustment under Texas law.",
    definition: "An aviation accident is a crash, hard landing, or in flight incident involving a commercial, charter, or private aircraft resulting in occupant or ground party injury. Federal aviation regulation governs pilot conduct, maintenance obligation, plus manufacturer liability connected toward the incident. Investigation frequently involves the National Transportation Safety Board, producing a formal finding tied toward probable cause. Injury severity typically reaches a catastrophic level given impact force carried by an aviation incident.",
    statistics: "Settlement value tied to an aviation accident claim shifts based on injury severity, liability apportionment (pilot, carrier, or manufacturer among parties), plus available insurance or corporate coverage limit. Claims involving a commercial carrier often carry substantially higher coverage limits compared toward a private aircraft claim. Federal preemption plus international treaty application (for an international flight) frequently shapes governing law.",
    documents: "Required documents supporting an aviation accident claim include a federal investigation report, medical treatment record, flight manifest, plus maintenance log connected toward the aircraft. Black box data, where recovered, strengthens causation proof presented during a claim. An aviation insurance declaration page confirms coverage limits carried by the operating carrier.",
    factors: "Settlement factors shifting aviation accident claim value include injury severity, liability apportionment across multiple parties, plus applicable federal or international law. Investigation findings carry substantial weight during negotiation given their formal evidentiary status, a consideration built into the Aviation Accident Settlement Calculator."
  },
  workplace: {
    title: "Workplace Accident Settlement Calculator",
    subtitle: "Office, warehouse, retail, or industrial injury events. Enter your case details below — Sutliff & Stout builds this estimate from documented economic loss, a pain-and-suffering multiplier, and a fault adjustment under Texas law.",
    definition: "A workplace accident is an injury event occurring during employment activity across an office, warehouse, retail, or industrial setting. Impact occurs through equipment malfunction, falling object, repetitive strain, or unsafe condition tied toward employer maintained premises. Workers compensation law typically governs the claim, though a third party liability claim can apply where a non employer party contributed toward the incident. Employer incident reporting generates a documented record tied toward injury circumstance.",
    statistics: "Settlement value tied to a workplace accident claim shifts based on injury severity, average weekly wage, plus applicable state workers compensation benefit schedule. A third party liability claim (against an equipment manufacturer among examples) can add compensation beyond standard workers compensation benefit. Industry type plus safety violation history often influence claim outcome patterns.",
    documents: "Required documents supporting a workplace accident claim include an employer incident report, medical treatment record, wage statement, plus safety inspection record where applicable. A witness statement from a coworker supports causation proof reviewed during a claim. A workers compensation insurance declaration confirms benefit availability connected toward the employer.",
    factors: "Settlement factors shifting workplace accident claim value include injury severity, average weekly wage, impairment rating, plus third party liability availability. Safety violation documentation strengthens a claim's negotiation position, a factor addressed within the Workplace Accident Settlement Calculator."
  },
  construction: {
    title: "Construction Accident Settlement Calculator",
    subtitle: "Scaffolding, falling objects, and subcontractor site incident events. Enter your case details below — Sutliff & Stout builds this estimate from documented economic loss, a pain-and-suffering multiplier, and a fault adjustment under Texas law.",
    definition: "A construction accident is an injury event occurring across a construction site, involving equipment operation, a fall from height, or a structural collapse. Impact occurs through scaffolding failure, unguarded excavation, or safety code violation tied toward general contractor or subcontractor conduct. Multiple liable parties (a general contractor, subcontractor, plus equipment manufacturer among examples) frequently complicate liability determination. Occupational Safety and Health Administration investigation often accompanies a serious site incident.",
    statistics: "Settlement value tied to a construction accident claim shifts based on injury severity, liability apportionment across multiple parties, plus available insurance coverage layered across each responsible party. Fall related incidents frequently carry higher severity given elevated impact force. Safety code violation documentation strengthens liability clarity during claim review.",
    documents: "Required documents supporting a construction accident claim include a site incident report, medical treatment record, safety inspection record, plus equipment maintenance log where applicable. Photograph evidence capturing site condition supports fault determination reviewed during a claim. Insurance declaration pages from each responsible party confirm combined coverage limits.",
    factors: "Settlement factors shifting construction accident claim value include injury severity, liability apportionment, safety code violation history, plus layered coverage across multiple parties. Multi party liability often extends negotiation complexity, a distinction reflected within the Construction Accident Settlement Calculator."
  },
  slipfall: {
    title: "Slip and Fall Settlement Calculator",
    subtitle: "Hazardous surface, wet floor, and walkway maintenance events. Enter your case details below — Sutliff & Stout builds this estimate from documented economic loss, a pain-and-suffering multiplier, and a fault adjustment under Texas law.",
    definition: "A slip and fall accident is an injury event occurring through a hazardous surface condition (a wet floor, uneven walkway, or debris among examples) present across a property maintained by another party. Premises liability law governs the claim, requiring proof that a property owner knew or reasonably should have known of the hazard. Impact severity often reflects fall height plus surface hardness at the incident location. An incident report filed with property management documents hazard condition plus fall circumstance.",
    statistics: "Settlement value tied to a slip and fall claim shifts based on injury severity, fault percentage, plus insurance policy limit carried by a property owner. Claims supported through a documented hazard notice history often settle faster given stronger liability clarity. Comparative fault argument tied toward visible hazard disregard frequently lowers an initial settlement offer.",
    documents: "Required documents supporting a slip and fall claim include a property incident report, medical treatment record, hazard photograph, plus maintenance or inspection log. A witness statement from a bystander supports causation proof reviewed during a claim. A commercial property insurance declaration page confirms coverage limits available toward compensation.",
    factors: "Settlement factors shifting slip and fall claim value include injury severity, fault percentage, hazard notice history, plus maintenance record completeness. Comparative fault argument tied toward the injured party's own conduct often requires active challenge, a consideration built into the Slip and Fall Settlement Calculator."
  },
  premises: {
    title: "Premises Liability Settlement Calculator",
    subtitle: "Unsafe property conditions, inadequate security, and hazard notice events. Enter your case details below — Sutliff & Stout builds this estimate from documented economic loss, a pain-and-suffering multiplier, and a fault adjustment under Texas law.",
    definition: "A premises liability accident is an injury event occurring through an unsafe property condition (inadequate security, structural defect, or hazardous walkway among examples) maintained by a property owner or occupier. Liability follows a duty of care standard tied toward the injured party's legal status (invitee, licensee, or trespasser). Impact severity varies widely given the broad range of underlying hazard types covered under this claim category. Property incident documentation, combined with a hazard history record, supports liability proof.",
    statistics: "Settlement value tied to a premises liability claim shifts based on injury severity, fault percentage, plus insurance policy limit carried by a property owner. Claims involving inadequate security following a criminal act often carry heightened litigation complexity. Prior incident history connected toward the same hazard strengthens notice argument during negotiation.",
    documents: "Required documents supporting a premises liability claim include a property incident report, medical treatment record, hazard photograph, plus prior incident history where available. Security footage, where available, strengthens causation plus notice proof presented during a claim. A property insurance declaration page confirms coverage limits available toward compensation.",
    factors: "Settlement factors shifting premises liability claim value include injury severity, fault percentage, notice history, plus the injured party's legal status at incident time. Hazard notice documentation carries substantial weight during negotiation, a factor accounted for within the Premises Liability Settlement Calculator."
  },
  dogbite: {
    title: "Dog Bite Settlement Calculator",
    subtitle: "Puncture wound, scarring, and homeowner insurance limits. Enter your case details below — Sutliff & Stout builds this estimate from documented economic loss, a pain-and-suffering multiplier, and a fault adjustment under Texas law.",
    definition: "A dog bite accident is an injury event caused through a dog attack occurring across a private property, public space, or roadway. Texas applies a strict liability standard toward an owner once prior knowledge of the dog's dangerous propensity gets established, layered against a negligence standard absent that knowledge. Injury severity frequently includes puncture wound, scarring, plus infection risk following the bite. Animal control response generates an incident report documenting bite location plus dog history.",
    statistics: "Settlement value tied to a dog bite claim shifts based on injury severity, scarring extent, plus homeowner or renter insurance policy limit carried by the dog's owner. Claims involving a documented prior bite history often settle faster given stronger liability clarity. Facial or hand injuries frequently carry higher value given disfigurement plus functional impact.",
    documents: "Required documents supporting a dog bite claim include an animal control incident report, medical treatment record, photograph of the wound, plus prior bite history where available. A homeowner or renter insurance declaration page confirms coverage limits available toward compensation. Witness statement supports causation proof reviewed during a claim.",
    factors: "Settlement factors shifting dog bite claim value include injury severity, scarring extent, prior bite history, plus insurance policy limit carried by the owner. Facial injury involving visible scarring often raises settlement value substantially, a consideration built into the Dog Bite Settlement Calculator."
  },
  medmal: {
    title: "Medical Malpractice Settlement Calculator",
    subtitle: "Standard of care breach, expert testimony, and statutory damage caps. Enter your case details below — Sutliff & Stout builds this estimate from documented economic loss, a pain-and-suffering multiplier, and a fault adjustment under Texas law.",
    definition: "A medical malpractice incident is an injury event resulting from a healthcare provider's deviation from an accepted standard of care during diagnosis, treatment, or surgical procedure. Texas applies a damage cap toward non economic loss under the Texas Medical Liability Act, distinguishing this claim category from a standard injury claim. A qualified expert report confirming standard of care breach is required before a claim proceeds under Texas statute. Injury severity ranges from a treatable complication toward a permanent or fatal outcome.",
    statistics: "Settlement value tied to a medical malpractice claim shifts based on injury severity, expert testimony strength, plus the applicable statutory damage cap governing non economic loss. Claims supported through a strong expert report often settle faster given clearer standard of care breach. Litigation timelines frequently extend longer compared toward a standard injury claim given expert discovery requirements.",
    documents: "Required documents supporting a medical malpractice claim include complete medical records, a qualified expert report, treatment timeline documentation, plus billing statement connected toward the disputed care. Peer review or hospital policy record, where obtainable, strengthens the standard of care argument. A medical malpractice insurance declaration page confirms coverage limits carried by the provider.",
    factors: "Settlement factors shifting medical malpractice claim value include injury severity, expert testimony strength, statutory damage cap application, plus provider insurance policy limit. Expert report quality carries decisive weight during negotiation, a factor addressed within the Medical Malpractice Settlement Calculator."
  },
  nursinghome: {
    title: "Nursing Home Abuse Settlement Calculator",
    subtitle: "Facility neglect, elder care violations, and citation records. Enter your case details below — Sutliff & Stout builds this estimate from documented economic loss, a pain-and-suffering multiplier, and a fault adjustment under Texas law.",
    definition: "A nursing home abuse incident is an injury event resulting from neglect, physical mistreatment, or inadequate care provided toward a resident within a long term care facility. Impact occurs through understaffing, medication error, or failure to prevent a fall or pressure ulcer tied toward facility conduct. State licensing regulation governs facility staffing ratio plus care standard, shaping liability determination during a claim. A state health agency investigation, combined with facility incident documentation, records the circumstance surrounding the injury.",
    statistics: "Settlement value tied to a nursing home abuse claim shifts based on injury severity, facility liability clarity, plus insurance policy limit carried by the operating company. Claims supported through a documented staffing violation often settle faster given stronger liability clarity. Repeated citation history connected toward a facility frequently strengthens negotiation leverage during a filed claim.",
    documents: "Required documents supporting a nursing home abuse claim include facility incident records, medical treatment record, staffing log, plus state health agency inspection history. Photograph evidence documenting injury conditions (a pressure ulcer or bruising among examples) supports causation proof. A facility insurance declaration page confirms coverage limits available toward compensation.",
    factors: "Settlement factors shifting nursing home abuse claim value include injury severity, facility citation history, staffing ratio documentation, plus insurance policy limit carried by the operator. Prior violation history carries substantial weight during negotiation, a consideration built into the Nursing Home Abuse Settlement Calculator."
  },
  product: {
    title: "Defective Product Settlement Calculator",
    subtitle: "Manufacturing flaws, design defects, and product recall events. Enter your case details below — Sutliff & Stout builds this estimate from documented economic loss, a pain-and-suffering multiplier, and a fault adjustment under Texas law.",
    definition: "A defective product incident is an injury event caused through a design flaw, manufacturing error, or inadequate warning connected toward a consumer product. Liability follows a strict liability standard applied toward a manufacturer, distributor, or retailer under Texas product liability law. Injury circumstance frequently involves a malfunction occurring during ordinary or foreseeable product use. A retained product sample, combined with a purchase record, supports causation proof during a claim.",
    statistics: "Settlement value tied to a defective product claim shifts based on injury severity, defect type (design, manufacturing, or warning among categories), plus insurance or corporate coverage limit carried by the manufacturer. Claims involving a recalled product often carry stronger liability clarity given documented defect acknowledgment. Multiple plaintiff claims connected toward the same defect frequently proceed through consolidated litigation.",
    documents: "Required documents supporting a defective product claim include the retained product, purchase receipt, medical treatment record, plus any applicable recall notice. Expert engineering evaluation, where obtained, strengthens defect causation proof presented during a claim. A manufacturer insurance declaration page confirms coverage limits available toward compensation.",
    factors: "Settlement factors shifting defective product claim value include injury severity, defect classification, recall status, plus manufacturer insurance policy limit. Product retention immediately following the incident carries decisive evidentiary weight, a factor accounted for within the Defective Product Settlement Calculator."
  },
  wrongfuldeath: {
    title: "Wrongful Death Settlement Calculator",
    subtitle: "Negligent, reckless, or intentional fatal injury events. Enter your case details below — Sutliff & Stout builds this estimate from documented economic loss, a pain-and-suffering multiplier, and a fault adjustment under Texas law.",
    definition: "A wrongful death incident is a fatal injury event resulting from another party's negligent, reckless, or intentional conduct, giving surviving family members a statutory claim. Texas law limits eligible claimants toward a surviving spouse, child, plus parent under the wrongful death statute. Damages extend across lost financial support, lost companionship, plus funeral expenses connected toward the deceased. A death certificate, combined with an underlying incident report, establishes the factual basis for the claim.",
    statistics: "Settlement value tied to a wrongful death claim shifts based on the deceased's earning capacity, liability clarity, plus insurance or corporate coverage limit carried by the at fault party. Claims involving a primary household earner often carry higher economic loss valuation. Litigation timelines frequently extend longer given the emotional plus evidentiary complexity carried by a fatality claim.",
    documents: "Required documents supporting a wrongful death claim include a death certificate, underlying incident report, income documentation connected toward the deceased, plus funeral expense record. Family relationship documentation confirms claimant eligibility under the governing statute. An insurance declaration page from the at fault party confirms coverage limits available toward compensation.",
    factors: "Settlement factors shifting wrongful death claim value include the deceased's earning capacity, liability clarity, surviving dependent count, plus insurance policy limit. Lost future income projection carries substantial weight during valuation, a distinction reflected within the Wrongful Death Settlement Calculator."
  },
  catastrophic: {
    title: "Catastrophic Injury Settlement Calculator",
    subtitle: "Permanent disability, disfigurement, and maximum medical improvement events. Enter your case details below — Sutliff & Stout builds this estimate from documented economic loss, a pain-and-suffering multiplier, and a fault adjustment under Texas law.",
    definition: "A catastrophic injury incident is a severe injury event resulting in permanent disability, disfigurement, or lasting impairment following an accident of any underlying type. Classification frequently covers a spinal cord injury, traumatic brain injury, amputation, or severe burn among examples. Long term care needs, lost earning capacity, plus permanent lifestyle limitations distinguish this category from a standard injury claim. Medical documentation confirming maximum medical improvement establishes the permanent impairment baseline.",
    statistics: "Settlement value tied to a catastrophic injury claim shifts based on impairment severity, projected life care cost, plus available insurance or corporate coverage limit. Claims involving lifelong care need often reach the highest valuation range compared toward other injury categories. Vocational expert testimony frequently supports lost earning capacity valuation within this claim type.",
    documents: "Required documents supporting a catastrophic injury claim include complete medical records, a life care plan, vocational expert evaluation, plus income documentation connected toward lost earning capacity. Physician projection confirming ongoing treatment needs strengthens future cost valuation. An insurance declaration page from every responsible party confirms combined coverage limits.",
    factors: "Settlement factors shifting catastrophic injury claim value include impairment severity, projected life care cost, lost earning capacity, plus combined insurance policy limit. Life care planning documentation carries decisive weight during valuation, a consideration built into the Catastrophic Injury Settlement Calculator."
  },
  burn: {
    title: "Burn Injury Settlement Calculator",
    subtitle: "Thermal, chemical, and electrical reconstructive surgery events. Enter your case details below — Sutliff & Stout builds this estimate from documented economic loss, a pain-and-suffering multiplier, and a fault adjustment under Texas law.",
    definition: "A burn injury incident is an injury event resulting from thermal, chemical, electrical, or radiation exposure connected toward a workplace, product, or premises hazard. Injury classification follows a degree scale, first through fourth degree, reflecting tissue damage depth plus surface area affected. Scarring, disfigurement, plus functional impairment frequently accompany a severe burn injury. Medical documentation, combined with a burn unit treatment record, establishes injury severity plus treatment course.",
    statistics: "Settlement value tied to a burn injury claim shifts based on burn degree, surface area affected, plus insurance or corporate coverage limit carried by the at fault party. Claims involving a third or fourth degree burn typically reach a substantially higher valuation given permanent scarring risk. Facial plus hand burns frequently carry elevated value given visible disfigurement plus functional loss.",
    documents: "Required documents supporting a burn injury claim include burn unit treatment records, photograph documentation, reconstructive surgery projection, plus wage loss verification. Expert medical testimony confirming long term scarring or functional impairment strengthens valuation. An insurance declaration page from the responsible party confirms coverage limits available toward compensation.",
    factors: "Settlement factors shifting burn injury claim value include burn degree, affected surface area, scarring extent, plus insurance policy limit. Reconstructive surgery projection carries substantial weight during valuation, a factor addressed within the Burn Injury Settlement Calculator."
  },
  spinalcord: {
    title: "Spinal Cord Injury Settlement Calculator",
    subtitle: "Paralysis, neurological trauma, and complete/incomplete spine injury events. Enter your case details below — Sutliff & Stout builds this estimate from documented economic loss, a pain-and-suffering multiplier, and a fault adjustment under Texas law.",
    definition: "A spinal cord injury incident is a severe injury event resulting in partial or complete loss of motor or sensory function following trauma toward the spine. Classification follows a completeness scale, distinguishing a complete injury (total function loss below the injury level) from an incomplete injury. Paralysis, chronic pain, plus lifelong mobility limitations frequently accompany this injury category. Medical imaging, combined with a neurological evaluation, confirms injury level plus completeness.",
    statistics: "Settlement value tied to a spinal cord injury claim shifts based on injury completeness, injury level (cervical, thoracic, or lumbar among locations), plus available insurance or corporate coverage limit. Claims involving complete paralysis typically reach the highest valuation range given lifelong care needs. Vocational expert testimony frequently supports lost earning capacity valuation within this claim type.",
    documents: "Required documents supporting a spinal cord injury claim include neurological evaluation records, imaging results, a life care plan, plus vocational expert assessment. Physician projection confirming mobility limitation plus ongoing care needs strengthens future cost valuation. An insurance declaration page from every responsible party confirms combined coverage limits.",
    factors: "Settlement factors shifting spinal cord injury claim value include injury completeness, injury level, projected life care cost, plus combined insurance policy limit. Mobility limitation documentation carries decisive weight during valuation, a consideration built into the Spinal Cord Injury Settlement Calculator."
  },
  tbi: {
    title: "Traumatic Brain Injury Settlement Calculator",
    subtitle: "Cognitive impairment, concussion, and neurological testing events. Enter your case details below — Sutliff & Stout builds this estimate from documented economic loss, a pain-and-suffering multiplier, and a fault adjustment under Texas law.",
    definition: "A traumatic brain injury incident is an injury event resulting from a blow, jolt, or penetrating trauma toward the head, disrupting normal brain function. Classification ranges from a mild concussion toward a severe injury involving lasting cognitive or physical impairment. Symptom onset sometimes delays following the initial incident, complicating early causation proof. Neurological evaluation, combined with imaging, confirms injury severity plus affected brain function.",
    statistics: "Settlement value tied to a traumatic brain injury claim shifts based on injury severity, cognitive impairment extent, plus available insurance or corporate coverage limit. Claims involving a severe injury with permanent cognitive impairment typically reach a substantially higher valuation. Delayed symptom onset frequently invites insurer skepticism absent prompt neurological evaluation.",
    documents: "Required documents supporting a traumatic brain injury claim include neurological evaluation records, imaging results, neuropsychological testing, plus a life care plan where applicable. Family or coworker testimony documenting cognitive or behavioral change strengthens causation proof. An insurance declaration page from the responsible party confirms coverage limits available toward compensation.",
    factors: "Settlement factors shifting traumatic brain injury claim value include injury severity, cognitive impairment extent, symptom documentation timing, plus insurance policy limit. Neuropsychological testing carries substantial weight during valuation, a factor accounted for within the Traumatic Brain Injury Settlement Calculator."
  },
  amputation: {
    title: "Amputation Injury Settlement Calculator",
    subtitle: "Surgical or traumatic loss of limb, prosthetics, and lost earning capacity. Enter your case details below — Sutliff & Stout builds this estimate from documented economic loss, a pain-and-suffering multiplier, and a fault adjustment under Texas law.",
    definition: "An amputation injury incident is an injury event resulting in the surgical or traumatic loss of a limb, digit, or other body part following an accident. Classification distinguishes a traumatic amputation (occurring at incident time) from a surgical amputation (performed following complication). Permanent disability, prosthetic need, plus lasting functional impairment accompany this injury category. Medical documentation, combined with a surgical record, confirms amputation level plus cause.",
    statistics: "Settlement value tied to an amputation injury claim shifts based on amputation level, prosthetic cost projection, plus available insurance or corporate coverage limit. Claims involving a lower limb amputation frequently carry substantial value given mobility loss plus prosthetic replacement cost. Vocational expert testimony often supports lost earning capacity valuation within this claim type.",
    documents: "Required documents supporting an amputation injury claim include surgical records, a prosthetic cost projection, vocational expert evaluation, plus income documentation. Physician projection confirming prosthetic replacement schedule strengthens future cost valuation. An insurance declaration page from every responsible party confirms combined coverage limits.",
    factors: "Settlement factors shifting amputation injury claim value include amputation level, prosthetic cost projection, lost earning capacity, plus combined insurance policy limit. Prosthetic replacement schedule documentation carries decisive weight during valuation, a consideration built into the Amputation Injury Settlement Calculator."
  },
  assault: {
    title: "Assault Injury Settlement Calculator",
    subtitle: "Intentional acts of violence, negligent security, and criminal conduct. Enter your case details below — Sutliff & Stout builds this estimate from documented economic loss, a pain-and-suffering multiplier, and a fault adjustment under Texas law.",
    definition: "An assault injury incident is an injury event resulting from an intentional act of violence, frequently occurring across a premises carrying inadequate security. Liability sometimes extends toward a property owner where foreseeable criminal conduct went unaddressed through reasonable security measures. Criminal proceeding against the assailant, where pursued, proceeds separately from a civil injury claim. A police report, combined with security footage, documents the incident.",
    statistics: "Settlement value tied to an assault injury claim shifts based on injury severity, property owner liability clarity, plus available insurance coverage limit. Claims involving documented prior criminal incidents at the same property often carry stronger negligent security liability. Assailant insolvency frequently shifts claim pursuit toward a property owner's liability coverage instead.",
    documents: "Required documents supporting an assault injury claim include a police report, medical treatment record, security footage where available, plus prior incident history connected toward the property. Expert security evaluation, where obtained, strengthens the negligent security argument. A property insurance declaration page confirms coverage limits available toward compensation.",
    factors: "Settlement factors shifting assault injury claim value include injury severity, property liability clarity, prior incident history, plus insurance policy limit. Negligent security documentation carries substantial weight during negotiation, a factor addressed within the Assault Injury Settlement Calculator."
  },
  swimmingpool: {
    title: "Swimming Pool Accident Settlement Calculator",
    subtitle: "Supervision adequacy, fencing failures, and drowning/brain injury events. Enter your case details below — Sutliff & Stout builds this estimate from documented economic loss, a pain-and-suffering multiplier, and a fault adjustment under Texas law.",
    definition: "A swimming pool accident is an injury or drowning event occurring across a residential, hotel, or public pool tied toward inadequate supervision, fencing failure, or maintenance defect. Premises liability law governs the claim, requiring proof that a property owner failed to maintain a reasonably safe pool condition. Injury severity frequently includes drowning, near drowning with brain injury, or a slip related fracture. An incident report, combined with a lifeguard or property staff statement, documents the circumstance.",
    statistics: "Settlement value tied to a swimming pool accident claim shifts based on injury severity, supervision adequacy, plus insurance policy limit carried by a property owner. Claims involving a child victim plus inadequate fencing often carry heightened liability given child safety statute application. Drowning related claims frequently reach a catastrophic valuation range given brain injury or fatality risk.",
    documents: "Required documents supporting a swimming pool accident claim include a property incident report, medical treatment record, fencing or barrier inspection record, plus witness statement. Photograph evidence documenting pool safety conditions supports fault determination reviewed during a claim. A property insurance declaration page confirms coverage limits available toward compensation.",
    factors: "Settlement factors shifting swimming pool accident claim value include injury severity, supervision adequacy, fencing compliance, plus insurance policy limit. Child safety statute compliance carries substantial weight during negotiation, a consideration built into the Swimming Pool Accident Settlement Calculator."
  }
};

const defaultValuesByTab: Record<string, { medical: number; wages: number; severity: "minor" | "moderate" | "severe" | "catastrophic" }> = {
  car: { medical: 9000, wages: 3000, severity: "moderate" },
  truck: { medical: 45000, wages: 12000, severity: "severe" },
  motorcycle: { medical: 35000, wages: 9000, severity: "severe" },
  bicycle: { medical: 15000, wages: 4000, severity: "moderate" },
  pedestrian: { medical: 25000, wages: 6000, severity: "severe" },
  rideshare: { medical: 12000, wages: 3500, severity: "moderate" },
  bus: { medical: 18000, wages: 5000, severity: "moderate" },
  boating: { medical: 22000, wages: 7000, severity: "moderate" },
  aviation: { medical: 120000, wages: 40000, severity: "catastrophic" },
  workplace: { medical: 28000, wages: 8000, severity: "severe" },
  construction: { medical: 40000, wages: 11000, severity: "severe" },
  slipfall: { medical: 8500, wages: 2500, severity: "minor" },
  premises: { medical: 14000, wages: 3800, severity: "moderate" },
  dogbite: { medical: 7500, wages: 1500, severity: "minor" },
  medmal: { medical: 85000, wages: 25000, severity: "severe" },
  nursinghome: { medical: 50000, wages: 5000, severity: "severe" },
  product: { medical: 30000, wages: 10000, severity: "severe" },
  wrongfuldeath: { medical: 60000, wages: 150000, severity: "catastrophic" },
  catastrophic: { medical: 180000, wages: 85000, severity: "catastrophic" },
  burn: { medical: 55000, wages: 1500, severity: "severe" },
  spinalcord: { medical: 250000, wages: 95000, severity: "catastrophic" },
  tbi: { medical: 90000, wages: 35000, severity: "severe" },
  amputation: { medical: 140000, wages: 60000, severity: "catastrophic" },
  assault: { medical: 16000, wages: 4500, severity: "moderate" },
  swimmingpool: { medical: 40000, wages: 8000, severity: "severe" }
};

const methodologySlides = [
  {
    num: "01/03",
    title: "Add documented economic damages",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14 2 14 8 20 8"/>
        <line x1="16" y1="13" x2="8" y2="13"/>
        <line x1="16" y1="17" x2="8" y2="17"/>
        <polyline points="10 9 9 9 8 9"/>
      </svg>
    ),
    description: "Economic damage documentation totals medical expense, lost wage amount, plus property damage cost connected to a specific claim. Verified billing statement, pay stub record, plus repair invoice supply the figures entered toward the calculation base. Future medical cost projection adds toward the total once a treating physician confirms ongoing care needs. A completed economic total forms the base figure that later steps adjust through multiplier application plus fault reduction.",
    calculation: {
      title: "Economic damages",
      items: [
        { label: "Medical bills", value: "$8,500" },
        { label: "Lost wages", value: "$3,200" }
      ],
      total: "$11,700"
    }
  },
  {
    num: "02/03",
    title: "Estimate Pain and Suffering Impact",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
        <line x1="12" y1="8" x2="12" y2="16"/>
        <line x1="8" y1="12" x2="16" y2="12"/>
      </svg>
    ),
    description: "Pain and suffering estimation applies a multiplier toward the economic damage total, reflecting injury severity plus recovery duration. A mild injury applies a lower multiplier near the bottom of a standard range. A severe or permanent injury applies a multiplier near the top of the range instead. Recovery duration, treatment intensity, plus lasting impairment shift multiplier selection upward or downward.",
    calculation: {
      title: "Pre-fault total",
      items: [
        { label: "Economic damages", value: "$11,700" },
        { label: "Pain & suffering multiplier", value: "x 3.0" }
      ],
      total: "$35,100"
    }
  },
  {
    num: "03/03",
    title: "Apply a Comparative Fault Adjustment",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="19" y1="5" x2="5" y2="19"/>
        <circle cx="6.5" cy="6.5" r="2.5"/>
        <circle cx="17.5" cy="17.5" r="2.5"/>
      </svg>
    ),
    description: "Comparative fault adjustment reduces the pre fault total through a percentage tied to responsibility assigned toward an injured party. A twenty percent fault assignment reduces total value by twenty percent under a proportional reduction rule. Texas bars recovery entirely once assigned fault crosses fifty percent under a modified comparative rule. The adjusted figure forms the final settlement range presented through the calculator output.",
    calculation: {
      title: "Estimated settlement",
      items: [
        { label: "Pre-fault total", value: "$35,100" },
        { label: "Comparative fault (20%)", value: "-$7,020" }
      ],
      total: "$28,080"
    }
  }
];

const customStateTexts: Record<string, { description: string; cities: { name: string; range: string }[] }> = {
  AL: {
    description: "Alabama accident settlement calculators apply a pure contributory negligence rule barring recovery once any fault percentage attaches toward an injured party under state statute. Filing deadline application sets a two year window from an incident date across a standard personal injury claim filed within Alabama. A standard vehicle collision claim carries no statutory cap toward compensatory damage under Alabama law. Birmingham, Montgomery, plus Mobile represent core Alabama cities carrying claim volume relevant toward venue specific settlement patterns, reviewed through the Alabama Settlement Calculator.",
    cities: [
      { name: "Birmingham", range: "$45,000 to $95,000" },
      { name: "Montgomery", range: "$38,000 to $80,000" },
      { name: "Mobile", range: "$40,000 to $85,000" }
    ]
  },
  AK: {
    description: "Alaska accident settlement calculators apply a pure comparative negligence rule, allowing recovery reduced proportionally regardless of an injured party's fault share under state statute. Filing deadline application sets a two year window from an incident date across a standard personal injury claim filed within Alaska. A standard vehicle collision claim carries no statutory cap toward compensatory damage under Alaska law. Anchorage, Fairbanks, plus Juneau represent core Alaska cities carrying claim volume relevant toward venue specific settlement patterns, reviewed through the Alaska Settlement Calculator.",
    cities: [
      { name: "Anchorage", range: "$42,000 to $90,000" },
      { name: "Fairbanks", range: "$35,000 to $75,000" },
      { name: "Juneau", range: "$33,000 to $72,000" }
    ]
  },
  AZ: {
    description: "Arizona accident settlement calculators apply a pure comparative negligence rule, allowing recovery reduced proportionally regardless of an injured party's fault share under state statute. Filing deadline application sets a two year window from an incident date across a standard personal injury claim filed within Arizona. A standard vehicle collision claim carries no statutory cap toward compensatory damage under Arizona law. Phoenix, Tucson, plus Mesa represent core Arizona cities carrying claim volume relevant toward venue specific settlement patterns, reviewed through the Arizona Settlement Calculator.",
    cities: [
      { name: "Phoenix", range: "$48,000 to $98,000" },
      { name: "Tucson", range: "$40,000 to $85,000" },
      { name: "Mesa", range: "$38,000 to $80,000" }
    ]
  },
  AR: {
    description: "Arkansas accident settlement calculators apply a modified comparative negligence rule barring recovery once assigned fault reaches 50 percent under state statute. Filing deadline application sets a three year window from an incident date across a standard personal injury claim filed within Arkansas. A standard vehicle collision claim carries no statutory cap toward compensatory damage under Arkansas law. Little Rock, Fayetteville, plus Fort Smith represent core Arkansas cities carrying claim volume relevant toward venue specific settlement patterns, reviewed through the Arkansas Settlement Calculator.",
    cities: [
      { name: "Little Rock", range: "$36,000 to $78,000" },
      { name: "Fayetteville", range: "$32,000 to $70,000" },
      { name: "Fort Smith", range: "$30,000 to $68,000" }
    ]
  },
  CA: {
    description: "California accident settlement calculators apply a pure comparative negligence rule, allowing recovery reduced proportionally regardless of an injured party's fault share under state statute. Filing deadline application sets a two year window from an incident date across a standard personal injury claim filed within California. Damage cap application applies toward medical malpractice claims under California's statutory limit on non economic loss. Los Angeles, San Diego, plus San Francisco represent core California cities carrying claim volume relevant toward venue specific settlement patterns, reviewed through the California Settlement Calculator.",
    cities: [
      { name: "Los Angeles", range: "$55,000 to $120,000" },
      { name: "San Diego", range: "$50,000 to $105,000" },
      { name: "San Francisco", range: "$52,000 to $110,000" }
    ]
  },
  CO: {
    description: "Colorado accident settlement calculators apply a modified comparative negligence rule barring recovery once assigned fault reaches 50 percent under state statute. Filing deadline application sets a two year window from an incident date across a standard personal injury claim, extended toward three years for a motor vehicle collision filed within Colorado. A standard vehicle collision claim carries no statutory cap toward compensatory damage under Colorado law. Denver, Colorado Springs, plus Aurora represent core Colorado cities carrying claim volume relevant toward venue specific settlement patterns, reviewed through the Colorado Settlement Calculator.",
    cities: [
      { name: "Denver", range: "$45,000 to $95,000" },
      { name: "Colorado Springs", range: "$38,000 to $82,000" },
      { name: "Aurora", range: "$37,000 to $80,000" }
    ]
  },
  CT: {
    description: "Connecticut accident settlement calculators apply a modified comparative negligence rule barring recovery once assigned fault exceeds 50 percent under state statute. Filing deadline application sets a two year window from an incident date across a standard personal injury claim filed within Connecticut. A standard vehicle collision claim carries no statutory cap toward compensatory damage under Connecticut law. Hartford, Bridgeport, plus New Haven represent core Connecticut cities carrying claim volume relevant toward venue specific settlement patterns, reviewed through the Connecticut Settlement Calculator.",
    cities: [
      { name: "Hartford", range: "$44,000 to $92,000" },
      { name: "Bridgeport", range: "$40,000 to $86,000" },
      { name: "New Haven", range: "$39,000 to $84,000" }
    ]
  },
  DE: {
    description: "Delaware accident settlement calculators apply a modified comparative negligence rule barring recovery once assigned fault exceeds the combined fault of the opposing party under state statute. Filing deadline application sets a two year window from an incident date across a standard personal injury claim, extending toward three years where the injury was not reasonably discoverable within Delaware. A standard vehicle collision claim carries no statutory cap toward compensatory damage under Delaware law. Wilmington, Dover, plus Newark represent core Delaware cities carrying claim volume relevant toward venue specific settlement patterns, reviewed through the Delaware Settlement Calculator.",
    cities: [
      { name: "Wilmington", range: "$41,000 to $88,000" },
      { name: "Dover", range: "$34,000 to $74,000" },
      { name: "Newark", range: "$33,000 to $72,000" }
    ]
  },
  FL: {
    description: "Florida accident settlement calculators apply a modified comparative negligence rule barring recovery once assigned fault exceeds 50 percent under state statute, with a pure comparative standard retained for medical malpractice claims. Filing deadline application sets a two year window from an incident date across a standard personal injury claim filed within Florida. Damage cap application applies toward specific claim categories under Florida's medical liability statute. Miami, Orlando, plus Tampa represent core Florida cities carrying claim volume relevant toward venue specific settlement patterns, reviewed through the Florida Settlement Calculator.",
    cities: [
      { name: "Miami", range: "$48,000 to $100,000" },
      { name: "Orlando", range: "$42,000 to $88,000" },
      { name: "Tampa", range: "$41,000 to $86,000" }
    ]
  },
  GA: {
    description: "Georgia accident settlement calculators apply a modified comparative negligence rule barring recovery once assigned fault reaches 50 percent under state statute. Filing deadline application sets a two year window from an incident date across a standard personal injury claim filed within Georgia. A standard vehicle collision claim carries no statutory cap toward compensatory damage under Georgia law. Atlanta, Augusta, plus Savannah represent core Georgia cities carrying claim volume relevant toward venue specific settlement patterns, reviewed through the Georgia Settlement Calculator.",
    cities: [
      { name: "Atlanta", range: "$46,000 to $96,000" },
      { name: "Augusta", range: "$35,000 to $76,000" },
      { name: "Savannah", range: "$36,000 to $78,000" }
    ]
  },
  HI: {
    description: "Hawaii accident settlement calculators apply a modified comparative negligence rule barring recovery once assigned fault exceeds the combined fault of all defendants under state statute. Filing deadline application sets a two year window from an incident date across a standard personal injury claim filed within Hawaii. A standard vehicle collision claim carries no statutory cap toward compensatory damage under Hawaii law. Honolulu, Hilo, plus Kailua represent core Hawaii cities carrying claim volume relevant toward venue specific settlement patterns, reviewed through the Hawaii Settlement Calculator.",
    cities: [
      { name: "Honolulu", range: "$47,000 to $98,000" },
      { name: "Hilo", range: "$33,000 to $70,000" },
      { name: "Kailua", range: "$34,000 to $72,000" }
    ]
  },
  ID: {
    description: "Idaho accident settlement calculators apply a modified comparative negligence rule barring recovery once assigned fault reaches 50 percent under state statute. Filing deadline application sets a two year window from an incident date across a standard personal injury claim filed within Idaho. A standard vehicle collision claim carries no statutory cap toward compensatory damage under Idaho law. Boise, Nampa, plus Idaho Falls represent core Idaho cities carrying claim volume relevant toward venue specific settlement patterns, reviewed through the Idaho Settlement Calculator.",
    cities: [
      { name: "Boise", range: "$37,000 to $80,000" },
      { name: "Nampa", range: "$31,000 to $68,000" },
      { name: "Idaho Falls", range: "$30,000 to $66,000" }
    ]
  },
  IL: {
    description: "Illinois accident settlement calculators apply a modified comparative negligence rule barring recovery once assigned fault exceeds 50 percent under state statute. Filing deadline application sets a two year window from an incident date across a standard personal injury claim filed within Illinois. A standard vehicle collision claim carries no statutory cap toward compensatory damage under Illinois law. Chicago, Aurora, plus Naperville represent core Illinois cities carrying claim volume relevant toward venue specific settlement patterns, reviewed through the Illinois Settlement Calculator.",
    cities: [
      { name: "Chicago", range: "$50,000 to $105,000" },
      { name: "Aurora", range: "$37,000 to $80,000" },
      { name: "Naperville", range: "$38,000 to $82,000" }
    ]
  },
  IN: {
    description: "Indiana accident settlement calculators apply a modified comparative negligence rule barring recovery once assigned fault exceeds 50 percent under state statute. Filing deadline application sets a two year window from an incident date across a standard personal injury claim filed within Indiana. Damage cap application applies toward medical malpractice claims under Indiana's statutory limit. Indianapolis, Fort Wayne, plus Evansville represent core Indiana cities carrying claim volume relevant toward venue specific settlement patterns, reviewed through the Indiana Settlement Calculator.",
    cities: [
      { name: "Indianapolis", range: "$43,000 to $90,000" },
      { name: "Fort Wayne", range: "$34,000 to $74,000" },
      { name: "Evansville", range: "$32,000 to $70,000" }
    ]
  },
  IA: {
    description: "Iowa accident settlement calculators apply a modified comparative negligence rule barring recovery once assigned fault exceeds 50 percent under state statute. Filing deadline application sets a two year window from an incident date across a standard personal injury claim filed within Iowa. A standard vehicle collision claim carries no statutory cap toward compensatory damage under Iowa law. Des Moines, Cedar Rapids, plus Davenport represent core Iowa cities carrying claim volume relevant toward venue specific settlement patterns, reviewed through the Iowa Settlement Calculator.",
    cities: [
      { name: "Des Moines", range: "$38,000 to $82,000" },
      { name: "Cedar Rapids", range: "$33,000 to $72,000" },
      { name: "Davenport", range: "$32,000 to $70,000" }
    ]
  },
  KS: {
    description: "Kansas accident settlement calculators apply a modified comparative negligence rule barring recovery once assigned fault reaches 50 percent under state statute. Filing deadline application sets a two year window from an incident date across a standard personal injury claim filed within Kansas. A standard vehicle collision claim carries no statutory cap toward compensatory damage under Kansas law. Wichita, Overland Park, plus Kansas City represent core Kansas cities carrying claim volume relevant toward venue specific settlement patterns, reviewed through the Kansas Settlement Calculator.",
    cities: [
      { name: "Wichita", range: "$37,000 to $80,000" },
      { name: "Overland Park", range: "$39,000 to $84,000" },
      { name: "Kansas City", range: "$38,000 to $82,000" }
    ]
  },
  KY: {
    description: "Kentucky accident settlement calculators apply a pure comparative negligence rule, allowing recovery reduced proportionally regardless of an injured party's fault share under state statute. Filing deadline application sets a one year window from an incident date across a standard personal injury claim filed within Kentucky. A standard vehicle collision claim carries no statutory cap toward compensatory damage under Kentucky law. Louisville, Lexington, plus Bowling Green represent core Kentucky cities carrying claim volume relevant toward venue specific settlement patterns, reviewed through the Kentucky Settlement Calculator.",
    cities: [
      { name: "Louisville", range: "$41,000 to $88,000" },
      { name: "Lexington", range: "$36,000 to $78,000" },
      { name: "Bowling Green", range: "$30,000 to $66,000" }
    ]
  },
  LA: {
    description: "Louisiana accident settlement calculators apply a modified comparative negligence rule barring recovery once assigned fault exceeds 50 percent under state statute, following a 2025 legislative shift away from a pure comparative standard. Filing deadline application sets a two year window from an incident date across a standard personal injury claim filed within Louisiana, following a 2024 extension from a prior one year period. A standard vehicle collision claim carries no statutory cap toward compensatory damage under Louisiana law. New Orleans, Baton Rouge, plus Shreveport represent core Louisiana cities carrying claim volume relevant toward venue specific settlement patterns, reviewed through the Louisiana Settlement Calculator.",
    cities: [
      { name: "New Orleans", range: "$44,000 to $92,000" },
      { name: "Baton Rouge", range: "$38,000 to $82,000" },
      { name: "Shreveport", range: "$34,000 to $74,000" }
    ]
  },
  ME: {
    description: "Maine accident settlement calculators apply a modified comparative negligence rule barring recovery once assigned fault reaches 50 percent under state statute. Filing a deadline application sets a six year window from an incident date across a standard personal injury claim filed within Maine, longer than the deadline applied across most other states. A standard vehicle collision claim carries no statutory cap toward compensatory damage under Maine law. Portland, Lewiston, plus Bangor represent core Maine cities carrying claim volume relevant toward venue specific settlement patterns, reviewed through the Maine Settlement Calculator.",
    cities: [
      { name: "Portland", range: "$36,000 to $78,000" },
      { name: "Lewiston", range: "$28,000 to $62,000" },
      { name: "Bangor", range: "$29,000 to $64,000" }
    ]
  },
  MD: {
    description: "Maryland accident settlement calculators apply a pure contributory negligence rule barring recovery once any fault percentage attaches toward an injured party under state statute, with a comparative exception recently added for a vulnerable road user. Filing deadline application sets a three year window from an incident date across a standard personal injury claim filed within Maryland. Damage cap application applies toward non economic loss under Maryland's statutory limit. Baltimore, Columbia, plus Silver Spring represent core Maryland cities carrying claim volume relevant toward venue specific settlement patterns, reviewed through the Maryland Settlement Calculator.",
    cities: [
      { name: "Baltimore", range: "$42,000 to $90,000" },
      { name: "Columbia", range: "$37,000 to $80,000" },
      { name: "Silver Spring", range: "$38,000 to $82,000" }
    ]
  },
  MA: {
    description: "Massachusetts accident settlement calculators apply a modified comparative negligence rule barring recovery once assigned fault exceeds 50 percent under state statute. Filing deadline application sets a three year window from an incident date across a standard personal injury claim filed within Massachusetts. A standard vehicle collision claim carries no statutory cap toward compensatory damage under Massachusetts law. Boston, Worcester, plus Springfield represent core Massachusetts cities carrying claim volume relevant toward venue specific settlement patterns, reviewed through the Massachusetts Settlement Calculator.",
    cities: [
      { name: "Boston", range: "$50,000 to $105,000" },
      { name: "Worcester", range: "$38,000 to $82,000" },
      { name: "Springfield", range: "$36,000 to $78,000" }
    ]
  },
  MI: {
    description: "Michigan accident settlement calculators apply a modified comparative negligence rule barring recovery once assigned fault exceeds 50 percent under state statute. Filing deadline application sets a three year window from an incident date across a standard personal injury claim filed within Michigan. Damage cap application applies toward non economic loss under Michigan's medical malpractice statute. Detroit, Grand Rapids, plus Ann Arbor represent core Michigan cities carrying claim volume relevant toward venue specific settlement patterns, reviewed through the Michigan Settlement Calculator.",
    cities: [
      { name: "Detroit", range: "$44,000 to $92,000" },
      { name: "Grand Rapids", range: "$37,000 to $80,000" },
      { name: "Ann Arbor", range: "$39,000 to $84,000" }
    ]
  },
  MN: {
    description: "Minnesota accident settlement calculators apply a modified comparative negligence rule barring recovery once assigned fault exceeds 50 percent under state statute. Filing deadline application sets a six year window from an incident date across a standard personal injury claim filed within Minnesota. Damage cap application applies toward specific claim categories under Minnesota's medical malpractice statute. Minneapolis, St. Paul, plus Rochester represent core Minnesota cities carrying claim volume relevant toward venue specific settlement patterns, reviewed through the Minnesota Settlement Calculator.",
    cities: [
      { name: "Minneapolis", range: "$45,000 to $94,000" },
      { name: "St. Paul", range: "$41,000 to $88,000" },
      { name: "Rochester", range: "$35,000 to $76,000" }
    ]
  },
  MS: {
    description: "Mississippi accident settlement calculators apply a pure comparative negligence rule, allowing recovery reduced proportionally regardless of an injured party's fault share under state statute. Filing deadline application sets a three year window from an incident date across a standard personal injury claim filed within Mississippi. Damage cap application applies toward non economic loss under Mississippi's medical malpractice statute. Jackson, Gulfport, plus Southaven represent core Mississippi cities carrying claim volume relevant toward venue specific settlement patterns, reviewed through the Mississippi Settlement Calculator.",
    cities: [
      { name: "Jackson", range: "$34,000 to $74,000" },
      { name: "Gulfport", range: "$31,000 to $68,000" },
      { name: "Southaven", range: "$30,000 to $66,000" }
    ]
  },
  MO: {
    description: "Missouri accident settlement calculators apply a pure comparative negligence rule, allowing recovery reduced proportionally regardless of an injured party's fault share under state statute. Filing deadline application sets a five year window from an incident date across a standard personal injury claim filed within Missouri. Damage cap application applies toward non economic loss under Missouri's medical malpractice statute. Kansas City, St. Louis, plus Springfield represent core Missouri cities carrying claim volume relevant toward venue specific settlement patterns, reviewed through the Missouri Settlement Calculator.",
    cities: [
      { name: "Kansas City", range: "$40,000 to $86,000" },
      { name: "St. Louis", range: "$42,000 to $90,000" },
      { name: "Springfield", range: "$33,000 to $72,000" }
    ]
  },
  MT: {
    description: "Montana accident settlement calculators apply a modified comparative negligence rule barring recovery once assigned fault exceeds 50 percent under state statute. Filing deadline application sets a three year window from an incident date across a standard personal injury claim filed within Montana. A standard vehicle collision claim carries no statutory cap toward compensatory damage under Montana law. Billings, Missoula, plus Great Falls represent core Montana cities carrying claim volume relevant toward venue specific settlement patterns, reviewed through the Montana Settlement Calculator.",
    cities: [
      { name: "Billings", range: "$34,000 to $74,000" },
      { name: "Missoula", range: "$32,000 to $70,000" },
      { name: "Great Falls", range: "$30,000 to $66,000" }
    ]
  },
  NE: {
    description: "Nebraska accident settlement calculators apply a modified comparative negligence rule barring recovery once assigned fault reaches 50 percent under state statute. Filing deadline application sets a four year window from an incident date across a standard personal injury claim filed within Nebraska. A standard vehicle collision claim carries no statutory cap toward compensatory damage under Nebraska law. Omaha, Lincoln, plus Bellevue represent core Nebraska cities carrying claim volume relevant toward venue specific settlement patterns, reviewed through the Nebraska Settlement Calculator.",
    cities: [
      { name: "Omaha", range: "$38,000 to $82,000" },
      { name: "Lincoln", range: "$34,000 to $74,000" },
      { name: "Bellevue", range: "$31,000 to $68,000" }
    ]
  },
  NV: {
    description: "Nevada accident settlement calculators apply a modified comparative negligence rule barring recovery once assigned fault exceeds 50 percent under state statute. Filing deadline application sets a two year window from an incident date across a standard personal injury claim filed within Nevada. Damage cap application applies toward non economic loss under Nevada's medical malpractice statute. Las Vegas, Reno, plus Henderson represent core Nevada cities carrying claim volume relevant toward venue specific settlement patterns, reviewed through the Nevada Settlement Calculator.",
    cities: [
      { name: "Las Vegas", range: "$46,000 to $96,000" },
      { name: "Reno", range: "$38,000 to $82,000" },
      { name: "Henderson", range: "$39,000 to $84,000" }
    ]
  },
  NH: {
    description: "New Hampshire accident settlement calculators apply a modified comparative negligence rule barring recovery once assigned fault exceeds 50 percent under state statute. Filing deadline application sets a three year window from an incident date across a standard personal injury claim filed within New Hampshire. A standard vehicle collision claim carries no statutory cap toward compensatory damage under New Hampshire law. Manchester, Nashua, plus Concord represent core New Hampshire cities carrying claim volume relevant toward venue specific settlement patterns, reviewed through the New Hampshire Settlement Calculator.",
    cities: [
      { name: "Manchester", range: "$37,000 to $80,000" },
      { name: "Nashua", range: "$35,000 to $76,000" },
      { name: "Concord", range: "$32,000 to $70,000" }
    ]
  },
  NJ: {
    description: "New Jersey accident settlement calculators apply a modified comparative negligence rule barring recovery once assigned fault exceeds 50 percent under state statute. Filing deadline application sets a two year window from an incident date across a standard personal injury claim filed within New Jersey. A standard vehicle collision claim carries no statutory cap toward compensatory damage under New Jersey law. Newark, Jersey City, plus Trenton represent core New Jersey cities carrying claim volume relevant toward venue specific settlement patterns, reviewed through the New Jersey Settlement Calculator.",
    cities: [
      { name: "Newark", range: "$46,000 to $96,000" },
      { name: "Jersey City", range: "$44,000 to $92,000" },
      { name: "Trenton", range: "$38,000 to $82,000" }
    ]
  },
  NM: {
    description: "New Mexico accident settlement calculators apply a pure comparative negligence rule, allowing recovery reduced proportionally regardless of an injured party's fault share under state statute. Filing deadline application sets a three year window from an incident date across a standard personal injury claim filed within New Mexico. A standard vehicle collision claim carries no statutory cap toward compensatory damage under New Mexico law. Albuquerque, Las Cruces, plus Santa Fe represent core New Mexico cities carrying claim volume relevant toward venue specific settlement patterns, reviewed through the New Mexico Settlement Calculator.",
    cities: [
      { name: "Albuquerque", range: "$39,000 to $84,000" },
      { name: "Las Cruces", range: "$32,000 to $70,000" },
      { name: "Santa Fe", range: "$33,000 to $72,000" }
    ]
  },
  NY: {
    description: "New York accident settlement calculators apply a pure comparative negligence rule, allowing recovery reduced proportionally regardless of an injured party's fault share under state statute. Filing deadline application sets a three year window from an incident date across a standard personal injury claim filed within New York. A standard vehicle collision claim carries no statutory cap toward compensatory damage under New York law. New York City, Buffalo, plus Rochester represent core New York cities carrying claim volume relevant toward venue specific settlement patterns, reviewed through the New York Settlement Calculator.",
    cities: [
      { name: "New York City", range: "$55,000 to $115,000" },
      { name: "Buffalo", range: "$38,000 to $82,000" },
      { name: "Rochester", range: "$37,000 to $80,000" }
    ]
  },
  NC: {
    description: "North Carolina accident settlement calculators apply a pure contributory negligence rule barring recovery once any fault percentage attaches toward an injured party under state statute, with a comparative exception recently added for a vulnerable road user. Filing deadline application sets a three year window from an incident date across a standard personal injury claim filed within North Carolina. A standard vehicle collision claim carries no statutory cap toward compensatory damage under North Carolina law. Charlotte, Raleigh, plus Greensboro represent core North Carolina cities carrying claim volume relevant toward venue specific settlement patterns, reviewed through the North Carolina Settlement Calculator.",
    cities: [
      { name: "Charlotte", range: "$43,000 to $90,000" },
      { name: "Raleigh", range: "$41,000 to $88,000" },
      { name: "Greensboro", range: "$34,000 to $74,000" }
    ]
  },
  ND: {
    description: "North Dakota accident settlement calculators apply a modified comparative negligence rule barring recovery once assigned fault reaches 50 percent under state statute. Filing a deadline application sets a six year window from an incident date across a standard personal injury claim filed within North Dakota, longer than the deadline applied across most other states. A standard vehicle collision claim carries no statutory cap toward compensatory damage under North Dakota law. Fargo, Bismarck, plus Grand Forks represent core North Dakota cities carrying claim volume relevant toward venue specific settlement patterns, reviewed through the North Dakota Settlement Calculator.",
    cities: [
      { name: "Fargo", range: "$32,000 to $70,000" },
      { name: "Bismarck", range: "$29,000 to $64,000" },
      { name: "Grand Forks", range: "$28,000 to $62,000" }
    ]
  },
  OH: {
    description: "Ohio accident settlement calculators apply a modified comparative negligence rule barring recovery once assigned fault exceeds 50 percent under state statute. Filing deadline application sets a two year window from an incident date across a standard personal injury claim filed within Ohio. Damage cap application applies toward non economic loss under Ohio's statutory limit. Columbus, Cleveland, plus Cincinnati represent core Ohio cities carrying claim volume relevant toward venue specific settlement patterns, reviewed through the Ohio Settlement Calculator.",
    cities: [
      { name: "Columbus", range: "$41,000 to $88,000" },
      { name: "Cleveland", range: "$40,000 to $86,000" },
      { name: "Cincinnati", range: "$39,000 to $84,000" }
    ]
  },
  OK: {
    description: "Oklahoma accident settlement calculators apply a modified comparative negligence rule barring recovery once assigned fault exceeds 50 percent under state statute. Filing deadline application sets a two year window from an incident date across a standard personal injury claim filed within Oklahoma. A standard vehicle collision claim carries no statutory cap toward compensatory damage under Oklahoma law. Oklahoma City, Tulsa, plus Norman represent core Oklahoma cities carrying claim volume relevant toward venue specific settlement patterns, reviewed through the Oklahoma Settlement Calculator.",
    cities: [
      { name: "Oklahoma City", range: "$37,000 to $80,000" },
      { name: "Tulsa", range: "$36,000 to $78,000" },
      { name: "Norman", range: "$31,000 to $68,000" }
    ]
  },
  OR: {
    description: "Oregon accident settlement calculators apply a modified comparative negligence rule barring recovery once assigned fault exceeds 50 percent under state statute. Filing deadline application sets a two year window from an incident date across a standard personal injury claim filed within Oregon. A standard vehicle collision claim carries no statutory cap toward compensatory damage under Oregon law. Portland, Salem, plus Eugene represent core Oregon cities carrying claim volume relevant toward venue specific settlement patterns, reviewed through the Oregon Settlement Calculator.",
    cities: [
      { name: "Portland", range: "$44,000 to $92,000" },
      { name: "Salem", range: "$34,000 to $74,000" },
      { name: "Eugene", range: "$35,000 to $76,000" }
    ]
  },
  PA: {
    description: "Pennsylvania accident settlement calculators apply a modified comparative negligence rule barring recovery once assigned fault exceeds 50 percent under state statute. Filing deadline application sets a two year window from an incident date across a standard personal injury claim filed within Pennsylvania. Damage cap application applies toward specific claim categories under Pennsylvania's medical malpractice statute. Philadelphia, Pittsburgh, plus Allentown represent core Pennsylvania cities carrying claim volume relevant toward venue specific settlement patterns, reviewed through the Pennsylvania Settlement Calculator.",
    cities: [
      { name: "Philadelphia", range: "$47,000 to $98,000" },
      { name: "Pittsburgh", range: "$41,000 to $88,000" },
      { name: "Allentown", range: "$35,000 to $76,000" }
    ]
  },
  RI: {
    description: "Rhode Island accident settlement calculators apply a pure comparative negligence rule, allowing recovery reduced proportionally regardless of an injured party's fault share under state statute. Filing deadline application sets a three year window from an incident date across a standard personal injury claim filed within Rhode Island. A standard vehicle collision claim carries no statutory cap toward compensatory damage under Rhode Island law. Providence, Warwick, plus Cranston represent core Rhode Island cities carrying claim volume relevant toward venue specific settlement patterns, reviewed through the Rhode Island Settlement Calculator.",
    cities: [
      { name: "Providence", range: "$40,000 to $86,000" },
      { name: "Warwick", range: "$34,000 to $74,000" },
      { name: "Cranston", range: "$33,000 to $72,000" }
    ]
  },
  SC: {
    description: "South Carolina accident settlement calculators apply a modified comparative negligence rule barring recovery once assigned fault exceeds 50 percent under state statute. Filing deadline application sets a three year window from an incident date across a standard personal injury claim filed within South Carolina. A standard vehicle collision claim carries no statutory cap toward compensatory damage under South Carolina law. Columbia, Charleston, plus Greenville represent core South Carolina cities carrying claim volume relevant toward venue specific settlement patterns, reviewed through the South Carolina Settlement Calculator.",
    cities: [
      { name: "Columbia", range: "$37,000 to $80,000" },
      { name: "Charleston", range: "$39,000 to $84,000" },
      { name: "Greenville", range: "$35,000 to $76,000" }
    ]
  },
  SD: {
    description: "South Dakota accident settlement calculators apply a slight versus gross negligence rule, allowing recovery only once an injured party's fault registers as slight compared toward a defendant's gross negligence under state statute. Filing deadline application sets a three year window from an incident date across a standard personal injury claim filed within South Dakota. A standard vehicle collision claim carries no statutory cap toward compensatory damage under South Dakota law. Sioux Falls, Rapid City, plus Aberdeen represent core South Dakota cities carrying claim volume relevant toward venue specific settlement patterns, reviewed through the South Dakota Settlement Calculator.",
    cities: [
      { name: "Sioux Falls", range: "$33,000 to $72,000" },
      { name: "Rapid City", range: "$30,000 to $66,000" },
      { name: "Aberdeen", range: "$27,000 to $60,000" }
    ]
  },
  TN: {
    description: "Tennessee accident settlement calculators apply a modified comparative negligence rule barring recovery once assigned fault reaches 50 percent under state statute. Filing deadline application sets a one year window from an incident date across a standard personal injury claim filed within Tennessee. Damage cap application applies toward non economic loss under Tennessee's statutory limit. Nashville, Memphis, plus Knoxville represent core Tennessee cities carrying claim volume relevant toward venue specific settlement patterns, reviewed through the Tennessee Settlement Calculator.",
    cities: [
      { name: "Nashville", range: "$42,000 to $90,000" },
      { name: "Memphis", range: "$39,000 to $84,000" },
      { name: "Knoxville", range: "$34,000 to $74,000" }
    ]
  },
  TX: {
    description: "Texas accident settlement calculators apply a modified comparative fault rule barring recovery once assigned fault crosses 50 percent under state statute. Filing deadline application sets a two year window from an incident date across a standard personal injury claim filed within Texas. Damage cap application applies toward specific claim categories, medical malpractice claims included under the Texas Medical Liability Act. Houston, Dallas, plus San Antonio represent core Texas cities carrying claim volume relevant toward venue specific settlement patterns, reviewed through the Texas Settlement Calculator.",
    cities: [
      { name: "Houston", range: "$48,000 to $100,000" },
      { name: "Dallas", range: "$46,000 to $96,000" },
      { name: "San Antonio", range: "$42,000 to $90,000" }
    ]
  },
  UT: {
    description: "Utah accident settlement calculators apply a modified comparative negligence rule barring recovery once assigned fault reaches 50 percent under state statute. Filing deadline application sets a four year window from an incident date across a standard personal injury claim filed within Utah. A standard vehicle collision claim carries no statutory cap toward compensatory damage under Utah law. Salt Lake City, Provo, plus West Valley City represent core Utah cities carrying claim volume relevant toward venue specific settlement patterns, reviewed through the Utah Settlement Calculator.",
    cities: [
      { name: "Salt Lake City", range: "$40,000 to $86,000" },
      { name: "Provo", range: "$32,000 to $70,000" },
      { name: "West Valley City", range: "$33,000 to $72,000" }
    ]
  },
  VT: {
    description: "Vermont accident settlement calculators apply a modified comparative negligence rule barring recovery once assigned fault exceeds 50 percent under state statute. Filing deadline application sets a three year window from an incident date across a standard personal injury claim filed within Vermont. A standard vehicle collision claim carries no statutory cap toward compensatory damage under Vermont law. Burlington, South Burlington, plus Rutland represent core Vermont cities carrying claim volume relevant toward venue specific settlement patterns, reviewed through the Vermont Settlement Calculator.",
    cities: [
      { name: "Burlington", range: "$34,000 to $74,000" },
      { name: "South Burlington", range: "$32,000 to $70,000" },
      { name: "Rutland", range: "$28,000 to $62,000" }
    ]
  },
  VA: {
    description: "Virginia accident settlement calculators apply a pure contributory negligence rule barring recovery once any fault percentage attaches toward an injured party under state statute. Filing deadline application sets a two year window from an incident date across a standard personal injury claim filed within Virginia. A standard vehicle collision claim carries no statutory cap toward compensatory damage under Virginia law. Virginia Beach, Richmond, plus Norfolk represent core Virginia cities carrying claim volume relevant toward venue specific settlement patterns, reviewed through the Virginia Settlement Calculator.",
    cities: [
      { name: "Virginia Beach", range: "$41,000 to $88,000" },
      { name: "Richmond", range: "$40,000 to $86,000" },
      { name: "Norfolk", range: "$37,000 to $80,000" }
    ]
  },
  WA: {
    description: "Washington accident settlement calculators apply a pure comparative negligence rule, allowing recovery reduced proportionally regardless of an injured party's fault share under state statute. Filing deadline application sets a three year window from an incident date across a standard personal injury claim filed within Washington. A standard vehicle collision claim carries no statutory cap toward compensatory damage under Washington law. Seattle, Spokane, plus Tacoma represent core Washington cities carrying claim volume relevant toward venue specific settlement patterns, reviewed through the Washington Settlement Calculator.",
    cities: [
      { name: "Seattle", range: "$49,000 to $102,000" },
      { name: "Spokane", range: "$37,000 to $80,000" },
      { name: "Tacoma", range: "$39,000 to $84,000" }
    ]
  },
  WV: {
    description: "West Virginia accident settlement calculators apply a modified comparative negligence rule barring recovery once assigned fault exceeds the combined fault of all other responsible parties under state statute. Filing deadline application sets a two year window from an incident date across a standard personal injury claim filed within West Virginia. Damage cap application applies toward non economic loss under West Virginia's medical malpractice statute. Charleston, Huntington, plus Morgantown represent core West Virginia cities carrying claim volume relevant toward venue specific settlement patterns, reviewed through the West Virginia Settlement Calculator.",
    cities: [
      { name: "Charleston", range: "$34,000 to $74,000" },
      { name: "Huntington", range: "$30,000 to $66,000" },
      { name: "Morgantown", range: "$29,000 to $64,000" }
    ]
  },
  WI: {
    description: "Wisconsin accident settlement calculators apply a modified comparative negligence rule barring recovery once assigned fault exceeds 50 percent under state statute. Filing deadline application sets a three year window from an incident date across a standard personal injury claim filed within Wisconsin. A standard vehicle collision claim carries no statutory cap toward compensatory damage under Wisconsin law. Milwaukee, Madison, plus Green Bay represent core Wisconsin cities carrying claim volume relevant toward venue specific settlement patterns, reviewed through the Wisconsin Settlement Calculator.",
    cities: [
      { name: "Milwaukee", range: "$41,000 to $88,000" },
      { name: "Madison", range: "$38,000 to $82,000" },
      { name: "Green Bay", range: "$33,000 to $72,000" }
    ]
  },
  WY: {
    description: "Wyoming accident settlement calculators apply a modified comparative negligence rule barring recovery once assigned fault reaches 50 percent under state statute. Filing deadline application sets a four year window from an incident date across a standard personal injury claim filed within Wyoming. A standard vehicle collision claim carries no statutory cap toward compensatory damage under Wyoming law. Cheyenne, Casper, plus Laramie represent core Wyoming cities carrying claim volume relevant toward venue specific settlement patterns, reviewed through the Wyoming Settlement Calculator.",
    cities: [
      { name: "Cheyenne", range: "$32,000 to $70,000" },
      { name: "Casper", range: "$30,000 to $66,000" },
      { name: "Laramie", range: "$28,000 to $62,000" }
    ]
  }
};

interface FaqTable {
  headers: string[];
  rows: string[][];
}

interface FaqItem {
  id: string;
  question: string;
  text: string;
  tag?: "h2" | "h3" | "h4";
  listItems?: { label: string; content: string }[];
  diagram?: string & {};
  table?: FaqTable;
}

interface FaqCategory {
  id: string;
  title: string;
  shortTitle: string;
  tooltip: string;
  items: FaqItem[];
}

const faqCategoryData: FaqCategory[] = [
  {
    id: "calc-process",
    title: "Accident Settlement Calculation Process",
    shortTitle: "Calculation Process",
    tooltip: "Overview of economic damage totaling, non-economic multipliers, legal adjustments, and case-specific valuation steps.",
    items: [
      {
        id: "calc-1",
        question: "How Is Settlement Calculated",
        text: "Settlement is calculated by evaluating the total economic damages, estimating the value of non-economic damages, and adjusting the result for any applicable legal and case-specific factors. Economic damages include documented medical expenses, lost wages, property damage, and other financial losses resulting from the injury. Non-economic damages, including pain and suffering, are often estimated using methods such as the multiplier or per diem approach when appropriate. Comparative fault, insurance policy limits, available evidence, and other legal factors may increase or reduce the final settlement value depending on the circumstances of the claim.",
        diagram: "process-diagram-1"
      },
      {
        id: "calc-2",
        question: "How Is Settlement Value Calculated",
        text: "Settlement value is calculated by evaluating the total economic damages, estimating the value of non-economic damages, and considering any legal or factual factors that affect the claim. Economic damages include documented medical expenses, lost wages, property damage, and other financial losses resulting from the incident. Non-economic damages are evaluated based on factors including the severity of the injury, the length of recovery, permanent impairment, and the overall impact on the injured person's life, with methods such as the multiplier or per diem approach sometimes used to estimate their value. Comparative fault, insurance policy limits, and other applicable legal factors may reduce or otherwise affect the final settlement value.",
        diagram: "process-diagram-2"
      },
      {
        id: "calc-3",
        question: "How Do You Calculate the Settlement Amount for a Claim",
        text: "Calculate the settlement amount for a claim by determining the total economic damages, estimating the value of non-economic damages, and adjusting the result for any applicable legal or case-specific factors. Economic damages include all verified medical expenses, lost wages, property damage, and other financial losses related to the claim. Non-economic damages are evaluated based on factors including the severity of the injury, the length of recovery, permanent impairment, and the overall impact on the claimant's life, with methods such as the multiplier or per diem approach sometimes used to estimate their value. Comparative fault, insurance policy limits, and other applicable legal factors may reduce or otherwise affect the final settlement amount.",
        diagram: "process-diagram-3"
      },
      {
        id: "calc-4",
        question: "How Do I Calculate My Settlement Amount",
        text: "Calculate your settlement amount by adding your economic damages, estimating your non-economic damages, and adjusting the total for any applicable comparative fault or other legal factors. Economic damages include documented medical expenses, lost wages, property damage, and other financial losses resulting from the incident. Non-economic damages, including pain and suffering, are often estimated using methods such as the multiplier or per diem approach when appropriate. Comparative fault, insurance policy limits, and other case-specific factors may reduce or otherwise affect the estimated settlement value under the applicable state law.",
        diagram: "process-diagram-4"
      },
      {
        id: "calc-5",
        question: "How Do Insurance Companies Calculate Settlements",
        text: "Insurance companies calculate settlements through internal software applying a multiplier toward medical expenses, weighted against liability clarity plus policy limit available. Internal software flags a claim file based on treatment cost, injury code, plus documented lost wage amount. Liability clarity shifts the applied multiplier upward for clear fault cases plus downward for disputed fault cases. Policy limit caps the final offer regardless of calculated value once total damage exceeds available coverage. Adjuster discretion applies past the software output, incorporating litigation risk plus venue history into a final settlement offer.",
        diagram: "process-diagram-5"
      }
    ]
  },
  {
    id: "injury-process",
    title: "Personal Injury and Accident Settlement Process",
    shortTitle: "Injury & Accident Process",
    tooltip: "Specific settlement evaluation workflows across car accidents, personal injury, pain & suffering, slip & fall, and lawyer calculations.",
    items: [
      {
        id: "inj-1",
        question: "How Are Car Accident Settlements Calculated",
        text: "Car accident settlements are calculated through economic damage totaling, multiplier application toward non-economic loss, plus fault-based reduction connected to a specific collision. Vehicle damage estimate, medical billing, plus wage loss verification supply the economic damage base. Multiplier selection reflects injury severity documented across the treatment period following the collision. Fault reduction applies a percentage tied to responsibility assigned toward each involved driver under state law.",
        diagram: "process-diagram-inj1"
      },
      {
        id: "inj-2",
        question: "How Are Personal Injury Settlements Calculated",
        text: "Personal injury settlements are calculated through the same layered process applied across every injury claim type, totaling economic damage before applying a severity multiplier plus fault reduction. Economic damage totals medical expenses, lost wages, plus property damage costs connected to a specific incident. Severity multiplier application shifts non-economic value based on injury type, recovery duration, plus lasting impairment. Fault reduction lowers the combined figure based on the percentage of responsibility assigned under applicable state law.",
        diagram: "process-diagram-inj2"
      },
      {
        id: "inj-3",
        question: "How to Calculate Pain and Suffering Settlement",
        text: "To calculate a pain and suffering settlement, follow the four steps. First, determine the total economic damages, including medical expenses, lost income, and other documented financial losses. Second, evaluate the severity of the injury, the length of recovery, and any permanent impairment supported by the medical evidence. Third, estimate the value of pain and suffering using an appropriate method, such as the multiplier method or the per diem method, when applicable. Lastly, compare the estimate with the facts of the case, available evidence, and any factors that may affect settlement negotiations before determining the potential settlement value.",
        diagram: "process-diagram-inj3"
      },
      {
        id: "inj-4",
        question: "How Are Slip and Fall Settlements Calculated",
        text: "Slip plus fall settlements are calculated through economic damage totaling, severity multiplier application, plus fault-based reduction connected to premises liability law. Economic damage totals medical expenses plus lost wage amount documented following a fall incident. Premises liability evidence, such as a maintenance record plus hazard notice history among examples, shapes liability clarity applied during negotiation. Comparative fault reduction applies once a property owner argues partial responsibility carried by the injured party.",
        diagram: "process-diagram-inj4"
      },
      {
        id: "inj-5",
        question: "How Do Lawyers Calculate Settlement Value After an Accident",
        text: "Lawyers calculate settlement value after an accident through case history review, documented damage totaling, plus negotiation leverage assessment tied to liability clarity. Case history review compares similar resolved claims toward a realistic value range presented to a client. Documented damage totaling combines every verified economic loss connected to the incident. Negotiation leverage assessment weighs liability clarity, policy limit, plus litigation risk carried by an insurance carrier before presenting a demand figure.",
        diagram: "process-diagram-inj5"
      }
    ]
  },
  {
    id: "wc-process",
    title: "Workers Compensation Settlement Process",
    shortTitle: "Workers Comp Process",
    tooltip: "Evaluation steps across average weekly wage, impairment rating, disability benefits, and California-specific workers' comp settlement rules.",
    items: [
      {
        id: "wc-1",
        question: "How Are Workers Comp Settlements Calculated",
        text: "Workers comp settlements are calculated through average weekly wage determination, impairment rating assessment, plus benefit schedule application connected to a specific state system. Average weekly wage determination totals earnings across a set period before the injury date. Impairment rating assessment assigns a percentage tied to permanent functional loss confirmed through medical evaluation. Benefit schedule application multiplies the impairment percentage through a state-set benefit table, producing a settlement figure",
        diagram: "process-diagram-wc1"
      },
      {
        id: "wc-2",
        question: "How to Calculate Workers Comp Settlement",
        text: "To calculate a workers' comp settlement, follow the four steps. First, determine the workers' compensation benefits available under the applicable state law. Second, gather the medical records, wage information, and any disability or impairment ratings that affect the claim. Third, evaluate future medical expenses, lost earning capacity, and any remaining benefits that may influence the settlement value. Lastly, compare the estimated settlement with the available benefits and applicable state laws before deciding whether to settle the claim.",
        diagram: "process-diagram-wc2"
      },
      {
        id: "wc-3",
        question: "How Is Workers' Comp Settlement Calculated",
        text: "Workers' comp settlement is calculated by evaluating the injured worker's average weekly wage, the severity of the injury, applicable disability or impairment ratings when required, available benefits under state law, and other factors that affect the value of the claim. The average weekly wage determines the amount of wage replacement benefits available under the applicable workers' compensation system. An impairment or disability rating, when applicable, measures the extent of any permanent loss resulting from the injury. State workers' compensation laws and benefit schedules determine how those factors affect the potential settlement, along with future medical expenses and other case-specific considerations.",
        diagram: "process-diagram-wc3"
      },
      {
        id: "wc-4",
        question: "How to Calculate Settlement From Workers Compensation",
        text: "To calculate a settlement from workers' compensation, follow the four steps. First, identify the workers' compensation benefits available under the applicable state law, including medical benefits, income benefits, and any impairment-related benefits. Second, gather documentation supporting the claim, including medical records, wage information, and any impairment rating assigned by the treating physician when applicable. Third, determine whether future medical expenses, disputed issues, or other case-specific factors affect the potential settlement value. Lastly, evaluate the proposed settlement against the available benefits and the long-term impact of the injury before deciding whether to resolve the claim.",
        diagram: "process-diagram-wc4"
      },
      {
        id: "wc-5",
        question: "How to Calculate a Workers Comp Settlement in California",
        text: "To calculate a workers comp settlement in California, follow the four steps. First, determine the permanent disability rating assigned after reaching maximum medical improvement. Second, calculate the permanent disability benefits using the applicable California benefit rate and the disability rating established under California's workers' compensation system. Third, consider additional factors that may affect the settlement, including future medical care, temporary disability benefits, age, occupation, and apportionment when applicable. Lastly, determine whether the settlement will be resolved through a Compromise and Release or a Stipulated Award before estimating the total settlement value.",
        diagram: "process-diagram-wc5"
      }
    ]
  },
  {
    id: "definitions",
    title: "Definitions",
    shortTitle: "Definitions",
    tooltip: "Key legal terms, damage types, economic vs non-economic differences, demand letters, and policy limit explanations.",
    items: [
      {
        id: "def-1",
        question: "What Is a Personal Injury Settlement?",
        text: "A personal injury settlement is a negotiated agreement resolving a claim through compensation paid toward an injured party absent a trial verdict. Settlement terms typically release the paying party from further liability connected to the specific incident once payment is completed. Negotiation moves through demand letter submission, counteroffer exchange, plus final agreement toward a specific figure. Settlement avoids trial cost, delay, plus outcome uncertainty carried by a jury verdict. Sutliff & Stout negotiates settlement terms toward a filed claim pursued on behalf of an injured client across Houston."
      },
      {
        id: "def-2",
        question: "What Are Damages in a Personal Injury Case?",
        text: "The damages in a personal injury case are listed below.",
        listItems: [
          {
            label: "Economic Damages",
            content: "Economic damages cover verifiable financial loss connected to a specific incident, including medical expenses and lost income among the core components. Documentation through billing statements plus pay records supports economic damage calculation. Economic damage totals form the base figure applied during settlement calculation."
          },
          {
            label: "Non-Economic Damages",
            content: "Non-economic damages cover subjective loss connected to pain, suffering, plus reduced quality of life following an injury. Multiplier or per diem method application converts non-economic impact into a calculated figure. Non-economic damage value shifts based on injury severity plus recovery duration."
          },
          {
            label: "Punitive Damages",
            content: "Punitive damages punish conduct rising past ordinary negligence, tied to reckless or intentional misconduct proven during trial. Punitive damage claims require a higher evidentiary threshold compared to a standard negligence claim. Punitive damage awards remain rare compared to standard compensatory recovery within a personal injury case."
          }
        ]
      },
      {
        id: "def-3",
        question: "What Is the Difference Between Economic and Non-Economic Damages?",
        text: "The difference between economic and non-economic damages is that economic damages compensate for measurable financial losses, while non-economic damages compensate for intangible losses that do not have a fixed monetary value. Economic damages are supported by verifiable financial records, including medical bills, lost wage documentation, property repair invoices, and other financial records showing the actual cost of the injury. Non-economic damages compensate for physical pain, emotional distress, mental anguish, loss of enjoyment of life, and other intangible effects of the injury. Settlement estimates often consider methods such as the multiplier or per diem approach when evaluating non-economic damages, although the appropriate valuation depends on the facts of the case.\n\nThe distinction below outlines core differences reviewed during a claim assessment.",
        table: {
          headers: ["Category", "Economic Damages", "Non-Economic Damages"],
          rows: [
            ["Basis", "Verifiable financial record", "Subjective impact assessment"],
            ["Documentation", "Billing statement, pay stub, invoice", "Medical narrative, treatment duration"],
            ["Calculation Method", "Direct total from records", "Multiplier or per diem application"],
            ["Cap Application", "Rarely capped under a standard claim", "Capped within specific claim categories under a jurisdiction applying a statutory limit"]
          ]
        }
      },
      {
        id: "def-4",
        question: "What Does Pain and Suffering Mean in a Settlement?",
        text: "Pain and suffering in a settlement means the non-economic damages awarded for the physical pain, emotional distress, and reduced quality of life resulting from an injury. These damages are commonly estimated using methods such as the multiplier method or the per diem method, depending on the facts of the case. The severity of the injury, the length of recovery, permanent impairment, and the overall impact on daily life all influence the amount awarded for pain and suffering. Medical records, treatment notes, personal journals, mental health records, and testimony from the injured person help support a claim for pain and suffering during settlement negotiations. Sutliff & Stout presents evidence of both economic and non-economic damages when negotiating compensation with insurance companies."
      },
      {
        id: "def-5",
        question: "What Is a Settlement Demand Letter?",
        text: "A settlement demand letter is a formal document presenting a requested compensation figure to an insurance carrier connected to a filed claim. The letter outlines liability argument, documented damage total, plus supporting evidence connected to the incident. A demand figure typically sits above the anticipated settlement value, allowing negotiation room toward a final agreed figure. Insurance carriers respond through a counteroffer, opening a negotiation exchange toward final resolution. Sutliff & Stout drafts demand letters supported through complete documentation connected to a filed claim. Suggested image alt tag: settlement demand letter template showing liability argument plus damage total sections."
      },
      {
        id: "def-6",
        question: "What Does Policy Limit Mean in an Injury Claim?",
        text: "Policy limit in an injury claim means the maximum amount an insurance company will pay under a particular insurance policy for a covered claim, regardless of whether the injured person's damages exceed that amount. A liability policy limit caps the compensation available from the at-fault party's insurance once proven damages exceed the available coverage. Underinsured motorist (UIM) coverage may provide additional compensation when the at-fault driver's liability insurance is insufficient, and the injured person carries applicable UIM coverage. Confirming the available policy limits early in the claim helps shape settlement negotiations and expectations. Sutliff & Stout investigates available insurance coverage and policy limits when evaluating a client's potential recovery."
      }
    ]
  },
  {
    id: "concepts",
    title: "Concepts",
    shortTitle: "Concepts",
    tooltip: "Core legal concepts including multiplier method, per diem approach, comparative vs contributory negligence, subrogation, and earning capacity.",
    items: [
      {
        id: "con-1",
        question: "What Is the Multiplier Method in Settlement Calculation?",
        text: "The Multiplier Method in settlement calculation is a common approach for estimating pain and suffering by multiplying a person's economic damages by a number that reflects the severity of the injury. Minor injuries generally receive a lower multiplier, while severe or permanent injuries may justify a higher multiplier depending on the facts of the case. Factors including the length of recovery, the extent of medical treatment, permanent impairment, and the overall impact of the injury influence the multiplier selected. Sutliff & Stout evaluates these factors along with the available evidence to determine the full value of a personal injury claim rather than relying on a single calculation method."
      },
      {
        id: "con-2",
        question: "What Is the Per Diem Method for Calculating Pain and Suffering?",
        text: "The Per Diem method for calculating pain and suffering is a damages calculation approach that assigns a daily monetary value to a person's pain and suffering and multiplies that amount by the number of days the injury affects the person's life. The daily value is often based on a reasonable amount supported by the facts of the case and, in some situations, may reference the injured person's daily earnings. The recovery period generally runs from the date of the injury until maximum medical improvement or the end of treatment, depending on the circumstances. The per diem method is commonly used when the injury has a clearly defined recovery period, while the multiplier method is more often applied when the effects of the injury are less predictable or longer lasting."
      },
      {
        id: "con-3",
        question: "What Is Comparative Negligence and How Does It Work?",
        text: "Comparative negligence is a legal rule reducing compensation based on a percentage of fault assigned to an injured party during a claim. A jury or adjuster assigns a fault percentage toward each involved party based on evidence reviewed during the claim. Compensation reduces proportionally, so a twenty percent fault assignment reduces total value by twenty percent. Texas applies a modified version barring recovery entirely once assigned fault crosses fifty percent under state statute. Sutliff & Stout challenges fault percentage assigned toward a client, presenting evidence supporting a lower determination."
      },
      {
        id: "con-4",
        question: "What Is Contributory Negligence?",
        tag: "h4",
        text: "Contributory negligence is a stricter legal rule barring recovery entirely once an injured party carries any percentage of fault connected to an incident. A small number of jurisdictions retain this rule, contrasting against the comparative fault approach applied within Texas. Under contributory negligence, even minimal fault assigned toward an injured party eliminates compensation regardless of the other party's greater fault share. Texas does not apply contributory negligence, applying a modified comparative rule instead."
      },
      {
        id: "con-5",
        question: "What Is Subrogation in a Personal Injury Settlement?",
        text: "Subrogation in a personal injury settlement is the legal right of an insurance company or benefit provider to recover the money it paid for accident-related expenses from a later settlement or court award. Health insurers and workers' compensation carriers commonly assert subrogation rights after paying medical expenses or wage-related benefits. Reimbursement of valid subrogation claims reduces the injured person's net recovery unless the amount is negotiated or otherwise reduced. Negotiating a reduction in subrogation claims can increase the client's final settlement proceeds before distribution. Sutliff & Stout works to identify, evaluate, and negotiate valid subrogation claims before finalizing a client's settlement."
      },
      {
        id: "con-6",
        question: "What Is Loss of Earning Capacity?",
        text: "Loss of earning capacity is a damage category covering reduced future income ability connected to a lasting injury impact. This category differs from lost wages. Lost wages cover missed work already incurred. Earning capacity covers diminished future potential connected to a lasting impairment. Vocational expert testimony often supports earning capacity valuation connected to a permanent impairment case. Sutliff & Stout pursues earning capacity valuation connected to a filed claim involving permanent impairment."
      }
    ]
  },
  {
    id: "process",
    title: "Process",
    shortTitle: "Process",
    tooltip: "How calculators work, negotiating with insurance companies, demand letter to payout timeline, adjuster scoring, and post-acceptance steps.",
    items: [
      {
        id: "proc-1",
        question: "How Does a Personal Injury Settlement Calculator Work?",
        text: "A personal injury settlement calculator works through input collection, formula application, plus range output presented for a specific claim. Input collection gathers medical expense total, lost wage amount, injury severity level, plus fault percentage connected to the incident. Formula application totals economic damage, applies a severity multiplier, then reduces the combined figure through the entered fault percentage. Range output presents a low figure plus a high figure reflecting documentation strength plus negotiation variability. Sutliff & Stout reviews calculator output alongside case-specific evidence before presenting a client with a realistic expectation."
      },
      {
        id: "proc-2",
        question: "How Is a Settlement Amount Negotiated With the Insurance Company?",
        text: "The settlement amount is negotiated with the insurance company through the exchange of a settlement demand, supporting evidence, and counteroffers until the parties reach an agreement or decide to proceed with litigation. A demand letter outlines the facts of the case, supporting evidence, damages, and the amount requested to resolve the claim. The insurance company reviews the demand and may accept it, reject it, or respond with a counteroffer, leading to further negotiations. The outcome depends on factors including liability, the strength of the evidence, the extent of the injuries, the available insurance coverage, and the potential risks of going to trial. Sutliff & Stout negotiates with insurance companies to pursue fair compensation based on the facts and evidence supporting each client's claim."
      },
      {
        id: "proc-3",
        question: "How Does a Claim Move From Demand Letter to Settlement Payout?",
        text: "A claim moves from demand letter to settlement payout through counteroffer exchange, agreement confirmation, plus release document execution. Counteroffer exchange continues until both parties reach a figure acceptable for final resolution. Agreement confirmation locks the final figure through a written settlement agreement signed by both parties. Release document execution formally closes the claim, releasing the paying party from further liability connected to the incident. Payout follows release execution, typically arriving through a check or electronic transfer processed by the insurer."
      },
      {
        id: "proc-4",
        question: "When Should I Use a Settlement Calculator During My Claim?",
        text: "You should use a settlement calculator during your claim after you have gathered basic information about your injuries, medical expenses, lost income, and other damages to obtain a general estimate of your claim's potential value. Using a calculator after the initial stages of treatment provides a more reliable estimate because additional medical records and financial documentation become available. Updating the information improves the estimate as treatment continues and damages change. A settlement calculator does not replace a legal evaluation because liability, insurance coverage, future damages, and other case-specific factors affect the final settlement value. Sutliff & Stout recommends discussing the facts of a claim with an attorney to better understand its potential value before accepting a settlement."
      },
      {
        id: "proc-5",
        question: "How Do Insurance Adjusters Calculate Their Settlement Offers?",
        text: "Insurance adjusters calculate settlement offers through internal software scoring, weighted against liability clarity plus documented damage total. Software scoring flags a claim file based on treatment cost, injury code, plus lost wage amount entered into the system. Liability clarity shifts the applied multiplier upward for clear fault cases plus downward for disputed fault cases. Adjuster discretion applies past the software output, incorporating litigation risk plus venue history into a final number. Initial offers commonly open below calculated value, anticipating a counteroffer exchange toward final resolution."
      },
      {
        id: "proc-6",
        question: "What Happens After I Accept a Settlement Offer?",
        text: "The insurance company prepares a settlement release for your signature, processes the agreed payment, and closes the claim once all required documents and deductions are completed after you accept a settlement offer. The settlement release confirms the agreed compensation and releases the responsible party from further liability related to the claim. Signing the release generally prevents additional claims arising from the same incident. Payment is typically issued after the signed release is returned, although the exact timing depends on the insurance company's processing procedures and the resolution of any valid medical liens or subrogation claims. Sutliff & Stout reviews settlement agreements and release documents with clients before they are signed to help protect their legal interests."
      }
    ]
  },
  {
    id: "requirements",
    title: "Requirements",
    shortTitle: "Requirements",
    tooltip: "Documentary requirements for medical expenses, lost wage proof, police reports, liability evidence, and legal review necessity.",
    items: [
      {
        id: "req-1",
        question: "What Information Do I Need to Use a Settlement Calculator?",
        text: "Medical expenses, lost income, information about your injuries, and details of the accident are the primary information needed to use a settlement calculator. Medical expense documentation includes itemized bills and insurance Explanation of Benefits (EOBs) for treatment related to the injury. Lost income documentation includes pay stubs, tax records, or employer verification showing wages lost because of the accident. Information about the injuries includes the diagnosis, medical treatment received, recovery period, and any permanent impairment. Accident details, including the police report, witness statements, photographs, and other liability evidence, help produce a more accurate estimate when evaluating the claim. Sutliff & Stout reviews this information to provide a more comprehensive assessment of a claim's potential value."
      },
      {
        id: "req-2",
        question: "What Documents Prove My Medical Expenses?",
        text: "Itemized medical bills, medical records, insurance Explanation of Benefits (EOBs), and payment receipts are the primary documents that prove medical expenses in a personal injury claim. Itemized medical bills identify the cost of each procedure, medication, and healthcare service received. Medical records link those expenses to the injuries caused by the accident and document the treatment provided. Insurance Explanation of Benefits statements show the amounts billed, paid by the insurer, and any remaining patient responsibility. Payment receipts verify out-of-pocket expenses incurred by the injured person. Complete documentation from every healthcare provider strengthens the calculation of economic damages during settlement negotiations. Sutliff & Stout collects and reviews these records to support the full value of a client's claim."
      },
      {
        id: "req-3",
        question: "How Do I Prove Lost Wages for a Settlement Claim?",
        text: "Proving lost wages requires pay stub comparison, an employer verification letter, plus tax filing connected to the missed work period. Pay stub comparison contrasts earnings before the incident against reduced or absent earnings following the incident. An employer verification letter confirms missed work dates plus standard pay rate connected to the position. Self-employed claimants supply a profit and loss statement plus tax filing covering a comparable period before plus after the incident. Complete wage documentation strengthens economic damage totaling presented during negotiation."
      },
      {
        id: "req-4",
        question: "Do I Need a Police Report to Calculate My Settlement?",
        tag: "h4",
        text: "Yes, a police report supports settlement calculation through documented fault determination plus incident detail confirmed at the scene. A police report records vehicle position, damage extent, plus witness statements gathered immediately following a collision. Insurance carriers weigh police report content heavily during liability determination connected to a filed claim. Absent a police report, liability proof relies more heavily on photograph evidence, witness statements, plus physical damage assessment gathered independently. Sutliff & Stout requests a police report copy early within a filed claim connected to liability proof."
      },
      {
        id: "req-5",
        question: "What Evidence Increases the Accuracy of a Settlement Estimate?",
        text: "Medical records, proof of lost income, and evidence establishing liability increase the accuracy of a settlement estimate by providing documentation that supports the value of a personal injury claim. Complete medical records reduce uncertainty when evaluating the severity of injuries and calculating damages. Verified proof of lost income improves the accuracy of economic damage calculations. Clear liability evidence, including accident reports, witness statements, photographs, and other supporting documentation, strengthens the assessment of fault and the potential settlement value. Sutliff & Stout reviews all available evidence before providing an informed estimate of a claim's potential value."
      },
      {
        id: "req-6",
        question: "Do I Need a Lawyer to Calculate My Settlement Value?",
        tag: "h4",
        text: "No, you do not need a lawyer to calculate your settlement value, but legal representation helps produce a more accurate estimate based on the specific facts of your case. A settlement calculator provides a general estimate using standard inputs but cannot account for case-specific factors such as disputed liability, insurance coverage limits, future damages, or the strength of the available evidence. A lawyer evaluates those factors to determine the full value of a claim and develop an effective negotiation strategy. Complex claims involving severe injuries, disputed fault, or multiple insurance policies benefit significantly from a professional legal review before a settlement demand is made. Sutliff & Stout offers free consultations to review the facts of a case and explain the factors that may affect its potential value."
      }
    ]
  },
  {
    id: "factors",
    title: "Factors",
    shortTitle: "Factors",
    tooltip: "Key factors affecting settlement value including severity, fault, pre-existing conditions, future medical costs, and state law variances.",
    items: [
      {
        id: "fact-1",
        question: "What Factors Increase a Personal Injury Settlement Amount?",
        text: "The factors that increase a personal injury settlement amount are listed below.",
        listItems: [
          {
            label: "Injury Severity",
            content: "Injury severity increases settlement value through a higher applied multiplier connected to lasting impairment or extended recovery. Permanent impairment plus disfigurement carry a higher multiplier compared to a fully resolved soft tissue injury. Documented severity through imaging plus specialist evaluation strengthens the applied multiplier during calculation."
          },
          {
            label: "Clear Liability",
            content: "Clear liability increases settlement value through reduced litigation risk carried by an insurance carrier during negotiation. A rear-end collision or a clearly documented hazard often carries stronger liability clarity compared to a disputed intersection incident. Clear liability shortens the negotiation timeline. Clear liability also supports a stronger initial demand figure."
          },
          {
            label: "Strong Documentation",
            content: "Strong documentation increases settlement value through complete medical records, income proof, plus liability evidence presented during negotiation. Consistent treatment record across the full recovery period removes causation doubt raised during adjuster review. Complete documentation shortens negotiation timeline through reduced back-and-forth evidence requests."
          },
          {
            label: "High Policy Limit",
            content: "A high policy limit increases the settlement value ceiling connected to the paying party's available coverage. A commercial vehicle policy often carries a higher limit compared to a standard personal auto policy. Confirming every available coverage layer, umbrella coverage included, raises the achievable settlement ceiling."
          }
        ]
      },
      {
        id: "fact-2",
        question: "How Does Injury Severity Affect the Settlement Value?",
        text: "Injury severity affects settlement value through multiplier selection applied to the non-economic damage calculation. A minor injury resolving within weeks applies a multiplier near the low end of a standard range. A severe or permanent injury applies a multiplier near the high end of a standard range, reflecting lasting impact on daily function. Recovery duration, treatment intensity, plus permanent impairment rating each shift multiplier selection within the standard range. Sutliff & Stout documents severity thoroughly to support a stronger multiplier position during negotiation."
      },
      {
        id: "fact-3",
        question: "How Does Being Partially at Fault Reduce My Settlement?",
        text: "Partial fault reduces settlement value through a proportional deduction tied to the assigned fault percentage under comparative negligence law. A twenty-five percent fault assignment reduces total calculated value by twenty-five percent before final payout. Texas bars recovery entirely once assigned fault crosses fifty percent under the modified comparative rule applied statewide. Evidence challenging the assigned fault percentage can shift the reduction downward, raising net settlement value. Sutliff & Stout challenges fault percentage assignment toward minimizing reduction applied against a client's settlement."
      },
      {
        id: "fact-4",
        question: "Do Pre-Existing Conditions Lower My Settlement Amount?",
        tag: "h4",
        text: "Yes, a pre-existing condition can lower settlement amount once an insurer argues current symptoms predate the incident rather than resulting from it. Medical documentation distinguishing aggravation from origin protects value tied to the specific incident. A previously stable condition worsened through a new incident still supports compensation tied to the aggravation itself. Absent clear distinguishing documentation, an insurer often discounts value tied toward the disputed portion of the injury. Sutliff & Stout gathers prior medical record comparisons to isolate aggravation value connected to a filed claim."
      },
      {
        id: "fact-5",
        question: "How Do Future Medical Costs Affect the Calculation?",
        text: "Future medical costs affect the calculation through an added projection layered onto documented past medical expenses connected to a specific claim. A treating physician's projection estimates ongoing treatment, therapy, or surgical need connected to the injury. Projected cost calculation often relies on life care planning connected to a permanent or catastrophic injury case. Adding future costs raises the economic damage base, indirectly raising the non-economic multiplier calculation applied afterward. Sutliff & Stout secures physician projection documentation before finalizing a settlement demand involving ongoing care needs."
      },
      {
        id: "fact-6",
        question: "Does the State I Live In Change My Settlement Value?",
        tag: "h4",
        text: "Yes, the governing state changes settlement value through comparative fault threshold, damage cap application, plus filing deadline specific to that jurisdiction. A state applying a strict fault threshold bars recovery sooner compared to a state applying a more lenient threshold. A state applying a damage cap toward non-economic loss limits recovery regardless of injury severity within specific claim categories. Filing deadline variance across state law shifts urgency connected to evidence gathering plus claim submission timing. Sutliff & Stout applies Texas-specific statute knowledge toward every filed claim reviewed across Houston."
      }
    ]
  },
  {
    id: "costs",
    title: "Costs and Deductions",
    shortTitle: "Costs & Deductions",
    tooltip: "Lawyer contingency fees, medical liens, subrogation, taxability of settlements, and calculating net payout.",
    items: [
      {
        id: "cost-1",
        question: "How Much Do Personal Injury Lawyers Take From a Settlement?",
        text: "Personal injury lawyers commonly take a contingency fee percentage ranging from one-third to forty percent of a final settlement figure. A lower percentage often applies once a case resolves early through negotiation absent litigation filing. A higher percentage often applies once a case proceeds past litigation filing toward trial preparation or trial itself. Fee agreement terms confirmed before representation begins set the exact percentage applied toward the final figure. Sutliff & Stout confirms fee structure clearly through a written agreement before beginning representation connected to a filed claim."
      },
      {
        id: "cost-2",
        question: "What Is a Contingency Fee and How Is It Calculated?",
        text: "A contingency fee is a payment arrangement tying attorney compensation directly to a percentage of the final settlement or trial award. Calculation multiplies the agreed percentage by the gross settlement figure before deducting case expenses. A case resolving through early negotiation often carries a lower percentage compared to a case proceeding through trial. Absent recovery, a contingency arrangement typically requires no attorney fee payment from the client. Sutliff & Stout structures contingency fee agreements clearly before beginning representation connected to a filed claim."
      },
      {
        id: "cost-3",
        question: "What Are Medical Liens and How Do They Reduce My Payout?",
        text: "Medical liens reduce a final payout once a healthcare provider or insurer asserts reimbursement rights connected to a settlement.\n\nThe categories below outline common lien types reviewed before final payout distribution.",
        listItems: [
          {
            label: "Hospital Lien",
            content: "A hospital lien asserts reimbursement rights connected to treatment costs provided following an incident. State law often sets a specific process a hospital follows toward asserting a valid lien. Negotiating a hospital lien reduction increases net payout received by an injured party."
          },
          {
            label: "Health Insurance Subrogation",
            content: "Health insurance subrogation asserts reimbursement rights connected to medical payments made on behalf of an injured party. Federal or state law shapes the possibility connected to a subrogation claim asserted by a private insurer. Negotiated subrogation reduction increases net value received following lien resolution."
          },
          {
            label: "Medicare or Medicaid Lien",
            content: "A Medicare or Medicaid lien asserts reimbursement rights connected to government-funded treatment provided following an incident. Federal formula application often reduces the asserted lien amount based on attorney fees plus case expense proportion. Timely reporting to the governing agency prevents penalties connected to delayed lien resolution."
          }
        ]
      },
      {
        id: "cost-4",
        question: "Is a Personal Injury Settlement Taxable?",
        tag: "h4",
        text: "No, compensation connected to physical injury within a personal injury settlement remains non-taxable under federal tax law under standard circumstances. Compensatory damages covering medical expenses plus physical injury impacts fall outside taxable income under federal statute. Punitive damage awards plus interest accrued during litigation remain taxable regardless of the underlying claim type. Emotional distress compensation absent an accompanying physical injury can carry taxable treatment under specific circumstances. Sutliff & Stout reviews settlement structure toward minimizing taxable exposure before finalizing a final agreement."
      },
      {
        id: "cost-5",
        question: "What Is My Net Payout After Fees and Deductions?",
        text: "Your net payout after fees and deductions equals the total settlement or court award minus the attorney's contingency fee, reimbursed case expenses, and any valid medical liens or subrogation claims that must be paid. The attorney's contingency fee is calculated according to the written contingency fee agreement, while case expenses may be deducted either before or after the fee calculation, depending on the terms of that agreement. Reimbursable expenses commonly include filing fees, expert witness fees, deposition costs, and medical record retrieval expenses. Any valid liens or subrogation claims are then resolved before the remaining funds are distributed. Sutliff & Stout provides clients with a clear explanation of fees, costs, and deductions before finalizing a settlement."
      },
      {
        id: "cost-6",
        question: "Who Pays the Court Costs in a Personal Injury Case?",
        text: "The representing law firm typically advances court costs in a personal injury case under a contingency fee agreement, with those costs reimbursed from the final settlement or court award if the case is successful. Advanced costs include filing fees, deposition expenses, expert witness fees, and medical record retrieval costs related to case preparation. Reimbursement occurs before the client's final net recovery is calculated and is deducted along with the attorney's contingency fee. Sutliff & Stout works on a contingency fee basis, meaning clients pay no upfront legal fees and owe attorney fees only if compensation is recovered."
      }
    ]
  },
  {
    id: "timelines",
    title: "Timelines",
    shortTitle: "Timelines",
    tooltip: "Timeframes for settlement payout, negotiation duration, statute of limitations, release payout timing, trial impact, and pre-treatment calculations.",
    items: [
      {
        id: "time-1",
        question: "How Long Does It Take to Receive a Settlement After an Accident?",
        text: "Receiving a settlement after an accident typically takes between 3 months and 18 months, depending on the complexity of the claim, the severity of the injuries, and whether the case settles or proceeds to litigation. A clear liability case supported by complete documentation often resolves near the shorter end of that timeframe. A disputed liability case or a case involving extended medical treatment often resolves near the longer end. Litigation extends the timeline further because court scheduling and the discovery process add additional steps beyond standard settlement negotiations. Sutliff & Stout manages client expectations throughout the settlement process for claims pursued across Houston."
      },
      {
        id: "time-2",
        question: "How Long Do Settlement Negotiations Usually Last?",
        text: "Settlement negotiations usually last between 1 and 6 months, depending on the complexity of the claim, the completeness of the supporting documentation, and whether liability is disputed. A complete demand package supported by clear liability often shortens negotiations toward the earlier end of that timeframe. A disputed liability case or a case awaiting final medical treatment often extends negotiations toward the later end. Insurer response times and multiple rounds of counteroffers also increase the overall negotiation period. Sutliff & Stout pursues efficient negotiations while working to secure the full value of every claim."
      },
      {
        id: "time-3",
        question: "What Is the Statute of Limitations for a Personal Injury Claim?",
        text: "The statute of limitations for a personal injury claim is generally two years from the date of the injury under Texas law. Missing the filing deadline typically prevents a claim from moving forward regardless of injury severity or liability clarity. Certain claim types, including claims against government entities, carry shorter notice deadlines that require much faster action. Deadline calculations can change under the discovery rule when an injury is not reasonably discovered until a later date. Sutliff & Stout tracks filing deadlines closely for every claim handled across Houston."
      },
      {
        id: "time-4",
        question: "How Long After Signing the Release Do I Get Paid?",
        text: "Payout after signing a settlement release typically arrives within 2 to 6 weeks, although the exact timeline depends on the insurance company's processing time and whether any medical liens or other claims must be resolved before payment is issued. A straightforward claim without outstanding liens often pays near the shorter end of that timeframe. A claim awaiting subrogation or lien resolution often pays near the longer end of the timeframe. Electronic payment processing typically arrives faster than receiving a mailed check. Sutliff & Stout tracks payout timing closely following every signed release connected to a client."
      },
      {
        id: "time-5",
        question: "Does Going to Trial Make the Payout Take Longer?",
        tag: "h4",
        text: "Yes, proceeding toward trial extends payout timing considerably compared to a claim resolved through negotiation. Court scheduling, discovery exchange, plus trial preparation each add process steps absent in a negotiated resolution. A jury verdict can also trigger a post-trial appeal period further delaying final payout. Settlement negotiation avoids this extended timeline, often resolving within a shorter window compared to litigation. Sutliff & Stout weighs timeline impact alongside value potential before recommending trial pursuit connected to a filed claim."
      },
      {
        id: "time-6",
        question: "Can I Calculate My Settlement Before Treatment Is Finished?",
        tag: "h4",
        text: "Yes, an early settlement calculation remains possible before treatment finishes, though accuracy improves once treatment reaches a stable endpoint. An early calculation relies on projected treatment cost plus anticipated recovery duration absent a final medical release. Accepting a final settlement before treatment completion risks undervaluing ongoing or future medical need. Waiting toward maximum medical improvement typically produces a more accurate final calculation supported through complete documentation. Sutliff & Stout balances early expectation setting alongside a recommendation toward waiting before finalizing a demand figure."
      }
    ]
  },
  {
    id: "comparisons",
    title: "Comparisons",
    shortTitle: "Comparisons",
    tooltip: "Side-by-side comparisons of calculator vs lawyer estimates, settling vs trial, multiplier vs per diem, state laws, and minor vs severe injuries.",
    items: [
      {
        id: "comp-1",
        question: "Which Is More Accurate, a Settlement Calculator or a Lawyer Estimate?",
        text: "A settlement calculator applies standard formula logic absent jurisdiction-specific nuance. A lawyer estimate applies case-specific legal review connected to a filed claim, incorporating nuance a standard formula cannot capture. Calculator output supplies a fast, general range useful early within a claim before full evidence gathering completes. Lawyer estimate accuracy improves through evidence review, negotiation experience, plus jurisdiction-specific statute knowledge applied toward the specific claim.\n\nThe table below outlines core differences reviewed during a settlement value assessment.",
        table: {
          headers: ["Category", "Settlement Calculator", "Lawyer Estimate"],
          rows: [
            ["Basis", "Standard formula logic", "Case-specific legal review"],
            ["Speed", "Instant output", "Requires case review time"],
            ["Nuance", "Limited to entered figures", "Incorporates liability nuance plus venue history"],
            ["Accuracy Over Time", "Static absent new input", "Improves as evidence plus negotiation progress"]
          ]
        }
      },
      {
        id: "comp-2",
        question: "Which Pays More, Settling vs Going to Trial?",
        text: "Settling typically resolves faster compared to trial, though trial can produce a higher award once liability plus damage proof reach a strong threshold. Settlement avoids trial cost, delay, plus outcome uncertainty carried by a jury verdict. Trial pursuit risks a lower award or complete denial once a jury reaches an unfavorable conclusion.\n\nThe comparison below outlines core tradeoffs reviewed before choosing a resolution path.",
        table: {
          headers: ["Category", "Settlement", "Trial"],
          rows: [
            ["Speed", "Faster resolution", "Extended timeline through court process"],
            ["Certainty", "Guaranteed figure once signed", "Uncertain outcome tied to jury decision"],
            ["Cost", "Lower litigation expense", "Higher expense through trial preparation"],
            ["Ceiling", "Capped near negotiated figure", "Potentially higher through jury award"]
          ]
        }
      },
      {
        id: "comp-3",
        question: "Which Should I Use, Multiplier Method vs Per Diem Method?",
        text: "Multiplier method selection suits an injury carrying lasting impairment or a less defined recovery timeline. Per diem method selection suits an injury carrying a clear, countable recovery timeline supported through defined treatment duration. Method choice shifts the calculated non-economic figure meaningfully depending on injury type plus documentation available.\n\nThe comparison below outlines when each method applies effectively.",
        table: {
          headers: ["Category", "Multiplier Method", "Per Diem Method"],
          rows: [
            ["Best Fit", "Lasting or severe impairment", "Clear, countable recovery timeline"],
            ["Calculation Basis", "Economic damage times severity figure", "Daily value times recovery days"],
            ["Documentation Need", "Severity plus impairment record", "Defined treatment start plus end date"],
            ["Common Use", "Long-term or permanent injury claims", "Short term, clearly bounded injury claims"]
          ]
        }
      },
      {
        id: "comp-4",
        question: "How Big Is the Gap First Insurance Offer vs Final Settlement?",
        text: "The gap separating a first insurance offer plus final settlement often ranges wide, since an initial offer commonly opens well below documented claim value. Strong documentation plus firm negotiation typically close this gap, raising the final figure well past the opening offer. A weak or incomplete claim file often closes less of this gap, settling nearer the initial offer. Litigation filing can widen the eventual gap further once trial risk pressures an insurer toward a higher figure. Sutliff & Stout negotiates aggressively toward closing this gap connected to a filed claim pursued across Houston."
      },
      {
        id: "comp-5",
        question: "How Do Settlement Amounts Differ Between States?",
        text: "Settlement amounts differ across states through comparative fault threshold, damage cap application, plus venue-specific jury verdict history. A state applying a strict fault threshold bars recovery sooner compared to a state applying a lenient threshold. A state applying a damage cap toward non-economic loss limits recovery regardless of injury severity within specific claim categories. Venue history connected to local jury verdict patterns also shifts insurer settlement behavior across different jurisdictions.\n\nThe comparison below outlines core state-level variables reviewed during a cross-state assessment.",
        table: {
          headers: ["Category", "Stricter Fault State", "Lenient Fault State"],
          rows: [
            ["Fault Threshold", "Bars recovery at a lower fault percentage", "Bars recovery at a higher fault percentage or not at all"],
            ["Damage Cap", "May apply toward specific claim categories", "Cap application varies by category plus jurisdiction"],
            ["Venue History", "Shapes insurer settlement behavior locally", "Shapes insurer settlement behavior locally"],
            ["Filing Deadline", "Set by individual state statute", "Set by individual state statute"]
          ]
        }
      },
      {
        id: "comp-6",
        question: "What Is the Value Difference Between Minor Injury vs Severe Injury Settlements?",
        text: "Minor injury settlements carry a lower non-economic multiplier compared to severe injury settlements, reflecting reduced recovery duration plus lasting impact. A minor injury resolving within a short recovery window applies a multiplier near the low end of a standard range. A severe injury involving permanent impairment applies a multiplier near the high end of a standard range, raising total settlement value substantially. Economic damage totals also differ, since severe injury cases often carry extended treatment costs plus future medical projections.\n\nThe comparison below outlines core value drivers separating minor from severe injury settlements.",
        table: {
          headers: ["Category", "Minor Injury", "Severe Injury"],
          rows: [
            ["Multiplier Range", "Lower end of standard range", "Higher end of standard range"],
            ["Recovery Duration", "Shorter, often weeks", "Extended, often months or permanent"],
            ["Economic Damage", "Limited medical plus wage loss", "Extensive medical, future care, plus lost earning capacity"],
            ["Negotiation Complexity", "Lower, often resolved quickly", "Higher, often requires expert testimony"]
          ]
        }
      }
    ]
  }
];

export default function Home() {
  // Tabs State
  const [activeFactorTab, setActiveFactorTab] = useState("01");
  const [activeStateGroupTab, setActiveStateGroupTab] = useState("A–G");
  const [selectedState, setSelectedState] = useState<USState | null>(states[0] || null);
  const [activeFaqTab, setActiveFaqTab] = useState(0);
  const [activeAccidentTab, setActiveAccidentTab] = useState("car");
  const [activeMethodSlide, setActiveMethodSlide] = useState(0);
  const [activeScopeItem, setActiveScopeItem] = useState<number | null>(null);
  const [isDescExpanded, setIsDescExpanded] = useState(false);
  const [isMethodDescExpanded, setIsMethodDescExpanded] = useState(false);
  const [isFactorsDescExpanded, setIsFactorsDescExpanded] = useState(false);
  const [isInterpretDescExpanded, setIsInterpretDescExpanded] = useState(false);
  const [isStatesDescExpanded, setIsStatesDescExpanded] = useState(false);

  // New FAQ Redesign State
  const [activeFaqCategoryTab, setActiveFaqCategoryTab] = useState(0);
  const [activeFaqCategoryTooltip, setActiveFaqCategoryTooltip] = useState<{ text: string; x: number; y: number } | null>(null);
  const [activeFaqItemId, setActiveFaqItemId] = useState<string | null>("calc-1");
  const [readMoreFaqItems, setReadMoreFaqItems] = useState<Record<string, boolean>>({});
  const faqTabsRef = useRef<HTMLDivElement>(null);

  const handleFaqCategoryTabChange = (idx: number) => {
    setActiveFaqCategoryTab(idx);
    const firstItemId = faqCategoryData[idx]?.items[0]?.id || null;
    setActiveFaqItemId(firstItemId);
  };

  const handleFaqTabMouseEnter = (e: React.MouseEvent, tooltipText: string) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const container = faqTabsRef.current?.parentElement;
    const containerRect = container?.getBoundingClientRect();
    if (containerRect) {
      let x = rect.left - containerRect.left + rect.width / 2;
      const y = rect.top - containerRect.top;

      // Clamp X position to prevent mobile viewport overflow
      const tooltipHalfWidth = Math.min(130, containerRect.width / 2 - 10);
      const minX = tooltipHalfWidth + 10;
      const maxX = containerRect.width - tooltipHalfWidth - 10;
      x = Math.max(minX, Math.min(maxX, x));

      setActiveFaqCategoryTooltip({ text: tooltipText, x, y });
    }
  };

  const toggleFaqCategoryTooltip = (e: React.MouseEvent, tooltipText: string) => {
    e.stopPropagation();
    if (activeFaqCategoryTooltip) {
      setActiveFaqCategoryTooltip(null);
    } else {
      handleFaqTabMouseEnter(e, tooltipText);
    }
  };

  const handleFaqTabMouseLeave = () => {
    setActiveFaqCategoryTooltip(null);
  };

  const scrollFaqTabs = (direction: "left" | "right") => {
    if (faqTabsRef.current) {
      const scrollAmount = direction === "left" ? -250 : 250;
      faqTabsRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  const toggleFaqAccordion = (itemId: string) => {
    setActiveFaqItemId((prev) => (prev === itemId ? null : itemId));
  };

  const toggleFaqReadMore = (itemId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setReadMoreFaqItems((prev) => ({ ...prev, [itemId]: !prev[itemId] }));
  };

  const prevMethodSlide = () => {
    setActiveMethodSlide((prev) => (prev === 0 ? methodologySlides.length - 1 : prev - 1));
  };

  const nextMethodSlide = () => {
    setActiveMethodSlide((prev) => (prev === methodologySlides.length - 1 ? 0 : prev + 1));
  };

  const activeTabData = accidentTabsData[activeAccidentTab];

  // Collapsible cards state
  const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>({});
  const [expandedMethodSlides, setExpandedMethodSlides] = useState<Record<number, boolean>>({});
  const [activeTooltip, setActiveTooltip] = useState<{ text: string; x: number; y: number } | null>(null);

  const handleTabMouseEnter = (e: React.MouseEvent, tabId: string) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const container = document.querySelector(".accident-tabs-nav-wrapper");
    const containerRect = container?.getBoundingClientRect();
    if (containerRect) {
      const rawX = rect.left - containerRect.left + rect.width / 2;
      const y = rect.top - containerRect.top;
      const text = accidentTabsData[tabId]?.definition || "";
      const shortText = text.split(".")[0] + ".";
      setActiveTooltip({ text: shortText, x: rawX, y });
    }
  };

  const handleTabMouseLeave = () => {
    setActiveTooltip(null);
  };
  
  const toggleCardExpanded = (cardKey: string) => {
    setExpandedCards((prev) => ({ ...prev, [cardKey]: !prev[cardKey] }));
  };

  const handleAccidentTabChange = (tabId: string) => {
    setActiveAccidentTab(tabId);
    setExpandedCards({});
    const defaults = defaultValuesByTab[tabId] || { medical: 9000, wages: 3000, severity: "moderate" };
    setAccMedical(defaults.medical);
    setAccWages(defaults.wages);
    setAccSeverity(defaults.severity);
    setAccFault(10);
  };

  const scrollAccidentTabs = (direction: "left" | "right") => {
    const container = document.getElementById("accident-tabs-container");
    if (container) {
      const amount = direction === "left" ? -240 : 240;
      container.scrollBy({ left: amount, behavior: "smooth" });
    }
  };

  const renderCardText = (text: string, cardKey: string) => {
    const isExpanded = expandedCards[cardKey];
    if (text.length <= 160 || isExpanded) {
      return (
        <>
          <p className="card-body-text">{text}</p>
          {text.length > 160 && (
            <button
              type="button"
              className="card-readmore-btn"
              onClick={() => toggleCardExpanded(cardKey)}
            >
              Read less
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ transform: "rotate(180deg)", marginLeft: "4px", transition: "transform 0.2s" }}><polyline points="6 9 12 15 18 9"/></svg>
            </button>
          )}
        </>
      );
    }

    const truncated = text.slice(0, 150).trim() + "...";
    return (
      <>
        <p className="card-body-text">{truncated}</p>
        <button
          type="button"
          className="card-readmore-btn"
          onClick={() => toggleCardExpanded(cardKey)}
        >
          Read more
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: "4px", transition: "transform 0.2s" }}><polyline points="6 9 12 15 18 9"/></svg>
        </button>
      </>
    );
  };

  // Custom Accident Calculator state
  const [accMedical, setAccMedical] = useState(9000);
  const [accWages, setAccWages] = useState(3000);
  const [accSeverity, setAccSeverity] = useState<"minor" | "moderate" | "severe" | "catastrophic">("moderate");
  const [accFault, setAccFault] = useState(10);

  const accCalculations = useMemo(() => {
    const economic = accMedical + accWages;
    
    let multLow = 1.0;
    let multHigh = 1.5;
    let caption = "Minor or soft tissue injuries with rapid recovery. (1x–1.5x)";
    
    if (accSeverity === "moderate") {
      multLow = 2.0;
      multHigh = 3.0;
      caption = "Fractures or injuries needing sustained treatment. (2x–3x)";
    } else if (accSeverity === "severe") {
      multLow = 3.0;
      multHigh = 4.5;
      caption = "Severe injuries with long-term symptoms or surgery. (3x–4.5x)";
    } else if (accSeverity === "catastrophic") {
      multLow = 5.0;
      multHigh = 7.0;
      caption = "Permanent, life-altering impairment or disability. (5x–7x)";
    }

    const painLow = economic * multLow;
    const painHigh = economic * multHigh;
    
    const subtotalLow = economic + painLow;
    const subtotalHigh = economic + painHigh;
    
    const faultLow = subtotalLow * (accFault / 100);
    const faultHigh = subtotalHigh * (accFault / 100);
    
    const finalLow = Math.max(0, subtotalLow - faultLow);
    const finalHigh = Math.max(0, subtotalHigh - faultHigh);
    
    return {
      economic,
      multLow,
      multHigh,
      caption,
      painLow,
      painHigh,
      subtotalLow,
      subtotalHigh,
      faultLow,
      faultHigh,
      finalLow,
      finalHigh
    };
  }, [accMedical, accWages, accSeverity, accFault]);

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
          <p className="eyebrow"><span className="eyebrow-tag">Independent methodology</span> <span className="eyebrow-dot">·</span> <span className="eyebrow-date">Updated July 2026</span></p>
          <h1 id="page-title">Personal Injury Settlement Calculator</h1>
          <p className="hero-lede">
            Use a personal injury settlement calculator that estimates compensation value tied to a filed injury claim through documented economic loss, pain and suffering impact, plus fault adjustment. Input fields collect medical expense total, lost wage amount, injury severity level, plus fault percentage connected to a specific incident.
            {!isDescExpanded && "..."}
            {isDescExpanded && (
              <span className="expanded-text">
                {" "}Calculation logic applies a multiplier method toward non-economic loss, layering the result onto verified economic damages. A fault adjustment reduces total value tied to a percentage of responsibility assigned toward an injured party under state law. Output presents a range rather than a single figure, since settlement negotiation shifts value upward or downward based on evidence strength, insurance policy limit, plus venue history. Sutliff & Stout builds calculator logic around case data reviewed across Houston injury claims, connecting estimated output toward realistic settlement expectation.
              </span>
            )}
            <button
              onClick={() => setIsDescExpanded(!isDescExpanded)}
              className="read-more-btn"
              aria-expanded={isDescExpanded}
            >
              {isDescExpanded ? "Read less" : "Read more"}
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ transform: isDescExpanded ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s ease" }}
              >
                <path d="M6 9l6 6 6-6" />
              </svg>
            </button>
          </p>
          <div className="hero-proof">
            <div><strong>5</strong><span>damage inputs</span></div>
            <div><strong>2</strong><span>range scenarios</span></div>
            <div><strong>0</strong><span>contact details required</span></div>
          </div>
          <p className="byline">Concept and information architecture by <strong style={{ whiteSpace: "nowrap" }}>Koray Tuğberk Gübür</strong></p>
        </div>

        <SettlementCalculator />
      </section>

      <section className="trust-elements-section" aria-labelledby="trust-heading">
        <div className="section-heading">
          <p className="eyebrow">Calculator Trust Standards</p>
          <h2 id="trust-heading">Designed for accuracy, built for trust</h2>
          <p>
            Unlike marketing tools that capture your personal details to sell as leads, our calculator follows strict independent publishing standards.
          </p>
        </div>
        <div className="trust-grid">
          <div className="trust-card">
            <div className="trust-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            </div>
            <h3>100% Anonymous</h3>
            <p>No phone numbers, emails, or sign-ups. Perform unlimited calculations with complete privacy.</p>
          </div>
          <div className="trust-card">
            <div className="trust-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="3" x2="12" y2="21"/><line x1="6" y1="7" x2="18" y2="7"/><path d="M6 7A4 4 0 0 0 2 11h8a4 4 0 0 0-4-4z"/><path d="M18 7A4 4 0 0 0 14 11h8a4 4 0 0 0-4-4z"/></svg>
            </div>
            <h3>Lawyer-Reviewed Logic</h3>
            <p>Formulas are modeled on actual insurance negotiation patterns and current state statutes.</p>
          </div>
          <div className="trust-card">
            <div className="trust-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
            </div>
            <h3>No Advertising Bias</h3>
            <p>Independent of attorney marketing. We do not promote specific law firms or highlight sponsored links.</p>
          </div>
          <div className="trust-card">
            <div className="trust-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
            </div>
            <h3>Realistic Ranges</h3>
            <p>We present a verified planning range showing low and high scenarios, avoiding single inflated estimates.</p>
          </div>
        </div>
      </section>

      <section className="stats-trust-section" aria-labelledby="stats-heading">
        <div className="section-heading">
          <p className="eyebrow">CASE FILE – CLAIM STATISTICS</p>
          <h2 id="stats-heading">What the numbers show</h2>
          <p>
            Benchmarks drawn from personal injury claims broadly, grouped by what they tell you about
            value, timeline, and the rules that shape a payout. Hover any card for the plain-language
            explanation.
          </p>
        </div>

        {statisticsData.map((group) => (
          <div key={group.category} className="stats-grid-group">
            <h3 className="stats-category-title">
              <span className={`bullet ${group.bulletClass}`} />
              {group.category}
            </h3>
            <div className="stats-cards-grid">
              {group.items.map((item) => (
                <div key={item.id} className="stat-card">
                  <button 
                    type="button" 
                    className="stat-info-icon-btn" 
                    aria-label={`Info about ${item.label}`}
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="16" x2="12" y2="12" />
                      <line x1="12" y1="8" x2="12.01" y2="8" />
                    </svg>
                  </button>
                  <div className="stat-tooltip-bubble">
                    {item.tooltipText || item.explanation}
                  </div>
                  <div className="stat-icon">{item.icon}</div>
                  <div className="stat-value">{item.value}</div>
                  <div className="stat-label">{item.label}</div>
                  <div className="stat-card-divider" />
                  <p className="stat-explanation">{item.explanation}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </section>

      <section className="detailed-calculator-section" id="detailed-calculator" aria-labelledby="detailed-calc-heading">
        {/* Tab Bar Container with Left/Right Scroll Arrows */}
        <div className="accident-tabs-nav-wrapper">
          <button
            type="button"
            className="tabs-scroll-btn left"
            onClick={() => scrollAccidentTabs("left")}
            aria-label="Scroll tabs left"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>

          <div className="accident-tabs-bar" id="accident-tabs-container">
            <div className="accident-tabs-track">
              {[
                { id: "car", label: "Car Accident", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/><path d="M5 17h10"/></svg> },
                { id: "truck", label: "Truck Accident", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="16" height="13" x="1" y="3" rx="2"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg> },
                { id: "motorcycle", label: "Motorcycle Accident", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="5" cy="18" r="3"/><circle cx="19" cy="18" r="3"/><path d="M12 18V8h4l3 3M12 13h5M9 8h3"/></svg> },
                { id: "bicycle", label: "Bicycle Accident", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="5.5" cy="17.5" r="3.5"/><circle cx="18.5" cy="17.5" r="3.5"/><path d="M15 6a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm-3 11.5V14l-3-3 4-3 2 3h3"/></svg> },
                { id: "pedestrian", label: "Pedestrian Accident", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="4" r="1"/><path d="m18 10-4-1-1-3h-2L9 12h2v8M11.5 14l-2 6"/></svg> },
                { id: "rideshare", label: "Rideshare Accident", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/><path d="M5 17h10"/><path d="M12 2v4M10 4h4"/></svg> },
                { id: "bus", label: "Bus Accident", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="3" width="16" height="16" rx="2"/><path d="M4 11h16M8 3v8M16 3v8M6 19v2M18 19v2M8 15h8"/></svg> },
                { id: "boating", label: "Boating Accident", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 18H2a4 4 0 0 0 4 4h12a4 4 0 0 0 4-4zM2 14l3-9h14l3 9H2zM12 2v3M9 3h6"/></svg> },
                { id: "aviation", label: "Aviation Accident", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L14 19v-5.5l7 2.5z"/></svg> },
                { id: "workplace", label: "Workplace Accident", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg> },
                { id: "construction", label: "Construction Accident", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 3v18M15 3v18M3 9h18M3 15h18"/></svg> },
                { id: "slipfall", label: "Slip & Fall", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg> },
                { id: "premises", label: "Premises Liability", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg> },
                { id: "dogbite", label: "Dog Bite", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2s8 4 8 10-8 10-8 10-8-4-8-10 8-10 8-10z"/></svg> },
                { id: "medmal", label: "Medical Malpractice", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg> },
                { id: "nursinghome", label: "Nursing Home Abuse", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> },
                { id: "product", label: "Defective Product", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="12" x2="12" y2="22"/></svg> },
                { id: "wrongfuldeath", label: "Wrongful Death", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><line x1="8" y1="11" x2="16" y2="11"/><line x1="12" y1="7" x2="12" y2="15"/></svg> },
                { id: "catastrophic", label: "Catastrophic Injury", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="5" r="2"/><path d="M12 7v6h4l2 5M12 13H8l-2 5"/></svg> },
                { id: "burn", label: "Burn Injury", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg> },
                { id: "spinalcord", label: "Spinal Cord Injury", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v18M8 6h8M8 11h8M8 16h8"/></svg> },
                { id: "tbi", label: "Brain Injury", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a5 5 0 0 0-5 5v1a4 4 0 0 0-1 2.5V18a3 3 0 0 0 3 3h6a3 3 0 0 0 3-3v-7.5A4 4 0 0 0 17 7V7a5 5 0 0 0-5-5z"/><path d="M12 6v6M9 9h6"/></svg> },
                { id: "amputation", label: "Amputation Injury", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="6" y1="3" x2="18" y2="15"/><line x1="18" y1="3" x2="6" y2="15"/></svg> },
                { id: "assault", label: "Assault Injury", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg> },
                { id: "swimmingpool", label: "Swimming Pool", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 6c.6 0 1.2-.2 1.6-.6L5 4.2c.4-.4 1-.6 1.6-.6s1.2.2 1.6.6L9.6 5.4c.4.4 1 .6 1.6.6s1.2-.2 1.6-.6L14.2 4.2c.4-.4 1-.6 1.6-.6s1.2.2 1.6.6L19 5.4c.4.4 1 .6 1.6.6s1.2-.2 1.6-.6M2 12c.6 0 1.2-.2 1.6-.6L5 10.2c.4-.4 1-.6 1.6-.6s1.2.2 1.6.6L9.6 11.4c.4.4 1 .6 1.6.6s1.2-.2 1.6-.6L14.2 10.2c.4-.4 1-.6 1.6-.6s1.2.2 1.6.6L19 11.4c.4.4 1 .6 1.6.6s1.2-.2 1.6-.6M2 18c.6 0 1.2-.2 1.6-.6L5 16.2c.4-.4 1-.6 1.6-.6s1.2.2 1.6.6L9.6 17.4c.4.4 1 .6 1.6.6s1.2-.2 1.6-.6L14.2 16.2c.4-.4 1-.6 1.6-.6s1.2.2 1.6.6L19 17.4c.4.4 1 .6 1.6.6s1.2-.2 1.6-.6"/></svg> }
              ].map((tab) => (
                <button
                  key={tab.id}
                  role="tab"
                  aria-selected={activeAccidentTab === tab.id}
                  className={`accident-tab-button ${activeAccidentTab === tab.id ? "active" : ""}`}
                  onClick={() => handleAccidentTabChange(tab.id)}
                  onMouseEnter={(e) => handleTabMouseEnter(e, tab.id)}
                  onMouseLeave={handleTabMouseLeave}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                  <svg className="tab-button-info-icon" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="12" y1="16" x2="12" y2="12"/>
                    <line x1="12" y1="8" x2="12.01" y2="8"/>
                  </svg>
                </button>
              ))}
            </div>
          </div>

          <button
            type="button"
            className="tabs-scroll-btn right"
            onClick={() => scrollAccidentTabs("right")}
            aria-label="Scroll tabs right"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>

          {activeTooltip && (
            <div
              className="tab-portal-tooltip"
              style={{
                left: `${activeTooltip.x}px`,
                top: `${activeTooltip.y - 8}px`
              }}
            >
              {activeTooltip.text}
              <div className="tab-portal-tooltip-arrow" />
            </div>
          )}
        </div>

        {/* Section Header */}
        <div className="section-heading detailed-header">
          <p className="eyebrow">DETAILED CALCULATOR – HOUSTON, TX</p>
          <h2 id="detailed-calc-heading">{activeTabData.title}</h2>
          <p>{activeTabData.subtitle}</p>
        </div>

        {/* Embedded Calculator */}
        <div className="embedded-calculator-wrapper">
          <div className="accident-calculator-grid">
            {/* Inputs Panel */}
            <div className="accident-calc-panel inputs">
              {/* Medical Expenses */}
              <div className="acc-calc-field">
                <label>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
                  Total Medical Expenses
                </label>
                <div className="acc-money-input-box">
                  <span className="acc-currency-prefix">$</span>
                  <input
                    type="number"
                    min="0"
                    step="100"
                    value={accMedical}
                    onChange={(e) => setAccMedical(Number(e.target.value) || 0)}
                  />
                </div>
              </div>

              {/* Lost Wages */}
              <div className="acc-calc-field">
                <label>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
                  Lost Wages
                </label>
                <div className="acc-money-input-box">
                  <span className="acc-currency-prefix">$</span>
                  <input
                    type="number"
                    min="0"
                    step="100"
                    value={accWages}
                    onChange={(e) => setAccWages(Number(e.target.value) || 0)}
                  />
                </div>
              </div>

              {/* Injury Severity */}
              <div className="acc-calc-field">
                <label>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                  Injury Severity
                </label>
                <div className="acc-severity-buttons">
                  {(["minor", "moderate", "severe", "catastrophic"] as const).map((level) => (
                    <button
                      key={level}
                      type="button"
                      className={`acc-severity-btn ${accSeverity === level ? "active" : ""}`}
                      onClick={() => setAccSeverity(level)}
                    >
                      {level.charAt(0).toUpperCase() + level.slice(1)}
                    </button>
                  ))}
                </div>
                <p className="acc-severity-caption">{accCalculations.caption}</p>
              </div>

              {/* Fault Percentage */}
              <div className="acc-calc-field">
                <div className="acc-fault-label-row">
                  <label>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="5" x2="5" y2="19"/><circle cx="6.5" cy="6.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/></svg>
                    Fault Percentage
                  </label>
                  <span className="acc-fault-value">{accFault}%</span>
                </div>
                <div className="acc-slider-container">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={accFault}
                    onChange={(e) => setAccFault(Number(e.target.value))}
                  />
                </div>
              </div>
            </div>

            {/* Results Panel */}
            <div className="accident-calc-panel results">
              <p className="acc-result-eyebrow">ESTIMATED SETTLEMENT RANGE</p>
              <h2 className="acc-result-range">
                {fmt.format(accCalculations.finalLow)} – {fmt.format(accCalculations.finalHigh)}
              </h2>

              {/* Stacked Chart */}
              <div className="acc-chart-container">
                {(() => {
                  const total = accCalculations.subtotalHigh;
                  const econWidth = (accCalculations.economic / total) * 100;
                  const painWidth = (accCalculations.painHigh / total) * 100;
                  const faultWidth = (accCalculations.faultHigh / total) * 100;
                  return (
                    <>
                      <div className="acc-stacked-bar">
                        <div className="bar-segment economic" style={{ width: `${econWidth}%` }} />
                        <div className="bar-segment pain" style={{ width: `${painWidth}%` }} />
                        {accFault > 0 && (
                          <div className="bar-segment fault" style={{ width: `${faultWidth}%` }} />
                        )}
                      </div>
                      <div className="acc-chart-legend">
                        <div><span className="legend-dot economic" /> Economic</div>
                        <div><span className="legend-dot pain" /> Pain & suffering</div>
                        {accFault > 0 && (
                          <div><span className="legend-dot fault" /> Reduced for fault</div>
                        )}
                      </div>
                    </>
                  );
                })()}
              </div>

              {/* Breakdown Table */}
              <div className="acc-breakdown-table">
                <div className="acc-table-row">
                  <span>Economic damages</span>
                  <strong>{fmt.format(accCalculations.economic)}</strong>
                </div>
                <div className="acc-table-row">
                  <span>Pain & suffering ({accCalculations.multLow}x–{accCalculations.multHigh}x)</span>
                  <strong>{fmt.format(accCalculations.painLow)} – {fmt.format(accCalculations.painHigh)}</strong>
                </div>
                <div className="acc-table-row">
                  <span>Subtotal, before fault</span>
                  <strong>{fmt.format(accCalculations.subtotalLow)} – {fmt.format(accCalculations.subtotalHigh)}</strong>
                </div>
                <div className="acc-table-row">
                  <span>Fault adjustment (-{accFault}%)</span>
                  <strong>-{fmt.format(accCalculations.faultLow)} – -{fmt.format(accCalculations.faultHigh)}</strong>
                </div>
                <div className="acc-table-divider" />
                <div className="acc-table-row final-row">
                  <span>Estimated settlement range</span>
                  <strong>{fmt.format(accCalculations.finalLow)} – {fmt.format(accCalculations.finalHigh)}</strong>
                </div>
              </div>

              <p className="acc-legal-note">
                This range moves with evidence strength, available insurance policy limits, and venue history. It's an educational estimate, not legal advice or a guarantee of any recovery — final value depends on the facts of your case.
              </p>

              <a
                href="#contact"
                className="acc-cta-button"
              >
                Talk to a Sutliff & Stout Attorney About Your {activeAccidentTab === "car" ? "Car" : "Truck"} Accident Claim
              </a>
            </div>
          </div>
        </div>

        {/* 4 Cards Grid */}
        <div className="accident-content-grid">
          <div className="accident-card">
            <div className="accident-card-meta">
              <span className="card-num">01</span>
              <span className="card-kicker">ACCIDENT CLASS</span>
            </div>
            <h3>Definition of the Accident</h3>
            {renderCardText(activeTabData.definition, "definition")}
          </div>
          <div className="accident-card">
            <div className="accident-card-meta">
              <span className="card-num">02</span>
              <span className="card-kicker">DATA BENCHMARKS</span>
            </div>
            <h3>Statistics for It</h3>
            {renderCardText(activeTabData.statistics, "statistics")}
          </div>
          <div className="accident-card">
            <div className="accident-card-meta">
              <span className="card-num">03</span>
              <span className="card-kicker">EVIDENTIARY AUDIT</span>
            </div>
            <h3>Required Documents</h3>
            {renderCardText(activeTabData.documents, "documents")}
          </div>
          <div className="accident-card">
            <div className="accident-card-meta">
              <span className="card-num">04</span>
              <span className="card-kicker">INFLUENCE FACTORS</span>
            </div>
            <h3>Settlement Factors</h3>
            {renderCardText(activeTabData.factors, "factors")}
          </div>
        </div>
      </section>

      <section className="section method" id="method" aria-labelledby="method-heading">
        <div className="section-heading">
          <p className="eyebrow">Method before marketing</p>
          <h2 id="method-heading">How a personal injury settlement estimate is calculated</h2>
          <p>
            A personal injury settlement estimate is calculated through a layered range built from documented economic damage, pain and suffering multiplier application, plus a fault based reduction.
            {!isMethodDescExpanded && "..."}
            {isMethodDescExpanded && (
              <>
                {" "}
                A low end range reflects conservative documentation, minimal fault reduction, plus modest injury severity. A high end range reflects strong documentation, clear liability, plus severe or lasting injury impact. Insurance policy limit caps the high end range regardless of injury severity once total damages exceed available coverage. Sutliff & Stout narrows a client range through case specific evidence review connected to a filed claim.
              </>
            )}
            <button
              type="button"
              className="card-readmore-btn"
              onClick={() => setIsMethodDescExpanded(!isMethodDescExpanded)}
              aria-expanded={isMethodDescExpanded}
              style={{ display: "inline-flex", marginLeft: "6px", verticalAlign: "baseline" }}
            >
              {isMethodDescExpanded ? "Read less" : "Read more"}
              <svg 
                width="12" 
                height="12" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="3" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                style={{ 
                  marginLeft: "4px", 
                  transform: isMethodDescExpanded ? "rotate(180deg)" : "rotate(0deg)", 
                  transition: "transform 0.2s ease" 
                }}
              >
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </button>
          </p>
        </div>

        {/* Carousel Slider Container */}
        <div className="method-slider-container">
          <button 
            type="button" 
            className="slider-nav-btn prev desktop-only"
            onClick={prevMethodSlide}
            aria-label="Previous step"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
          </button>

          <div className="method-slider-card">
            {/* Top Row: Meta and Title */}
            <div className="method-slide-header">
              <span className="method-slide-num">{methodologySlides[activeMethodSlide].num}</span>
              <span className="method-slide-icon-box">{methodologySlides[activeMethodSlide].icon}</span>
              <h3>{methodologySlides[activeMethodSlide].title}</h3>
            </div>
            
            {(() => {
              const fullDesc = methodologySlides[activeMethodSlide].description;
              const sentences = fullDesc.split(". ");
              const shortDesc = sentences.slice(0, 2).join(". ") + (sentences.length > 2 ? "." : "");
              const isExpanded = !!expandedMethodSlides[activeMethodSlide];

              return (
                <p className="method-slide-description">
                  {isExpanded ? fullDesc : shortDesc}
                  {sentences.length > 2 && (
                    <>
                      {" "}
                      <button
                        type="button"
                        className="card-readmore-btn method-readmore-btn"
                        onClick={() => setExpandedMethodSlides((prev) => ({ ...prev, [activeMethodSlide]: !prev[activeMethodSlide] }))}
                        style={{ display: "inline-flex", alignItems: "center", marginLeft: "4px", marginTop: 0, verticalAlign: "middle" }}
                      >
                        {isExpanded ? "Read less ▴" : "Read more ▾"}
                      </button>
                    </>
                  )}
                </p>
              );
            })()}

            {/* Sub-Card Calculation Box */}
            <div className="method-slide-calc-box">
              <div className="method-calc-items">
                {methodologySlides[activeMethodSlide].calculation.items.map((item, idx) => (
                  <div className="method-calc-row" key={idx}>
                    <span>{item.label}</span>
                    <span>{item.value}</span>
                  </div>
                ))}
              </div>
              <div className="method-calc-divider" />
              <div className="method-calc-row total-row">
                <strong>{methodologySlides[activeMethodSlide].calculation.title}</strong>
                <strong>{methodologySlides[activeMethodSlide].calculation.total}</strong>
              </div>
            </div>
          </div>

          <button 
            type="button" 
            className="slider-nav-btn next desktop-only"
            onClick={nextMethodSlide}
            aria-label="Next step"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
          </button>
        </div>

        {/* Pagination & Mobile Control Row */}
        <div className="slider-controls-row">
          <button 
            type="button" 
            className="slider-nav-btn prev mobile-only-btn"
            onClick={prevMethodSlide}
            aria-label="Previous step"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
          </button>

          <div className="slider-dots">
            {methodologySlides.map((_, idx) => (
              <button
                key={idx}
                type="button"
                className={`slider-dot-btn ${activeMethodSlide === idx ? "active" : ""}`}
                onClick={() => setActiveMethodSlide(idx)}
                aria-label={`Go to step ${idx + 1}`}
              />
            ))}
          </div>

          <button 
            type="button" 
            className="slider-nav-btn next mobile-only-btn"
            onClick={nextMethodSlide}
            aria-label="Next step"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
          </button>
        </div>
      </section>

      <section className="section factors" id="factors" aria-labelledby="factors-heading">
        <div className="section-heading" style={{ marginBottom: "40px" }}>
          <p className="eyebrow">Value drivers</p>
          <h2 id="factors-heading">What factors affect a personal injury settlement value?</h2>
          <p>The factors that affect a personal injury settlement value are listed below.</p>
          
          {isFactorsDescExpanded && (
            <ul className="factors-intro-list">
              <li><strong>Gather Medical Evidence:</strong> Medical evidence establishes injury diagnosis, treatment path, plus prognosis connected to a specific claim. Complete medical records tie injury directly toward the incident, strengthening causation proof reviewed during negotiation. Gaps within treatment records weaken value tied to disputed severity or causation.</li>
              <li><strong>Provide Income Proof:</strong> Income proof documents wage loss connected to missed work following an injury. Pay stub record, tax filing, plus employer statement verify lost income totals entered toward the calculation. Self employed claimants supply a profit and loss record toward income verification absent a standard pay stub.</li>
              <li><strong>Collect Liability Evidence:</strong> Liability evidence establishes fault connected to a specific incident through police report, witness statement, plus physical evidence. Clear liability evidence strengthens negotiation leverage present during settlement discussion. Disputed liability evidence often lowers settlement value tied toward litigation risk carried by an insurance carrier.</li>
              <li><strong>Document Recovery Duration:</strong> Recovery duration tracks treatment length connected to an injury from initial diagnosis toward final medical release. Extended recovery duration signals higher severity, supporting a higher multiplier applied during calculation. Medical release documentation confirms treatment completion relevant toward final settlement value.</li>
              <li><strong>Confirm Insurance Limits:</strong> Insurance limit confirmation reveals maximum compensation available under a policy carried by an at fault party. Policy declaration page review prevents pursuit of a value figure exceeding available coverage. Underinsured motorist coverage extends compensation past a minimum liability limit when a policy includes added protection.</li>
              <li><strong>Review Applicable State Law:</strong> State law review reveals comparative fault rule, damage cap application, plus filing deadline connected to a specific jurisdiction. State specific rules shift settlement value upward or downward compared toward a claim filed elsewhere. Sutliff & Stout applies jurisdiction specific statute knowledge toward case strategy built around a filed claim.</li>
            </ul>
          )}

          <button
            type="button"
            className="card-readmore-btn"
            onClick={() => setIsFactorsDescExpanded(!isFactorsDescExpanded)}
            aria-expanded={isFactorsDescExpanded}
            style={{ marginTop: "16px" }}
          >
            {isFactorsDescExpanded ? "Read less" : "Read more"}
            <svg 
              width="12" 
              height="12" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="3" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              style={{ 
                marginLeft: "4px", 
                transform: isFactorsDescExpanded ? "rotate(180deg)" : "rotate(0deg)", 
                transition: "transform 0.2s ease" 
              }}
            >
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </button>
        </div>

        <div className="factors-tabs-container">
          {/* Left side: Vertical Tabs */}
          <div className="factors-tab-list" role="tablist" aria-label="Value drivers">
            {[
              { id: "01", title: "Gather Medical Evidence" },
              { id: "02", title: "Provide Income Proof" },
              { id: "03", title: "Collect Liability Evidence" },
              { id: "04", title: "Document Recovery Duration" },
              { id: "05", title: "Confirm Insurance Limits" },
              { id: "06", title: "Review Applicable State Law" },
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
                  <h3>01 / Gather Medical Evidence</h3>
                  <p>Medical evidence establishes injury diagnosis, treatment path, plus prognosis connected to a specific claim. Complete medical records tie injury directly toward the incident, strengthening causation proof reviewed during negotiation. Gaps within treatment records weaken value tied to disputed severity or causation.</p>
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
                  <h4>Detailed Impact Analysis</h4>
                  <p>Medical evidence gathering extends across emergency treatment records, specialist referral notes, imaging results, plus physical therapy log connected to a specific injury. A soft tissue injury supported through limited record carries lower value compared toward a fracture supported through imaging plus surgical record. A claimant treated across a short window supplies thinner evidence compared toward a claimant treated across an extended recovery period. Consistent record gathering across the full treatment path strengthens causation proof presented during negotiation or trial.</p>
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
                  <h3>02 / Provide Income Proof</h3>
                  <p>Income proof documents wage loss connected to missed work following an injury. Pay stub record, tax filing, plus employer statement verify lost income totals entered toward the calculation. Self employed claimants supply a profit and loss record toward income verification absent a standard pay stub.</p>
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
                  <h4>Detailed Impact Analysis</h4>
                  <p>Income proof extends across pay stub records, tax filing, plus employer verification letters connected to missed work. A salaried claimant missing two weeks of work supplies proof through pay stub comparison covering the missed period. A commission based claimant supplies extended income history toward an average earning calculation absent a fixed wage figure. Self employed claimants supply a profit and loss statement plus tax filing covering a period before plus after the incident.</p>
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
                  <h3>03 / Collect Liability Evidence</h3>
                  <p>Liability evidence establishes fault connected to a specific incident through police report, witness statement, plus physical evidence. Clear liability evidence strengthens negotiation leverage present during settlement discussion. Disputed liability evidence often lowers settlement value tied toward litigation risk carried by an insurance carrier.</p>
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
                  <h4>Detailed Impact Analysis</h4>
                  <p>Liability evidence extends across police reports, traffic camera footage, witness statements, plus physical damage assessment connected to a specific incident. A rear end collision often carries clear liability tied toward a following distance violation documented within a police report. A disputed intersection collision requires added evidence, a signal timing record or witness corroboration among options, toward fault clarity. Strong liability evidence shifts negotiation leverage upward. Weak liability evidence invites a lower initial offer from an insurance carrier.</p>
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
                  <h3>04 / Document Recovery Duration</h3>
                  <p>Recovery duration tracks treatment length connected to an injury from initial diagnosis toward final medical release. Extended recovery duration signals higher severity, supporting a higher multiplier applied during calculation. Medical release documentation confirms treatment completion relevant toward final settlement value.</p>
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
                  <h4>Detailed Impact Analysis</h4>
                  <p>Recovery duration documentation extends across treatment start date, therapy session log, plus final medical release date connected to a specific injury. A claimant released after six weeks of treatment supports a lower severity multiplier compared toward a claimant treated across twelve months. A permanent impairment rating extends recovery duration consideration past the final release date, supporting a higher multiplier tied toward lasting impact. Consistent documentation across the full duration strengthens value presented during settlement negotiation.</p>
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
                  <h3>05 / Confirm Insurance Limits</h3>
                  <p>Insurance limit confirmation reveals maximum compensation available under a policy carried by an at fault party. Policy declaration page review prevents pursuit of a value figure exceeding available coverage. Underinsured motorist coverage extends compensation past a minimum liability limit when a policy includes added protection.</p>
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
                  <h4>Detailed Impact Analysis</h4>
                  <p>Insurance limit confirmation extends across liability policy limit, umbrella policy presence, plus underinsured motorist coverage connected to a specific claim. A claim valued above a low liability limit shifts strategy toward underinsured motorist coverage carried by an injured party. A commercial vehicle claim often carries a policy limit set well above a standard personal auto policy. Confirming every available coverage layer prevents an injured party from settling below true claim value.</p>
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
                  <h3>06 / Review Applicable State Law</h3>
                  <p>State law review reveals comparative fault rule, damage cap application, plus filing deadline connected to a specific jurisdiction. State specific rules shift settlement value upward or downward compared toward a claim filed elsewhere. Sutliff & Stout applies jurisdiction specific statute knowledge toward case strategy built around a filed claim.</p>
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
                  <h4>Detailed Impact Analysis</h4>
                  <p>State law review extends across comparative fault threshold, statute of limitations deadline, plus damage cap application connected to a specific jurisdiction. Texas applies a modified comparative fault rule barring recovery once assigned fault crosses fifty percent. Texas sets a filing deadline tied toward two years from an incident date across a standard injury claim. A jurisdiction applying a damage cap toward non economic loss shifts strategy toward economic loss documentation within a filed claim.</p>
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

       <section className="section scope-section" aria-labelledby="interpret-heading">
        <div className="section-heading scope-heading">
          <p className="eyebrow">Information gain</p>
          <h2 id="interpret-heading">How to Interpret Your Settlement Estimate</h2>
          <p style={{ maxWidth: "800px", margin: "20px auto 0", color: "#aeb7d3", lineHeight: "1.65" }}>
            To interpret your settlement estimate, follow the four steps.
            {!isInterpretDescExpanded && "..."}
            {isInterpretDescExpanded && (
              <>
                {" "}
                First, review the presented range against documented economic damage totals entered toward the calculation. Second, identify evidence gaps tied to causation, income proof, or liability clarity that could narrow the range through added documentation. Third, compare the range against applicable state law, checking fault threshold plus damage cap application relevant toward the specific claim. Lastly, confirm available insurance coverage supports the high end of the presented range before proceeding toward negotiation.
              </>
            )}
            <button
              type="button"
              className="card-readmore-btn"
              onClick={() => setIsInterpretDescExpanded(!isInterpretDescExpanded)}
              aria-expanded={isInterpretDescExpanded}
              style={{ display: "inline-flex", marginLeft: "6px", verticalAlign: "baseline", color: "var(--signal)" }}
            >
              {isInterpretDescExpanded ? "Read less" : "Read more"}
              <svg 
                width="12" 
                height="12" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="3" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                style={{ 
                  marginLeft: "4px", 
                  transform: isInterpretDescExpanded ? "rotate(180deg)" : "rotate(0deg)", 
                  transition: "transform 0.2s ease" 
                }}
              >
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </button>
          </p>
        </div>
        
        <div className="scope-layout">
          <div className="scope-card">
            <ol>
              <li 
                onClick={() => setActiveScopeItem((prev) => (prev === 0 ? null : 0))}
                className="scope-accordion-item"
                style={{ cursor: "pointer" }}
              >
                <span style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
                  <h3>Is Every Loss Supported by a Record?</h3>
                  <span style={{ color: "var(--signal)", font: "900 20px var(--display)", transition: "transform 0.2s" }}>
                    {activeScopeItem === 0 ? "−" : "+"}
                  </span>
                </span>
                <div>
                  <small style={{ display: "block", marginBottom: activeScopeItem === 0 ? "14px" : "0" }}>
                    {activeScopeItem === 0 
                      ? "Yes, every loss is supported by a record before a settlement estimate reaches final acceptance." 
                      : "Replace memory with bills, reports, wage statements, and dates."
                    }
                  </small>
                  {activeScopeItem === 0 && (
                    <p className="scope-expanded-text">
                      Medical expense claims need a billing statement, insurance explanation of benefit, plus treatment note connected toward each service billed. Lost wage claims need pay stub comparison, employer verification, or tax filing connected toward the missed work period. Property damage claims need repair estimate, replacement invoice, or diminished value assessment connected toward the affected item. Sutliff & Stout reviews record completeness toward every loss category before presenting a finalized settlement estimate.
                    </p>
                  )}
                </div>
              </li>

              <li 
                onClick={() => setActiveScopeItem((prev) => (prev === 1 ? null : 1))}
                className="scope-accordion-item"
                style={{ cursor: "pointer" }}
              >
                <span style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
                  <h3>Which Facts Could Weaken Causation?</h3>
                  <span style={{ color: "var(--signal)", font: "900 20px var(--display)", transition: "transform 0.2s" }}>
                    {activeScopeItem === 1 ? "−" : "+"}
                  </span>
                </span>
                <div>
                  <small style={{ display: "block", marginBottom: activeScopeItem === 1 ? "14px" : "0" }}>
                    {activeScopeItem === 1 
                      ? "The facts that could weaken causation are listed below." 
                      : "Prior injuries and treatment gaps often need context, not concealment."
                    }
                  </small>
                  {activeScopeItem === 1 && (
                    <ul className="scope-sub-list" onClick={(e) => e.stopPropagation()}>
                      <li><strong>Treatment Gap:</strong> A treatment gap describes a delay or pause within a documented recovery path following an incident. Insurance adjusters cite a treatment gap toward an argument that injury severity resolved or originated elsewhere. Continuous treatment closes this gap, strengthening causation proof presented during negotiation.</li>
                      <li><strong>Pre Existing Condition:</strong> A pre existing condition describes an injury or diagnosis present before a specific incident occurred. Insurance adjusters cite pre existing history toward an argument that current symptoms predate the incident. Medical documentation distinguishing aggravation from origin strengthens causation proof tied toward the specific incident.</li>
                      <li><strong>Delayed Reporting:</strong> Delayed reporting describes a gap between incident date plus initial medical treatment or police report filing. Insurance adjusters cite delayed reporting toward an argument that injury severity was minimal at incident time. Prompt reporting plus immediate treatment closes this gap, supporting causation proof presented during review.</li>
                      <li><strong>Inconsistent Statement:</strong> An inconsistent statement describes contradictory detail present across a police report, medical record, or claim narrative. Insurance adjusters cite inconsistency toward an argument that overall claim credibility carries doubt. Consistent detail maintained across every record strengthens credibility presented during negotiation or trial.</li>
                    </ul>
                  )}
                </div>
              </li>

              <li 
                onClick={() => setActiveScopeItem((prev) => (prev === 2 ? null : 2))}
                className="scope-accordion-item"
                style={{ cursor: "pointer" }}
              >
                <span style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
                  <h3>What Does Local Law Change?</h3>
                  <span style={{ color: "var(--signal)", font: "900 20px var(--display)", transition: "transform 0.2s" }}>
                    {activeScopeItem === 2 ? "−" : "+"}
                  </span>
                </span>
                <div>
                  <small style={{ display: "block", marginBottom: activeScopeItem === 2 ? "14px" : "0" }}>
                    {activeScopeItem === 2 
                      ? "Local law changes settlement value through comparative fault threshold, damage cap application, plus filing deadline connected to a specific jurisdiction." 
                      : "Check deadlines, comparative fault, caps, and recoverable damages."
                    }
                  </small>
                  {activeScopeItem === 2 && (
                    <p className="scope-expanded-text">
                      A jurisdiction applying a strict comparative fault threshold bars recovery once assigned fault crosses a set percentage, shifting strategy toward liability proof. A jurisdiction applying a damage cap toward non economic loss limits recovery regardless of injury severity within a specific claim category. Filing deadline variance across jurisdiction shifts urgency connected to evidence gathering plus claim filing timeline. Sutliff & Stout applies Texas specific statute knowledge toward case strategy built around a filed claim across Houston.
                    </p>
                  )}
                </div>
              </li>

              <li 
                onClick={() => setActiveScopeItem((prev) => (prev === 3 ? null : 3))}
                className="scope-accordion-item"
                style={{ cursor: "pointer" }}
              >
                <span style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
                  <h3>What Coverage Is Actually Available?</h3>
                  <span style={{ color: "var(--signal)", font: "900 20px var(--display)", transition: "transform 0.2s" }}>
                    {activeScopeItem === 3 ? "−" : "+"}
                  </span>
                </span>
                <div>
                  <small style={{ display: "block", marginBottom: activeScopeItem === 3 ? "14px" : "0" }}>
                    {activeScopeItem === 3 
                      ? "Coverage available toward a settlement traces through liability policy limit, umbrella policy presence, plus underinsured motorist coverage carried by an involved party." 
                      : "Identify responsible parties and relevant insurance policies."
                    }
                  </small>
                  {activeScopeItem === 3 && (
                    <p className="scope-expanded-text">
                      A liability policy limit sets the maximum an at fault carrier pays regardless of total damage value proven within a claim. An umbrella policy extends coverage past a standard liability limit once total damage value exceeds the base policy. Underinsured motorist coverage extends compensation past a minimum liability limit when a policy includes added protection carried by the injured party. Sutliff & Stout confirms every available coverage layer before finalizing a settlement estimate presented to a client.
                    </p>
                  )}
                </div>
              </li>
            </ol>
          </div>
          <div className="scope-aside">
            <span className="scope-stamp">NO LEAD FORM</span>
            <h3>Your case facts stay in your browser.</h3>
            <p>This first version sends no calculator inputs to a server and asks for no name, email, or phone number.</p>
            <button onClick={scrollToCalculator}>Recalculate privately <span>↗</span></button>
          </div>
        </div>
      </section>

      <section className="section states-section" id="states" aria-labelledby="states-heading">
        <div className="section-heading states-heading">
          <p className="eyebrow">Geographic topic cluster</p>
          <h2 id="states-heading">Personal injury settlement calculators by state</h2>
          <p style={{ maxWidth: "800px", margin: "20px auto 0", lineHeight: "1.65" }}>
            Personal injury settlement calculators by state adjust output based on comparative fault threshold, damage cap application, plus filing deadline specific toward a chosen jurisdiction.
            {!isStatesDescExpanded && " "}
            {isStatesDescExpanded && (
              <>
                {" "}
                State selection changes multiplier range application once local damage cap rules apply toward non economic loss. Filing deadline variance across state law shifts urgency connected to a pending claim nearing a statutory cutoff. Local city data connected to a chosen state supports venue specific expectation setting relevant toward settlement negotiation. Sutliff & Stout builds state specific calculator logic around jurisdiction law reviewed across a filed claim.{" "}
              </>
            )}
            <button
              type="button"
              className="card-readmore-btn"
              onClick={() => setIsStatesDescExpanded(!isStatesDescExpanded)}
              aria-expanded={isStatesDescExpanded}
              style={{ display: "inline-flex", alignItems: "center", marginLeft: "4px", marginTop: 0, verticalAlign: "middle" }}
            >
              {isStatesDescExpanded ? "Read less" : "Read more"}
              <svg 
                width="12" 
                height="12" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="3" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                style={{ 
                  marginLeft: "4px", 
                  transform: isStatesDescExpanded ? "rotate(180deg)" : "rotate(0deg)", 
                  transition: "transform 0.2s ease" 
                }}
              >
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </button>
          </p>
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
                <h3>{customStateTexts[selectedState.code] ? `${selectedState.name} Accident Settlement Calculator` : `${selectedState.name} Calculation Angle`}</h3>
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

                    const descriptionText = customStateTexts[selectedState.code]
                      ? customStateTexts[selectedState.code].description
                      : `${selectedState.name} accident settlement calculators apply a ${stateStats.rule.toLowerCase()} rule under state statute. Filing deadline application sets a ${stateStats.deadline} window from an incident date across a standard personal injury claim filed within ${selectedState.name}. A standard vehicle collision claim features ${stateStats.caps.toLowerCase()} under ${selectedState.name} law. Local city data connected to the state supports venue specific expectation setting relevant toward settlement negotiation, reviewed through the ${selectedState.name} Settlement Calculator.`;

                    return (
                      <>
                        <p className="state-panel-lede" style={{ marginBottom: "28px" }}>
                          {descriptionText}
                        </p>
                        



                        {customStateTexts[selectedState.code]?.cities && (
                          <div className="state-cities-section">
                            <h4>Core Cities Settlement Benchmarks</h4>
                            <div className="state-cities-grid">
                              {customStateTexts[selectedState.code].cities.map((city, idx) => (
                                <div key={idx} className="state-city-card">
                                  <span className="state-city-name">{city.name}</span>
                                  <span className="state-city-range">{city.range}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="state-calc-cta" style={{ marginTop: "32px" }}>
                          <p>Selecting {selectedState.name} in the main calculator allows you to model comparative fault adjustments manually.</p>
                          <Link href={`/states/${selectedState.slug}`} className="state-link-btn">
                            View full {selectedState.name} Settlement Guide <span>↗</span>
                          </Link>
                        </div>
                      </>
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

      <section className="section faq" id="faq" aria-labelledby="faq-heading">
        <div className="section-heading">
          <p className="eyebrow">Plain answers</p>
          <h2 id="faq-heading">Frequently asked questions about settlement calculators</h2>
        </div>
        
        {/* Horizontal Navigation Tabs with Info Icon & Tooltip */}
        <div className="faq-tabs-nav-wrapper">
          <button
            type="button"
            className="tabs-scroll-btn left"
            onClick={() => scrollFaqTabs("left")}
            aria-label="Scroll FAQ tabs left"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>

          <div className="faq-tabs-scroll-container" ref={faqTabsRef}>
            <div className="faq-tabs-row" role="tablist" aria-label="FAQ Categories">
              {faqCategoryData.map((cat, idx) => (
                <button
                  key={cat.id}
                  role="tab"
                  aria-selected={activeFaqCategoryTab === idx}
                  className={`faq-horizontal-tab-btn ${activeFaqCategoryTab === idx ? "active" : ""}`}
                  onClick={() => handleFaqCategoryTabChange(idx)}
                  onMouseEnter={(e) => handleFaqTabMouseEnter(e, cat.tooltip)}
                  onMouseLeave={handleFaqTabMouseLeave}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="4" y="2" width="16" height="20" rx="2" ry="2"/>
                    <line x1="8" y1="6" x2="16" y2="6"/>
                    <line x1="16" y1="14" x2="16" y2="18"/>
                    <path d="M16 10h.01M12 10h.01M8 10h.01M12 14h.01M8 14h.01M12 18h.01M8 18h.01"/>
                  </svg>
                  <span>{cat.title}</span>
                  <svg 
                    className="tab-button-info-icon" 
                    width="13" 
                    height="13" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2.5" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                    onClick={(e) => toggleFaqCategoryTooltip(e, cat.tooltip)}
                  >
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="12" y1="16" x2="12" y2="12"/>
                    <line x1="12" y1="8" x2="12.01" y2="8"/>
                  </svg>
                </button>
              ))}
            </div>
          </div>

          <button
            type="button"
            className="tabs-scroll-btn right"
            onClick={() => scrollFaqTabs("right")}
            aria-label="Scroll FAQ tabs right"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>

          {activeFaqCategoryTooltip && (
            <div
              className="tab-portal-tooltip"
              style={{
                left: `${activeFaqCategoryTooltip.x}px`,
                top: `${activeFaqCategoryTooltip.y - 8}px`
              }}
            >
              {activeFaqCategoryTooltip.text}
              <div className="tab-portal-tooltip-arrow" />
            </div>
          )}
        </div>

        {/* Tab Items Container */}
        <div className="faq-items-list">
          {faqCategoryData[activeFaqCategoryTab]?.items.map((item, idx) => {
            const isOpen = activeFaqItemId === item.id;
            const isReadMore = !!readMoreFaqItems[item.id];
            
            // Sentence split for preview
            const sentences = item.text.split(". ");
            const previewText = sentences[0] + (sentences.length > 1 ? "." : "");

            return (
              <div key={item.id} className={`faq-item-card ${isOpen ? "open" : ""}`}>
                <button
                  type="button"
                  className="faq-item-header"
                  onClick={() => toggleFaqAccordion(item.id)}
                  aria-expanded={isOpen}
                >
                  {item.tag === "h4" ? (
                    <h4>{item.question}</h4>
                  ) : item.tag === "h2" || (idx === 0 && !item.tag) ? (
                    <h2>{item.question}</h2>
                  ) : (
                    <h3>{item.question}</h3>
                  )}
                  <span className="faq-toggle-icon">{isOpen ? "−" : "+"}</span>
                </button>

                {isOpen && (
                  <div className="faq-item-body">
                    <p className="faq-preview-text">
                      {isReadMore ? item.text : previewText}
                    </p>

                    {/* Responsive Table rendering for items with table data */}
                    {isReadMore && item.table && (
                      <div className="faq-table-wrapper">
                        <table className="faq-responsive-table">
                          <thead>
                            <tr>
                              {item.table.headers.map((header, hIdx) => (
                                <th key={hIdx}>{header}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {item.table.rows.map((row, rIdx) => (
                              <tr key={rIdx}>
                                {row.map((cell, cIdx) => (
                                  <td key={cIdx} data-label={item.table?.headers[cIdx]}>{cell}</td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}

                    {/* Bullet List rendering for items with listItems */}
                    {isReadMore && item.listItems && (
                      <ul className="faq-bullet-list">
                        {item.listItems.map((li, lIdx) => (
                          <li key={lIdx}>
                            <strong>{li.label}: </strong>{li.content}
                          </li>
                        ))}
                      </ul>
                    )}

                    {/* Show Diagram Image box when Read More is active */}
                    {isReadMore && item.diagram === "process-diagram-1" && (
                      <div className="faq-diagram-card dark-theme">
                        <h4 className="faq-diagram-title">Settlement Calculation Process</h4>
                        <div className="faq-diagram-flow">
                          <div className="faq-flow-step">
                            <div className="faq-step-box">
                              <div className="faq-step-icon">
                                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="2"/><path d="M6 12h.01M18 12h.01"/></svg>
                              </div>
                              <span>Calculate Economic Damages</span>
                            </div>
                          </div>
                          <div className="faq-flow-arrow">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                          </div>
                          <div className="faq-flow-step">
                            <div className="faq-step-box">
                              <div className="faq-step-icon">
                                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                              </div>
                              <span>Estimate Non-economic Damages</span>
                            </div>
                          </div>
                          <div className="faq-flow-arrow">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                          </div>
                          <div className="faq-flow-step">
                            <div className="faq-step-box">
                              <div className="faq-step-icon">
                                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m14 13 5 5M6 6l5 5M4 11l4-4M13 20l4-4M15 4l5 5"/></svg>
                              </div>
                              <span>Apply Legal Adjustments</span>
                            </div>
                          </div>
                          <div className="faq-flow-arrow">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                          </div>
                          <div className="faq-flow-step">
                            <div className="faq-step-box highlight">
                              <div className="faq-step-icon">
                                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><path d="m9 15 2 2 4-4"/></svg>
                              </div>
                              <span>Final Settlement Value</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {isReadMore && item.diagram === "process-diagram-2" && (
                      <div className="faq-diagram-card dark-theme alt-bg">
                        <h4 className="faq-diagram-title">Settlement Value Calculation Process</h4>
                        <div className="faq-diagram-flow">
                          <div className="faq-flow-step">
                            <div className="faq-step-box simple">
                              <span>Calculate Economic Damages</span>
                            </div>
                          </div>
                          <div className="faq-flow-arrow">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                          </div>
                          <div className="faq-flow-step">
                            <div className="faq-step-box simple">
                              <span>Estimate Non-Economic Damages</span>
                            </div>
                          </div>
                          <div className="faq-flow-arrow">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                          </div>
                          <div className="faq-flow-step">
                            <div className="faq-step-box simple">
                              <span>Apply Legal Adjustments</span>
                            </div>
                          </div>
                          <div className="faq-flow-arrow">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                          </div>
                          <div className="faq-flow-step">
                            <div className="faq-step-box simple highlight">
                              <span>Final Settlement Value</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {isReadMore && item.diagram === "process-diagram-3" && (
                      <div className="faq-diagram-card dark-theme alt-bg-2">
                        <h4 className="faq-diagram-title">Settlement Amount Calculation Process</h4>
                        <div className="faq-diagram-bracket-flow">
                          <div className="faq-bracket-left-col">
                            <div className="faq-step-box simple">
                              <span>Calculate Economic Damages</span>
                            </div>
                            <div className="faq-step-box simple">
                              <span>Estimate Non-Economic Damages</span>
                            </div>
                          </div>
                          <div className="faq-bracket-symbol">
                            <svg width="24" height="84" viewBox="0 0 24 84" fill="none" stroke="#ff6b52" strokeWidth="2.5">
                              <path d="M4 6 C16 6, 16 22, 16 42 C16 62, 16 78, 4 78 M16 42 L24 42" strokeLinecap="round" />
                            </svg>
                          </div>
                          <div className="faq-flow-step">
                            <div className="faq-step-box simple">
                              <span>Apply Legal Adjustments</span>
                            </div>
                          </div>
                          <div className="faq-flow-arrow">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                          </div>
                          <div className="faq-flow-step">
                            <div className="faq-step-box simple highlight">
                              <span>Final Settlement Amount</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {isReadMore && item.diagram === "process-diagram-4" && (
                      <div className="faq-diagram-card dark-theme alt-bg-2">
                        <h4 className="faq-diagram-title">Settlement Amount Calculation Process</h4>
                        <div className="faq-diagram-bracket-flow">
                          <div className="faq-bracket-left-col">
                            <div className="faq-step-box blue-theme">
                              <div className="faq-step-icon">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#00b4d8" strokeWidth="2"><rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="2"/><path d="M6 12h.01M18 12h.01"/></svg>
                              </div>
                              <span>Calculate Economic Damages</span>
                            </div>
                            <div className="faq-step-box blue-theme">
                              <div className="faq-step-icon">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#00b4d8" strokeWidth="2"><path d="m14 13 5 5M6 6l5 5M4 11l4-4M13 20l4-4M15 4l5 5"/></svg>
                              </div>
                              <span>Estimate Non-Economic Damages</span>
                            </div>
                          </div>
                          <div className="faq-bracket-symbol">
                            <svg width="24" height="84" viewBox="0 0 24 84" fill="none" stroke="#00b4d8" strokeWidth="2.5">
                              <path d="M4 6 C16 6, 16 22, 16 42 C16 62, 16 78, 4 78 M16 42 L24 42" strokeLinecap="round" />
                            </svg>
                          </div>
                          <div className="faq-flow-step">
                            <div className="faq-step-box blue-theme">
                              <div className="faq-step-icon">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#00b4d8" strokeWidth="2"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"/><line x1="8" y1="6" x2="16" y2="6"/><path d="M16 14h.01M12 14h.01M8 14h.01M12 18h.01M8 18h.01"/></svg>
                              </div>
                              <span>Calculate Total Damages</span>
                            </div>
                          </div>
                          <div className="faq-flow-arrow">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                          </div>
                          <div className="faq-flow-step">
                            <div className="faq-step-box blue-theme">
                              <div className="faq-step-icon">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#00b4d8" strokeWidth="2"><path d="m14 13 5 5M6 6l5 5M4 11l4-4M13 20l4-4M15 4l5 5"/></svg>
                              </div>
                              <span>Apply Legal Adjustments</span>
                            </div>
                          </div>
                          <div className="faq-flow-arrow">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                          </div>
                          <div className="faq-flow-step">
                            <div className="faq-step-box blue-theme highlight">
                              <div className="faq-step-icon">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#00b4d8" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><path d="m9 15 2 2 4-4"/></svg>
                              </div>
                              <span>Final Settlement Amount</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {isReadMore && item.diagram === "process-diagram-5" && (
                      <div className="faq-staircase-card">
                        <h4 className="faq-staircase-title">Insurance Settlement Process</h4>
                        <div className="faq-staircase-steps-wrapper">
                          <div className="stair-step-item step-green">
                            <span>Final Offer</span>
                          </div>
                          <div className="stair-step-item step-pink">
                            <span>Adjuster Discretion</span>
                          </div>
                          <div className="stair-step-item step-red">
                            <span>Policy Limit Check</span>
                          </div>
                          <div className="stair-step-item step-orange">
                            <span>Liability Assessment</span>
                          </div>
                          <div className="stair-step-item step-yellow">
                            <span>Claim Flagging</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {isReadMore && item.diagram === "process-diagram-inj1" && (
                      <div className="faq-diagram-card dark-theme alt-bg-2">
                        <h4 className="faq-diagram-title">Car Accident Settlement Calculation</h4>
                        <div className="faq-diagram-flow">
                          <div className="faq-flow-step">
                            <div className="faq-step-box blue-theme">
                              <span>Calculate Economic Damages</span>
                            </div>
                          </div>
                          <div className="faq-flow-arrow">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                          </div>
                          <div className="faq-flow-step">
                            <div className="faq-step-box blue-theme rounded-pill">
                              <span>Apply Multiplier</span>
                            </div>
                          </div>
                          <div className="faq-flow-arrow">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                          </div>
                          <div className="faq-flow-step">
                            <div className="faq-step-box blue-theme">
                              <span>Apply Fault Reduction</span>
                            </div>
                          </div>
                          <div className="faq-flow-arrow">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                          </div>
                          <div className="faq-flow-step">
                            <div className="faq-step-box blue-theme rounded-oval highlight">
                              <span>Final Settlement</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {isReadMore && item.diagram === "process-diagram-inj2" && (
                      <div className="faq-diagram-card dark-theme alt-bg-2">
                        <h4 className="faq-diagram-title">Personal Injury Settlement Calculation Process</h4>
                        <div className="faq-diagram-flow">
                          <div className="faq-flow-step">
                            <div className="faq-step-box blue-theme">
                              <div className="faq-step-icon">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#00b4d8" strokeWidth="2"><rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="2"/></svg>
                              </div>
                              <span>Calculate Economic Damages</span>
                              <p className="faq-step-subtext">Sum medical expenses, lost wages, and property damage costs.</p>
                            </div>
                          </div>
                          <div className="faq-flow-arrow">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                          </div>
                          <div className="faq-flow-step">
                            <div className="faq-step-box blue-theme">
                              <div className="faq-step-icon">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#00b4d8" strokeWidth="2"><circle cx="12" cy="12" r="9"/><path d="M12 8v8M8 12h8"/></svg>
                              </div>
                              <span>Apply Severity Multiplier</span>
                              <p className="faq-step-subtext">Adjust non-economic value based on injury type, recovery duration, and lasting impairment.</p>
                            </div>
                          </div>
                          <div className="faq-flow-arrow">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                          </div>
                          <div className="faq-flow-step">
                            <div className="faq-step-box blue-theme">
                              <div className="faq-step-icon">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#00b4d8" strokeWidth="2"><line x1="19" y1="5" x2="5" y2="19"/><circle cx="6.5" cy="6.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/></svg>
                              </div>
                              <span>Apply Fault Reduction</span>
                              <p className="faq-step-subtext">Lower the total based on percentage of responsibility under state law.</p>
                            </div>
                          </div>
                          <div className="faq-flow-arrow">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                          </div>
                          <div className="faq-flow-step">
                            <div className="faq-step-box blue-theme rounded-oval highlight">
                              <div className="faq-step-icon">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#00b4d8" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><path d="m9 15 2 2 4-4"/></svg>
                              </div>
                              <span>Final Settlement Amount</span>
                              <p className="faq-step-subtext">The resulting monetary value of the injury claim.</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {isReadMore && item.diagram === "process-diagram-inj3" && (
                      <div className="faq-diagram-card dark-theme alt-bg-2">
                        <h4 className="faq-diagram-title">Pain and Suffering Settlement Calculation Process</h4>
                        <div className="faq-diagram-flow">
                          <div className="faq-flow-step">
                            <div className="faq-step-box blue-theme">
                              <span className="step-tag">Step 1: Determine Economic Damages</span>
                              <p className="faq-step-subtext">Calculate medical expenses, lost income, and documented financial losses.</p>
                            </div>
                          </div>
                          <div className="faq-flow-arrow">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                          </div>
                          <div className="faq-flow-step">
                            <div className="faq-step-box blue-theme">
                              <span className="step-tag">Step 2: Evaluate Injury Severity</span>
                              <p className="faq-step-subtext">Assess recovery length and permanent impairment using medical evidence.</p>
                            </div>
                          </div>
                          <div className="faq-flow-arrow">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                          </div>
                          <div className="faq-flow-step">
                            <div className="faq-step-box blue-theme">
                              <span className="step-tag">Step 3: Estimate Pain and Suffering Value</span>
                              <p className="faq-step-subtext">Apply multiplier method or per diem method.</p>
                            </div>
                          </div>
                          <div className="faq-flow-arrow">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                          </div>
                          <div className="faq-flow-step">
                            <div className="faq-step-box blue-theme highlight">
                              <span className="step-tag">Step 4: Final Settlement Determination</span>
                              <p className="faq-step-subtext">Compare estimate with case facts, evidence, and negotiation factors.</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {isReadMore && item.diagram === "process-diagram-inj4" && (
                      <div className="faq-diagram-card dark-theme alt-bg-2">
                        <h4 className="faq-diagram-title">Slip and Fall Settlement Calculation Process</h4>
                        <div className="faq-diagram-flow">
                          <div className="faq-flow-step">
                            <div className="faq-step-box blue-theme">
                              <span>Calculate Economic Damages</span>
                              <p className="faq-step-subtext">Sum of medical expenses and documented lost wages.</p>
                            </div>
                          </div>
                          <div className="faq-flow-arrow">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                          </div>
                          <div className="faq-flow-step">
                            <div className="faq-step-box blue-theme">
                              <span>Apply Severity Multiplier</span>
                              <p className="faq-step-subtext">Multiply economic damages by a severity factor.</p>
                            </div>
                          </div>
                          <div className="faq-flow-arrow">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                          </div>
                          <div className="faq-flow-step">
                            <div className="faq-step-box blue-theme">
                              <span>Assess Premises Liability</span>
                              <p className="faq-step-subtext">Evaluate maintenance records and hazard notice history.</p>
                            </div>
                          </div>
                          <div className="faq-flow-arrow">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                          </div>
                          <div className="faq-flow-step">
                            <div className="faq-step-box blue-theme diamond-shape">
                              <span>Is Partial Responsibility Argued?</span>
                              <p className="faq-step-subtext">Determine if property owner claims injured party fault.</p>
                            </div>
                          </div>
                          <div className="faq-flow-arrow">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                          </div>
                          <div className="faq-flow-step">
                            <div className="faq-step-box blue-theme">
                              <span>Apply Comparative Fault Reduction</span>
                              <p className="faq-step-subtext">Reduce settlement based on percentage of injured party fault.</p>
                            </div>
                          </div>
                          <div className="faq-flow-arrow">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                          </div>
                          <div className="faq-flow-step">
                            <div className="faq-step-box blue-theme rounded-oval highlight">
                              <span>Final Settlement Amount</span>
                              <p className="faq-step-subtext">The resulting value after all adjustments.</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {isReadMore && item.diagram === "process-diagram-inj5" && (
                      <div className="faq-diagram-card dark-theme alt-bg-2">
                        <h4 className="faq-diagram-title">Settlement Value Calculation Process</h4>
                        <div className="faq-diagram-bracket-flow">
                          <div className="faq-bracket-left-col">
                            <div className="faq-step-box blue-theme">
                              <div className="faq-step-icon">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#00b4d8" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><circle cx="10" cy="12" r="3"/><line x1="12" y1="14" x2="15" y2="17"/></svg>
                              </div>
                              <span>Review Case History</span>
                            </div>
                            <div className="faq-step-box blue-theme">
                              <div className="faq-step-icon">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#00b4d8" strokeWidth="2"><rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="2"/></svg>
                              </div>
                              <span>Total Economic Damages</span>
                            </div>
                            <div className="faq-step-box blue-theme">
                              <div className="faq-step-icon">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#00b4d8" strokeWidth="2"><path d="m14 13 5 5M6 6l5 5M4 11l4-4M13 20l4-4M15 4l5 5"/></svg>
                              </div>
                              <span>Assess Negotiation Leverage</span>
                            </div>
                          </div>
                          <div className="faq-bracket-symbol">
                            <svg width="24" height="120" viewBox="0 0 24 120" fill="none" stroke="#00b4d8" strokeWidth="2.5">
                              <path d="M4 6 C16 6, 16 35, 16 60 C16 85, 16 114, 4 114 M16 60 L24 60" strokeLinecap="round" />
                            </svg>
                          </div>
                          <div className="faq-flow-step">
                            <div className="faq-step-box blue-theme highlight">
                              <div className="faq-step-icon">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#00b4d8" strokeWidth="2"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"/><line x1="8" y1="6" x2="16" y2="6"/><path d="M16 14h.01M12 14h.01M8 14h.01M12 18h.01M8 18h.01"/></svg>
                              </div>
                              <span>Calculate Settlement Value</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {isReadMore && item.diagram === "process-diagram-wc1" && (
                      <div className="faq-diagram-card dark-theme alt-bg-2">
                        <h4 className="faq-diagram-title">Workers Comp Settlement Calculation</h4>
                        <div className="faq-diagram-flow">
                          <div className="faq-flow-step">
                            <div className="faq-step-box blue-theme">
                              <span>Determine Weekly Wage</span>
                            </div>
                          </div>
                          <div className="faq-flow-arrow">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                          </div>
                          <div className="faq-flow-step">
                            <div className="faq-step-box blue-theme">
                              <span>Assess Impairment Rating</span>
                            </div>
                          </div>
                          <div className="faq-flow-arrow">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                          </div>
                          <div className="faq-flow-step">
                            <div className="faq-step-box blue-theme">
                              <span>Apply Benefit Schedule</span>
                            </div>
                          </div>
                          <div className="faq-flow-arrow">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                          </div>
                          <div className="faq-flow-step">
                            <div className="faq-step-box blue-theme highlight">
                              <span>Settlement Figure</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {isReadMore && item.diagram === "process-diagram-wc2" && (
                      <div className="faq-diagram-card dark-theme alt-bg-2">
                        <h4 className="faq-diagram-title">Workers' Compensation Settlement Calculation Process</h4>
                        <div className="faq-diagram-flow">
                          <div className="faq-flow-step">
                            <div className="faq-step-box pink-theme">
                              <div className="faq-step-icon">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ec4899" strokeWidth="2"><rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="2"/></svg>
                              </div>
                              <span className="step-tag pink-text">Step 1: Determine Benefits</span>
                            </div>
                          </div>
                          <div className="faq-flow-arrow">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                          </div>
                          <div className="faq-flow-step">
                            <div className="faq-step-box pink-theme">
                              <div className="faq-step-icon">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ec4899" strokeWidth="2"><path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2z"/></svg>
                              </div>
                              <span className="step-tag pink-text">Step 2: Gather Documentation</span>
                            </div>
                          </div>
                          <div className="faq-flow-arrow">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                          </div>
                          <div className="faq-flow-step">
                            <div className="faq-step-box pink-theme">
                              <div className="faq-step-icon">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ec4899" strokeWidth="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
                              </div>
                              <span className="step-tag pink-text">Step 3: Evaluate Future Factors</span>
                            </div>
                          </div>
                          <div className="faq-flow-arrow">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                          </div>
                          <div className="faq-flow-step">
                            <div className="faq-step-box pink-theme highlight">
                              <div className="faq-step-icon">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ec4899" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                              </div>
                              <span className="step-tag pink-text">Step 4: Compare and Decide</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {isReadMore && item.diagram === "process-diagram-wc3" && (
                      <div className="faq-diagram-card dark-theme alt-bg-2">
                        <h4 className="faq-diagram-title">Workers' Comp Settlement Calculation</h4>
                        <div className="faq-diagram-flow">
                          <div className="faq-flow-step">
                            <div className="faq-step-box blue-theme">
                              <span>Assess Wage History</span>
                            </div>
                          </div>
                          <div className="faq-flow-arrow">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                          </div>
                          <div className="faq-flow-step">
                            <div className="faq-step-box blue-theme">
                              <span>Evaluate Injury</span>
                            </div>
                          </div>
                          <div className="faq-flow-arrow">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                          </div>
                          <div className="faq-flow-step">
                            <div className="faq-step-box blue-theme">
                              <span>Apply State Law</span>
                            </div>
                          </div>
                          <div className="faq-flow-arrow">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                          </div>
                          <div className="faq-flow-step">
                            <div className="faq-step-box blue-theme">
                              <span>Estimate Future Costs</span>
                            </div>
                          </div>
                          <div className="faq-flow-arrow">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                          </div>
                          <div className="faq-flow-step">
                            <div className="faq-step-box blue-theme highlight">
                              <span>Calculate Settlement</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {isReadMore && item.diagram === "process-diagram-wc4" && (
                      <div className="faq-diagram-card dark-theme alt-bg-2">
                        <h4 className="faq-diagram-title">workers' Compensation Settlement Calculation Process</h4>
                        <div className="faq-diagram-flow">
                          <div className="faq-flow-step">
                            <div className="faq-step-box blue-theme">
                              <div className="faq-step-icon">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#00b4d8" strokeWidth="2"><rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="2"/></svg>
                              </div>
                              <span>Identify Benefits</span>
                            </div>
                          </div>
                          <div className="faq-flow-arrow">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                          </div>
                          <div className="faq-flow-step">
                            <div className="faq-step-box blue-theme">
                              <div className="faq-step-icon">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#00b4d8" strokeWidth="2"><path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2z"/></svg>
                              </div>
                              <span>Gather Documentation</span>
                            </div>
                          </div>
                          <div className="faq-flow-arrow">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                          </div>
                          <div className="faq-flow-step">
                            <div className="faq-step-box blue-theme">
                              <div className="faq-step-icon">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#00b4d8" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><circle cx="10" cy="12" r="3"/><line x1="12" y1="14" x2="15" y2="17"/></svg>
                              </div>
                              <span>Assess Case Factors</span>
                            </div>
                          </div>
                          <div className="faq-flow-arrow">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                          </div>
                          <div className="faq-flow-step">
                            <div className="faq-step-box blue-theme">
                              <div className="faq-step-icon">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#00b4d8" strokeWidth="2"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"/><line x1="8" y1="6" x2="16" y2="6"/><path d="M16 14h.01M12 14h.01M8 14h.01M12 18h.01M8 18h.01"/></svg>
                              </div>
                              <span>Evaluate Settlement</span>
                            </div>
                          </div>
                          <div className="faq-flow-arrow">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                          </div>
                          <div className="faq-flow-step">
                            <div className="faq-step-box diamond-shape highlight">
                              <div className="faq-step-icon">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="2"><path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="M7 21h10"/><path d="M12 3v18"/></svg>
                              </div>
                              <span>Decide on Resolution</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {isReadMore && item.diagram === "process-diagram-wc5" && (
                      <div className="faq-diagram-card dark-theme alt-bg-2">
                        <h4 className="faq-diagram-title">Calculate a California workers comp settlement</h4>
                        <div className="faq-diagram-flow">
                          <div className="faq-flow-step">
                            <div className="faq-step-box blue-theme">
                              <span>Determine disability rating</span>
                              <p className="faq-step-subtext">Determine the permanent disability rating assigned after reaching maximum medical improvement.</p>
                            </div>
                          </div>
                          <div className="faq-flow-arrow">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                          </div>
                          <div className="faq-flow-step">
                            <div className="faq-step-box blue-theme">
                              <span>Calculate disability benefits</span>
                              <p className="faq-step-subtext">Calculate the permanent disability benefits using the applicable California benefit rate and the disability rating.</p>
                            </div>
                          </div>
                          <div className="faq-flow-arrow">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                          </div>
                          <div className="faq-flow-step">
                            <div className="faq-step-box blue-theme">
                              <span>Consider additional factors</span>
                              <p className="faq-step-subtext">Consider future medical care, temporary disability benefits, age, occupation, and apportionment.</p>
                            </div>
                          </div>
                          <div className="faq-flow-arrow">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                          </div>
                          <div className="faq-flow-step">
                            <div className="faq-step-box blue-theme highlight">
                              <span>Determine settlement resolution</span>
                              <p className="faq-step-subtext">Determine whether the settlement will be resolved through a Compromise and Release or a Stipulated Award.</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {(item.text.length > previewText.length || item.table || item.listItems || item.diagram) && (
                      <button
                        type="button"
                        className="faq-readmore-btn"
                        onClick={(e) => toggleFaqReadMore(item.id, e)}
                      >
                        {isReadMore ? "Read less ▴" : "Read more ▾"}
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
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
