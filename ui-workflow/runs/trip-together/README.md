# trip-together · 多人一起排行程

需求：“做一个多人可以一起编辑行程的旅行 App”。完整走了一遍：Mobbin 查结构 → 原型 → Mobbin 查视觉 → 上风格。

打开：`cd ui-workflow && npm install && RUN=runs/trip-together npx vite`
- 成品：直接打开
- 原型（同样的结构和功能，没有风格）：地址后面加 `?skin=proto`
- 看多人同步：用同一个浏览器再开一个窗口，在“同行”里换一个身份去编辑

验证：`node scripts/gate-app.mjs runs/trip-together` → 33 ok · 0 fail，六条验收场景自动跑通（包括两个窗口实时同步）。

来源与决定：`refs/sources.md`（结构）、`style/VISUAL.md`（视觉）、`app-spec.json`（产品规格）。

局限：只在同一浏览器的窗口之间同步，没有服务端，不能跨设备；没有地点图片、地图、路程时间和地点搜索；行程是一份写好的京都示例，不能新建行程；没有“仅查看”权限。
