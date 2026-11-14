// All values below are entirely synthetic; NASA OSDR data have NOT been imported.
const base = [
  {day:'B1',phase:'baseline',neutrophils:4.0,lymphocytes:2.0,quality:'verified'},
  {day:'B2',phase:'baseline',neutrophils:4.1,lymphocytes:2.0,quality:'verified'},
  {day:'B3',phase:'baseline',neutrophils:3.9,lymphocytes:2.0,quality:'verified'}
];
const m = (day, neutrophils, lymphocytes=2, quality='verified') => ({day,phase:'mission',neutrophils,lymphocytes,quality});
export const scenarios = {
  A:{id:'A',name:'Astronaut A',subtitle:'Stable readings',sleepHours:7.8,readings:[...base,m('D1',4.02),m('D2',4.04),m('D3',4.0),m('D4',4.08)]},
  B:{id:'B',name:'Astronaut B',subtitle:'Gradual rise + reduced sleep',sleepHours:5.4,readings:[...base,m('D1',4.1),m('D2',4.4),m('D3',4.8),m('D4',5.3),m('D5',5.6)]},
  C:{id:'C',name:'Astronaut C',subtitle:'Unverified / missing data',sleepHours:null,readings:[...base,m('D1',4.1),m('D2',null,null,'missing'),m('D3',19.8,2,'unverified'),m('D4',null,null,'missing')]}
};
