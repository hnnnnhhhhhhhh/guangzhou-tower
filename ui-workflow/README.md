# App 界面生成工作流

从一句需求出发，参考真实上线产品的结构，用 Astryx 组件库搭出手机界面，并注入一套提炼出来的设计风格。任何能读文件、跑命令的模型都可以照着跑。

## 两条路线

| | 做什么 | 入口 | 门禁 | 样例 |
|---|---|---|---|---|
| **应用**（推荐） | 一句需求 → 能用的 app：有核心循环、真实内容、数据会保存，视觉来自参考图 | `stages/A-app-spec.md` → `stages/V-visual.md` | `scripts/gate-app.mjs` | `runs/pte-vocab/` |
| 单屏 | 一屏的结构稿：只用 Astryx 组件和主题，不含交互逻辑 | `stages/0-brief.md` 起 | `scripts/gate.mjs` | `runs/habit-today/` |

应用路线是后加的，原因有两个：单屏路线产出的是画面而不是产品（勾选框点了没反应、内容是样例）；只换主题达不到参考图的视觉水平（阴影、模糊、渐隐、特殊形状都不在主题里）。应用路线用 `recipes/` 里的视觉配方搭界面，用自动执行的验收场景证明它能用。

下面的内容描述的是单屏路线。

## 流程

```
0 需求定稿 ─→ 1 取参考 ─┬→ 2 读图与归纳 ─────┐
                        │   (结构：有哪些区)    ├→ 4 屏幕规格 ─→ 5 搭建 ─→ 门禁 ─→ 6 评审 ─→ 交付
                        └→ 3 风格 ─────────────┘                  ↑__________不通过__________|
                            (外观：长什么样)
```

| 阶段 | 指令 | 产物 | 检查方式 |
|---|---|---|---|
| 0 需求定稿 | `stages/0-brief.md` | `brief.json` | schema |
| 1 取参考 | `stages/1-references.md` | `refs/shots/`、`style/shots/` | 每屏 ≥ 3 个不同 app |
| 2 读图与归纳 | `stages/2-analyze.md` | `refs/analysis/*.json`、`refs/patterns.json` | schema + 证据链 |
| 3 风格 | `stages/3-style.md` | `style/DESIGN.md`、`theme/theme.ts` | 主题编译 |
| 4 屏幕规格 | `stages/4-spec.md` | `specs/<屏>.json` | schema + 证据链 |
| 5 搭建 | `stages/5-build.md` | `screens/<屏>.tsx` | `scripts/gate.mjs` |
| 6 评审 | `stages/6-review.md` | `out/review-<屏>.json` | 评分表，≥ 13/16 |

每个阶段只读上一阶段落在磁盘上的产物，所以可以中途换模型，也可以让不同模型各做一段。

## 开始一次运行

```bash
cd ui-workflow
npm install
# 截图检查需要 Playwright + Chromium；机器上没有的话：
#   npm i -D playwright && npx playwright install chromium
mkdir -p runs/<name>/{refs/shots,refs/analysis,specs,screens,style/shots,theme}
```

然后从 `stages/0-brief.md` 起按顺序做。随时可以跑：

```bash
node scripts/validate.mjs runs/<name>   # 只查 JSON 产物
node scripts/palette.mjs  runs/<name>   # 从 style/shots 量颜色
node scripts/gate.mjs     runs/<name>   # 全部检查 + 明暗截图
```

两次样例运行：

- `runs/habit-today/` —— **完整流程**：从 Mobbin 取了 5 个 app 的功能参考和 Joi 的风格参考，走完 0–6 全部阶段。
- `runs/demo-habit/` —— 同一份需求的**无参考**版本，只走了规格、搭建和门禁。两者对比能看出参考和风格注入带来的差别。

## 为什么这样设计

**参考图不直接喂给搭建阶段。** 模型看着一张截图搭页面，结果是那张图的近似翻版：换个需求就不适用，还有抄袭问题。所以截图先被读成结构化的 analysis，再跨 3 个以上 app 归纳成共识与分歧，搭建阶段只看到归纳结果。

**功能参考和风格参考分开。** 同品类的 app 告诉你这类屏该有哪些区；风格可以来自任何一个 app。混在一起，风格就和品类绑死了。

**风格落成能编译的主题。** 一份散文式的风格文档，不同模型读出来差别很大。颜色由脚本从截图像素里量出来，数值写进 `theme.ts` 由编译器校验；文档里只留需要判断的规则，并且每条都要能判对错。

**能自动判断的都交给脚本。** 门禁检查的每一项都不需要品味：有没有裸标签、写死的颜色，spec 的区是不是都搭了，主题有没有真的生效，390 宽下有没有溢出，触控目标够不够大，对比度过不过。这是不同模型能产出同一下限的主要保证。

**组件 API 现查，不凭记忆。** 各模型训练数据里的 Astryx 版本不同，凭记忆写 props 是跨模型结果不一致的最大来源。CLI 输出的是当前安装版本的真实 API。

## 已知边界

- **产出是 React 网页，在手机宽度下渲染。** Astryx 是 Web 组件库，不是原生 iOS / Android 控件。做设计稿、原型、WebView / PWA 没问题；要原生工程，需要换组件库，这套流程的阶段 0–4 仍然可用。
- **Astryx 面向桌面 Web，移动端要补。** 它没有底部标签栏，默认控件高度是 32–36px，内置图标只有 29 个。`shell/MobileShell.tsx`、`shell/mobile-base.ts` 和 `lucide-react` 是为此补的，所有屏共用。
- **主题换不出插画、摄影和品牌图形。** 很多 app 的辨识度来自这些。风格文档的“主题之外”一节会如实列出，需要用户提供素材。
- **阶段 2、3b、6 必须由能看图的模型做。** 其余阶段纯文本模型可以做。
- **Mobbin 需要付费账号**，通过它的连接器 / 官方 MCP 或人工导出取图，见 `stages/1-references.md`。参考截图不进仓库。
- **“效果一样”指的是同一下限，不是同一张图。** 验证办法：同一份 brief 让两个模型各跑一遍，比较两份 `gate-report.json` 和由同一个评审模型打出的阶段 6 分数。

## 目录

```
stages/      各阶段的指令（A、V 是应用路线；0–6 是单屏路线）
recipes/     视觉配方库（应用路线用）
schemas/     产物合同
templates/   DESIGN.md 模板
shell/       手机外壳与移动端基线（所有屏共用，不要在单次运行里改）
scripts/     validate / palette / gate
runs/<name>/ 一次运行的全部产物
```
