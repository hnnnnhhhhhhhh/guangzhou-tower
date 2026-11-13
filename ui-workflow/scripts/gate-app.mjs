#!/usr/bin/env node
// 应用门禁：检查的是“这个 app 能不能真的用”，而不只是屏幕长得对不对。
// 用法: node scripts/gate-app.mjs runs/<name>
//   1 规格   app-spec.json 合合同；每屏有实现；每条验收场景有脚本
//   2 源码   屏幕只用配方和组件；没有空的事件处理；没有写死的样式
//     规范   配方样式里的间距、字号、圆角、高度只能来自刻度变量
//   3 构建   vite build
//   4 验收   在 390×844 的真实浏览器里把每条验收场景点一遍（全新存储、可拨动的日期）
//   5 每屏   截图；无横向溢出；触控目标 ≥ 44；对比度与可访问性
//   6 覆盖   规格里的每一屏都被某条场景走到过
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {pathToFileURL} from 'node:url';
import {KIT, Report, list, loadPlaywright, readJson, require, resolveRun} from './lib.mjs';

const {abs: RUN, rel: RUN_REL} = resolveRun(process.argv[2]);
const report = new Report();
const VIEWPORT = {width: 390, height: 844};
const START = new Date(2026, 10, 12, 9, 0, 0); // 场景里的“第一天”

// ---------- 1 规格 ----------
const Ajv = require('ajv');
const validate = new Ajv({allErrors: true, strict: false}).compile(readJson(path.join(KIT, 'schemas/app.schema.json')));
let spec = null;
try {
  spec = readJson(path.join(RUN, 'app-spec.json'));
  if (!validate(spec)) {
    for (const e of validate.errors) report.fail('spec', `app-spec${e.instancePath} ${e.message}`);
    spec = null;
  } else report.pass('spec', 'app-spec.json 符合合同');
} catch (e) {
  report.fail('spec', `读不了 app-spec.json：${e.message}`);
}

const screenFiles = list(path.join(RUN, 'app/screens'), ['.tsx']);
const sources = Object.fromEntries(screenFiles.map((f) => [f, fs.readFileSync(f, 'utf8')]));
if (spec) {
  const ids = new Set(spec.screens.map((s) => s.id));
  for (const s of spec.screens) {
    if (!Object.values(sources).some((src) => new RegExp(`screen=["']${s.id}["']`).test(src))) report.fail('spec', `规格里的屏 ${s.id} 没有实现（找不到 <Screen screen="${s.id}">）`);
    for (const to of s.leads_to) if (!ids.has(to)) report.fail('spec', `屏 ${s.id} 的 leads_to 指向不存在的屏 ${to}`);
  }
  for (const a of spec.acceptance) if (!fs.existsSync(path.join(RUN, 'acceptance', `${a.id}.mjs`))) report.fail('spec', `验收场景 ${a.id} 没有脚本 acceptance/${a.id}.mjs`);
}

// ---------- 2 源码 ----------
const RAW_TAGS = /<(div|span|p|h[1-6]|button|a|img|ul|ol|li|section|header|footer|nav|main|input|textarea|select|table|label|form)(\s|>|\/)/g;
const RULES = [
  [/\bstyle=\{/g, '行内样式。视觉效果要做成配方（recipes/），不要写在屏里'],
  [/\bclassName=/g, 'className。屏里不写样式'],
  [/#[0-9a-fA-F]{3,8}\b(?![\w-])/g, '写死的颜色'],
  [/\b\d+(\.\d+)?(px|rem|em)\b/g, '写死的尺寸'],
  [/=\{\s*\(\s*\)\s*=>\s*\{\s*\}\s*\}/g, '空的事件处理函数。每个能点的东西都要真的做事'],
  [/from ['"](?!react['"]|lucide-react['"]|@astryxdesign\/|\.\.?\/)[^'"]+['"]/g, '引入了允许范围以外的包'],
];
const strip = (s) => s.replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, ' ')).replace(/(^|[^:])\/\/.*$/gm, (m, p) => p + ' '.repeat(m.length - p.length));
for (const [file, raw] of Object.entries(sources)) {
  const rel = path.relative(RUN, file);
  const src = strip(raw);
  const line = (i) => src.slice(0, i).split('\n').length;
  let bad = 0;
  for (const m of src.matchAll(RAW_TAGS)) (report.fail('source', `裸 HTML 标签 <${m[1]}>。用配方或组件`, `${rel}:${line(m.index)}`), bad++);
  for (const [re, msg] of RULES) for (const m of src.matchAll(re)) (report.fail('source', `${msg}：${m[0].slice(0, 40)}`, `${rel}:${line(m.index)}`), bad++);
  if (!bad) report.pass('source', `${rel} 只组合配方，没有空操作`);
}
for (const f of list(path.join(RUN, 'app/logic'), ['.ts'])) {
  const src = fs.readFileSync(f, 'utf8');
  if (/from ['"]\.\.\/screens/.test(src) || /from ['"].*recipes/.test(src)) report.fail('source', '业务逻辑不应该依赖界面', path.relative(RUN, f));
}

// 规范：配方样式里，尺寸只能来自刻度变量。:root 里定义变量；:root 之外不许写死间距、字号、圆角、高度。
for (const f of [path.join(KIT, 'recipes/recipes.css'), path.join(RUN, 'style/visual.css')].filter((x) => fs.existsSync(x))) {
  const cssRaw = fs.readFileSync(f, 'utf8').replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, ' '));
  const rootEnd = cssRaw.indexOf('}', cssRaw.indexOf(':root'));
  const body = cssRaw.slice(0, cssRaw.indexOf(':root')).replace(/[^\n]/g, ' ') + cssRaw.slice(cssRaw.indexOf(':root'), rootEnd + 1).replace(/[^\n]/g, ' ') + cssRaw.slice(rootEnd + 1);
  const SIZED = /(?<=[{;]\s*|^\s*)(padding[a-z-]*|margin[a-z-]*|gap|row-gap|column-gap|font-size|line-height|border-radius|width|height|min-height|max-height|min-width|inset|top|right|bottom|left)\s*:\s*([^;]+);/gm;
  let bad = 0;
  for (const m of body.matchAll(SIZED)) {
    const value = m[2].replace(/var\([^()]*\)/g, '').replace(/env\([^()]*\)/g, '');
    const raw = value.match(/(?<![\w.-])(?!0(px|rem)?\b)\d*\.?\d+(px|rem|em)\b/);
    if (raw) {
      report.fail('tokens', `写死的尺寸 ${m[1]}: ${raw[0]}。间距、字号、圆角、高度只能用刻度变量（--spacing-* / --rx-*）`, `${path.relative(KIT, f)}:${body.slice(0, m.index).split('\n').length}`);
      bad++;
    }
  }
  if (!bad) report.pass('tokens', `${path.relative(KIT, f)}：尺寸全部来自刻度`);
}

// ---------- 3 构建 ----------
let built = false;
if (!fs.existsSync(path.join(RUN, 'index.html'))) fs.copyFileSync(path.join(KIT, 'templates/index.html'), path.join(RUN, 'index.html'));
if (fs.existsSync(path.join(RUN, 'style/visual.json'))) {
  // 样式由选择题的答案生成，保证 app/style.css 和 theme.ts 与 visual.json 一致
  try {
    execFileSync('node', [path.join(KIT, 'scripts/style.mjs'), RUN_REL], {cwd: KIT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe']});
  } catch (e) {
    report.fail('visual', `样式生成失败：${(e.stderr || e.stdout || e.message).trim().split('\n').slice(0, 4).join(' | ')}`);
  }
}
if (fs.existsSync(path.join(RUN, 'theme/theme.ts'))) {
  // 有主题就先编译：主题写错了在这里就会报
  try {
    execFileSync('npx', ['astryx', 'theme', 'build', path.join(RUN_REL, 'theme/theme.ts')], {cwd: KIT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe']});
    report.pass('theme', 'theme.ts 编译通过');
  } catch (e) {
    report.fail('theme', `主题编译失败：${(e.stderr || e.stdout || e.message).trim().split('\n').slice(0, 5).join(' | ')}`);
  }
}
try {
  execFileSync('npx', ['vite', 'build', '--logLevel', 'error'], {cwd: KIT, env: {...process.env, RUN: RUN_REL}, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe']});
  built = true;
  report.pass('build', '构建成功');
} catch (e) {
  report.fail('build', `构建失败：${(e.stderr || e.stdout || e.message).trim().split('\n').slice(0, 8).join(' | ')}`);
}

// ---------- 4–6 验收 ----------
const outDir = path.join(RUN, 'out');
fs.rmSync(outDir, {recursive: true, force: true});
fs.mkdirSync(outDir, {recursive: true});
const visited = new Set();
// 有 style/visual.json 的 run：先校验它，后面每一屏都会拿它核对
let visual = null;
const visualFile = path.join(RUN, 'style/visual.json');
if (fs.existsSync(visualFile)) {
  const vv = new Ajv({allErrors: true, strict: false}).compile(readJson(path.join(KIT, 'schemas/visual.schema.json')));
  try {
    visual = readJson(visualFile);
    if (!vv(visual)) {
      for (const e of vv.errors) report.fail('visual', `visual.json${e.instancePath} ${e.message}`);
      visual = null;
    } else report.pass('visual', `visual.json 合合同（参考：${visual.source.app}）`);
  } catch (e) {
    report.fail('visual', `读不了 style/visual.json：${e.message}`);
  }
}

if (built && spec) {
  const dist = path.join(RUN, 'dist');
  const MIME = {'.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.json': 'application/json'};
  const server = http.createServer((req, res) => {
    const p = path.join(dist, decodeURIComponent(new URL(req.url, 'http://x').pathname));
    const file = fs.existsSync(p) && fs.statSync(p).isFile() ? p : path.join(dist, 'index.html');
    res.writeHead(200, {'content-type': MIME[path.extname(file)] ?? 'application/octet-stream'});
    fs.createReadStream(file).pipe(res);
  });
  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  const url = `http://127.0.0.1:${server.address().port}/`;
  const {chromium} = loadPlaywright();
  const axeSource = fs.readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8');
  const browser = await chromium.launch();
  const shotOnce = new Set();

  // 第一屏不能是空状态：用户打开看到的第一眼必须有内容
  {
    const ctx = await browser.newContext({viewport: VIEWPORT, colorScheme: 'light', locale: 'zh-CN'});
    const page = await ctx.newPage();
    await page.clock.install({time: new Date(START)});
    await page.goto(url);
    await page.locator('[data-screen]').first().waitFor({timeout: 5000}).catch(() => {});
    if (await page.locator('[data-k="empty"]').first().isVisible().catch(() => false)) report.fail('first-screen', '打开的第一屏是空状态。示例数据要相对“今天”生成，让第一屏有真实内容');
    else report.pass('first-screen', '第一屏有内容');
    await ctx.close();
  }
  for (const a of spec.acceptance) {
    const file = path.join(RUN, 'acceptance', `${a.id}.mjs`);
    if (!fs.existsSync(file)) continue;
    const ctx = await browser.newContext({viewport: VIEWPORT, deviceScaleFactor: 2, hasTouch: true, isMobile: true, colorScheme: 'light', locale: 'zh-CN'});
    const page = await ctx.newPage();
    const errors = [];
    page.on('pageerror', (e) => errors.push(e.message));
    let now = new Date(START);
    await page.clock.install({time: now});
    await page.goto(url);
    let step = '打开应用';

    const current = () => page.locator('[data-screen]').first().getAttribute('data-screen');
    const inspect = async (name) => {
      const id = await current();
      visited.add(id);
      const key = name ?? id;
      if (shotOnce.has(key)) return;
      shotOnce.add(key);
      await page.waitForTimeout(550); // 等入场动效结束再拍
      const shot = `${key}.png`;
      await page.screenshot({path: path.join(outDir, shot)});
      const m = await page.evaluate(() => {
        const vw = document.documentElement.clientWidth;
        const small = [];
        for (const el of document.querySelectorAll('button, a[href], input, [role="button"]')) {
          let r = el.getBoundingClientRect();
          // 输入框的点击面是包着它的那个框（点框的任何位置都会聚焦），按外框量
          if (el.matches('input, textarea')) {
            for (let p = el.parentElement, i = 0; p && i < 3; p = p.parentElement, i++) {
              const pr = p.getBoundingClientRect();
              if (pr.height > r.height && pr.height <= 80) r = pr;
            }
          }
          // 2px 以内的是给读屏用的隐形代理（真正的点击面是它外面的容器），不算触控目标
          if (r.width > 2 && r.height > 2 && (r.height < 43.5 || r.width < 43.5)) small.push(`${(el.getAttribute('aria-label') || el.textContent || el.tagName).trim().slice(0, 14)} (${Math.round(r.width)}×${Math.round(r.height)})`);
        }
        return {over: document.documentElement.scrollWidth > vw + 1, small};
      });
      // 细节规则（docs/design-details.md）：D02 一种分隔、D05 粗体稀缺、D06 字体不混排
      const d = await page.evaluate(() => {
        const visible = (el) => { const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0; };
        const both = [];
        for (const el of document.querySelectorAll('[data-screen] *')) {
          if (!visible(el)) continue;
          const cs = getComputedStyle(el);
          const border = parseFloat(cs.borderTopWidth) >= 1 && cs.borderTopStyle === 'solid' && !/, 0\)$|transparent/.test(cs.borderTopColor);
          const shadow = cs.boxShadow !== 'none' && !/^(rgba?\([^)]*\) 0px 0px 0px 0px,? ?)+$/.test(cs.boxShadow) && !cs.boxShadow.includes('inset');
          if (border && shadow) both.push(el.className.toString().split(' ')[0] || el.tagName.toLowerCase());
        }
        let total = 0, bold = 0, heavy = 0, serif = 0;
        const walker = document.createTreeWalker(document.querySelector('[data-screen]'), NodeFilter.SHOW_TEXT);
        for (let n = walker.nextNode(); n; n = walker.nextNode()) {
          const len = n.textContent.trim().length;
          const el = n.parentElement;
          if (!len || !el || !visible(el)) continue;
          const cs = getComputedStyle(el);
          const w = Number(cs.fontWeight);
          total += len;
          if (w >= 700) bold += len;
          if (w >= 800) heavy += len;
          if (/serif/i.test(cs.fontFamily.split(',')[0]) && !/sans/i.test(cs.fontFamily.split(',')[0])) serif += len;
        }
        return {both: [...new Set(both)].slice(0, 6), bold: total ? bold / total : 0, heavy: total ? heavy / total : 0, serif: total ? serif / total : 0};
      });
      if (visual) {
        const got = await page.evaluate((ground) => {
          const rgb = (c) => (c.match(/[\d.]+/g) ?? []).map(Number);
          const far = (a, b) => { const x = rgb(a), y = rgb(b); return x.length >= 3 && (x[3] ?? 1) > 0.5 && Math.abs(x[0] - y[0]) + Math.abs(x[1] - y[1]) + Math.abs(x[2] - y[2]) > 24; };
          const g = `rgb(${parseInt(ground.slice(1, 3), 16)}, ${parseInt(ground.slice(3, 5), 16)}, ${parseInt(ground.slice(5, 7), 16)})`;
          const bucket = (r, h) => (r <= 1 ? 'square' : r >= h / 2 - 1 || r > 32 ? 'pill' : r <= 8 ? 'small' : r <= 16 ? 'medium' : 'large');
          const name = (el) => (el.className.toString().split(' ')[0] || el.tagName.toLowerCase()) + (el.textContent ? `「${el.textContent.trim().slice(0, 8)}」` : '');
          const boxes = [], controls = [];
          for (const el of document.querySelectorAll('[data-screen] *')) {
            const r = el.getBoundingClientRect();
            if (r.width < 4 || r.height < 4) continue;
            const cs = getComputedStyle(el);
            const radius = parseFloat(cs.borderTopLeftRadius) || 0;
            const isControl = el.matches('button, a, input, textarea, [role="button"]') || (el.querySelector(':scope > input, :scope > textarea, :scope > * > input') && r.height <= 80);
            if (isControl) {
              // 只看“有形状”的控件：有底色或有描边的
              const shaped = far(cs.backgroundColor, g) || (parseFloat(cs.borderTopWidth) >= 1 && cs.borderTopStyle !== 'none' && far(cs.borderTopColor, g));
              if (shaped && r.width >= 60 && r.height >= 32 && !el.closest('[data-k="tabs"]') && !el.matches('.k-avatar, .k-day, .k-cell')) controls.push({name: name(el), bucket: bucket(radius, r.height)});
              continue;
            }
            if (r.width < 160 || r.height < 48 || el.closest('button, a') || el.matches('[data-k="image"], img, svg, nav, main')) continue;
            const filled = far(cs.backgroundColor, g);
            const sides = ['Top', 'Right', 'Bottom', 'Left'].filter((s) => parseFloat(cs[`border${s}Width`]) >= 1 && cs[`border${s}Style`] !== 'none' && far(cs[`border${s}Color`], g)).length;
            const shadow = cs.boxShadow !== 'none' && !cs.boxShadow.includes('inset');
            if (filled || sides >= 3 || shadow) boxes.push({name: name(el), kind: shadow ? 'shadow' : filled ? 'fill' : 'border', bucket: bucket(radius, r.height)});
          }
          const title = document.querySelector('[data-k="title"]');
          return {boxes, controls, titleWeight: title ? Number(getComputedStyle(title).fontWeight) : null};
        }, visual.colors.ground);
        const say = (list) => [...new Set(list.map((x) => x.name))].slice(0, 4).join('、');
        let bad = 0;
        if (visual.surface === 'none' && got.boxes.length) (report.fail('conform', `参考图上没有容器（surface: none），但这屏有 ${got.boxes.length} 个带底色、描边或阴影的块：${say(got.boxes)}`, `out/${shot}`), bad++);
        const wrongKind = got.boxes.filter((b) => visual.surface !== 'none' && b.kind !== visual.surface);
        if (wrongKind.length) (report.fail('conform', `参考图上的容器是 ${visual.surface}，这屏有 ${wrongKind.length} 个不是：${say(wrongKind)}`, `out/${shot}`), bad++);
        const wrongR = got.boxes.filter((b) => b.bucket !== visual.radius && !(visual.radius === 'pill' && b.bucket === 'large'));
        if (wrongR.length) (report.fail('conform', `参考图上容器的圆角是 ${visual.radius}，这屏有 ${wrongR.length} 个不是：${say(wrongR)}（${[...new Set(wrongR.map((b) => b.bucket))].join('/')}）`, `out/${shot}`), bad++);
        const wrongC = got.controls.filter((b) => b.bucket !== visual.control_radius);
        if (wrongC.length) (report.fail('conform', `参考图上按钮和输入框的圆角是 ${visual.control_radius}，这屏有 ${wrongC.length} 个不是：${say(wrongC)}（${[...new Set(wrongC.map((b) => b.bucket))].join('/')}）`, `out/${shot}`), bad++);
        const want = {regular: [300, 450], medium: [451, 650], bold: [651, 900]}[visual.title.weight];
        if (got.titleWeight && (got.titleWeight < want[0] || got.titleWeight > want[1])) (report.fail('conform', `参考图上标题的粗细是 ${visual.title.weight}，这屏标题的字重是 ${got.titleWeight}`, `out/${shot}`), bad++);
        if (!bad) report.pass('conform', `${key}：容器、圆角、控件、标题粗细与参考图的读法一致`);
      }
      if (d.both.length) report.warn('detail', `D02 同一个元素既有描边又有阴影：${d.both.join('、')}`, `out/${shot}`);
      if (d.heavy > 0) report.warn('detail', `D05 用了 800 以上的字重（占可见文字 ${Math.round(d.heavy * 100)}%）`, `out/${shot}`);
      if (d.bold > 0.25) report.warn('detail', `D05 粗体占可见文字 ${Math.round(d.bold * 100)}%，超过四分之一`, `out/${shot}`);
      if (d.serif > 0.05 && d.serif < 0.95) report.warn('detail', `D06 衬线与无衬线混排（衬线占 ${Math.round(d.serif * 100)}%）`, `out/${shot}`);
      if (m.over) report.fail('viewport', '390 宽下横向溢出', `out/${shot}`);
      if (m.small.length) report.fail('touch', `触控目标小于 44：${m.small.join('；')}`, `out/${shot}`);
      await page.addScriptTag({content: axeSource});
      const axe = await page.evaluate(async () => (await window.axe.run(document, {runOnly: ['wcag2a', 'wcag2aa']})).violations.map((v) => ({id: v.id, impact: v.impact, n: v.nodes.length, detail: v.nodes[0]?.any?.[0]?.message, html: v.nodes[0]?.html?.slice(0, 80)})));
      for (const v of axe) (v.impact === 'critical' || v.impact === 'serious' ? report.fail : report.warn).call(report, 'a11y', `${v.id} ×${v.n}：${v.detail ?? ''} ${v.html ?? ''}`, `out/${shot}`);
      if (!m.over && !m.small.length && !axe.some((v) => v.impact === 'critical' || v.impact === 'serious')) report.pass('screen', `${key}：无溢出、触控与对比度通过`);
    };

    const t = {
      page,
      /** 断言现在在哪一屏，并顺便检查、截图这一屏 */
      async screen(id, shotName) {
        step = `应该在 ${id} 屏`;
        await page.locator(`[data-screen="${id}"]`).waitFor({timeout: 4000});
        await inspect(shotName);
      },
      async tap(name) {
        step = `点「${name}」`;
        await page.getByRole('button', {name, exact: true}).click({timeout: 4000});
      },
      async see(text) {
        step = `应该看到「${text}」`;
        const loc = text instanceof RegExp ? page.locator('[data-screen]').filter({hasText: text}) : page.getByText(text, {exact: false}).first();
        await loc.waitFor({timeout: 4000});
      },
      async notSee(text) {
        step = `不应该看到「${text}」`;
        if (await page.getByText(text, {exact: false}).first().isVisible()) throw new Error(`看到了不该出现的「${text}」`);
      },
      async count(text) {
        return page.getByText(text, {exact: true}).count();
      },
      async expect(cond, message) {
        step = message;
        if (!cond) throw new Error(message);
      },
      async reload() {
        step = '刷新页面';
        await page.reload();
      },
      /** 把日期往后拨 n 天再打开 */
      async nextDay(n = 1) {
        step = `${n} 天后再打开`;
        now = new Date(now.getFullYear(), now.getMonth(), now.getDate() + n, 9, 0, 0);
        await page.clock.setSystemTime(now);
        await page.reload();
      },
      shot: inspect,
    };

    try {
      const mod = await import(pathToFileURL(file).href);
      await mod.default(t);
      if (errors.length) throw new Error(`页面脚本报错：${errors[0]}`);
      report.pass('acceptance', `${a.id}：${a.then}`);
    } catch (e) {
      await page.screenshot({path: path.join(outDir, `FAILED-${a.id}.png`)}).catch(() => {});
      report.fail('acceptance', `${a.id} 在「${step}」这一步失败：${String(e.message).split('\n')[0]}`, `acceptance/${a.id}.mjs · 现场截图 out/FAILED-${a.id}.png`);
    }
    await ctx.close();
  }
  // 把参考图和产出拼在一起，方便人（和模型自己）并排看
  const refs = list(path.join(RUN, 'style/shots'), ['.png', '.jpg', '.jpeg', '.webp']).slice(0, 3);
  // 按走到的先后顺序取前四屏：第一张就是用户打开看到的第一屏
  const outs = [...shotOnce].filter((k) => !k.startsWith('proto')).slice(0, 4).map((k) => path.join(outDir, `${k}.png`)).filter((f) => fs.existsSync(f));
  if (refs.length && outs.length) {
    const page = await browser.newPage({viewport: {width: 1600, height: 900}});
    const img = (f) => `<img src="data:image/${f.toLowerCase().endsWith('.png') ? 'png' : 'jpeg'};base64,${fs.readFileSync(f).toString('base64')}">`;
    await page.setContent(`<style>body{margin:0;padding:32px;background:#d9d9de;font:600 22px system-ui;display:flex;gap:48px;align-items:flex-start;width:max-content}section{display:flex;flex-direction:column;gap:16px}div{display:flex;gap:20px}img{height:760px;display:block}</style><section>参考<div>${refs.map(img).join('')}</div></section><section>产出<div>${outs.map(img).join('')}</div></section>`);
    await page.waitForLoadState('networkidle');
    await page.screenshot({path: path.join(outDir, 'compare.png'), fullPage: true});
    await page.close();
    report.pass('compare', '参考与产出的并排图：out/compare.png（自己打开看一遍）');
  }
  await browser.close();
  server.close();

  for (const s of spec.screens) {
    if (visited.has(s.id)) report.pass('coverage', `屏 ${s.id} 被验收场景走到`);
    else report.fail('coverage', `屏 ${s.id} 没有任何验收场景走到——它可能根本进不去`);
  }
}

report.print();
fs.writeFileSync(path.join(outDir, 'gate-report.json'), JSON.stringify({run: RUN_REL, passed: report.count('fail') === 0, summary: {pass: report.count('pass'), warn: report.count('warn'), fail: report.count('fail')}, items: report.items.filter((i) => i.level !== 'pass')}, null, 2) + '\n');
console.log(report.count('fail') ? '\n门禁未通过：逐条修掉 FAIL 后重跑。' : `\n门禁通过：验收场景全部跑通。截图在 ${RUN_REL}/out/`);
process.exit(report.count('fail') ? 1 : 0);
