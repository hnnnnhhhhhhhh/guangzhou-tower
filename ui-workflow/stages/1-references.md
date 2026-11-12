# 阶段 1 · 取参考

**输入** brief.json
**产物** `refs/shots/*.png`（功能参考）、`style/shots/*.png`（风格参考）、`refs/sources.md`

两类截图分开放，后面的阶段不会混用：

| 目录 | 找什么 | 数量 |
|---|---|---|
| `refs/shots/` | 和每一屏**功能相同**的屏，来自**不同 app** | 每屏 ≥ `min_apps_per_screen`（至少 3），建议 4–6 |
| `style/shots/` | **同一个 app** 的不同屏（列表、详情、表单、空状态各一） | 3–8 张 |

## 取图的三条路，按顺序试

**A. Mobbin 连接器（首选）**
Mobbin 有官方 MCP，需要付费方案。在 Claude 里是连接器目录中的 “Mobbin”（工具 `search_screens` / `search_flows`）；其他客户端接 `https://api.mobbin.com/mcp`，首次连接走浏览器登录。

- 功能参考：`search_screens`，query 写成一句话 `<category> app <这一屏是什么>`，例如 `habit tracker app today screen with habit checklist`；`platform` 取 brief 的平台；`limit` 8 左右。一屏搜一次，不要把几屏合在一个 query 里。
- 风格参考：`search_screens`，query 写 `<App 名> app screens`，从结果里挑 3–8 张类型不同的屏。
- **存图**：结果里的 `image_url` 是高清图，能下载就下载它；下载不了（网络策略不放行 mobbin.com）时，用工具返回的预览图文件——分辨率低一些，读结构和量颜色够用。
- 每张图的 `mobbin_url` 记进 `refs/sources.md`。

**B. 人工导出**
连不上 MCP（没有账号、无头环境没法走浏览器授权、网络策略不放行 mobbin.com）时，停下来请用户在 Mobbin 网页上按同样的关键词挑图、下载，放进这两个目录。把要搜的关键词列给用户。

**C. 无参考模式**
用户明确说不提供参考时才走。两个目录留空，后续阶段照常进行，门禁会给一条 WARN，交付说明里必须写明“未使用参考”。

**不要**写爬虫去抓 Mobbin 网页：内容在登录和付费墙后面，而且抓下来的东西不稳定。也**不要**凭记忆“回忆”某个 app 长什么样来代替截图。

## 命名与登记

- 文件名：`<app>-<screen-id>-<序号>.png`，全小写连字符，如 `streaks-today-1.png`。这个名字去掉扩展名就是后面的 analysis id。
- `refs/sources.md` 每张图一行：文件名、app、来源链接、取图方式（mobbin-mcp / manual-export）。
- 截图有版权，`.gitignore` 已经把这两个目录排除在仓库之外；进仓库的只有来源链接和阶段 2 的读图结果。

## 挑图标准

- 同一屏的参考要**有差异**：别挑 4 个长得一样的。至少一个信息密度高的、一个低的。
- 选近两年的版本。
- 跳过主要内容是营销图、插画、视频的屏——那些学不到结构。

## 完成标准

每屏有 ≥ 3 个不同 app 的截图；`style/shots/` 里是同一个 app 的 3–8 张（`reference-app` 模式）。
