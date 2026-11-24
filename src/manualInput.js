/**
 * Ephemeral manual-input helper for RESEARCH DEMONSTRATION ONLY.
 * Entries are not authenticated, device-verified, or sent to a server.
 * Numerical values are converted to cells/µL; NLR itself is unitless.
 */
export const MANUAL_QUALITIES = ['entered', 'unverified', 'missing'];
const isoDay = /^\d{4}-\d{2}-\d{2}$/;

export function validateManualEntry(entry, current = []) {
  if (!entry || !isoDay.test(entry.date || '') || Number.isNaN(Date.parse(entry.date + 'T00:00:00Z')) ||
    new Date(entry.date + 'T00:00:00Z').toISOString().slice(0, 10) !== entry.date) {
    return 'Provide a valid date (YYYY-MM-DD).';
  }
  if (!['baseline', 'mission'].includes(entry.phase)) return 'Choose baseline or monitoring phase.';
  if (!MANUAL_QUALITIES.includes(entry.quality)) return 'Choose a measurement quality flag.';
  if (!['cells/µL', '10³/µL'].includes(entry.unit)) return 'Choose the matching unit for both counts.';
  if (entry.quality === 'entered') {
    const n = Number(entry.neutrophils);
    const l = Number(entry.lymphocytes);
    if (String(entry.neutrophils).trim() === '' || String(entry.lymphocytes).trim() === '' ||
      !Number.isFinite(n) || !Number.isFinite(l) || n < 0 || l <= 0) {
      return 'Enter non-negative neutrophils and positive lymphocytes; both values must be finite numbers.';
    }
  }
  // Reference measurements must precede monitoring; do not build a baseline from the future.
  if (entry.phase === 'baseline' && current.some(r => r.phase === 'mission' && r.date <= entry.date)) {
    return 'Baseline measurements must predate all monitoring measurements.';
  }
  if (entry.phase === 'mission' && current.some(r => r.phase === 'baseline' && r.date >= entry.date)) {
    return 'Monitoring measurements must occur after the baseline measurements.';
  }
  if (current.some(r => r.date === entry.date && r.phase === entry.phase)) {
    return 'A measurement already exists for this phase on this date; delete it before replacing.';
  }
  return null;
}

export function manualScenarioFromEntries(entries = []) {
  const readings = [...entries].sort((a,b) => a.date.localeCompare(b.date) || a.id-b.id).map(entry => {
    const factor = entry.unit === '10³/µL' ? 1000 : 1;
    const isEntered = entry.quality === 'entered';
    return {
      day:entry.date,
      phase:entry.phase,
      quality:entry.quality,
      neutrophils:isEntered ? Number(entry.neutrophils) * factor : null,
      lymphocytes:isEntered ? Number(entry.lymphocytes) * factor : null,
      source:'User-entered (not instrument verified)'
    };
  });
  return { id:'MANUAL', name:'Manual testing session', mode:'manual', sleepHours:null, readings };
}

export function exportManualCsv(entries=[]) {
  const escape = value => '"' + String(value ?? '').replace(/"/g, '""') + '"';
  const columns = ['date','phase','neutrophils','lymphocytes','unit','quality','source'];
  return [
    columns.join(','),
    ...entries.map(entry => [entry.date,entry.phase,entry.neutrophils,entry.lymphocytes,entry.unit,entry.quality,'User-entered (not instrument verified)'].map(escape).join(','))
  ].join('\n') + '\n';
}
