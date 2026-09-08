// Contrast check for the design tokens. Run: node tests/tools/contrast.mjs
// Targets: 4.5:1 for normal text, 3:1 for large text and control boundaries
// (WCAG 2.2 AA, 1.4.3 and 1.4.11).
const hex = (h) => h.replace('#','').match(/../g).map(x=>parseInt(x,16)/255);
const lin = (c) => c <= 0.04045 ? c/12.92 : ((c+0.055)/1.055)**2.4;
const lum = (h) => { const [r,g,b]=hex(h).map(lin); return 0.2126*r+0.7152*g+0.0722*b; };
const ratio = (a,b) => { const [x,y]=[lum(a),lum(b)].sort((m,n)=>n-m); return (x+0.05)/(y+0.05); };
// Keep in sync with the @theme block in src/app/globals.css.
const T = {
  ink:'#101010', inkRaised:'#191918', paper:'#F3F0E9', signal:'#FF5738',
  signalHover:'#FF745C', signalInk:'#B82F0C', mutedDark:'#B8B5AF', mutedLight:'#625F59',
  ruleDark:'#3A3936', ruleLight:'#CEC9C0', controlDark:'#75726B', controlLight:'#625F59',
};
const pairs = [
  ['paper on ink', T.paper, T.ink],
  ['muted-dark on ink', T.mutedDark, T.ink],
  ['muted-dark on ink-raised', T.mutedDark, T.inkRaised],
  ['signal on ink', T.signal, T.ink],
  ['signal on ink-raised', T.signal, T.inkRaised],
  ['ink on signal', T.ink, T.signal],
  ['ink on signal-hover', T.ink, T.signalHover],
  ['ink on paper', T.ink, T.paper],
  ['muted-light on paper', T.mutedLight, T.paper],
  ['signal on paper', T.signal, T.paper],
  ['signal-ink on paper (labels)', T.signalInk, T.paper],
  ['control-dark border on ink', T.controlDark, T.ink],
  ['control-dark border on ink-raised', T.controlDark, T.inkRaised],
  ['control-light border on paper', T.controlLight, T.paper],
  ['rule-dark on ink (decorative divider)', T.ruleDark, T.ink],
  ['rule-light on paper (decorative divider)', T.ruleLight, T.paper],
];
for (const [name,a,b] of pairs) {
  const r = ratio(a,b);
  const norm = r>=4.5 ? 'AA-text' : r>=3 ? 'AA-3:1-only' : 'below-3:1';
  console.log(`${r.toFixed(2).padStart(6)}  ${norm.padEnd(12)} ${name}`);
}
// Decorative dividers below 3:1 are intentional: they carry no meaning and
// never form the visual boundary of a control. Interactive boundaries use the
// control-* tokens, which are checked above.
