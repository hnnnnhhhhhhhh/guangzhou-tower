# 给在这个仓库里工作的模型

要生成 app 时，走 `ui-workflow/` 里的工作流：**读 `ui-workflow/START.md`，照它的八步做。**

- 所有命令在 `ui-workflow/` 目录下运行。
- 交付前 `node scripts/gate-app.mjs runs/<name>` 必须 0 fail。不要改门禁脚本、合同或验收脚本的断言来让它通过。
- 样例：`runs/trip-together/`、`runs/driving-quiz/`。
- 细节规则：`ui-workflow/docs/design-details.md`。
- 内容必须是真的，功能必须能用；没做的、没验证的如实写进交付说明。
- 不能看图的模型不要做读图的步骤（第 2、5 步），如实说明并交给能看图的模型。
- 参考截图不进仓库（已在 `.gitignore`）。

仓库里的旧东西，不要照着做：`ui-workflow/stages/0-*.md` 到 `6-*.md`、`stages/V-visual.md`、`scripts/gate.mjs`、`shell/`、`recipes/`、`runs/demo-habit`、`runs/habit-today`、`runs/pte-vocab` 是更早的做法，保留只为对照。根目录的 `index.html` 和 `assets/` 是无关的旧页面。
