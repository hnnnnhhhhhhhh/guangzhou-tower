#!/usr/bin/env node
// 把 style/visual.json（对着参考图做的选择题）编译成样式。模型不写样式，只答题。
// 用法: node scripts/style.mjs runs/<name>
// 产出: runs/<name>/theme/theme.ts（Astryx 主题）和 runs/<name>/app/style.css（kit 零件读的变量）
import fs from 'node:fs';
import path from 'node:path';
import {KIT, readJson, require, resolveRun} from './lib.mjs';

const {abs: RUN} = resolveRun(process.argv[2]);
const file = path.join(RUN, 'style/visual.json');
if (!fs.existsSync(file)) {
  console.error('缺 style/visual.json。先按 docs/reading-visuals.md 对着参考图答题。');
  process.exit(2);
}
const v = readJson(file);
const Ajv = require('ajv');
const validate = new Ajv({allErrors: true, strict: false}).compile(readJson(path.join(KIT, 'schemas/visual.schema.json')));
if (!validate(v)) {
  for (const e of validate.errors) console.error(`visual.json${e.instancePath} ${e.message}${e.params?.allowedValues ? '：只能是 ' + e.params.allowedValues.join(' / ') : ''}`);
  process.exit(1);
}
for (const s of v.source.shots) if (!fs.existsSync(path.join(RUN, 'style/shots', s))) console.warn(`提醒：style/shots/${s} 不在本机（截图不进仓库，换机器后需要重新下载）`);

// ---- 选择题 → 数值。全部落在 Astryx 的刻度上 ----
// 圆角的实际数值只在这里定一次，写进 Astryx 的圆角变量，零件和 Astryx 自己的输入框都读它
const RADIUS_PX = {square: 0, small: 6, medium: 14, large: 24, pill: 36};
const CTL_PX = {square: 0, small: 4, medium: 10, pill: 9999};
const DENSITY = {airy: {pad: 6, item: 5, section: 10}, regular: {pad: 5, item: 4, section: 8}, compact: {pad: 4, item: 3, section: 6}};
const WEIGHT = {regular: 400, medium: 500, bold: 700};
const dark = v.mode === 'dark';
const c = v.colors;
const mix = (a, b, pct) => `color-mix(in srgb, ${a} ${pct}%, ${b})`;
const d = DENSITY[v.density];
const surface = {
  none: {bg: 'transparent', border: '0 solid transparent', shadow: 'none', pad: '0px'},
  fill: {bg: c.surface, border: '0 solid transparent', shadow: 'none', pad: `var(--spacing-${d.pad})`},
  border: {bg: 'transparent', border: `1px solid ${mix(c.ink, c.ground, 18)}`, shadow: 'none', pad: `var(--spacing-${d.pad})`},
  shadow: {bg: c.surface, border: '0 solid transparent', shadow: 'var(--shadow-low)', pad: `var(--spacing-${d.pad})`},
}[v.surface];
const selected = {
  invert: {bg: c.ink, fg: c.ground, line: 'transparent'},
  accent: {bg: c.accent, fg: c.on_accent, line: 'transparent'},
  underline: {bg: 'transparent', fg: c.ink, line: c.ink},
}[v.selected];

const css = `/* 由 scripts/style.mjs 从 style/visual.json 生成，不要手改。要改样子就改 visual.json 再重新生成。
   参考：${v.source.app} */
:root {
  --k-ground: ${c.ground};
  --k-surface: ${c.surface};
  --k-ink: ${c.ink};
  --k-ink2: ${c.ink2};
  --k-line: ${v.divider === 'hairline' ? mix(c.ink, c.ground, dark ? 16 : 12) : 'transparent'};
  --k-faint: ${mix(c.ink, c.ground, dark ? 9 : 6)};
  --k-accent: ${c.accent};
  --k-on-accent: ${c.on_accent};
  --k-good: ${dark ? '#5fd08a' : '#187a45'};
  --k-warn: ${dark ? '#f2b84b' : '#8a5a00'};
  --k-bad: ${dark ? '#ff7b72' : '#b3261e'};

  --k-radius: var(--radius-container);
  --k-radius-ctl: var(--radius-element);
  --k-card-bg: ${surface.bg};
  --k-card-border: ${surface.border};
  --k-card-shadow: ${surface.shadow};
  --k-card-pad: ${surface.pad};
  /* D01 同心：容器里的小块 = 容器圆角 − 内边距，最小为 0 */
  --k-radius-inner: max(0px, calc(var(--k-radius) - var(--k-card-pad)));

  --k-gap-item: var(--spacing-${d.item});
  --k-gap-section: var(--spacing-${d.section});
  --k-row-pad: var(--spacing-${d.item});

  --k-title-size: ${v.title.size === 'large' ? 'var(--text-display-3-size)' : 'var(--text-heading-1-size)'};
  --k-title-weight: ${WEIGHT[v.title.weight]};
  --k-heading-weight: ${v.title.weight === 'regular' ? 500 : 600};
  --k-label-spacing: ${v.label === 'caps-spaced' ? '0.14em' : '0'};
  --k-label-transform: ${v.label === 'caps-spaced' ? 'uppercase' : 'none'};
  --k-label-size: ${v.label === 'caps-spaced' ? '0.6875rem' : 'var(--text-supporting-size)'};

  --k-btn-bg: ${v.button === 'solid' ? c.accent : 'transparent'};
  --k-btn-fg: ${v.button === 'solid' ? c.on_accent : c.ink};
  --k-btn-border: ${v.button === 'solid' ? 'transparent' : c.ink};
  --k-sel-bg: ${selected.bg};
  --k-sel-fg: ${selected.fg};
  --k-sel-line: ${selected.line};
}
`;
fs.mkdirSync(path.join(RUN, 'app'), {recursive: true});
fs.writeFileSync(path.join(RUN, 'app/style.css'), css);

const pair = (hex) => `['${hex}', '${hex}']`;
const theme = `// 由 scripts/style.mjs 从 style/visual.json 生成，不要手改。参考：${v.source.app}
import {defineTheme} from '@astryxdesign/core/theme';

export const theme = defineTheme({
  name: 'app',
  typography: {scale: {base: 17, ratio: 1.2}, body: {family: 'Noto Sans SC', fallbacks: 'system-ui, -apple-system, sans-serif'}},
  tokens: {
    '--color-background-body': ${pair(c.ground)},
    '--color-background-surface': ${pair(c.ground)},
    '--color-background-card': ${pair(c.surface)},
    '--color-background-muted': ${pair(c.surface)},
    '--color-text-primary': ${pair(c.ink)},
    '--color-text-secondary': ${pair(c.ink2)},
    '--color-accent': ${pair(c.accent)},
    '--color-on-accent': ${pair(c.on_accent)},
    '--radius-container': '${RADIUS_PX[v.radius]}px',
    '--radius-element': '${CTL_PX[v.control_radius]}px',
    '--radius-inner': '${Math.min(4, CTL_PX[v.control_radius])}px',
  },
});
`;
fs.mkdirSync(path.join(RUN, 'theme'), {recursive: true});
fs.writeFileSync(path.join(RUN, 'theme/theme.ts'), theme);
console.log(`已生成 app/style.css 和 theme/theme.ts（${v.source.app}：${v.mode}，容器 ${v.surface} / ${v.radius}，控件 ${v.control_radius}，选中 ${v.selected}，密度 ${v.density}）`);
