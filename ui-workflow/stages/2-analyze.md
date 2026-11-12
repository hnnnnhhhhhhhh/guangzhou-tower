# 阶段 2 · 读图与归纳

**输入** `refs/shots/*.png`、brief.json
**产物** `refs/analysis/<id>.json`（每张图一份，合同：`schemas/analysis.schema.json`）、`refs/patterns.json`（合同：`schemas/patterns.schema.json`）

**这一步需要能看图的模型。** 不能看图的模型不要做这一步，也不要根据文件名或 app 名猜内容——交给能看图的模型做完，再从阶段 3 接手。

这一步的目的是把截图变成**结构**。之后的阶段只读这里产出的 JSON，不再看功能参考的截图，所以这里漏掉的东西后面就没有了；同时这也保证了产出不会是某张图的像素翻版。

## 2a 逐张读图 → analysis

一次只看一张图，填一份 analysis。只回答这些问题：

- 这屏的框架：顶部是什么、导航是什么（`frame`）
- 从上到下分几个区；每个区**在帮用户做什么**（`role`），里面是**什么形状的信息**（`content_shape`，只能用合同里的枚举），占首屏多大（`share_of_screen`）
- 集合怎么排：行、竖排卡、横滑卡、宫格（`collection_layout`），每一项显示哪些字段（`item_fields`）
- 主操作是什么意思、放在哪（`primary_action`）
- 最多 3 条值得带走的做法（`notable`）；哪些是品牌专属、不能带走（`do_not_copy`）

不要写：颜色、字号、像素值、具体文案、图标长相。那些属于风格，由阶段 3 处理。

## 2b 跨图归纳 → patterns

对每一屏，把它的所有 analysis 放在一起比：

- **consensus**：≥ 2/3 的参考都这么做的事。每条必须列出支撑它的 analysis id（`evidence`），至少 2 个。
- **divergences**：参考之间做法不同的地方，写成一个问题加几个选项，每个选项列证据。
- **decisions**：本产品采用什么。每条的 `because` 必须引用 brief 里的 `core_tasks` 或 `audience`——“因为大多数 app 这么做”不算理由，共识只是默认值，brief 才是裁判。

## 完成标准

`node scripts/validate.mjs runs/<name>` 通过：每张截图都有 analysis，每屏 ≥ 3 个不同 app，patterns 里引用的 id 都存在。
