# 从这里开始

你要做的事：把用户的一句需求，做成一个**真的能用、有自己样子**的手机小应用。

整个流程是：**写规格 → 去 Mobbin 查结构 → 写验收 → 去 Mobbin 查视觉并做选择题 → 用通用零件搭界面 → 对照细节规则 → 过门禁 → 写交付说明**。
样例是 `runs/fit-booking/`（健身约课），拿不准时照着看。

这套流程的要点：**你不需要会写样式。** 参考图长什么样，由你回答一组选择题来描述；样式由脚本生成；界面用现成的零件拼；门禁会量你做出来的东西，和你对参考图的描述对不上就不通过。

---

## 0 准备

```bash
npm install                      # 在本目录执行
# 门禁要用 Playwright + Chromium；机器上没有的话：
#   npm i -D playwright && npx playwright install chromium
mkdir -p runs/<name>/{refs/shots,style/shots,app/{data,logic,screens},acceptance,theme}
```

- 所有命令都在本目录（`ui-workflow/`）下执行。
- 需要 Mobbin：连接器或 MCP（`https://api.mobbin.com/mcp`），工具是 `search_screens`、`search_flows`。连不上时停下来请用户提供截图，**不要凭记忆想象某个产品长什么样**。
- 读图的步骤（第 2、4 步）需要能看图的模型。不能看图就如实说明，交给能看图的模型做这两步。

---

## 1 写规格

产物：`runs/<name>/app-spec.json`（合同：`schemas/app.schema.json`；写法：`stages/A-app-spec.md`）

先有产品才有屏。必须写出来的：

- **核心循环**：用户每次打开亲手做的那几步。把步骤念一遍，用户的目的达成了吗？“背单词”里没有“回忆—对答案—自评”，那只是看单词。
- **数据**：哪些东西会因为用户的动作而改变。
- **规则**：写到能直接实现和测试（数值、边界、顺序）。
- **内容来源**：内容必须是真的。备不齐的写进 `content.gaps`，不要用占位数据充数。
- **验收场景**：至少覆盖核心循环走一遍、刷新后数据还在、输入不合格时、用户做了“错”的选择之后。

## 2 去 Mobbin 查结构

产物：`refs/sources.md`

查两次，目的不同：

| 查什么 | 怎么搜 | 用来决定 |
|---|---|---|
| 按**动作**：用户在核心那一屏做的事 | “quiz question screen with answer options”“day by day itinerary screen” | 核心屏有哪些不同做法，选哪种 |
| 按**品类**：这类产品整体 | “exam prep app home screen”“group trip planning with friends” | 该有哪些内容、分几块，别漏 |

- 两次合计至少看 8 个不同的产品。只看一两个就是照抄。
- 用结果里的 `image_url` 下载高清图放进 `refs/shots/`（下载不了再用预览图）。
- 在 `refs/sources.md` 里写一张表：产品、链接、**从它学到的结构**。
- 当场做出结构决定并写下理由，至少包括：有哪几屏、首页是什么、底部要不要导航。
  - 首页：用户下一步要做的事是确定的 → 打开就是任务本身；要先看全貌才知道做什么 → 才用总览。
  - 底部导航：看同类产品在“单个任务内部”用不用。不需要就不加。

## 3 写验收脚本

产物：`acceptance/<id>.mjs`，和 `app-spec.json` 的 `acceptance` 一一对应。

脚本拿到一个 `t`：`t.screen(id)` 断言在哪一屏并截图检查 · `t.tap(按钮的可读名字)` · `t.see(文字或正则)` · `t.notSee(文字)` · `t.count(文字)` · `t.expect(条件, 说明)` · `t.reload()` · `t.nextDay(n)` · `t.shot(名字)` · `t.page`（需要时直接用 Playwright）。

## 4 去 Mobbin 查视觉，做选择题

产物：`style/shots/`、`style/visual.json`

**这一步你不写任何样式，只做一组选择题。** 样式由脚本根据你的答案生成。

1. 选**一个**气质鲜明的产品，取它 3 张不同的屏，下载高清图放进 `style/shots/`。
   - 先看它靠不靠照片：如果大图是画面主角而你拿不到真图，换一个参考，或者照做并写明。
2. 量颜色，不要目测：`node scripts/palette.mjs runs/<name>`
3. 按 `docs/reading-visuals.md` 逐题作答，写成 `style/visual.json`（合同：`schemas/visual.schema.json`）。
   - 每一题只能选给定的选项：容器是 无 / 底色 / 描边 / 阴影，圆角是 直角 / 小 / 中 / 大 / 胶囊，等等。
   - 每一题都要在 `evidence` 里写出依据：哪张图的哪个位置。**找不到依据就重新看图，不要按习惯选。**
   - 最常见的错误：看到深色界面就默认“每块内容一个灰色圆角块”。先确认图上真的有。
4. 生成样式：`node scripts/style.mjs runs/<name>` → 得到 `app/style.css` 和 `theme/theme.ts`。这两个文件不要手改。

样例：`runs/fit-booking/style/visual.json`。

## 5 用通用零件搭界面

产物：`app/`

```
app/main.tsx            入口，挂载 App
app/App.tsx             路由和主题外壳（照抄 runs/fit-booking/app/App.tsx 的开头）
app/style.css           第 4 步生成，不要手改
app/data/               真实内容
app/logic/              业务规则：纯函数，不碰界面和存储；存储单独一个文件
app/screens/*.tsx       屏：只组合 kit 里的零件
```

**界面用 `kit/` 里的零件拼**（`import {…} from '../../../../kit'`）。它们长什么样已经由第 4 步决定，你只管放什么内容：

| 要放的东西 | 用哪个零件 |
|---|---|
| 一屏的骨架、底部固定操作、底部导航 | `Screen`（`foot`、`tabs`） |
| 页面标题（一屏一个）、分类小标签、小标题、正文 | `Title`、`Label`、`H2`、`Text` |
| 页面的一个区 | `Section`，区与区之间放 `Divider` 或留白 |
| 同类的一组东西 | `List` + `Item`（一行：`lead` 时间或序号、`title`、`sub`、`extra`、`end` 状态） |
| 能单独拿走的一个东西 | `Surface`（它有没有底色和圆角由参考决定） |
| 按钮 | `Btn`（`primary` 一屏最多一个；`secondary` / `quiet` / `danger`）、`IconBtn` |
| 状态 | `Status`（色点加文字，不是按钮） |
| 进度 | `Meter` |
| 选一天 / 几选一 / 多选格子 | `Week`、`Segments`、`Cells` |
| 日期、带单位或货币符号的数字 | `DateNum`、`Num` |
| 人 | `Avatars`（名字的一个字加颜色） |
| 图片 | `ImageSlot`（有真图传 `src`，没有就留空） |
| 空状态 | `Empty` |
| 排列 | `Stack`、`Row`、`Wrap`、`Grow`、`Enter` |
| 文字输入 | Astryx 的 `TextInput`（属性现查：`npx astryx --dense component TextInput`） |

每个零件的参数写在 `kit/index.tsx` 的注释里，用之前读一下。

规则：

- 每屏最外层是 `<Screen screen="规格里的屏 id">`。
- 每个能点的东西都要真的做事。空的事件处理函数过不了门禁。
- 屏幕文件里不写裸 HTML 标签、`style=`、`className`、颜色和尺寸。
- **不要给零件另写样式去“调整”它**。觉得样子不对，回第 4 步改答案再重新生成。
- kit 里确实没有的东西（很少见），才在 `app/ui/` 里自己写一个零件；它的样式只能用 `--k-*` 变量和 Astryx 的刻度，并在交付说明里写明加了什么、为什么。
- **示例数据要相对“今天”生成**，让用户打开的第一屏有真实内容。第一屏是空状态过不了门禁。
- 地址加 `?skin=proto` 可以看去掉气质的原型，用来单独判断结构。

## 6 对照细节规则

全文在 `docs/design-details.md`。零件已经替你做到了其中几条（同心圆角、日期分三段、单位小一档、头像用首字、图片位留空），你要自己守住的是：

- D05 粗体是稀缺的：不要把多个 `Title` 放在一屏；大号文字只给主角。
- D06 一屏一种字体。
- D07 没有真图就留空，不用表情顶替内容图。
- 同一个信息一屏只出现一次；不能点的东西不要做得像按钮。

## 7 过门禁

```bash
node scripts/gate-app.mjs runs/<name>
```

它会：校验规格和选择题 → 重新生成样式 → 检查屏幕源码 → 构建 → 确认第一屏有内容 → 在 390×844 的浏览器里把每条验收场景点一遍 → 每屏截图并检查溢出、触控目标、对比度、细节规则 → **量每一屏的容器、圆角、控件、标题粗细，和 `visual.json` 里的答案核对** → 确认规格里每一屏都被走到 → 拼一张“参考 | 产出”的并排图。

- **0 fail 才能交付。**
- `conform` 报错的意思是：你说参考图是这样的，但你做出来的不是。两条路：做的不对就改界面；答案本身答错了就回第 4 步改答案。**不要为了通过而把答案改成和你做的一样**——答案的依据是参考图，不是你的产出。
- `detail` 开头的警告对应细节规则，要清零；清不掉的在交付说明里逐条写原因。
- **打开 `runs/<name>/out/compare.png` 看一遍**：左边是参考，右边是你的产出。放在一起违和的地方，回去改。
- 不要为了通过而改门禁脚本、合同、kit，或者删掉验收脚本里的断言。

## 8 写交付说明

产物：`runs/<name>/README.md`，照 `runs/fit-booking/README.md` 的写法：

- 怎么打开（`RUN=runs/<name> npx vite`）
- 它能做什么
- 验证了什么（门禁结果）
- **局限**：没做的、没验证的、内容是不是真的、有没有人看过。如实写。

---

## 硬性要求

- 内容必须是真的；功能必须能用；说“验证过”的必须真的跑过。
- 参考截图有版权，不进仓库（`.gitignore` 已排除 `refs/shots/` 和 `style/shots/`），只留链接和文字提炼。
- 结构参考至少 8 个产品；视觉只学一个，并在 `visual.json` 的 `not_copied` 里写明没照搬什么。
- 你不写样式：样式来自选择题的答案，界面来自 kit 的零件。
- 不知道的事情写“不知道”，不要编。

## 已知的边界

- 产出是手机宽度的 React 网页，不是原生 iOS / Android 工程。
- 数据存在浏览器本地，没有服务端。
- 没有图片检索：需要真图时，用你所在环境的搜图工具；没有就把图位留空。
- 选择题只有十来道，描述不了参考图的全部气质（插画、照片、特殊版式都不在里面）。产出会像参考的“骨架和质地”，不会和它一模一样。
- kit 的零件种类有限。遇到它没有的东西可以自己加，但要写明。
