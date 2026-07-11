# 测试基础设施

## 测试框架

**无测试框架**。本项目未配置任何自动化测试工具（无 Jest、Vitest、Mocha、Playwright、Cypress 等）。

## 测试文件

**不存在测试文件**。代码库中没有任何 `*.test.*`、`*.spec.*` 或测试目录。

## 测试覆盖范围

| 类型 | 状态 | 说明 |
|------|------|------|
| 单元测试 | 无 | 无 JS/TS 业务逻辑需要单元测试 |
| 集成测试 | 无 | reveal.js 为第三方库，未做集成测试 |
| E2E 测试 | 无 | 幻灯片交互未做端到端测试 |
| 视觉回归测试 | 无 | CSS 效果依赖人工预览 |
| 可访问性测试 | 无 | 未配置 a11y 检查工具 |

## CI/CD 与自动化

**无 CI/CD 配置**。代码库中不存在以下文件：

- `.github/workflows/` — 无 GitHub Actions
- `.gitlab-ci.yml` — 无 GitLab CI
- `Jenkinsfile` — 无 Jenkins
- `netlify.toml` / `vercel.json` — 无部署平台配置

## 代码质量工具

| 工具 | 状态 | 说明 |
|------|------|------|
| ESLint | 无 | 无 `.eslintrc` 配置 |
| Prettier | 无 | 无 `.prettierrc` 配置 |
| TypeScript | 无 | 无 `tsconfig.json` |
| Stylelint | 无 | 无 SCSS/CSS 检查 |

## 开发服务器

- 使用 `http-server` 作为静态文件服务器
- 启动命令：`npm start`（端口 9999）或 `npm run dev`（无缓存模式）
- 手动访问 `http://localhost:9999/ppt` 浏览 PPT 目录

## 测试策略说明

本项目为演示文稿集合，以静态 HTML/CSS 为主，测试策略以**人工验证**为核心：

1. **幻灯片预览**：通过浏览器打开各 PPT 的 `index.html` 逐页检查
2. **iframe 效果验证**：每个 `iframes/` 子目录中的特效需单独打开验证
3. **多主题切换**：在 `demo.html` 中手动切换主题确认样式正确
4. **代码高亮检查**：确认 `hljs` 类代码块渲染和行号显示正常
5. **响应式检查**：部分 iframe 演示包含 `@media` 查询，需在不同视口下验证

## 建议引入的测试（如未来需要）

若项目规模扩大，可考虑：

- **HTML 验证**：使用 `html-validate` 检查幻灯片 HTML 结构
- **CSS 兼容性检查**：使用 `stylelint` + `stylelint-config-standard-scss`
- **链接检查**：使用 `markdown-link-check` 验证 design.md 中的外部链接
- **截图对比**：对关键幻灯页使用 Playwright 做视觉回归测试
