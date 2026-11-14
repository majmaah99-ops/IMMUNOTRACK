/** Transparent experimental rules: NOT clinical thresholds. No automated diagnosis. */
export const DEMO_SETTINGS = Object.freeze({ trendPercent: 18, minBaselineSamples: 3, maxMissingFraction: 0.35 });

export function calculateNLR(neutrophils, lymphocytes) {
  if (![neutrophils, lymphocytes].every(v => typeof v === 'number' && Number.isFinite(v)) || neutrophils < 0 || lymphocytes <= 0) return null;
  return neutrophils / lymphocytes;
}
export function computeBaseline(readings) {
  const values = readings.map(r => r.nlr).filter(v => typeof v === 'number' && Number.isFinite(v) && v >= 0);
  if (values.length < DEMO_SETTINGS.minBaselineSamples) return null;
  const ordered = [...values].sort((a,b)=>a-b);
  const mid = Math.floor(ordered.length / 2);
  return ordered.length % 2 ? ordered[mid] : (ordered[mid-1] + ordered[mid]) / 2;
}
function isSampleValid(sample) {
  return sample && sample.quality === 'verified' && Number.isFinite(sample.neutrophils) && Number.isFinite(sample.lymphocytes) && sample.neutrophils >= 0 && sample.lymphocytes > 0;
}
export function analyzeScenario(scenario) {
  const rows = scenario.readings.map((r, index) => ({
    ...r, index, nlr: isSampleValid(r) ? calculateNLR(r.neutrophils, r.lymphocytes) : null,
    source: 'Synthetic'
  }));
  const baselineRows = rows.filter(r => r.phase === 'baseline' && r.nlr !== null);
  const baseline = computeBaseline(baselineRows);
  const missionRows = rows.filter(r => r.phase === 'mission');
  const latest = missionRows.at(-1);
  const missing = missionRows.filter(r => r.nlr === null).length;
  const missingFraction = missionRows.length ? missing / missionRows.length : 1;
  const chart = rows.map(r => ({ day:r.day, nlr:r.nlr, baseline, source:'Synthetic', quality:r.quality }));
  if (baseline === null || baseline <= 0 || !missionRows.length || missingFraction > DEMO_SETTINGS.maxMissingFraction || !latest || latest.nlr === null) {
    return { status:'insufficient', heading:'INSUFFICIENT DATA', message:'Missing, unverified, or insufficient measurements prevent reliable trend interpretation.', action:'Verify sample quality and repeat the measurement per the mission medical protocol.', baseline, changePercent:null, chart, evidence: { validBaseline:baselineRows.length, missing, total:missionRows.length } };
  }
  const changePercent = ((latest.nlr - baseline) / baseline) * 100;
  const trend = missionRows.slice(-3);
  const rising = trend.length >= 3 && trend.every((r,i)=> i === 0 || r.nlr > trend[i-1].nlr);
  const above = changePercent >= DEMO_SETTINGS.trendPercent;
  const alerts = [];
  if (above) alerts.push(`Latest NLR is ${changePercent.toFixed(1)}% above this astronaut's synthetic baseline.`);
  if (rising) alerts.push('Three successive valid mission readings are increasing.');
  if (scenario.sleepHours !== null && scenario.sleepHours < 6) alerts.push(`Reported sleep: ${scenario.sleepHours} h (context only; no causal inference).`);
  if (above && rising) return { status:'review', heading:'REVIEW TREND', message:alerts.join(' '), action:'Consider repeating the measurement and checking symptoms with the designated medical protocol. Do not treat this as a diagnosis.', baseline, changePercent, chart, evidence:{ validBaseline:baselineRows.length, missing, total:missionRows.length } };
  return { status:'stable', heading:'NO DEMO TREND ALERT', message:`Latest NLR is ${changePercent.toFixed(1)}% relative to the personal synthetic baseline. No demo rule triggered.`, action:'Continue routine measurements under the mission medical protocol.', baseline, changePercent, chart, evidence:{ validBaseline:baselineRows.length, missing, total:missionRows.length } };
}
