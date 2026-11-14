import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateNLR, computeBaseline, analyzeScenario } from './immuneEngine.js';
import { scenarios } from './scenarios.js';
test('NLR calculation uses neutrophils divided by lymphocytes',()=>assert.equal(calculateNLR(4,2),2));
test('NLR rejects zero lymphocytes',()=>assert.equal(calculateNLR(4,0),null));
test('NLR rejects negative and invalid measurements',()=>{assert.equal(calculateNLR(-1,2),null);assert.equal(calculateNLR('4',2),null);});
test('baseline requires at least three readings',()=>assert.equal(computeBaseline([{nlr:2},{nlr:3}]),null));
test('baseline uses median',()=>assert.equal(computeBaseline([{nlr:1},{nlr:2},{nlr:100}]),2));
test('A is stable',()=>assert.equal(analyzeScenario(scenarios.A).status,'stable'));
test('B triggers review',()=>{const r=analyzeScenario(scenarios.B);assert.equal(r.status,'review');assert.ok(r.changePercent>18);});
test('C requires more data, not a false red alert',()=>assert.equal(analyzeScenario(scenarios.C).status,'insufficient'));
test('unverified 9.9 NLR is not automatically treated as an invalid numeric value',()=>{assert.equal(calculateNLR(19.8,2),9.9);assert.equal(analyzeScenario(scenarios.C).chart.find(r=>r.day==='D3').nlr,null);});
test('chart provenance never claims unverified NASA measurements',()=>{for (const s of Object.values(scenarios)) assert.ok(analyzeScenario(s).chart.every(r=>r.source==='Synthetic'));});
test('a single increased reading does not count as confirmed rising trend',()=>{const s={...scenarios.B,readings:[...scenarios.B.readings.slice(0,3),{day:'D1',phase:'mission',neutrophils:6,lymphocytes:2,quality:'verified'}]};assert.equal(analyzeScenario(s).status,'stable');});

test('missing sample breaks consecutiveness',()=>{const s={...scenarios.B,readings:[...scenarios.B.readings.slice(0,3),...scenarios.B.readings.slice(3,7),{day:'D5',phase:'mission',neutrophils:null,lymphocytes:null,quality:'missing'},{day:'D6',phase:'mission',neutrophils:5.6,lymphocytes:2,quality:'verified'}]};assert.equal(analyzeScenario(s).status,'stable');});

test('unverified sample in latest three measurements prevents trend alert',()=>{
  const base = scenarios.B.readings.filter(r=>r.phase==='baseline');
  const sample = (day,n,quality='verified')=>({day,phase:'mission',neutrophils:n,lymphocytes:2,quality});
  const scenario = {...scenarios.B,readings:[...base,sample('D1',4.1),sample('D2',4.4),sample('D3',5.1),sample('D4',5.4,'unverified'),sample('D5',6.2)]};
  const result = analyzeScenario(scenario);
  assert.equal(result.status,'stable');
  assert.ok(result.changePercent>=18);
});
test('no high NLR can override invalid current sample',()=>{
  const scenario = {...scenarios.B,readings:[...scenarios.B.readings.slice(0,-1),{day:'D5',phase:'mission',neutrophils:null,lymphocytes:null,quality:'missing'}]};
  assert.equal(analyzeScenario(scenario).status,'insufficient');
});
