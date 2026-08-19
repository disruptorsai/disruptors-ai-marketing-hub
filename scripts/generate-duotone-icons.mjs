import { renderToStaticMarkup } from 'react-dom/server';
import fs from 'fs';
import path from 'path';
import { pathToFileURL } from 'url';

const names = ["Cpu","Vault","GraduationCap","ClockCountdown","UsersThree","PlugsConnected","ListChecks",
"Lightning","ArrowsClockwise","HourglassSimple","ChartLineUp","Keyboard","BellRinging","Funnel",
"SealCheck","Broom","Binoculars","Brain","Blueprint","RocketLaunch","PuzzlePiece","Trophy","Target",
"Robot","Handshake","Presentation","CurrencyCircleDollar","Compass","Engine","UserFocus",
"PaperPlaneTilt","ChartBar","FlowArrow","FastForward","Flask","FunnelSimple","TrendDown","Medal",
"NotePencil","FilmStrip","Crown","ShareNetwork","CalendarCheck","Ranking","ChatCenteredText","Code",
"MagnifyingGlass","Magnet","TrendUp","MagicWand","FrameCorners","ChartPieSlice","Broadcast","Megaphone"];

const out = {};
for (const n of names) {
  const mod = await import(pathToFileURL(path.resolve(process.cwd(), `node_modules/@phosphor-icons/react/dist/defs/${n}.es.js`)).href);
  const weights = mod.default;
  const el = weights.get('duotone');
  if (!el) { console.error('NO DUOTONE:', n); process.exit(1); }
  const html = renderToStaticMarkup(el);
  // paths are simple, self-closing, attribute order stable
  const paths = [...html.matchAll(/<path\b([^>]*?)\s*\/?>/g)].map(m => {
    const attrs = m[1];
    const d = /\bd="([^"]*)"/.exec(attrs)?.[1];
    const opacity = /\bopacity="([^"]*)"/.exec(attrs)?.[1];
    return opacity ? { d, opacity } : { d };
  });
  if (!paths.length || paths.some(p => !p.d)) { console.error('PARSE FAIL:', n, html.slice(0,120)); process.exit(1); }
  out[n] = paths;
}

const lines = [];
lines.push('// GENERATED FILE — do not edit by hand.');
lines.push('// Duotone-only path data extracted from @phosphor-icons/react (MIT, Phosphor Icons).');
lines.push('// Regenerate with scripts/generate-duotone-icons.mjs.');
lines.push('//');
lines.push('// Why this exists: @phosphor-icons/react ships all six weights inside each icon module,');
lines.push('// and a single icon def cannot be tree-shaken down to one weight. Importing the 54 icons');
lines.push('// this template uses cost 209kB raw / 55kB gzipped. We only ever render duotone, so the');
lines.push('// duotone paths are extracted here instead.');
lines.push('');
lines.push('import React from \'react\';');
lines.push('');
lines.push('// name -> array of [d, opacity?]; opacity 0.2 is the duotone under-layer.');
lines.push('const P = {');
for (const [n, paths] of Object.entries(out)) {
  const arr = paths.map(p => p.opacity ? `['${p.d}','${p.opacity}']` : `['${p.d}']`).join(',');
  lines.push(`  ${n}: [${arr}],`);
}
lines.push('};');
lines.push('');
lines.push('/** Phosphor duotone glyph. Sized/coloured by className + style, like the previous icons. */');
lines.push('function make(name) {');
lines.push('  const paths = P[name];');
lines.push('  // `weight` is accepted and ignored — these are duotone-only, but a caller may still');
lines.push('  // pass it. Swallowing it keeps it off the DOM (React warns on unknown attributes).');
lines.push('  // eslint-disable-next-line no-unused-vars -- `weight` is destructured purely to keep it off the DOM');
lines.push('  const C = ({ className = \'\', style, weight, ...rest }) => (');
lines.push('    <svg viewBox="0 0 256 256" fill="currentColor" className={className} style={style} aria-hidden="true" {...rest}>');
lines.push('      {paths.map(([d, opacity], i) => <path key={i} d={d} opacity={opacity} />)}');
lines.push('    </svg>');
lines.push('  );');
lines.push('  C.displayName = name;');
lines.push('  return C;');
lines.push('}');
lines.push('');
for (const n of names) lines.push(`export const ${n} = make('${n}');`);
lines.push('');

fs.writeFileSync('src/components/solutions/duotoneIcons.jsx', lines.join('\n'));
console.log(`generated ${names.length} duotone icons -> src/components/solutions/duotoneIcons.jsx`);
console.log(`file size: ${fs.statSync('src/components/solutions/duotoneIcons.jsx').size} bytes`);
