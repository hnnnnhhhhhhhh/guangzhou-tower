#!/usr/bin/env node
// 把 kit.css、kit.js 和一段应用内容拼成一个单文件 HTML。
// 用法：
//   node single-file/build.mjs                     生成 template.html（空白起手模板）
//   node single-file/build.mjs examples/shopping   生成 examples/shopping.html
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const dir = path.dirname(fileURLToPath(import.meta.url));
const css = fs.readFileSync(path.join(dir, 'kit.css'), 'utf8');
const js = fs.readFileSync(path.join(dir, 'kit.js'), 'utf8');
const name = process.argv[2];

const BLANK = `<div class="app">
  <header class="topbar">
    <!-- 左边最多一个（返回或头像），右边最多两个图标按钮 -->
  </header>
  <main class="page">
    <div class="head">
      <h1 class="t-display">页面名</h1>
      <p class="t-sub">一行真实的摘要，比如“4 件 · 已买 1”</p>
    </div>
    <!-- 区块：<section class="section"> 小标题 + 清单 -->
  </main>
  <!-- 主操作（一屏一个）：<div class="actionbar"><button class="btn">…</button></div> -->
</div>
<script>
  // 你的代码写在这里。日期用 kit.fmt.date，金额用 kit.fmt.price，图标用 kit.icon，弹层用 kit.sheet。
</script>`;

const body = name ? fs.readFileSync(path.join(dir, `${name}.app.html`), 'utf8') : BLANK;
const title = name ? (body.match(/class="t-display"[^>]*>([^<]+)</)?.[1] ?? 'App') : 'App';
const html = `<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${title}</title>
<style>
${css}
</style>
</head>
<body>
<script>
${js}
</script>
${body}
</body>
</html>
`;
const out = path.join(dir, name ? `${name}.html` : 'template.html');
fs.writeFileSync(out, html);
console.log(`→ ${path.relative(process.cwd(), out)}（${Math.round(html.length / 1024)} KB）`);
