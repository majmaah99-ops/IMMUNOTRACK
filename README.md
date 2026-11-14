# IMMUNOTRACK 2.0 — Autonomous Immune Health Monitoring & Decision Support

**NASA Space Apps Challenge 2026 — Health Monitoring Software**  
**Team:** Jahiz AI (Saudi Arabia)  
**Status:** Research demonstration — **not a medical device**

## High-Level Summary

IMMUNOTRACK 2.0 explores an offline-first approach to longitudinal immune-health monitoring for astronauts. A transparent JavaScript engine calculates the neutrophil-to-lymphocyte ratio (NLR), compares values with a personal historical baseline, explains unusual simulated trends, and withholds interpretation when data quality is inadequate. It is a research prototype rather than a diagnosis, infection prediction, or clinical recommendation system.

## 🎯 NASA Research Alignment

IMMUNOTRACK 2.0 is designed to address NASA's Human Research Roadmap Gap **IM-201** (Monitoring immune functions during spaceflight). Our research goal is to provide a locally running decision-support tool to help crews interpret immune data such as NLR, with a future pathway to onboard measurements. The present version demonstrates this concept using synthetic measurements; it has not replaced or reduced reliance on Earth-based laboratories.

**Scope clarification:** This paragraph describes the *intended research alignment and future goal*. This prototype has not been clinically validated, flown in space, integrated with onboard diagnostic hardware, or demonstrated to replace Earth-based laboratories.

**Reference:** [NASA Human Research Roadmap — Gap IM-201](https://humanresearchroadmap.nasa.gov/Gaps/gap.aspx?i=669)

## Features

- Three interactive, **fully synthetic** astronaut cases: A (stable), B (gradual trend), C (missing / unverified samples).
- NLR calculation from neutrophil and lymphocyte counts, with input validation and individual median baseline.
- Explainable, *experimental* trend rules. No AI model or clinical inference is claimed.
- Explicit data-quality refusal rather than forcing a risk label.
- Client-side processing: the analysis does not send data to a remote model or API.
- Automated unit tests using Node's native test runner.

## Data provenance

**Every displayed measurement in this version is `Synthetic`. The value `2.27` has NOT been verified against a NASA record and is not used or attributed to NASA.** No real NASA or Inspiration4 measurement has been downloaded, embedded, or validated in this repository. NASA Open Science Data Repository (OSDR), particularly Inspiration4 CBC dataset **OSD-569**, is a candidate for future documented integration, subject to checking available fields, units, consent/data-use constraints and proper attribution. Do not cite this application as a NASA-trained, NASA-validated, or clinical model.

- [NASA OSDR](https://osdr.nasa.gov/)
- [NASA Human Research Roadmap](https://humanresearchroadmap.nasa.gov/)

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

## Limitations / safety

This is educational research software created for a hackathon. It is **not** a clinical diagnostic tool, medical device, immune-risk predictor, astronaut flight-certified system, or substitute for physician oversight and mission medical protocols. It cannot prove that sleep influences NLR, reduce infections, or independently manage a crew member's health. The three demonstration scenarios are illustrative and do not establish sensitivity, specificity, or real-world performance.

## Use of AI tools

AI assistance was used to draft and refine code, project documentation, and UI structure. Outputs require human review, testing, and verification by the team. No autonomous clinical decision-making or AI diagnostic model is claimed.

## Team — Jahiz AI

- Rema Alsahli
- Sadem Almutairi
- Waten Alsahli
- Hathal Alsahli

## License / credit

Project materials are authored for the team's hackathon submission. NASA is credited only as a source of public research context; **NASA does not endorse this prototype**.
