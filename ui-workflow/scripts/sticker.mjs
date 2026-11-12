#!/usr/bin/env node
// 把微软 Fluent Emoji（MIT）做成“白边贴纸”：白色描边 + 一层很轻的投影，输出矢量 SVG。
// 用同一套图源，所以在任何手机上长得都一样，不依赖系统自带的 emoji。
// 用法: node scripts/sticker.mjs runs/<name> automobile warning trophy …
//   输出到 runs/<name>/app/stickers/<名字>.svg，并生成 index.ts 供界面按名字引用。
//   查名字: node scripts/sticker.mjs --find 关键词
import fs from 'node:fs';
import path from 'node:path';
import {require, resolveRun} from './lib.mjs';

const set = require('@iconify-json/fluent-emoji/icons.json');
if (process.argv[2] === '--find') {
  const q = (process.argv[3] ?? '').toLowerCase();
  console.log(Object.keys(set.icons).filter((n) => n.includes(q)).slice(0, 80).join('  '));
  process.exit(0);
}
const {abs} = resolveRun(process.argv[2]);
const names = process.argv.slice(3);
if (!names.length) {
  console.error('给出至少一个 emoji 名字');
  process.exit(2);
}
const out = path.join(abs, 'app/stickers');
fs.mkdirSync(out, {recursive: true});
const PAD = 5; // 给白边和投影留的余量（图源是 32×32）
const size = 32 + PAD * 2;
for (const name of names) {
  const icon = set.icons[name];
  if (!icon) {
    console.error(`没有叫 ${name} 的 emoji。用 --find 查一下`);
    process.exit(1);
  }
  // 图源里的渐变 id 在同页多张贴纸时会撞名，逐张加前缀
  const body = icon.body.replace(/id="([^"]+)"/g, `id="${name}-$1"`).replace(/url\(#([^)]+)\)/g, `url(#${name}-$1)`).replace(/href="#([^"]+)"/g, `href="#${name}-$1"`);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="${-PAD} ${-PAD} ${size} ${size}">
<defs><filter id="${name}-sticker" x="-25%" y="-25%" width="150%" height="150%" color-interpolation-filters="sRGB">
<feMorphology in="SourceAlpha" operator="dilate" radius="1.7"/>
<feGaussianBlur stdDeviation="0.45"/>
<feComponentTransfer result="edge"><feFuncA type="linear" slope="6" intercept="-1.6"/></feComponentTransfer>
<feFlood flood-color="#fff"/><feComposite in2="edge" operator="in" result="border"/>
<feGaussianBlur in="edge" stdDeviation="0.9"/><feOffset dy="0.9"/>
<feComponentTransfer result="shadow"><feFuncA type="linear" slope="0.28"/></feComponentTransfer>
<feMerge><feMergeNode in="shadow"/><feMergeNode in="border"/><feMergeNode in="SourceGraphic"/></feMerge>
</filter></defs>
<g filter="url(#${name}-sticker)">${body}</g></svg>
`;
  fs.writeFileSync(path.join(out, `${name}.svg`), svg);
}
const all = fs.readdirSync(out).filter((f) => f.endsWith('.svg')).map((f) => f.slice(0, -4)).sort();
const ident = (n) => n.replace(/-([a-z0-9])/g, (_, c) => c.toUpperCase());
fs.writeFileSync(
  path.join(out, 'index.ts'),
  `// 由 scripts/sticker.mjs 生成，不要手改。图源：Microsoft Fluent Emoji（MIT）。\n${all.map((n) => `import ${ident(n)} from './${n}.svg';`).join('\n')}\n\nexport const STICKERS = {${all.map((n) => `'${n}': ${ident(n)}`).join(', ')}} as const;\nexport type StickerName = keyof typeof STICKERS;\n`,
);
console.log(`已生成 ${names.length} 张贴纸 → ${path.relative(process.cwd(), out)}（共 ${all.length} 张）`);
