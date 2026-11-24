import { useMemo, useState } from 'react';
import { ResponsiveContainer, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, ReferenceLine } from 'recharts';
import { analyzeScenario, calculateNLR, DEMO_SETTINGS } from './immuneEngine.js';
import { validateManualEntry, manualScenarioFromEntries, exportManualCsv } from './manualInput.js';
import './ManualPanel.css';

const fmt = x => x === null || x === undefined || !Number.isFinite(x) ? '—' : Number(x).toFixed(2);
const today = () => {
  const d = new Date();
  const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
};
export default function ManualPanel() {
  const [entries, setEntries] = useState([]);
  const [date, setDate] = useState(today);
  const [phase, setPhase] = useState('baseline');
  const [unit, setUnit] = useState('10³/µL');
  const [neutrophils, setNeutrophils] = useState('');
  const [lymphocytes, setLymphocytes] = useState('');
  const [quality, setQuality] = useState('entered');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const scenario = useMemo(() => manualScenarioFromEntries(entries), [entries]);
  const report = useMemo(() => analyzeScenario(scenario), [scenario]);
  const recent = [...report.chart].reverse().find(p => p.nlr !== null);
  const nlrPreview = quality === 'entered' && neutrophils.trim() && lymphocytes.trim()
    ? calculateNLR(Number(neutrophils), Number(lymphocytes)) : null;
  const baselineCount = entries.filter(e => e.phase === 'baseline' && e.quality === 'entered').length;
  const missionCount = entries.filter(e => e.phase === 'mission' && e.quality === 'entered').length;
  const sorted = [...entries].sort((a,b) => a.date.localeCompare(b.date) || a.id-b.id);

  function addReading(event) {
    event.preventDefault();
    setError('');
    setNotice('');
    const entry = {
      id: entries.reduce((max,e)=>Math.max(max,e.id),0)+1,
      date, phase, unit, neutrophils, lymphocytes, quality
    };
    const message = validateManualEntry(entry, entries);
    if (message) { setError(message); return; }
    setEntries(prev => [...prev,entry]);
    setNeutrophils('');
    setLymphocytes('');
    setNotice('Reading added to this temporary browser session.');
  }
  function exportCsv() {
    if (!entries.length) return;
    const blob = new Blob([exportManualCsv(entries)], {type:'text/csv;charset=utf-8'});
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'immunotrack-manual-session.csv';
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  }
  function clearReadings() {
    if (!entries.length || !window.confirm('Remove all readings in this session? This cannot be undone.')) return;
    setEntries([]);
    setError('');
    setNotice('Session cleared.');
  }
  return <section className="manual-mode">
    <div className="section-head"><div><small>02 / INTERACTIVE RESEARCH TESTING</small><h2>Manual NLR analysis</h2></div><span className="synthetic">● UNVERIFIED USER INPUT</span></div>
    <div className="manual-callout"><strong>Research demo, not a clinical tool.</strong> Values entered here are never assumed to be device-verified, and any trend is <em>provisional</em>. Use only fictional or non-identifiable test measurements. This page keeps readings in memory until you refresh or close it; no database upload occurs.</div>
    <div className="manual-layout">
      <form className="panel manual-form" onSubmit={addReading}>
        <div className="panel-head"><div><small>INPUT A READING</small><h3>New measurement</h3></div></div>
        <div className="manual-fields">
          <label className="manual-field"><span>Measurement date</span><input type="date" value={date} onChange={e=>setDate(e.target.value)} required/></label>
          <label className="manual-field"><span>Measurement phase</span><select value={phase} onChange={e=>setPhase(e.target.value)}><option value="baseline">Baseline (reference)</option><option value="mission">Monitoring (follow-up)</option></select></label>
          <label className="manual-field"><span>Neutrophils — absolute count</span><input inputMode="decimal" type="number" min="0" step="any" placeholder={unit==='10³/µL'?'e.g. 4.2':'e.g. 4200'} value={neutrophils} onChange={e=>setNeutrophils(e.target.value)} disabled={quality !== 'entered'} required={quality==='entered'}/></label>
          <label className="manual-field"><span>Lymphocytes — absolute count</span><input inputMode="decimal" type="number" min="0.000001" step="any" placeholder={unit==='10³/µL'?'e.g. 2.1':'e.g. 2100'} value={lymphocytes} onChange={e=>setLymphocytes(e.target.value)} disabled={quality !== 'entered'} required={quality==='entered'}/></label>
          <label className="manual-field"><span>Units (both counts)</span><select value={unit} onChange={e=>setUnit(e.target.value)}><option value="10³/µL">10³ cells/µL</option><option value="cells/µL">cells/µL</option></select></label>
          <label className="manual-field"><span>Record status</span><select value={quality} onChange={e=>setQuality(e.target.value)}>
            <option value="entered">Entered — format checked only</option>
            <option value="unverified">Flag as unusable / unverified</option>
            <option value="missing">Missing measurement</option>
          </select></label>
        </div>
        <div className="manual-preview"><span>Calculated NLR (unitless)</span><strong>{fmt(nlrPreview)}</strong><small>Count ratio only. No health interpretation from a single result.</small></div>
        {error && <p className="manual-error" role="alert">{error}</p>}
        {notice && <p className="manual-ok" role="status">{notice}</p>}
        <button type="submit" className="manual-primary">+ Add measurement</button>
        <p className="manual-hint">Enter at least {DEMO_SETTINGS.minBaselineSamples} baseline measurements dated before follow-up readings. Each record uses a different date within its phase. NLR trend rules are illustrative, not medically validated.</p>
      </form>

      <div className="manual-results">
        <section className="panel">
          <div className="panel-head"><div><small>PERSONAL TEST SESSION</small><h3>Trend analysis</h3></div><span className="tag">Local browser calculation</span></div>
          <div className="manual-stats"><div><small>Baseline points</small><strong>{baselineCount}</strong></div><div><small>Monitoring points</small><strong>{missionCount}</strong></div><div><small>Baseline NLR</small><strong>{fmt(report.baseline)}</strong></div><div><small>Latest usable NLR</small><strong>{fmt(recent?.nlr)}</strong></div></div>
          <div className={'status '+(report.status==='review'?'amber':report.status==='stable'?'green':'gray')}>{report.heading}</div>
          <p className="manual-interpretation">{report.message}</p>
          <p className="manual-action"><strong>Suggested test response:</strong> {report.action}</p>
          <div className="manual-plot" role="img" aria-label="User-entered NLR trend"><ResponsiveContainer width="100%" height="100%"><LineChart data={report.chart} margin={{top:14,right:16,left:-18,bottom:8}}><CartesianGrid vertical={false} stroke="#243b55" strokeDasharray="3 6"/><XAxis dataKey="day" stroke="#95a9bb" tick={{fontSize:10}} angle={-25} textAnchor="end" height={55}/><YAxis stroke="#95a9bb" tickLine={false} axisLine={false} domain={[0,'auto']}/><Tooltip contentStyle={{background:'#10233a',border:'1px solid #29415c',color:'#f4fbff'}} formatter={v=>[fmt(v),'NLR']}/>{report.baseline!==null&&<ReferenceLine y={report.baseline} stroke="#59dfcb" strokeDasharray="6 5"/>}<Line dataKey="nlr" type="linear" connectNulls={false} stroke="#53c8ff" strokeWidth={3} dot={{r:4}} isAnimationActive={false}/></LineChart></ResponsiveContainer></div>
          <p className="manual-hint">The chart, baseline and provisional trend use only entries in this testing session. They never use the NASA research panel as a personal baseline.</p>
        </section>
      </div>
    </div>
    <section className="panel manual-history">
      <div className="panel-head"><div><small>IN-MEMORY HISTORY</small><h3>Session measurements ({entries.length})</h3></div><div className="manual-buttons"><button type="button" disabled={!entries.length} onClick={exportCsv}>Export CSV</button><button type="button" disabled={!entries.length} onClick={clearReadings}>Clear session</button></div></div>
      {entries.length===0 ? <p className="manual-empty">No measurements added. Start with baseline readings on earlier dates.</p> :
      <div className="nasa-table-wrap"><table className="nasa-table"><thead><tr><th>Date</th><th>Phase</th><th>Neutrophils</th><th>Lymphocytes</th><th>NLR</th><th>Status</th><th></th></tr></thead><tbody>{sorted.map(entry=>{
        const p=quality => quality==='entered' ? fmt(calculateNLR(Number(entry.neutrophils),Number(entry.lymphocytes))) : '—';
        return <tr key={entry.id}><td>{entry.date}</td><td>{entry.phase}</td><td>{entry.quality==='entered'?entry.neutrophils+' '+entry.unit:'—'}</td><td>{entry.quality==='entered'?entry.lymphocytes+' '+entry.unit:'—'}</td><td>{p(entry.quality)}</td><td>{entry.quality==='entered'?'User-entered':entry.quality}</td><td><button type="button" className="manual-remove" aria-label={'Delete reading '+entry.date} onClick={()=>{setEntries(prev=>prev.filter(r=>r.id!==entry.id));setNotice('Reading removed.');setError('');}}>Remove</button></td></tr>;
      })}</tbody></table></div>}
      <p className="manual-hint">Exported CSV includes the label “User-entered (not instrument verified)”. Refreshing the page clears unsaved readings.</p>
    </section>
  </section>;
}
