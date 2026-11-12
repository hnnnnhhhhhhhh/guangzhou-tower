# 阶段 5 · 搭建

**输入** `specs/<screen-id>.json`、`theme/`、`style/DESIGN.md`
**产物** `screens/<screen-id>.tsx`，门禁通过

## 规则

1. **照 spec 搭**。每个 region 前放一行标记 `{/* region: <id> */}`。spec 里有的都要搭，spec 里没有的不要加；发现 spec 不对，回去改 spec 再搭。
2. **外壳用现成的**：`import {MobileShell} from '../../../shell/MobileShell'`，传 `theme`、`header`、`tabs` / `bottomBar`。不要自己搭页面框架。
3. **主题用编译产物**：
   ```tsx
   import {appTheme} from '../theme/app';
   import '../theme/app.css';
   ```
4. **组件 API 现查**：写每个组件之前跑 `npx astryx --dense component <Name>`，按它列的 props 写。不要凭记忆写 props——各模型记忆里的版本不一样，这是跨模型结果不一致的头号来源。
5. **只用组件和 token**：不写裸 HTML 标签、`style={}`、`className`、十六进制颜色、px 数值。间距用布局组件的档位（`gap={4}`）。
6. **只引入** `react`、`@astryxdesign/*`、`lucide-react` 和本仓库的相对路径。
7. **数据用 spec 的 `sample_data`**：`import spec from '../specs/<id>.json'`，不要在组件里另写一份。
8. **整行可点**：行尾带勾选框或开关的列表行，用 `ListItem` 的 `interactiveRef` 把整行的点击交给那个控件。
9. 一屏一个 `variant="primary"`。

参考写法：`runs/demo-habit/screens/today.tsx`。

## 门禁

```bash
node scripts/gate.mjs runs/<name>
```

逐条修掉 FAIL 再重跑，直到 0 fail。WARN 逐条看，能修的修，不修的在交付说明里写原因。不要为了过门禁去改门禁脚本或删 spec 里的 region。

门禁通过后，它会在 `out/` 留下每屏明暗两张 390×844 的截图。**自己打开看一遍**再进阶段 6（不能看图的模型跳过这句，直接交给评审）。
