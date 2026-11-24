import { useMemo, useState } from 'react';
import { ResponsiveContainer, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, ReferenceLine } from 'recharts';
import { analyzeScenario, DEMO_SETTINGS } from './immuneEngine.js';
import { scenarios } from './scenarios.js';
import { nasaEvidence, summarizeNasaEvidence } from './nasaEvidence.js';
import './App.css';
import ManualPanel from './ManualPanel.jsx';

const fmt = x => x === null || x === undefined ? '—' : Number(x).toFixed(2);
const tone = { stable:'green', review:'amber', insufficient:'gray' };
export default function App(){
  const [selected,setSelected] = useState('B');
  const [mode,setMode] = useState('simulation');
  const [showAction,setShowAction] = useState(true);
  const active = scenarios[selected];
  const result = useMemo(()=>analyzeScenario(active),[active]);
  const recent = [...result.chart].reverse().find(r=>r.nlr!==null);
  const nasa = useMemo(() => summarizeNasaEvidence(), []);
  return <div className="shell">
    <header className="topbar"><div className="brandmark">✳</div><div className="brand"><strong>IMMUNOTRACK <span>2.0</span></strong><small>Autonomous Immune Monitoring & Decision Support</small></div><div className="top-right"><span className="online">● LOCAL ANALYSIS</span><span className="prototype">RESEARCH PROTOTYPE</span></div></header>
    <main><section className="intro"><p className="eyebrow">JAHIZ AI <span> / </span> NASA SPACE APPS CHALLENGE 2026</p><h1>Immune health, <em>clarified.</em></h1><p className="subtitle">Explore explainable immune trend monitoring with a personal baseline. Mission simulation uses synthetic data; a separate research panel shows source-attributed CBC values. NLR is a non-specific marker.</p></section>
    <div className="notice"><strong>DEMONSTRATION ONLY</strong> Experimental rules are not validated clinical thresholds. No diagnosis, treatment, or infection prediction. Three mission-demo scenarios are Synthetic. A separate research evidence panel uses NASA-origin CBC values from a public mirror; primary-file verification is pending.</div>
    <nav className="mode-bar" aria-label="Analysis modes">
      <button type="button" aria-pressed={mode==='simulation'} onClick={()=>setMode('simulation')}>01 · Simulation</button>
      <button type="button" aria-pressed={mode==='manual'} onClick={()=>setMode('manual')}>02 · Manual Input</button>
      <button type="button" aria-pressed={mode==='research'} onClick={()=>setMode('research')}>03 · NASA Research</button>
    </nav>
    {mode==='simulation' && <>
    <div className="section-head"><div><small>01 / MISSION MONITOR</small><h2>Astronaut scenarios</h2></div><span className="synthetic">● SYNTHETIC DATA</span></div>
    <div className="case-grid" role="group" aria-label="Choose simulated astronaut scenario">{Object.values(scenarios).map(s=><button key={s.id} type="button" aria-pressed={selected===s.id} className={'case '+(selected===s.id?'selected':'')} onClick={()=>{setSelected(s.id);setShowAction(true);}}><span className="case-icon">0{s.id==='A'?'1':s.id==='B'?'2':'3'}</span><strong>{s.name}</strong><small>{s.subtitle}</small></button>)}</div>
    <div className="dashboard"><section className="panel chart-panel"><div className="panel-head"><div><small>BIOMARKER MONITORING</small><h3>NLR trajectory</h3></div><span className="tag">Neutrophils / Lymphocytes</span></div><div className="plot" role="img" aria-label={`NLR chart for ${active.name}`}><ResponsiveContainer width="100%" height="100%"><LineChart data={result.chart} margin={{top:12,right:20,left:-16,bottom:0}}><CartesianGrid vertical={false} stroke="#243b55" strokeDasharray="3 6"/><XAxis dataKey="day" stroke="#95a9bb" tickLine={false} axisLine={false}/><YAxis stroke="#95a9bb" tickLine={false} axisLine={false} domain={[0,'auto']}/><Tooltip contentStyle={{background:'#10233a',border:'1px solid #29415c',borderRadius:10,color:'#f4fbff'}} formatter={(v)=>[fmt(v),'NLR']} /><ReferenceLine y={result.baseline??0} stroke="#59dfcb" strokeDasharray="6 5" label={{value:'Baseline',fill:'#59dfcb',position:'insideTopRight',fontSize:11}}/><Line type="linear" connectNulls={false} dataKey="nlr" name="NLR" stroke="#53c8ff" strokeWidth={3} dot={{r:4,fill:'#53c8ff',stroke:'#071526',strokeWidth:2}} activeDot={{r:6}} isAnimationActive={false}/></LineChart></ResponsiveContainer></div><div className="legend"><span><i className="line cyan"/> Measured NLR (synthetic)</span><span><i className="line teal"/> Personal baseline</span></div></section>
    <section className="panel status-panel"><div className="panel-head"><div><small>DECISION SUPPORT</small><h3>Interpretation</h3></div></div><div className={'status '+tone[result.status]}><span className="dot">●</span>{result.heading}</div><p className="message">{result.message}</p><div className="metric-grid"><div><small>Last verified synthetic NLR</small><strong>{fmt(recent?.nlr)}</strong></div><div><small>Personal baseline</small><strong>{fmt(result.baseline)}</strong></div><div><small>Change from baseline</small><strong>{result.changePercent===null?'—':`${result.changePercent>=0?'+':''}${result.changePercent.toFixed(1)}%`}</strong></div><div><small>Reported sleep</small><strong>{active.sleepHours===null?'Unknown':`${active.sleepHours} h`}</strong></div></div><button className="action-toggle" onClick={()=>setShowAction(v=>!v)} type="button" aria-expanded={showAction}>{showAction?'Hide':'Show'} suggested next step <span>{showAction?'−':'+'}</span></button>{showAction&&<div className="action"><small>RESEARCH-ONLY GUIDANCE</small><p>{result.action}</p></div>}</section></div>
    </>}
    {mode==='manual' && <ManualPanel/>}
    {mode==='research' && <section className="panel nasa-panel">
      <div className="section-head"><div><small>04 / RESEARCH EVIDENCE — SEPARATE FROM DEMO ENGINE</small><h2>Inspiration4 CBC data: sample-level NLR</h2></div><span className="synthetic">NASA-ORIGIN · MIRROR UNVERIFIED</span></div>
      <p className="message">A small, traceable subset of published NASA OSDR OSD-569 CBC values, transcribed from a public third-party mirror. Each NLR is calculated from the listed absolute cell counts; these are <strong>preflight/postflight</strong> observations, not daily in-flight measurements. The original NASA download has not been independently checked against the mirror.</p>
      <div className="nasa-table-wrap"><table className="nasa-table"><thead><tr><th>Sample / time</th><th>Neutrophils (cells/µL)</th><th>Lymphocytes (cells/µL)</th><th>Computed NLR</th></tr></thead><tbody>{nasa.samples.map(row=><tr key={row.sampleId}><td><strong>{row.phase}</strong><small>{row.sampleId}</small></td><td>{row.neutrophils.toLocaleString('en-US')}</td><td>{row.lymphocytes.toLocaleString('en-US')}</td><td>{fmt(row.nlr)}</td></tr>)}</tbody></table></div>
      <div className="evidence-summary"><div><small>Preflight median, C001 (3 samples)</small><strong>{fmt(nasa.preflightMedian)}</strong></div><div><small>Postflight R+1, same person</small><strong>{fmt(nasa.postflightNlr)}</strong></div><div><small>Relative difference (observational)</small><strong>{nasa.changePercent.toFixed(1)}%</strong></div></div>
      <p className="evidence-footnote">Research context only. Different timepoints are not a validated risk threshold; no flight-time immune trajectory, medical diagnosis, or causal effect is inferred. This dataset is <strong>not</strong> used to replace the synthetic baseline of Astronaut A, B, or C.</p>
      <p className="evidence-links"><a href={nasaEvidence.sourceUrl} target="_blank" rel="noreferrer">NASA study OSD-569</a> · <a href={nasaEvidence.mirrorUrl} target="_blank" rel="noreferrer">Source CSV mirror</a> · <a href={nasaEvidence.sourceManifestUrl} target="_blank" rel="noreferrer">Mirror provenance manifest</a></p>
    </section>}
    {mode==='simulation' && <section className="bottom"><div className="mini"><small>02 / EXPERIMENTAL DETECTION RULE</small><p>Baseline = median of at least {DEMO_SETTINGS.minBaselineSamples} verified reference measurements. Trend review requires an increase of at least {DEMO_SETTINGS.trendPercent}% and 3 consecutive rising valid mission measurements. These are illustrative settings, <strong>not medical thresholds.</strong></p></div><div className="mini"><small>03 / DATA CONFIDENCE</small><p>{result.evidence.validBaseline} valid baseline samples · {result.evidence.missing} missing or unverified of {result.evidence.total} mission samples. Invalid or unknown sample quality suppresses automatic interpretation.</p></div></section>}
    <footer><span>IMMUNOTRACK 2.0 · JAHIZ AI</span><span>Local browser analysis · Simulation: Synthetic · Manual: User-entered · NASA: Research mirror</span></footer></main>
  </div>;
}
