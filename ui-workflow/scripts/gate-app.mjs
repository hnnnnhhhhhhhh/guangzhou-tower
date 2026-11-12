#!/usr/bin/env node
// 应用门禁：检查的是“这个 app 能不能真的用”，而不只是屏幕长得对不对。
// 用法: node scripts/gate-app.mjs runs/<name>
//   1 规格   app-spec.json 合合同；每屏有实现；每条验收场景有脚本
//   2 源码   屏幕只用配方和组件；没有空的事件处理；没有写死的样式
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

// ---------- 3 构建 ----------
let built = false;
if (!fs.existsSync(path.join(RUN, 'index.html'))) fs.copyFileSync(path.join(KIT, 'templates/index.html'), path.join(RUN, 'index.html'));
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
          const r = el.getBoundingClientRect();
          if (r.width && r.height && (r.height < 43.5 || r.width < 43.5)) small.push(`${(el.getAttribute('aria-label') || el.textContent || el.tagName).trim().slice(0, 14)} (${Math.round(r.width)}×${Math.round(r.height)})`);
        }
        return {over: document.documentElement.scrollWidth > vw + 1, small};
      });
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
