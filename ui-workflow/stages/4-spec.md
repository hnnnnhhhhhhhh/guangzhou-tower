# 阶段 4 · 屏幕规格

**输入** brief.json、`refs/patterns.json`、`style/DESIGN.md`
**产物** `specs/<screen-id>.json`（合同：`schemas/spec.schema.json`）

spec 是阶段 5 唯一的施工图。阶段 5 不许加 spec 里没有的区，所以结构上的决定都在这里做完。

## 做什么

1. **定框架**（`frame`）：顶栏形式、导航形式、底部标签。取自 patterns 的 decisions。
2. **列区**（`regions`，最多 7 个）：每个区写 `role`、`content_shape`，并从 patterns 里找到支撑它的 `evidence`。没有证据的区，要在 `notes` 里写出它对应 brief 的哪条 core_task；写不出就删掉。
3. **排优先级**：恰好 1 个 `primary` 区（主操作所在的区）。其余是 secondary 或 tertiary。
4. **选组件**：按信息形状选，不按长相选。
   - 用 `npx astryx build "<这屏是什么>"` 和 `npx astryx search <词>` 找候选
   - 用 `npx astryx component <Name>` 确认它存在、看它的 Do / Don't
   - 同类一组的数据用 `List` / `ListItem`，不要每项一张 `Card`；`Card` 留给独立对象
   - 图标来自 `lucide-react`
5. **可选信息默认关闭**：副标题、标签、头像、辅助数字这些可选槽位，默认都不放。要放的写进 `optional_slots_on`，并在 `notes` 说明它服务哪条任务。
6. **样例数据**（`sample_data`）：写真实感的内容，必须包含一条很长的文本、一个 0、一个很大的数。阶段 5 原样使用。
7. **缺口**（`gaps`）：Astryx 没有的形状（底部标签栏、环形进度、统计格、打分条等），写明用哪些现有组件组合代替。先查 `shell/` 里有没有现成的。

## 完成标准

`node scripts/validate.mjs runs/<name>` 通过。
