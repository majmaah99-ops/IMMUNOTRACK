import test from 'node:test';
import assert from 'node:assert/strict';
import { nasaEvidence, summarizeNasaEvidence } from './nasaEvidence.js';

test('four traceable source identifiers are present', () => {
  assert.equal(nasaEvidence.samples.length, 4);
  assert.ok(nasaEvidence.samples.every(r=>r.sampleId.startsWith('C001_whole-blood_')));
});
test('NLR derives from source cell counts and does not use 2.27 placeholder', () => {
  const out = summarizeNasaEvidence();
  assert.equal(out.samples[0].nlr, 2349 / 2241);
  assert.equal(out.samples[1].nlr, 2998 / 1859);
  assert.equal(out.samples[2].nlr, 3570 / 2667);
  assert.equal(out.samples[3].nlr, 2685 / 1640);
  assert.notEqual(out.preflightMedian, 2.27);
});
test('preflight reference only uses the same anonymized subject before flight', () => {
  const out = summarizeNasaEvidence();
  assert.equal(out.preflightMedian, 3570 / 2667);
  assert.ok(out.changePercent > 0);
  assert.ok(out.samples[3].phase.startsWith('Postflight'));
});
test('source is labeled as third-party mirror pending primary verification', () => {
  assert.match(nasaEvidence.provenance, /mirror/i);
  assert.match(nasaEvidence.provenance, /pending/i);
  assert.ok(nasaEvidence.sourceUrl.includes('OSD-569'));
});
