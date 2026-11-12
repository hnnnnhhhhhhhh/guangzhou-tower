# 阶段 0 · 需求定稿

**输入** 用户的一句话或一段话。
**产物** `runs/<name>/brief.json`（合同：`schemas/brief.schema.json`）

## 做什么

1. 把需求写成 brief.json。每个字段都要填实，不确定的问用户，不要编。
2. `screens` 只列这次要交付的屏，每屏写清**唯一的**主操作。写不出唯一主操作，说明这屏该拆。
3. `category` 和每屏的 `search_terms` 用英文，用 Mobbin 上的叫法（home、onboarding、checkout、empty state、paywall…），阶段 1 直接拿它们检索。
4. `style_source` 三选一，**功能参考和风格参考是两件事，分开填**：
   - `reference-app`：风格学某一个上线 app（可以和功能品类无关，比如记账 app 学 Linear 的风格）
   - `brand`：用户自己有品牌规范
   - `preset`：用 Astryx 内置主题（`npx astryx theme list`）

## 完成标准

`node scripts/validate.mjs runs/<name>` 里 brief 一行是 ok。
