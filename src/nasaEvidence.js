import { calculateNLR } from './immuneEngine.js';

/**
 * Source: NASA OSDR OSD-569, LSDS-7 CBC transformed CSV.
 * Values transcribed from a PUBLIC THIRD-PARTY MIRROR of the NASA-origin file.
 * Original NASA file was not fetched/byte-verified in this build.
 * Study participants are anonymized; do not treat these as flight-time measurements.
 *
 * Public mirror:
 * https://github.com/ibeastmanish/ASCLEPIUS/blob/main/data/raw/LSDS-7_Complete_Blood_Count_CBC_TRANSFORMED.csv
 * Mirror provenance:
 * https://github.com/ibeastmanish/ASCLEPIUS/blob/main/data/manifest.json
 * NASA study: https://osdr.nasa.gov/bio/repo/data/studies/OSD-569
 */
export const nasaEvidence = Object.freeze({
  study: 'NASA OSDR OSD-569 — Inspiration4 CBC',
  subject: 'C001 (anonymized)',
  units: 'cells/µL',
  provenance: 'NASA-origin values transcribed from public third-party mirror; independent original-file verification pending',
  sourceFile: 'LSDS-7_Complete_Blood_Count_CBC_TRANSFORMED.csv',
  sourceUrl: 'https://osdr.nasa.gov/bio/repo/data/studies/OSD-569',
  mirrorUrl: 'https://github.com/ibeastmanish/ASCLEPIUS/blob/main/data/raw/LSDS-7_Complete_Blood_Count_CBC_TRANSFORMED.csv',
  sourceManifestUrl: 'https://github.com/ibeastmanish/ASCLEPIUS/blob/main/data/manifest.json',
  samples: [
    { sampleId: 'C001_whole-blood_L-92_cbc', phase: 'Preflight (L-92)', neutrophils: 2349, lymphocytes: 2241 },
    { sampleId: 'C001_whole-blood_L-44_cbc', phase: 'Preflight (L-44)', neutrophils: 2998, lymphocytes: 1859 },
    { sampleId: 'C001_whole-blood_L-3_cbc', phase: 'Preflight (L-3)', neutrophils: 3570, lymphocytes: 2667 },
    { sampleId: 'C001_whole-blood_R+1_cbc', phase: 'Postflight (R+1)', neutrophils: 2685, lymphocytes: 1640 }
  ]
});

export function summarizeNasaEvidence(study = nasaEvidence) {
  const samples = study.samples.map(sample => ({
    ...sample,
    nlr: calculateNLR(sample.neutrophils, sample.lymphocytes),
    source: 'NASA OSDR — public mirror (original not independently verified)'
  }));
  const before = samples.filter(r => r.sampleId.includes('_L-')).map(r => r.nlr).sort((a,b)=>a-b);
  if (before.length !== 3 || before.some(v => v === null)) throw new Error('Three valid preflight samples are required');
  const preflightMedian = before[1];
  const postflight = samples.find(r => r.sampleId.endsWith('_R+1_cbc'));
  return { samples, preflightMedian, postflightNlr: postflight?.nlr ?? null, changePercent: postflight?.nlr === null ? null : (postflight.nlr / preflightMedian - 1) * 100 };
}
