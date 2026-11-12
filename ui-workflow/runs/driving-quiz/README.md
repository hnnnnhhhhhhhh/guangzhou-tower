# driving-quiz · 验证“按动作查做法 + 换气质 + emoji 贴纸”

需求：科目一刷题。用来和一版通用产出（绿色、主卡 + 章节卡片列表）对比，看这条路能不能把样子拉开。

- **做法**（按“逐题作答”这个动作查到的）：首页即题；练习用拇指区作答；模考用安静的答卷。
- **气质**：路牌。沥青黑、信号黄、厚边牌子；模考切到白色答卷。
- **素材**：微软 Fluent Emoji（MIT）经 `scripts/sticker.mjs` 做成白边贴纸。
- **规格**：间距、圆角、字号取自 apps-builder 设计方法第 8 节。

打开：`cd ui-workflow && npm install && RUN=runs/driving-quiz npx vite`
验证：`node scripts/gate-app.mjs runs/driving-quiz` → 27 ok · 0 fail，五条验收场景自动跑通。

局限：24 道原创示例题，不是官方题库，没有图片题，未经驾培老师审校；模考是 10 题 5 分钟的缩短版；没有统计页；界面零件是这个应用自己写的，没有接入 apps-builder 的组件和构建链路。
