# 测试基础设施

## 测试框架

**无测试框架**。本项目未配置任何自动化测试工具（无 Jest、Vitest、Mocha、Playwright Test、Cypress 等）。

注意：`ppt/boris-five-roles-in-ai-native-teams/package.json` 中的 `playwright-chromium` 是 Slidev `export` 功能的导出依赖（生成 PDF/图片用），不是测试框架。

## 测试文件

**不存在测试文件**。代码库中没有任何 `*.test.*`、`*.spec.*` 或测试目录。

## 唯一的自动化检查

**术语一致性校验**：`pnpm -C ppt/claude-from-zero lint:terms`（即 `node scripts/validate-terms.mjs`）

- 校验 `docs/claude-from-zero/terms.yaml` 中定义的术语 id 与 `slides.md` / `components/*.vue` 里 `<terms>` 组件的实际使用是否双向对齐（未使用 / 未定义）
- 退出码非 0 表示存在不一致，可在本地与 CI 中作为门禁使用
- 配套写入脚本：`ppt/claude-from-zero/scripts/replace-terms.mjs`

## 测试覆盖范围

| 类型 | 状态 | 说明 |
|------|------|------|
| 单元测试 | 无 | 引擎逻辑（`three/`）与 Vue 组件均无单元测试 |
| 集成测试 | 无 | Slidev/reveal.js 为第三方库，未做集成测试 |
| E2E 测试 | 无 | 幻灯片交互未做端到端测试 |
| 视觉回归测试 | 无 | CSS/ThreeJS 效果依赖人工预览 |
| 静态校验 | 仅一处 | 术语一致性 `lint:terms`（见上） |

## CI/CD 与自动化

**存在构建部署流水线，无测试流水线**：`.github/workflows/deploy-pages.yml`

- 触发：push 到 `main`（paths 限定 `ppt/**`、`scripts/build-all-decks.mjs`、workflow 自身），另支持 `workflow_dispatch` 手动触发
- 流程：checkout → pnpm 9 + Node lts（按 `ppt/**/pnpm-lock.yaml` 缓存）→ `node scripts/build-all-decks.mjs --install` → 上传 `dist-pages/ppt` → `deploy-pages@v4` 发布 GitHub Pages
- concurrency 组 `pages`、排队不取消；**流水线不含任何测试/类型检查步骤**，质量门禁依赖本地人工验证
- 本地可完整复现 CI 行为：`pnpm build:all`（或 `pnpm build:all:install` 含装依赖），产物在 `dist-pages/ppt/`

无 `.gitlab-ci.yml`、`Jenkinsfile`、`netlify.toml`（`ppt/demo-slidev/netlify.toml` 为 deck 自带模板残留，未用于本项目部署）。

## 代码质量工具

| 工具 | 状态 | 说明 |
|------|------|------|
| ESLint | 无 | 无任何 eslint 配置 |
| Prettier | 无 | 无配置，格式靠约定（无分号 + 单引号 + 2 空格） |
| TypeScript | 部分 | 仅 `ppt/boris-five-roles-in-ai-native-teams/tsconfig.engine.json`：`strict` + `noUncheckedIndexedAccess`、`noEmit`，只覆盖 `three/**/*.ts`；无 typecheck script，无 CI 强制 |
| Stylelint | 无 | 无 SCSS/CSS 检查 |
| 自定义校验 | `lint:terms` | `ppt/claude-from-zero/scripts/validate-terms.mjs` |

## 开发与预览服务器

| 命令 | 用途 | 端口 |
|------|------|------|
| `pnpm dev` / `pnpm start`（根） | http-server 起根目录，浏览老 reveal.js PPT | 9999 |
| `pnpm dev:boris` | boris deck Slidev dev | 4945 |
| `pnpm dev:cfz` | claude-from-zero Slidev dev | 3411 |
| `pnpm dev:demo` | demo-slidev Slidev dev | 12983 |
| `pnpm build:all` | 聚合构建全部分享到 `dist-pages/ppt/` | — |
| `pnpm build:all:install` | 同上，先对各 deck `pnpm install` | — |
| `pnpm preview:all` | http-server 预览聚合产物，与线上路径一致（`/ppt/`） | 8080 |

## 测试策略说明

本项目为演示文稿集合，测试策略以**人工验证**为核心：

1. **Slidev deck 逐页预览**：`pnpm dev:<deck>` 起对应 deck，浏览器逐页检查渲染、Mermaid 图、组件交互
2. **聚合产物验证**：`pnpm build:all` + `pnpm preview:all` 后访问 `http://localhost:8080/ppt/`，检查聚合首页卡片链接与各 deck 子路径可用（与线上 GitHub Pages 路径完全一致）
3. **构建引用重写验证**：老 revealjs 分享（poaa/light-travel）的 `dist/`、`plugin/` 引用被构建脚本重写为 `/ppt/dist|plugin/`，需人工确认无 404
4. **ThreeJS 背景验证**：背景 canvas 跨页常驻（翻页波纹、首页随机波），需实际翻页检查；调试入口 `window.__deckBg` / `window.__deckInspector`
5. **iframe 效果验证**：`ppt/light-travel/iframes/` 等特效需单独打开验证
6. **术语一致性**：改 `terms.yaml` 或 `<terms>` 组件后跑 `pnpm -C ppt/claude-from-zero lint:terms`

**DOM 操作铁律**（来自 `ppt/claude-from-zero/.claude/slidev-dom-structure.md`，适用于对 Slidev 页面做测试/自动化）：
Slidev 将所有 `.slidev-page` 常驻 DOM、仅以 `display: none` 切换显隐。`document.querySelectorAll` 会命中全部 slide 的同名元素，必须先定位可见 slide（`.slidev-page:not([style*="display: none"])`）再查询，或用 `getBoundingClientRect()` 过滤。

## 建议引入的测试（如未来需要）

若项目规模扩大，可考虑：

- **引擎单元测试**：对 `three/` 纯逻辑（如 `worldToGrid`、轨迹点衰减计算）用 Vitest 补测试，`tsconfig.engine.json` 可直接复用
- **类型检查门禁**：为 `tsconfig.engine.json` 增加 `pnpm exec tsc -p` script 并纳入 CI
- **构建冒烟测试**：CI 中 `build:all` 后检查 `dist-pages/ppt/<deck>/index.html` 存在性与引用重写结果
- **截图对比**：对关键幻灯页用 Playwright 做视觉回归测试
- **链接检查**：使用 `markdown-link-check` 验证 design.md 中的外部链接

---

*Testing analysis: 2026-10-02*
