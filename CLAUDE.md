# 给在这个仓库里工作的模型

要生成 app 界面时，走 `ui-workflow/` 里的工作流：先读 `ui-workflow/README.md`，再从 `ui-workflow/stages/0-brief.md` 起按顺序做，每个阶段读它自己的指令文件。

- 所有命令在 `ui-workflow/` 目录下运行。
- 组件的 props 用 `npx astryx --dense component <Name>` 现查，不凭记忆写。
- 交付前 `node scripts/gate.mjs runs/<name>` 必须是 0 fail。不要改门禁脚本、`shell/` 或 schema 来让它通过。
- 不能看图的模型不要做阶段 2、3b、6，如实说明并交给能看图的模型。
- 仓库根目录的 `index.html` 和 `assets/` 是无关的旧页面，不用管。
