#!/usr/bin/env node
// 从风格参考截图里“量”出颜色，而不是让模型目测报十六进制。
// 不同模型看同一张图报的色值会不一样；像素统计不会。
// 用法: node scripts/palette.mjs runs/<name>          读 style/shots/*.png|jpg，写 style/measured.json
//       node scripts/palette.mjs runs/<name> a.png b.png   指定文件
import fs from 'node:fs';
import path from 'node:path';
import {list, loadPlaywright, resolveRun} from './lib.mjs';

const {abs} = resolveRun(process.argv[2]);
const files = process.argv.length > 3 ? process.argv.slice(3).map((f) => path.resolve(f)) : list(path.join(abs, 'style/shots'), ['.png', '.jpg', '.jpeg', '.webp']);
if (!files.length) {
  console.error('没有风格截图。把 3–8 张同一个 app 的截图放进 style/shots/');
  process.exit(2);
}

const {chromium} = loadPlaywright();
const browser = await chromium.launch();
const page = await browser.newPage();

// 在浏览器里解码并统计：把每个像素量化到 4bit/通道的桶，按面积排序。
const analyse = async (dataUrl) =>
  page.evaluate(async (src) => {
    const img = new Image();
    img.src = src;
    await img.decode();
    const scale = Math.min(1, 400 / img.width);
    const w = Math.round(img.width * scale);
    const h = Math.round(img.height * scale);
    const c = new OffscreenCanvas(w, h);
    const ctx = c.getContext('2d');
    ctx.drawImage(img, 0, 0, w, h);
    // 去掉顶部状态栏和底部一条：Mobbin 的预览图底部有水印条，状态栏也不属于 app 的界面
    const y0 = Math.round(h * 0.07);
    const y1 = Math.round(h * 0.95);
    const d = ctx.getImageData(0, y0, w, y1 - y0).data;
    const buckets = new Map();
    for (let i = 0; i < d.length; i += 4) {
      const key = ((d[i] >> 4) << 8) | ((d[i + 1] >> 4) << 4) | (d[i + 2] >> 4);
      const b = buckets.get(key) ?? {n: 0, r: 0, g: 0, b: 0};
      b.n++;
      b.r += d[i];
      b.g += d[i + 1];
      b.b += d[i + 2];
      buckets.set(key, b);
    }
    const total = w * (y1 - y0);
    return [...buckets.values()]
      .map((b) => ({r: Math.round(b.r / b.n), g: Math.round(b.g / b.n), b: Math.round(b.b / b.n), share: b.n / total}))
      .sort((a, b) => b.share - a.share)
      .slice(0, 40);
  }, dataUrl);

const mime = (f) => (f.endsWith('.png') ? 'image/png' : f.endsWith('.webp') ? 'image/webp' : 'image/jpeg');
const hex = ({r, g, b}) => '#' + [r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('').toUpperCase();
const sat = ({r, g, b}) => {
  const mx = Math.max(r, g, b);
  const mn = Math.min(r, g, b);
  return mx === 0 ? 0 : (mx - mn) / mx;
};
const lum = ({r, g, b}) => (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
const hue = ({r, g, b}) => {
  const mx = Math.max(r, g, b);
  const mn = Math.min(r, g, b);
  if (mx === mn) return 0;
  const d = mx - mn;
  const h = mx === r ? ((g - b) / d) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return Math.round((h * 60 + 360) % 360);
};

const perFile = [];
for (const f of files) {
  const data = `data:${mime(f.toLowerCase())};base64,${fs.readFileSync(f).toString('base64')}`;
  perFile.push({file: path.basename(f), colors: await analyse(data)});
}
await browser.close();

// 汇总：中性色 = 低饱和；强调色 = 高饱和里跨图出现最稳定的那个色相。
const all = perFile.flatMap((p) => p.colors.map((c) => ({...c, file: p.file})));
const neutrals = all.filter((c) => sat(c) < 0.12);
const chroma = all.filter((c) => sat(c) >= 0.35 && lum(c) > 0.15 && lum(c) < 0.9);
const mode = lum(neutrals.sort((a, b) => b.share - a.share)[0] ?? {r: 255, g: 255, b: 255}) > 0.5 ? 'light' : 'dark';

const hueGroups = new Map();
for (const c of chroma) {
  const k = Math.round(hue(c) / 20) * 20;
  const g = hueGroups.get(k) ?? {hue: k, share: 0, files: new Set(), best: c};
  g.share += c.share;
  g.files.add(c.file);
  if (c.share * sat(c) > g.best.share * sat(g.best)) g.best = c;
  hueGroups.set(k, g);
}
const accents = [...hueGroups.values()]
  .sort((a, b) => b.files.size - a.files.size || b.share - a.share)
  .slice(0, 4)
  .map((g) => ({hex: hex(g.best), hue: g.hue, seen_in: g.files.size, of: files.length, area: +(g.share / files.length).toFixed(4)}));

const byLum = (arr) => [...new Map(arr.map((c) => [hex(c), c])).values()].sort((a, b) => lum(b) - lum(a));
const topNeutrals = byLum(neutrals.sort((a, b) => b.share - a.share).slice(0, 12)).map((c) => ({hex: hex(c), lum: +lum(c).toFixed(2), area: +c.share.toFixed(3)}));

const out = {
  measured_from: files.map((f) => path.basename(f)),
  mode,
  accent_candidates: accents,
  neutrals: topNeutrals,
  chroma_share: +(chroma.reduce((s, c) => s + c.share, 0) / files.length).toFixed(3),
  note: 'accent_candidates[0] 通常是品牌主色；seen_in 低说明它只在个别屏出现（多半是内容图片，不是 UI 色）。chroma_share 是彩色面积占比：< 0.05 克制，> 0.2 浓烈。字体、圆角、间距量不出来，需要读图判断后写进 DESIGN.md。',
};
const dest = path.join(abs, 'style/measured.json');
fs.mkdirSync(path.dirname(dest), {recursive: true});
fs.writeFileSync(dest, JSON.stringify(out, null, 2) + '\n');
console.log(JSON.stringify(out, null, 2));
console.log(`\n→ ${path.relative(process.cwd(), dest)}`);
