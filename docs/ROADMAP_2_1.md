# IMMUNOTRACK 2.1 — Approved Development Roadmap

Status: **Approved by project owner on 24 November 2026**. This is a development plan, **not** proof of a NASA Global Nominee or Global Finalist status.

## Release separation / provenance

- Production `main`: current live demo [Render](https://immunotrack-2.onrender.com). No new untested functionality is deployed directly to `main`.
- Archive reference `reference-2026-11-15-predeadline`: pinned to commit `981518b9dd45e900938217920b67075f5e01d006`, with GitHub committer timestamp **2026-11-15 20:25:38 UTC**. This preserves a repository state from that date and **does not verify which version was submitted to NASA**, whether submission was completed, or the event's official deadline timezone.
- Active development `development-2.1`: changes must be tested and reviewed before merging into production.
- Any change after the submission cutoff is a **post-submission improvement** and must not be represented as part of the originally evaluated hackathon submission.

## Phase 0 — Eligibility and scientific traceability (mandatory review before award claims)

- [ ] **A1** Obtain original NASA Space Apps 2026 project submission URL and evidence of successful submission and final submission timestamp. Keep status UNKNOWN until sourced.
- [ ] **A2** Download primary NASA OSDR OSD-569/LSDS-7 CBC file; verify identity/columns/units, row C001 IDs, full-file checksum against public mirror, and independently recompute NLR. Current evidence uses a **third-party public mirror with original-file matching pending**. Do not silently replace the provenance label.
- [ ] **A3** Confirm a NASA resource used in the program is included in the **specific Health Monitoring Software 2026 challenge resources**, and that usage satisfies the applicable eligibility criteria. A citation alone is not sufficient evidence of compliance.
- [ ] **A4** Demonstrate an auditable, reproducible NASA-source analysis without reusing one subject's baseline for others. Record script, test inputs and computed outputs.
- [ ] **A5** Audit third-party dataset, code, image, and AI assistance credits; add a license only after the repository owner explicitly selects rights for their original work. Do not choose a license unilaterally.

**Gate:** No claim of global-award eligibility, independently authenticated NASA measurements, medical validation or clinical effect without supporting evidence.

## Phase 1 — Profiles and alert history (2.1)

- [ ] **B1** Add independent **fictional** astronaut profiles with per-profile baselines, readings and selection controls; prevent accidental mixing; allow deletion/export.
- [ ] **B2** Add per-profile timestamped alert-history events with quality status, causal rule explanation, and “reviewed” workflow; alerts are experimental, not diagnoses.
- [ ] Add automated tests for profile isolation, transitions and history consistency. Keep personal health data OFF the demo server; avoid storing identifiable data.

## Phase 2 — Input reliability and integration simulator

- [ ] **B3** Measurement-quality and provenance metadata for all modes (source, units, timestamp, status).
- [ ] **B4** Optional validated CSV import with clear schema and errors, without claiming device verification.
- [ ] **B5** Mock Point-of-Care device feed with calibration/missing/out-of-order/error cases. No claim of actual rHEALTH integration.
- [ ] **B6** Local offline build/cache proof; distinguish browser-only calculations from genuine offline app loading.

## Phase 3 — Evaluation / evidence

- [ ] **C1** Independent NLR arithmetic test vectors and units.
- [ ] **C2** Missing, unverified, conflicting, duplicate, out-of-order inputs.
- [ ] **C3** False-alert rates on a clearly defined reference corpus; report limits; synthetic results are not clinical sensitivity/specificity.
- [ ] **C4** Small usability study for explanation comprehension.
- [ ] **C5** Before/after task timing with comparison condition.
- [ ] **C6** Browser walkthroughs across desktop/mobile; verify CSV export and delete/profile switching.

## Phase 4 — Presentation and documentation

- [ ] **D1** Accurate English research summary, scope, NASA-source methods and limitations.
- [ ] **D2** Live demonstrations: no rule, experimental review, insufficient quality.
- [ ] **D3** Hardware compatibility and Earth-analog validation *roadmap*, not completed clinical trials.
- [ ] **D4** Evidence-based comparison against raw-value monitoring.
- [ ] **D5** Clearly distinguish measured results, simulated results and planned outcomes; comply with NASA submission media/format rules as applicable.

## Out of scope until independently supported

- Predicting disease probabilities with ML;
- Treatment decisions or medical certifications;
- Claimed connectivity to rHEALTH / flight hardware;
- Generalized osteoporosis, cardiac or mental-health diagnosis.

**Release gates:** Unit tests pass; production build passes; no provenance regression; user-facing medical disclaimers remain; a reviewer confirms the feature on a test build before production deployment.
