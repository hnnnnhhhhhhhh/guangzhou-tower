# 阶段 3 · 风格

**输入** brief.json 的 `style_source`、`style/shots/*.png`（reference-app 模式）
**产物** `style/measured.json`、`style/DESIGN.md`、`theme/theme.ts`

风格分成两半，分别落到两个文件：

| | 放哪 | 谁来保证 |
|---|---|---|
| 能量化的：颜色、字阶、圆角、动效时长、组件外观 | `theme/theme.ts`（`defineTheme`） | 编译器。写错了编不过 |
| 不能量化的：密度、层级怎么拉开、强调色用在哪、语气 | `style/DESIGN.md` | 阶段 6 按它逐条评审 |

只写散文式的风格文档，不同模型读出来的结果差别很大；所以凡是能写成数值的，一律进 theme.ts，DESIGN.md 只留判断题。

## 3a 量颜色（reference-app 模式）

```bash
node scripts/palette.mjs runs/<name>
```

读 `style/shots/`，写 `style/measured.json`：主色候选、中性色阶、彩色面积占比。**颜色用它量出来的值，不要目测。**

## 3b 读图判断其余的（需要能看图的模型）

把 `style/shots/` 的图一起看，按 `templates/DESIGN.md` 的结构写 `style/DESIGN.md`。每一节都要填，每条规则写成“做 X / 不做 Y”，并注明是从哪张图看出来的。字体认不出具体型号时，写它的类别（几何无衬线 / 人文无衬线 / 衬线 / 等宽），然后选一个可免费使用的同类字体。

`brand` 模式：从品牌文档直接填。`preset` 模式：`npx astryx theme eject <slug> runs/<name>/theme/theme.ts` 取内置主题作起点，DESIGN.md 照样要写。

## 3c 写主题

1. `npx astryx docs author-a-theme` 读一遍字段说明；`npx astryx theme targets <组件>` 查某个组件能覆盖什么。不要凭记忆写字段。
2. 写 `theme/theme.ts`：
   - `name` 固定写 `'app'`
   - `components` 必须先展开移动端基线：`components: {...mobileBase, …}`（从 `shell/mobile-base.ts` 引入）
   - 颜色 token 写成 `[浅色值, 深色值]` 一对；深色值没有参考图时，保持色相、按深色背景重新取明度，并在 DESIGN.md 里注明是推导的
   - 先调大旋钮（accent、字阶 base/ratio、radius base、字体），再做组件级覆盖。组件级覆盖不超过 6 处，多了说明风格没抓住重点
3. `npx astryx theme build runs/<name>/theme/theme.ts`，编译通过为止。

## 主题表达不了的东西

插画、摄影、品牌图形、自定义图表、特殊的版式——这些是很多 app“好看”的主要来源，但换主题换不出来。在 DESIGN.md 的“主题之外”一节如实列出，让用户决定是提供素材还是放弃，不要用占位色块假装有。

## 完成标准

theme.ts 编译通过；DESIGN.md 每一节都有内容且每条规则可判断对错。
