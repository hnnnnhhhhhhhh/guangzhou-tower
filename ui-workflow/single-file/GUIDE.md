# 单文件起手模板 · 使用说明

**给生成应用的模型读。** 交付物是一个单独的 HTML 文件时，用这套模板。

## 一句话

**复制 `template.html` 起步。样式和组件都已经写好，你只做三件事：填颜色、用类名搭页面、写业务逻辑。不要自己写 CSS。**

## 第 1 步：填颜色

打开 `template.html`，找到 `<style>` 开头的“1 风格变量”。把风格文档“02 配色方案”表里**默认方案**那一列的 8 个颜色，按名字抄进去：

| 风格文档里的名字 | 变量 |
|---|---|
| 页面底色 | `--c-page` |
| 卡片底色 | `--c-card` |
| 主要文字 | `--c-text` |
| 辅助文字 | `--c-text-2` |
| 主强调色 | `--c-accent` |
| 浅强调底 | `--c-accent-soft` |
| 边框与分隔线 | `--c-line` |
| 主按钮文字 | `--c-on-accent` |

再按风格文档“05 卡片样式”填两个圆角：

- `--radius`（容器）：直角填 `0px`，小圆角 `8px`，中圆角 `16px`，大圆角 `24px`。
- `--radius-ctl`（按钮、输入框）：直角 `0px`，小 `8px`，中 `12px`，胶囊 `999px`。

**只改这 10 个值。** 下面的“2 固定刻度”和其余样式一个字都不要改。

## 第 2 步：用类名搭页面

| 要放的东西 | 用 | 不要 |
|---|---|---|
| 页面外框 | `<div class="app">` 里放 `.topbar`、`<main class="page">`、`.actionbar` | — |
| 顶栏 | `.topbar`：左边最多一个，右边最多两个 `.btn-icon` | 放标题、口号 |
| 页面标题 + 一行摘要 | `.head` 里放 `.t-display` 和 `.t-sub` | 摘要做成大卡片 |
| 页面的一个区 | `<section class="section">`，里面 `.section-head`（`.t-label` 小标题 + 右侧 `.t-small` 或 `.link`） | 用 `.card` 包一个区 |
| 一组同类的东西 | `<ul class="list">` 里放 `<li class="row">` | 每项一个 `.card` |
| 一行的内容 | `.row-main`（`.row-title` + `.row-sub`）+ `.row-end` | 一行超过三层文字 |
| 一行前面的勾选 | `<button class="check" role="checkbox" aria-checked="false">`，行加 `has-lead` | 自己画圆圈 |
| 一行前面的图 | `.row-thumb` 里放真图；没有真图就不放 | 放表情、色块、彩色图标方块 |
| 已完成的行 | 行加 `done` | — |
| 能单独拿走的一个东西 | `.card`（一屏最多 3 张） | — |
| 统计数字 | `.stats` > `.stat`（`.stat-value` + `.stat-label`） | 一排小卡片、进度环 |
| 进度 | `.meter` 里放 `<i style="width:40%">` | 进度环 |
| 状态 | `<span class="status good">已约满</span>`（`good` / `warn` / `bad`） | 彩色底的徽章 |
| 主操作（一屏一个） | 页面末尾 `<div class="actionbar"><button class="btn">…</button></div>` | 浮动圆按钮 + 底栏同时出现 |
| 次要操作 | `.btn-secondary`、`.btn-quiet`、`.link` | 第二个 `.btn` |
| 删除 | `.btn-danger`，并先 `await kit.confirm(…, {danger: true})` | — |
| 图标按钮 | `<button class="btn-icon" aria-label="…">${kit.icon('more')}</button>` | 表情当图标 |
| 底部导航（3–5 个功能才要） | `<nav class="tabbar">` | 只有一件事也加导航 |
| 同一批东西的几种状态 | `.segmented` | 和 `.chips`、顶部 Tab 同时出现 |
| 分类很多 | `.chips` | — |
| 选一天 | `.week` | — |
| 输入 | `.field` > `label` + `.input` | — |
| 搜索 | `.search` > 图标 + `.input` | — |
| 空 | `<li class="empty">一句话</li>`，只占一行 | 整屏插图 |
| 图片位 | `.img`：有真图放 `<img>`，没有就写“暂无图片” | 表情、渐变、色块 |

字只有这几种：`.t-display`（一屏一处）、`.t-title`、`.t-h`、`.t-body`、`.t-sub`、`.t-small`、`.t-label`。

## 第 3 步：写逻辑时用这些函数

| 要做的 | 用 |
|---|---|
| 日期 | `kit.fmt.date(d)` → 11/20（斜杠自动排小）；`kit.fmt.date(d, {withWeek: true})` 带周几 |
| 时间 | `kit.fmt.time(d)` |
| 金额 | `kit.fmt.price(1218)` → ¥1,218（符号自动排小） |
| 数值 + 单位 | `kit.fmt.num(5.8, 'km')` |
| 头像 | `kit.fmt.avatar('阿May')`，有照片时加 `{src}` |
| 图标 | `kit.icon('plus')`，可用的名字见 `kit.js` 里的 `P` |
| 弹层 | `kit.sheet({title, body})`，关闭 `kit.closeSheet()` |
| 确认 | `await kit.confirm('删除这一项？', {ok: '删除', danger: true})` |
| 提示 | `kit.toast('已加入')` |
| 保存 | `kit.store.get(key, 默认值)`、`kit.store.set(key, 值)` |
| 转义用户输入 | `kit.esc(text)` |

**日期、金额不要自己拼字符串**，用上面的函数，排版细节才会对。

## 不许做

1. 写新的 CSS，或在元素上写 `style=`（`.meter` 的宽度、`.img` 的比例除外）。
2. 用变量之外的颜色；用渐变。
3. 用 `.card` 包清单的每一项，或包整个区块。
4. 一屏出现两个 `.btn`。
5. 底部同时有 `.actionbar` 和别的浮动按钮。
6. 同一个数字一屏出现两次（比如“已买 1”既在摘要又在筛选里）。
7. 用表情当图标，或放和内容无关的插画、装饰形状。
8. 写空话：“欢迎回来”“轻松管理”“开启你的……”。
9. 内容少于 8 项还做“全部 / 待办 / 已完成”筛选。直接分两个区块。
10. 打开的第一屏是空的。示例数据要让第一屏有内容。

## 例子

`examples/shopping.html`：新家入住采购。打开就是清单，摘要只有一行，待买和已买分两个区块，一个主操作，成员和邀请收在右上角的头像里。拿不准时照着它写。
