# 给在这个仓库里工作的模型

要生成 app 时，走 `ui-workflow/` 里的工作流。先读 `ui-workflow/README.md`。

- **默认走应用路线**：`stages/A-app-spec.md`（需求 → 能用的产品）→ `stages/V-visual.md`（视觉）。交付前 `node scripts/gate-app.mjs runs/<name>` 必须 0 fail。样例：`runs/pte-vocab/`。
- 只要一屏结构稿时才走单屏路线（`stages/0-brief.md` 起，门禁 `scripts/gate.mjs`）。
- 所有命令在 `ui-workflow/` 目录下运行。
- 每个能点的东西都要真的做事；内容必须是真的，备不齐就如实写进规格的 `content.gaps`。
- 屏幕文件只组合 `recipes/` 里的配方，不写样式。缺配方时可以新增，但要在 `style/VISUAL.md` 里记下它对应参考图的哪一处，并在交付说明里告诉人。
- 不要改门禁脚本、schema 或验收脚本的断言来让它通过。
- 不能看图的模型不要做读图、视觉和评审，如实说明并交给能看图的模型。
- 参考截图不进仓库（已在 `.gitignore`）。
- 仓库根目录的 `index.html` 和 `assets/` 是无关的旧页面，不用管。
