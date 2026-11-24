import test from 'node:test';
import assert from 'node:assert/strict';
import { validateManualEntry, manualScenarioFromEntries, exportManualCsv } from './manualInput.js';
import { analyzeScenario, calculateNLR } from './immuneEngine.js';

const make = (id, date, phase, n, l, quality='entered', unit='cells/µL') =>
  ({ id,date,phase,neutrophils:String(n),lymphocytes:String(l),quality,unit });
const base = [
 make(1,'2026-01-01','baseline',4000,2000),
 make(2,'2026-01-02','baseline',4100,2000),
 make(3,'2026-01-03','baseline',3900,2000)
];
const mission = [
 make(4,'2026-01-04','mission',4100,2000),
 make(5,'2026-01-05','mission',4500,2000),
 make(6,'2026-01-06','mission',5200,2000)
];
test('rejects malformed or impossible measurements',()=>{
 assert.match(validateManualEntry(make(1,'2026-01-01','baseline',-4,2)),/non-negative/);
 assert.match(validateManualEntry(make(1,'2026-01-01','baseline',4,0)),/positive/);
 assert.match(validateManualEntry(make(1,'2026-02-30','baseline',4,2)),/valid date/);
});
test('rejects reference data dated after monitoring',()=>{
 assert.match(validateManualEntry(make(7,'2026-01-07','baseline',4000,2000),mission),/predate/);
 assert.match(validateManualEntry(make(7,'2025-12-31','mission',4000,2000),base),/after/);
});
test('rejects duplicates for a date and phase',()=>{
 assert.match(validateManualEntry(make(5,'2026-01-01','baseline',4000,2000),base),/already exists/);
});
test('unit conversion preserves NLR',()=>{
 const x=make(1,'2026-01-01','baseline',4,2,'entered','10³/µL');
 const normalized=manualScenarioFromEntries([x]).readings[0];
 assert.equal(normalized.neutrophils,4000);
 assert.equal(normalized.lymphocytes,2000);
 assert.equal(calculateNLR(normalized.neutrophils,normalized.lymphocytes),2);
});
test('manual input is never labeled verified or NASA',()=>{
 const out=analyzeScenario(manualScenarioFromEntries([...base,...mission]));
 assert.equal(out.status,'review');
 assert.match(out.heading,/PROVISIONAL/);
 assert.ok(out.chart.every(p=>p.source==='User-entered (not instrument verified)'));
 assert.match(out.message,/not independently verified/);
});
test('less than three baseline samples suppresses trend',()=>{
 const out=analyzeScenario(manualScenarioFromEntries([...base.slice(0,2),...mission]));
 assert.equal(out.status,'insufficient');
});
test('flagged unusable sample suppresses trend when latest',()=>{
 const flagged={...mission[2],quality:'unverified'};
 const out=analyzeScenario(manualScenarioFromEntries([...base,...mission.slice(0,2),flagged]));
 assert.equal(out.status,'insufficient');
 assert.equal(out.chart.at(-1).nlr,null);
});
test('missing middle entry breaks consecutive trend',()=>{
 const flagged={...mission[1],quality:'missing'};
 const out=analyzeScenario(manualScenarioFromEntries([...base,mission[0],flagged,mission[2]]));
 assert.equal(out.status,'stable');
});
test('CSV export labels origin and escapes strings',()=>{
 const csv=exportManualCsv([base[0]]);
 assert.match(csv,/User-entered \(not instrument verified\)/);
 assert.match(csv,/date,phase,neutrophils/);
});
