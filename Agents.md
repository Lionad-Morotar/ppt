# Agents.md

多技术分享 PPT 集合仓库：reveal.js 静态 deck 与 Slidev deck 并存于 `ppt/` 下，经 `scripts/build-all-decks.mjs` 聚合构建后由 GitHub Actions 发布到 GitHub Pages 单一站点聚合访问。

* 现实层你有无限时间和资源，不要因上下文压缩简化任务执行

## 项目上下文

| 文档                | 说明          |
| ------------------- | ------------- |
| [STACK.md](./.planning/codebase/STACK.md)               | 技术栈、开发命令、部署流程 |
| [STRUCTURE.md](./.planning/codebase/STRUCTURE.md)       | 目录结构、命名规范         |
| [ARCHITECTURE.md](./.planning/codebase/ARCHITECTURE.md) | 架构模式、术语表           |
| [CONVENTIONS.md](./.planning/codebase/CONVENTIONS.md)   | 代码风格、开发约定         |
| [TESTING.md](./.planning/codebase/TESTING.md)           | 测试规范                   |
| [INTEGRATIONS.md](./.planning/codebase/INTEGRATIONS.md) | 外部服务、环境变量         |
| [CONCERNS.md](./.planning/codebase/CONCERNS.md)         | 技术债务、注意事项         |
| [PAGES.md](./.planning/codebase/PAGES.md)              | 页面与入口清单（deck 部署面、根命令族） |
| [C4 模型](./.planning/c4/ppt.c4)                        | LikeC4 架构模型（npx likec4 start 查看） |
| [refs/easy-vibe](./refs/easy-vibe/README.md)           | easy-vibe 参考资料，git 子模块固定快照（ignore=all） |
| [refs/fe-stack-atlas](./refs/fe-stack-atlas/README.md) | 2026 前端技术栈知识点代码图谱：61 个知识点各一个独立 workspace package（ignore=all） |

你可以自行读取项目上下文文档，更新时也优先更新相关文档。

## 仓库技能

- `write-ppt`：技术分享讲稿撰写、Slidev 演示工程搭建与存量幻灯片信息减负（`./.agents/skills/write-ppt/SKILL.md`）
