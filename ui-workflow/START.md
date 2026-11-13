# 从这里开始

你要做的事：把用户的一句需求，做成一个**真的能用、有自己样子**的手机小应用。

整个流程是：**写规格 → 去 Mobbin 查结构 → 搭原型 → 去 Mobbin 查视觉 → 上风格 → 过门禁 → 写交付说明**。
样例在 `runs/trip-together/`（多人排行程）和 `runs/driving-quiz/`（科目一刷题），拿不准时照着看。

---

## 0 准备

```bash
npm install                      # 在本目录执行
# 门禁要用 Playwright + Chromium；机器上没有的话：
#   npm i -D playwright && npx playwright install chromium
mkdir -p runs/<name>/{refs/shots,style/shots,app/{data,logic,screens,ui},acceptance,theme}
```

- 所有命令都在本目录（`ui-workflow/`）下执行。
- 需要 Mobbin：连接器或 MCP（`https://api.mobbin.com/mcp`），工具是 `search_screens`、`search_flows`。连不上时停下来请用户提供截图，**不要凭记忆想象某个产品长什么样**。
- 读图的步骤（第 2、5 步）需要能看图的模型。不能看图就如实说明，交给能看图的模型做这两步。

---

## 1 写规格

产物：`runs/<name>/app-spec.json`（合同：`schemas/app.schema.json`；写法：`stages/A-app-spec.md`）

先有产品才有屏。必须写出来的：

- **核心循环**：用户每次打开亲手做的那几步。把步骤念一遍，用户的目的达成了吗？“背单词”里没有“回忆—对答案—自评”，那只是看单词。
- **数据**：哪些东西会因为用户的动作而改变。
- **规则**：写到能直接实现和测试（数值、边界、顺序）。
- **内容来源**：内容必须是真的。备不齐的写进 `content.gaps`，不要用占位数据充数。
- **验收场景**：至少覆盖核心循环走一遍、刷新后数据还在、输入不合格时、用户做了“错”的选择之后。

## 2 去 Mobbin 查结构

产物：`refs/sources.md`

查两次，目的不同：

| 查什么 | 怎么搜 | 用来决定 |
|---|---|---|
| 按**动作**：用户在核心那一屏做的事 | “quiz question screen with answer options”“day by day itinerary screen” | 核心屏有哪些不同做法，选哪种 |
| 按**品类**：这类产品整体 | “exam prep app home screen”“group trip planning with friends” | 该有哪些内容、分几块，别漏 |

- 两次合计至少看 8 个不同的产品。只看一两个就是照抄。
- 用结果里的 `image_url` 下载高清图放进 `refs/shots/`（下载不了再用预览图）。
- 在 `refs/sources.md` 里写一张表：产品、链接、**从它学到的结构**。
- 当场做出结构决定并写下理由，至少包括：有哪几屏、首页是什么、底部要不要导航。
  - 首页：用户下一步要做的事是确定的 → 打开就是任务本身；要先看全貌才知道做什么 → 才用总览。
  - 底部导航：看同类产品在“单个任务内部”用不用。不需要就不加。

## 3 写验收脚本

产物：`acceptance/<id>.mjs`，和 `app-spec.json` 的 `acceptance` 一一对应。

脚本拿到一个 `t`：`t.screen(id)` 断言在哪一屏并截图检查 · `t.tap(按钮的可读名字)` · `t.see(文字或正则)` · `t.notSee(文字)` · `t.count(文字)` · `t.expect(条件, 说明)` · `t.reload()` · `t.nextDay(n)` · `t.shot(名字)` · `t.page`（需要时直接用 Playwright）。

## 4 搭原型

产物：`app/`

```
app/main.tsx            入口，挂载 App
app/App.tsx             路由和主题外壳
app/data/               真实内容
app/logic/              业务规则：纯函数，不碰界面和存储；存储单独一个文件
app/ui/index.tsx + ui.css   这个应用自己的界面零件和样式
app/screens/*.tsx       屏：只组合 app/ui 里的零件和 Astryx 组件
```

- 每屏最外层的零件要带 `data-screen="<规格里的屏 id>"`，门禁靠它认屏。
- 每个能点的东西都要真的做事。空的事件处理函数过不了门禁。
- 屏幕文件里不写裸 HTML 标签、`style=`、`className`、颜色和尺寸。这些只出现在 `app/ui/` 里。
- 表单输入、按钮这类行为复杂的控件用 Astryx 的组件。它的属性**现查**：`npx astryx --dense component <Name>`，不要凭记忆写。
- 做一层“原型皮”：同样的结构和功能，灰度、直角、没有素材，地址加 `?skin=proto` 切换。它用来单独判断结构对不对。写法见 `runs/trip-together/app/ui/ui.css` 末尾。

## 5 去 Mobbin 查视觉

产物：`style/shots/`、`style/VISUAL.md`

- 选**一个**气质鲜明的产品，最好取它 3 张以上不同的屏，**下载高清图**（约 1180 像素宽）。阴影、细线、字重这些在预览图里看不出来。
- 颜色用脚本量，不要目测：`node scripts/palette.mjs runs/<name>`。
- 在 `style/VISUAL.md` 里写一张表：**从图上读到的 → 怎么落的**，逐条对应。再写一段“没有照搬的”。
- 结构来自第 2 步的多个产品，样子来自这里的一个产品。两者分开，产出才不会变成某一家的翻版。

## 6 上风格

产物：`theme/theme.ts`、`app/ui/ui.css`

- **规范用 Astryx 的**：间距 `--spacing-*`、圆角 `--radius-*`、字号 `--text-*-size`。`ui.css` 里不出现刻度以外的尺寸。
- **颜色写进 Astryx 主题**：`theme/theme.ts` 里 `defineTheme`，`name` 固定写 `'app'`。手机上字阶基准用 17、比例 1.2。屏幕里这样引入：
  ```tsx
  import {Theme} from '@astryxdesign/core/theme';
  import '@astryxdesign/core/reset.css';
  import '@astryxdesign/core/astryx.css';
  import {appTheme} from '../theme/app';
  import '../theme/app.css';
  ```
  （`theme/app.*` 由门禁在构建前自动生成，不用手写、不进仓库。）
- **细节规则必须遵守**，全文在 `docs/design-details.md`：
  - D01 圆角嵌套要同心：里层 = 外层 − 间距
  - D02 一块东西只用一种方式和背景分开：底色差、阴影、描边三选一
  - D03 日期分三段排，分隔符小一档
  - D04 货币符号和单位比数字小一档、基线对齐
  - D05 粗体是稀缺的：标题只比常规稍重，不用 800 以上
  - D06 一屏一种字体，衬线和无衬线不混排
  - D07 有真图用真图，没有就空着，不用表情顶替内容图
  - D08 头像没有真实的就用首字加颜色；不从网上找真人照片
- **贴纸**只做小装饰（类型标记、空状态）：`node scripts/sticker.mjs runs/<name> <emoji 名字>…`，名字用 `--find` 查。图源是微软 Fluent Emoji（MIT）。
- **字体**要随应用打包（`@fontsource/noto-sans-sc`），不依赖手机自带字体。

## 7 过门禁

```bash
node scripts/gate-app.mjs runs/<name>
```

它会：校验规格 → 检查屏幕源码 → 编译主题 → 构建 → 在 390×844 的浏览器里把每条验收场景点一遍 → 每屏截图并检查溢出、触控目标、对比度、细节规则 → 确认规格里每一屏都被走到。

- **0 fail 才能交付。**
- `detail` 开头的警告对应细节规则，要清零；清不掉的在交付说明里逐条写原因。
- 截图在 `runs/<name>/out/`。**自己打开看一遍**，和第 5 步的参考图放在一起比。
- 不要为了通过而改门禁脚本、合同，或者删掉验收脚本里的断言。

## 8 写交付说明

产物：`runs/<name>/README.md`，照 `runs/trip-together/README.md` 的写法：

- 怎么打开（`RUN=runs/<name> npx vite`）
- 它能做什么
- 验证了什么（门禁结果）
- **局限**：没做的、没验证的、内容是不是真的、有没有人看过。如实写。

---

## 硬性要求

- 内容必须是真的；功能必须能用；说“验证过”的必须真的跑过。
- 参考截图有版权，不进仓库（`.gitignore` 已排除 `refs/shots/` 和 `style/shots/`），只留链接和文字提炼。
- 结构参考至少 8 个产品；视觉只学一个，并写明没照搬什么。
- 屏幕不写样式；样式只用 Astryx 的刻度。
- 不知道的事情写“不知道”，不要编。

## 已知的边界

- 产出是手机宽度的 React 网页，不是原生 iOS / Android 工程。
- 数据存在浏览器本地，没有服务端。
- 没有图片检索：需要真图时，用你所在环境的搜图工具；没有就把图位留空。
- 细节规则里 D01、D03、D04 还没有自动检查，靠你自己对照。
