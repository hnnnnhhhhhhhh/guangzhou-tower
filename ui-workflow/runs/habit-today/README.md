# habit-today · 完整流程的一次运行

同 `demo-habit` 的需求，这次走完了全部阶段。

| 阶段 | 做了什么 |
|---|---|
| 1 取参考 | Mobbin 连接器。功能参考 5 个不同 app（Insight Timer、Anything、Finch、Me+、Numo），风格参考 Joi 的 5 张屏。来源见 `refs/sources.md`，截图不进仓库 |
| 2 读图与归纳 | `refs/analysis/` 5 份，`refs/patterns.json`：4 条共识、6 处分歧、7 条决定 |
| 3 风格 | `style/measured.json`（彩色面积 0.002，没有品牌彩色）→ `style/DESIGN.md` + `theme/theme.ts` |
| 4 规格 | `specs/today.json`，每个区都带参考证据 |
| 5 搭建 | `screens/today.tsx`，门禁 19 ok · 0 warn · 0 fail |
| 6 评审 | `out/review-today.json`：第 1 轮 13/16，改了 4 处；第 2 轮 15/16 |

**评审的局限**：两轮评审和搭建是同一个模型做的，按 `stages/6-review.md` 应该换一个模型复评。

**还没做的**：只有 default 一个状态；只有“今天”一屏；参考图用的是连接器返回的低分辨率预览图。

截图：`out/today.light.png`、`out/today.dark.png`
