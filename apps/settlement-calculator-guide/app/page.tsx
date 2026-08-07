"use client";

import { useEffect, useMemo, useState } from "react";
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
        label: "Average settlement amount",
        explanation: "Typical recovery value drawn from resolved claims — skewed upward by a small share of large cases.",
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
        explanation: "Communicates the midpoint value across a resolved claim set, reducing distortion from outlier awards.",
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
        label: "Claims resulting in compensation",
        explanation: "Communicates how often a filed claim ends in payment versus denial or withdrawal.",
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
        explanation: "Communicates typical treatment cost carried across a resolved claim.",
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
        explanation: "Communicates typical missed income tied to a resolved claim.",
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
        explanation: "Communicates the common range applied toward non-economic loss calculation.",
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
        explanation: "Communicates typical duration from filing toward final resolution.",
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
        label: "Resolved without trial",
        explanation: "Communicates how often a claim closes through negotiation rather than a jury verdict.",
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
        explanation: "Communicates typical jury verdict value among cases that proceed toward trial.",
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
        explanation: "Communicates the common contingency percentage charged across resolved claims.",
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
        label: "Claims capped by policy limits",
        explanation: "Communicates how often available coverage caps final settlement value.",
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
        explanation: "Communicates how value shifts across minor, moderate, plus severe injury categories.",
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
        explanation: "Communicates how value shifts across different incident categories.",
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
        label: "Comparative-fault reduction",
        explanation: "Communicates typical value reduction tied to assigned fault.",
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
        label: "State-specific caps & deadlines",
        explanation: "Communicates jurisdiction specific limits plus filing windows.",
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
  }
};

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

  const prevMethodSlide = () => {
    setActiveMethodSlide((prev) => (prev === 0 ? methodologySlides.length - 1 : prev - 1));
  };

  const nextMethodSlide = () => {
    setActiveMethodSlide((prev) => (prev === methodologySlides.length - 1 ? 0 : prev + 1));
  };

  const activeTabData = accidentTabsData[activeAccidentTab];

  // Collapsible cards state
  const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>({});
  const [activeTooltip, setActiveTooltip] = useState<{ text: string; x: number; y: number } | null>(null);

  const handleTabMouseEnter = (e: React.MouseEvent, tabId: string) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const container = document.querySelector(".accident-tabs-nav-wrapper");
    const containerRect = container?.getBoundingClientRect();
    if (containerRect) {
      const x = rect.left - containerRect.left + rect.width / 2;
      const y = rect.top - containerRect.top;
      const text = accidentTabsData[tabId]?.definition || "";
      const shortText = text.split(".")[0] + ".";
      setActiveTooltip({ text: shortText, x, y });
    }
  };

  const handleTabMouseLeave = () => {
    setActiveTooltip(null);
  };
  
  const toggleCardExpanded = (cardKey: string) => {
    setExpandedCards((prev) => ({ ...prev, [cardKey]: !prev[cardKey] }));
  };

  useEffect(() => {
    setExpandedCards({});
    const defaults = defaultValuesByTab[activeAccidentTab] || { medical: 9000, wages: 3000, severity: "moderate" };
    setAccMedical(defaults.medical);
    setAccWages(defaults.wages);
    setAccSeverity(defaults.severity);
    setAccFault(10);
  }, [activeAccidentTab]);

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
          <p className="eyebrow"><span>Independent methodology</span> · Updated July 2026</p>
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
          <p className="byline">Concept and information architecture by <strong>Koray Tuğberk Gübür</strong></p>
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
                  onClick={() => setActiveAccidentTab(tab.id)}
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

        {/* Carousel Slider Slider Container */}
        <div className="method-slider-container">
          <button 
            type="button" 
            className="slider-nav-btn prev"
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
            
            <p className="method-slide-description">
              {methodologySlides[activeMethodSlide].description}
            </p>

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
            className="slider-nav-btn next"
            onClick={nextMethodSlide}
            aria-label="Next step"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
          </button>
        </div>

        {/* Pagination Dots */}
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
                  <span>Is Every Loss Supported by a Record?</span>
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
                  <span>Which Facts Could Weaken Causation?</span>
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
                  <span>What Does Local Law Change?</span>
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
                  <span>What Coverage Is Actually Available?</span>
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
            {!isStatesDescExpanded && "..."}
            {isStatesDescExpanded && (
              <>
                {" "}
                State selection changes multiplier range application once local damage cap rules apply toward non economic loss. Filing deadline variance across state law shifts urgency connected to a pending claim nearing a statutory cutoff. Local city data connected to a chosen state supports venue specific expectation setting relevant toward settlement negotiation. Sutliff & Stout builds state specific calculator logic around jurisdiction law reviewed across a filed claim.
              </>
            )}
            <button
              type="button"
              className="card-readmore-btn"
              onClick={() => setIsStatesDescExpanded(!isStatesDescExpanded)}
              aria-expanded={isStatesDescExpanded}
              style={{ display: "inline-flex", marginLeft: "6px", verticalAlign: "baseline" }}
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
                        </div>

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
