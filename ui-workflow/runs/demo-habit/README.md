# demo-habit · 冒烟测试

用来验证工具链能跑通：合同校验 → 主题编译 → 渲染 → 门禁 → 明暗截图。

**这次运行没有使用任何参考图。** 搭建它的环境连不上 Mobbin，所以阶段 1、2、3a、3b 没有做：`refs/` 是空的，`theme/theme.ts` 里的颜色是手写的示例值，`style/DESIGN.md` 不存在。它证明的是流程的后半段（阶段 4–5 和门禁）可用，不代表完整流程的产出质量。阶段 6 的评审也没有做。

```bash
node scripts/gate.mjs runs/demo-habit   # 12 ok · 1 warn（无参考模式）· 0 fail
```

截图：`out/today.light.png`、`out/today.dark.png`
