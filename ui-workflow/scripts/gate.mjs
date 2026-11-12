#!/usr/bin/env node
// 交付门禁。任何模型搭完页面都跑这一条；不过就改，过了才进入评审。
// 用法: node scripts/gate.mjs runs/<name>
// 它检查的都是“不需要品味就能判断”的事，所以对所有模型一视同仁：
//   1 合同   JSON 产物合 schema，证据链接得上
//   2 源码   只用组件和 token：没有裸标签、行内样式、写死的颜色和尺寸
//   3 覆盖   spec 里每个 region 都搭了，没有多搭
//   4 渲染   能编译、能渲染成单文件 HTML
//   5 体检   astryx doctor
//   6 真机宽 390×844 明暗两套截图；无横向溢出；触控目标 ≥ 44；对比度与可访问性（axe）
import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {KIT, Report, list, loadPlaywright, require, resolveRun} from './lib.mjs';
import {validateRun} from './validate.mjs';

const {abs: RUN, rel: RUN_REL} = resolveRun(process.argv[2]);
const report = new Report();
const VIEWPORT = {width: 390, height: 844};

// ---------- 1 合同 ----------
const {specs = []} = validateRun(RUN, report);

// ---------- 2 源码 ----------
const screens = list(path.join(RUN, 'screens'), ['.tsx']);
if (!screens.length) report.fail('source', '还没有任何 screens/*.tsx');

const RAW_TAGS = /<(div|span|p|h[1-6]|button|a|img|ul|ol|li|section|header|footer|nav|main|input|textarea|select|table|label|form|svg)(\s|>|\/)/g;
const RULES = [
  [/\bstyle=\{/g, '行内样式 style={…}。改用组件 prop 或主题'],
  [/#[0-9a-fA-F]{3,8}\b(?![\w-])/g, '写死的十六进制颜色。颜色只能出现在 theme/theme.ts'],
  [/\b(rgb|rgba|hsl|hsla|oklch)\(/g, '写死的颜色函数'],
  [/\b\d+(\.\d+)?(px|rem|em)\b/g, '写死的尺寸。用间距档位（gap={4}）或 token'],
  [/\bclassName=/g, 'className。本工作流不手写 CSS'],
  [/from ['"](?!react['"]|lucide-react['"]|@astryxdesign\/|\.\.?\/)[^'"]+['"]/g, '引入了组件库以外的包（只允许 @astryxdesign/* 和图标库 lucide-react）'],
];
const stripComments = (s) => s.replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, ' ')).replace(/(^|[^:])\/\/.*$/gm, (m, p) => p + ' '.repeat(m.length - p.length));

for (const file of screens) {
  const rel = path.relative(RUN, file);
  const raw = fs.readFileSync(file, 'utf8');
  const src = stripComments(raw);
  const lineOf = (i) => src.slice(0, i).split('\n').length;
  let bad = 0;
  for (const m of src.matchAll(RAW_TAGS)) {
    report.fail('source', `裸 HTML 标签 <${m[1]}>。用 Astryx 组件`, `${rel}:${lineOf(m.index)}`);
    bad++;
  }
  for (const [re, msg] of RULES) {
    for (const m of src.matchAll(re)) {
      report.fail('source', `${msg}：${m[0]}`, `${rel}:${lineOf(m.index)}`);
      bad++;
    }
  }
  if (!/<(Theme|MobileShell)[\s>]/.test(src)) {
    report.fail('source', '没有用 <MobileShell theme={…}>（或 <Theme>）包住页面，风格注入不会生效', rel);
    bad++;
  }
  const primaryCount = (src.match(/variant=["']primary["']/g) ?? []).length;
  if (primaryCount > 1) report.warn('source', `出现 ${primaryCount} 个 primary 按钮。一屏一个主操作；列表里重复出现的行内主操作除外`, rel);
  if (!bad) report.pass('source', `${rel} 只用了组件和 token`);

  // ---------- 3 覆盖 ----------
  const id = path.basename(file, '.tsx').replace(/\..*$/, '');
  const spec = specs.find((s) => s.screen_id === id);
  if (!spec) {
    report.fail('coverage', `没有对应的 specs/${id}.json。先写 spec 再搭`, rel);
  } else {
    const marked = new Set([...raw.matchAll(/region:\s*([a-z][a-z0-9-]*)/g)].map((m) => m[1]));
    const wanted = new Set(spec.regions.map((r) => r.id));
    for (const w of wanted) if (!marked.has(w)) report.fail('coverage', `spec 里的 region "${w}" 没搭（找不到 {/* region: ${w} */} 标记）`, rel);
    for (const m of marked) if (!wanted.has(m)) report.fail('coverage', `多搭了 spec 里没有的 region "${m}"。要加先改 spec`, rel);
    if ([...wanted].every((w) => marked.has(w)) && [...marked].every((m) => wanted.has(m))) report.pass('coverage', `${rel} 与 spec 的 ${wanted.size} 个 region 一一对应`);
    const declared = new Set(spec.regions.flatMap((r) => r.components));
    const imported = new Set([...src.matchAll(/import\s*\{([^}]+)\}\s*from\s*['"]@astryxdesign\/core[^'"]*['"]/g)].flatMap((m) => m[1].split(',').map((s) => s.trim()).filter(Boolean)));
    const LAYOUT = new Set(['Theme', 'Layout', 'LayoutContent', 'LayoutHeader', 'LayoutFooter', 'VStack', 'HStack', 'Stack', 'Grid', 'Center', 'Section', 'Divider', 'Icon', 'Text', 'Heading']);
    for (const c of imported) if (!declared.has(c) && !LAYOUT.has(c)) report.warn('coverage', `用了 spec 没列的组件 ${c}`, rel);
  }
}

// ---------- 4 渲染 ----------
const outDir = path.join(RUN, 'out');
fs.mkdirSync(outDir, {recursive: true});
const astryx = (args) => execFileSync('npx', ['astryx', ...args], {cwd: KIT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe']});
const rendered = [];

// 主题必须先编译：静态渲染不执行运行时注入，没编译的主题等于没有主题。
const themeSrc = path.join(RUN, 'theme/theme.ts');
let themeAccent = null;
if (!fs.existsSync(themeSrc)) report.fail('theme', '缺 theme/theme.ts（阶段 3）');
else {
  const t = fs.readFileSync(themeSrc, 'utf8');
  if (!/name:\s*['"]app['"]/.test(t)) report.fail('theme', "theme.ts 的 name 必须是 'app'（屏幕文件统一 import {appTheme} from '../theme/app'）");
  themeAccent = t.match(/['"]--color-accent['"]\s*:\s*\[\s*['"](#[0-9a-fA-F]{6})['"]/)?.[1] ?? t.match(/accent:\s*['"](#[0-9a-fA-F]{6})['"]/)?.[1] ?? null;
  try {
    astryx(['theme', 'build', path.relative(KIT, themeSrc)]);
    report.pass('theme', 'theme.ts 编译通过');
  } catch (e) {
    report.fail('theme', `主题编译失败：${(e.stderr || e.stdout || e.message).trim().split('\n').slice(0, 5).join(' | ')}`, 'theme/theme.ts');
  }
}

for (const file of screens) {
  const id = path.basename(file, '.tsx');
  const html = path.join(outDir, `${id}.html`);
  fs.rmSync(html, {force: true});
  try {
    astryx(['experimental', 'render', path.relative(KIT, file), '--out', path.relative(KIT, html)]);
    rendered.push({id, html});
    report.pass('render', `${id} 渲染成功`);
  } catch (e) {
    report.fail('render', `渲染失败：${(e.stderr || e.stdout || e.message).trim().split('\n').slice(0, 6).join(' | ')}`, `screens/${id}.tsx`);
  }
}

// ---------- 5 体检 ----------
try {
  const out = JSON.parse(astryx(['--json', 'doctor', '--built', RUN_REL]));
  const checks = JSON.stringify(out).match(/"status":"(fail|warn)"[^}]*"message":"([^"]+)"/g) ?? [];
  for (const c of checks) {
    const [, level, message] = c.match(/"status":"(fail|warn)"[^}]*"message":"([^"]+)"/);
    if (level === 'fail') report.fail('doctor', message);
    else if (/raw element|custom style|icon/i.test(message)) report.warn('doctor', message);
  }
  report.pass('doctor', 'astryx doctor 已运行');
} catch (e) {
  const text = (e.stdout || e.stderr || e.message).toString();
  report.fail('doctor', `astryx doctor 未通过：${text.trim().split('\n').slice(-4).join(' | ')}`);
}

// ---------- 6 真机宽检查 ----------
if (rendered.length) {
  const {chromium} = loadPlaywright();
  const axeSource = fs.readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8');
  const browser = await chromium.launch();
  for (const {id, html} of rendered) {
    for (const scheme of ['light', 'dark']) {
      const ctx = await browser.newContext({viewport: VIEWPORT, deviceScaleFactor: 2, colorScheme: scheme, hasTouch: true, isMobile: true});
      const page = await ctx.newPage();
      const errors = [];
      page.on('pageerror', (e) => errors.push(e.message));
      await page.goto('file://' + html);
      await page.waitForLoadState('networkidle');
      const shot = path.join(outDir, `${id}.${scheme}.png`);
      await page.screenshot({path: shot});
      const where = `out/${id}.${scheme}.png`;

      const m = await page.evaluate(() => {
        const vw = document.documentElement.clientWidth;
        const overflow = [];
        for (const el of document.querySelectorAll('body *')) {
          const r = el.getBoundingClientRect();
          if (r.width > 0 && (r.right > vw + 1 || r.left < -1)) {
            const cs = getComputedStyle(el);
            // 被可滚动祖先裁掉的不算
            let p = el.parentElement;
            let clipped = false;
            while (p && p !== document.body) {
              const ox = getComputedStyle(p).overflowX;
              if (ox === 'auto' || ox === 'scroll' || ox === 'hidden' || ox === 'clip') {
                clipped = true;
                break;
              }
              p = p.parentElement;
            }
            if (!clipped && cs.position !== 'fixed') overflow.push(el.tagName.toLowerCase() + (el.className ? '.' + String(el.className).split(' ')[0] : ''));
          }
        }
        const small = [];
        for (const el of document.querySelectorAll('button, a[href], [role="tab"], [role="button"], input:not([type="hidden"]), [role="checkbox"], [role="switch"]')) {
          const r = el.getBoundingClientRect();
          if (r.width === 0 || r.height === 0) continue;
          // 命中区可能由 ::before/::after 撑大，或由包着它的 label 承担
          const grow = (pseudo) => {
            const cs = getComputedStyle(el, pseudo);
            if (cs.content === 'none' || cs.position !== 'absolute') return 0;
            return Math.max(-parseFloat(cs.top) || 0, 0) + Math.max(-parseFloat(cs.bottom) || 0, 0);
          };
          const label = el.closest('label');
          // 行内的勾选框/开关：整行代为接收点击（ListItem 的 interactiveRef），按行高算
          const row = el.matches('input') ? el.closest('li, [role="listitem"]') : null;
          const h = Math.max(r.height + Math.max(grow('::before'), grow('::after')), label ? label.getBoundingClientRect().height : 0, row ? row.getBoundingClientRect().height : 0);
          if (h < 43.5) small.push(`${(el.getAttribute('aria-label') || el.textContent || el.tagName).trim().slice(0, 18)} (${Math.round(h)}px)`);
        }
        return {
          scrollW: document.documentElement.scrollWidth,
          vw,
          overflow: [...new Set(overflow)].slice(0, 5),
          small: [...new Set(small)].slice(0, 8),
          bodyH: document.body.getBoundingClientRect().height,
          textLen: document.body.innerText.trim().length,
          accent: getComputedStyle(document.querySelector('[data-astryx-theme] *') ?? document.body).getPropertyValue('--color-accent'),
        };
      });
      if (themeAccent && scheme === 'light') {
        if (m.accent.toLowerCase().includes(themeAccent.toLowerCase())) report.pass('theme', `${id} 页面上的主色就是 theme.ts 里的 ${themeAccent}`);
        else report.fail('theme', `主题没生效：页面主色是 ${m.accent || '空'}，theme.ts 里是 ${themeAccent}。屏幕文件要 import {appTheme} from '../theme/app' 和 '../theme/app.css'`, where);
      }
      if (m.scrollW > m.vw + 1 || m.overflow.length) report.fail('viewport', `390 宽下横向溢出：${m.overflow.join(', ') || `scrollWidth ${m.scrollW}`}`, where);
      else report.pass('viewport', `${id}/${scheme} 无横向溢出`);
      if (m.textLen < 10) report.fail('viewport', '页面几乎是空的，可能渲染出错', where);
      if (m.small.length) report.warn('touch', `触控目标小于 44px：${m.small.join('；')}`, where);
      if (errors.length) report.fail('runtime', `页面脚本报错：${errors[0]}`, where);

      await page.addScriptTag({content: axeSource});
      const axe = await page.evaluate(async () => {
        const r = await window.axe.run(document, {runOnly: ['wcag2a', 'wcag2aa']});
        return r.violations.map((v) => ({id: v.id, impact: v.impact, n: v.nodes.length, sample: v.nodes[0]?.html?.slice(0, 90), detail: v.nodes[0]?.any?.[0]?.message}));
      });
      for (const v of axe) {
        const msg = `${v.id} ×${v.n}${v.detail ? `：${v.detail}` : ''}  ${v.sample ?? ''}`;
        if (v.impact === 'critical' || v.impact === 'serious') report.fail('a11y', msg, where);
        else report.warn('a11y', msg, where);
      }
      if (!axe.some((v) => v.impact === 'critical' || v.impact === 'serious')) report.pass('a11y', `${id}/${scheme} 对比度与可访问性通过`);
      await ctx.close();
    }
  }
  await browser.close();
}

report.print();
fs.writeFileSync(path.join(outDir, 'gate-report.json'), JSON.stringify({run: RUN_REL, passed: report.count('fail') === 0, summary: {pass: report.count('pass'), warn: report.count('warn'), fail: report.count('fail')}, items: report.items.filter((i) => i.level !== 'pass')}, null, 2) + '\n');
console.log(report.count('fail') ? '\n门禁未通过：逐条修掉 FAIL 后重跑。' : `\n门禁通过。截图在 ${RUN_REL}/out/，进入阶段 6 评审。`);
process.exit(report.count('fail') ? 1 : 0);
