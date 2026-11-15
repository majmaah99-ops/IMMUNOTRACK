# IMMUNOTRACK 2.0 — Autonomous Immune Health Monitoring & Decision Support

**NASA Space Apps Challenge 2026 — Health Monitoring Software**  
**Team:** Jahiz AI (Saudi Arabia)  
**Status:** Research demonstration — **not a medical device**

## High-Level Summary

IMMUNOTRACK 2.0 explores a locally computed approach to longitudinal immune-health monitoring for astronauts. A transparent JavaScript engine calculates the neutrophil-to-lymphocyte ratio (NLR), compares values with a personal historical baseline, explains unusual simulated trends, and withholds interpretation when data quality is inadequate. It is a research prototype rather than a diagnosis, infection prediction, or clinical recommendation system.

## 🎯 NASA Research Alignment

IMMUNOTRACK 2.0 is designed to address NASA's Human Research Roadmap Gap **IM-201** (Monitoring immune functions during spaceflight). Our research goal is to provide a locally running decision-support tool to help crews interpret immune data such as NLR, with a future pathway to onboard measurements. The mission-simulation engine uses synthetic measurements. A separate evidence panel also calculates NLR from four traceable Inspiration4 CBC rows attributed to NASA OSDR OSD-569 via a publicly accessible third-party mirror; direct original-file verification remains pending. The prototype has not replaced or reduced reliance on Earth-based laboratories.

**Scope clarification:** This paragraph describes the *intended research alignment and future goal*. This prototype has not been clinically validated, flown in space, integrated with onboard diagnostic hardware, or demonstrated to replace Earth-based laboratories.

**Reference:** [NASA Human Research Roadmap — Gap IM-201](https://humanresearchroadmap.nasa.gov/Gaps/gap.aspx?i=669)

## Features

- Three interactive, **fully synthetic** astronaut cases: A (stable), B (gradual trend), C (missing / unverified samples).
- Separate NASA-origin OSD-569 CBC **research-evidence panel**: four source-identifiable C001 preflight/postflight counts from a public mirror, with reproducible NLR calculations (not used as synthetic astronaut baselines).
- NLR calculation from neutrophil and lymphocyte counts, with input validation and individual median baseline.
- Explainable, *experimental* trend rules. No AI model or clinical inference is claimed.
- Explicit data-quality refusal rather than forcing a risk label.
- Client-side processing: the analysis does not send data to a remote model or API.
- Automated unit tests using Node's native test runner.

## Data provenance

**Two deliberately separate data tracks**:

1. **Mission simulation (A/B/C):** Every reading and baseline in the three interactive astronaut scenarios is `Synthetic`. No synthetic point is labeled as a NASA measurement.
2. **NASA research-evidence panel:** Four source-identifiable CBC rows for the **same anonymized individual C001** are included from a *public third-party mirror* of the NASA OSDR **OSD-569 / LSDS-7 Complete Blood Count** transformed CSV. Neutrophils and lymphocytes use the source's absolute counts (cells/µL), and NLR is computed at runtime. The values are preflight and postflight, **not in-flight daily trends**.

| Source sample | Neutrophils (cells/µL) | Lymphocytes (cells/µL) |
| --- | ---: | ---: |
| `C001_whole-blood_L-92_cbc` | 2,349 | 2,241 |
| `C001_whole-blood_L-44_cbc` | 2,998 | 1,859 |
| `C001_whole-blood_L-3_cbc` | 3,570 | 2,667 |
| `C001_whole-blood_R+1_cbc` | 2,685 | 1,640 |

The preflight reference number shown in the research panel is the **median of these three C001 preflight NLR values**, not an externally validated medical cutoff. This reference is **not transferred to simulated astronauts A/B/C**. The previously suggested arbitrary number `2.27` was not validated and is not used.

**Provenance and verification limits:** The mirror repository publishes a manifest claiming a NASA-origin download, fetched Nov 3, 2026, with SHA-256 `32e4f9c97d3b636b5d5c2e72dab8c4d3319dee64c437508b092dad04603b2b8f` for the full source CSV. We have inspected the mirrored text and identified the exact four rows, **but could not download the original NASA file to independently verify that the mirror matches the primary source byte-for-byte**. The selected C001 rows do not involve the separately reported C003 L-92 data-column anomaly. Treat these values as *NASA-origin, publicly mirrored, pending primary verification*, not independently validated NASA records.

- [NASA OSDR study OSD-569](https://osdr.nasa.gov/bio/repo/data/studies/OSD-569)
- [Public mirror source CSV](https://github.com/ibeastmanish/ASCLEPIUS/blob/main/data/raw/LSDS-7_Complete_Blood_Count_CBC_TRANSFORMED.csv)
- [Public mirror provenance manifest](https://github.com/ibeastmanish/ASCLEPIUS/blob/main/data/manifest.json)
- [NASA OSDR repository](https://osdr.nasa.gov/)
- [NASA Human Research Roadmap](https://humanresearchroadmap.nasa.gov/)

**Eligibility note:** Inclusion of NASA-origin data does not alone establish eligibility for NASA Space Apps Global Awards. The team must confirm that its selected resource is among those listed for this specific challenge and cite all resources and third-party mirrors accurately in the submission.

## How the experimental engine works

1. Read neutrophil and lymphocyte counts from each **verified** sample; invalid/missing/unverified samples are not interpreted.
2. Compute `NLR = neutrophils / lymphocytes`, provided lymphocytes are positive.
3. Compute personal median baseline from **at least 3 verified reference measurements**.
4. Trigger a **review prompt** only when the latest NLR is at least **18% above baseline AND three consecutive verified mission measurements are increasing**.
5. If more than 35% of mission measurements are missing/unverified, the current sample is invalid, or baseline is inadequate, return **INSUFFICIENT DATA**.
6. Report what the rule observed and suggest only verification / protocol-based follow-up, not a diagnosis.

**Important:** The 18%, 35%, three-sample and sleep-context settings are illustrative demo choices, **not NASA or clinical safety thresholds**. NLR is a non-specific marker that can vary for many reasons. A high NLR is not proof of infection or immune dysfunction. A green demo label means only that the example rule did not trigger, not that the astronaut is healthy.

## Run locally

Requires modern Node.js (recommended 20+).

```bash
git clone https://github.com/majmaah99-ops/IMMUNOTRACK.git
cd IMMUNOTRACK
npm install
npm run dev
```

Open the local address displayed by Vite (typically `http://localhost:5173`).

```bash
npm test
npm run build
npm run preview
```

### Offline scope

Analysis is implemented entirely in client-side JavaScript with no backend dependency. **Offline-first does not yet mean the app can always be loaded after the internet is disconnected**: that requires service-worker / asset-caching support, or a locally served production build. For a real demonstration, run Vite locally or serve the built `dist/` folder and then verify the absence of network requests. A production-grade offline-capable PWA remains future work.

## 🧪 Validation & Hardware Integration Plan

**Current status:** This is a browser-based research prototype; no physical blood analyzer, clinical workflow, NASA analog campaign, or spacecraft hardware is connected or tested. All A/B/C mission scenarios are synthetic. A separate research panel computes NLR from selected Inspiration4 CBC rows attributed to NASA OSDR-569 through a public third-party mirror; independent verification of the original NASA file remains pending.

**Why hardware matters:** Software cannot make an unreliable measurement reliable. A proposed future interface would accept data from a qualified, calibrated point-of-care (PoC) blood analyzer after verifying its measurement method, units, sample and instrument identifiers, calibration/quality-control status, timestamps, transport integrity, and traceable provenance. **rHEALTH ONE is an illustrative technology reference, not a device integrated with, certified for, or endorsed as compatible with IMMUNOTRACK.** Published research describes an rHEALTH ONE cytometry demonstration on the ISS; this does not mean it outputs our required differential blood counts or offers an integration API.

**What our present data-quality checks do:** The demo rejects explicitly missing or unverified measurements, invalid numeric values, zero lymphocyte denominators, inadequate baseline data, and excessive gaps. These software checks **cannot independently detect a miscalibrated analyzer, pre-analytical blood-sample problems, systematic measurement bias, or whether a plausible-looking value is accurate**. A verified label in a synthetic case is a demo input flag, not physical validation.

### Proposed validation stages (not yet completed)

1. **Software and data verification (present prototype, additional verification required):** Unit-test the NLR formula and failure handling; independently obtain and checksum the primary NASA OSDR file; verify sample identities, units, and CBC arithmetic; build a reference test corpus. Record error-handling performance and software test results separately from any clinical performance claims.
2. **Bench and Earth-based human research (future, conditional on approvals):** Connect a suitable PoC analyzer, compare its readings against laboratory reference methods across expected operating conditions, and measure agreement, repeatability, missingness, and data-transfer failures. Only after ethics review, informed consent, hardware suitability assessment and partnership approval, propose human-factors studies in an appropriate terrestrial analog (for example NASA HERA or an Antarctic station). Analog habitats simulate isolation and operational constraints, **not the full physiological effects of microgravity or space radiation**.
3. **Spaceflight qualification and operational validation (long-term aspiration):** Subject the proposed hardware/software system to flight safety, reliability, cybersecurity, human factors and medical requirements. Seek a suitable in-orbit demonstration, potentially the ISS if a mission sponsor and program authorize it, before considering deep-space use. **No ISS test or flight approval is scheduled or claimed.**

**Proposed success measures:** CBC measurement agreement with a reference instrument (if hardware is added), data completeness and traceability, correctly handled invalid records, false-alert rate, sensitivity/specificity against an independently adjudicated reference **only when clinically defined**, time to interpret a case, usability, and resilience under simulated communication delays. Baseline comparisons should be within-person and not inferred from an unrelated astronaut's samples.

**Research context:**
- [NASA — Analog Missions](https://www.nasa.gov/analog-missions/)
- [NASA — HERA facility](https://www.nasa.gov/hera-about-hera/)
- [rHEALTH ONE cytometry aboard the ISS (peer-reviewed research)](https://pubmed.ncbi.nlm.nih.gov/38528030/)

## Limitations / safety

This is educational research software created for a hackathon. It is **not** a clinical diagnostic tool, medical device, immune-risk predictor, astronaut flight-certified system, or substitute for physician oversight and mission medical protocols. It cannot prove that sleep influences NLR, reduce infections, or independently manage a crew member's health. The NASA-origin research panel is descriptive only, without clinical inference. The three demonstration scenarios are illustrative and do not establish sensitivity, specificity, or real-world performance.

## Use of AI tools

AI assistance was used to draft and refine code, project documentation, and UI structure. Outputs require human review, testing, and verification by the team. No autonomous clinical decision-making or AI diagnostic model is claimed.

## Team — Jahiz AI

- Rema Alsahli
- Sadem Almutairi
- Waten Alsahli
- Hathal Alsahli

## License / credit

Project materials are authored for the team's hackathon submission. NASA is credited only as a source of public research context; **NASA does not endorse this prototype**.
