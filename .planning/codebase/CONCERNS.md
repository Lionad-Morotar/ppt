# CONCERNS.md

> 代码库问题、风险与改进机会分析
> 分析日期：2026-04-28
> 仓库：/Users/lionad/Github/Lionad-Morotar/ppt

---

## 1. 技术债务

### 1.1 框架版本陈旧且存在安全风险

- **reveal.js 版本未声明**：根目录的 `dist/` 和 `plugin/` 目录中直接内嵌了 reveal.js 的编译产物，但 `package.json` 中未将其声明为依赖，无法通过 `npm outdated` 检查版本状态。
- **jQuery 直接内嵌**：`plugin/js/jquery.js` 以单文件形式存在，版本未知，可能包含已知 CVE 漏洞。
- **highlight.js 同样内嵌**：`plugin/highlight/` 目录包含 highlight.js 的编译产物，版本不可追溯。

### 1.2 二进制/大文件混入版本控制

- `ppt/poaa/snapshot.mp4`（11MB）和 `cover.png`（112KB）直接提交到 Git，导致仓库体积膨胀，克隆速度受影响。
- 多个 iframe 演示文件体积巨大：
  - `ppt/poaa/iframes/aritecture/index.html` — 63KB（近 3000 行内联 CSS/JS）
  - `ppt/poaa/iframes/artdraw/index.html` — 73KB（近 1600 行）
  - `ppt/light-travel/iframes/flash/index.html` — 372KB（内联了 base64 图片或大量 CSS）

### 1.3 路径引用不一致

- **poaa/index.html** 使用相对路径 `../../dist/...`（基于 `/ppt/poaa/` 目录深度）
- **light-travel/index.html** 使用绝对路径 `/dist/...`
- 这种不一致意味着两个子项目必须在不同的 URL 层级下运行，无法统一部署到同一基路径。

### 1.4 代码重复与内联膨胀

- 所有 iframe 演示均为独立的 `.html` 文件，内含大量重复的 CSS 和 HTML 结构，没有抽取公共模板或组件。
- `demo/demo.html` 是 reveal.js 官方示例的完整复制，约 479 行，与业务无关，属于仓库噪音。

---

## 2. 安全考虑

### 2.1 外部资源依赖（无 SRI / 无本地 fallback）

- 多个幻灯片直接引用外部 CDN 和第三方域名：
  - `https://cdn.jsdelivr.net/gh/Lionad-Morotar/blog-cdn/...`
  - `https://mgear-image.oss-cn-shanghai.aliyuncs.com/...`
  - `https://static.slid.es/...`
  - `https://www.baidu.com/...`（作为 iframe 背景）
  - `https://elrumordelaluz.github.io/csshake...`
- 这些外部资源没有 Subresource Integrity (SRI) 校验，一旦源站被篡改，演示内容可被注入恶意代码。

### 2.2 iframe 背景嵌入第三方网站

- `poaa/index.html` 将 `https://www.baidu.com/s?wd=水箱` 作为 `data-background-iframe`，存在点击劫持和信息泄露风险。
- `light-travel/index.html` 嵌入 `https://image.baidu.com/...` 和 `https://www.cssworld.cn/`，同样存在不可控风险。

### 2.3 无 Content Security Policy

- 所有 HTML 文件均未设置 `<meta http-equiv="Content-Security-Policy">`，无法限制脚本来源、阻止内联脚本执行或限制 iframe 加载目标。

### 2.4 控制台输出敏感信息

- `poaa/index.html` 的 `slidechanged` 事件处理器中通过 `console.log` 输出帮助信息，包含可直接执行的 DOM 操作代码片段，在生产环境中可能暴露内部调试信息。

---

## 3. 性能瓶颈

### 3.1 首屏加载问题

- reveal.js 的 `dist/reveal.js` 和 `dist/reveal.css` 未压缩版本直接提供服务（通过 `http-server`）。
- 多个 iframe 背景幻灯片使用 `data-preload` 属性，导致页面初始化时并行加载大量 iframe 内容，首屏时间严重恶化。
- `light-travel/iframes/flash/index.html` 体积达 372KB，疑似内联了 base64 编码的图片资源。

### 3.2 大文件阻塞 Git 操作

- `snapshot.mp4`（11MB）每次修改都会生成新的 Git blob，即使只修改几字节也会复制整个文件，长期累积将严重拖慢 `git clone` 和 `git status`。

### 3.3 无资源优化策略

- 无图片压缩流程（poaa/cover.png 112KB 对一张封面图来说偏大）。
- 无代码分割：每个 iframe 都是独立的完整 HTML，公共 CSS/JS 未抽取。
- 无懒加载机制：非首屏 iframe 内容在页面加载时即全部请求。

---

## 4. 可维护性问题

### 4.1 无构建工具链

- `package.json` 仅定义了 `http-server` 的启动脚本，无构建、无打包、无转译。
- SCSS 文件（`css/reveal.scss`、`css/layout.scss`）存在于源码中，但无编译脚本将其转为 CSS，实际使用的是预编译的 `dist/reveal.css`。
- 这意味着 `.scss` 源文件与 `.css` 产物可能已不同步，修改 SCSS 不会生效。

### 4.2 无包管理锁定文件的有效性存疑

- `pnpm-lock.yaml` 存在但内容极少（仅 114 字节），且 `package.json` 中未声明任何生产依赖，锁定文件实际未锁定任何有意义的依赖版本。
- `node_modules` 目录已提交到 `.gitignore`，但 `http-server` 作为全局工具推荐安装（`npm install -g http-server`），未作为项目依赖管理。

### 4.3 文档与代码脱节

- `Readme.md` 中的分享列表存在拼写错误：`claude-from-zerro`（多了一个 r）。
- `poaa/index.md` 是讲稿/提纲，但 `poaa/index.html` 是实际演示文件，两者内容不同步（HTML 中无 Markdown 内容引用机制）。
- `design.md` 中引用的外部路径（如 `~/Github/Lionad-Morotar/claude-from-zero/...`）使用绝对路径，在其他机器上无法访问。

### 4.4 无测试与自动化

- 无任何测试框架配置。
- 无 CI/CD 流程（`.github/workflows/` 目录不存在）。
- 无预提交钩子（`.git/hooks/` 仅存在示例文件）。

---

## 5. 缺失工具链

| 工具类型 | 状态 | 影响 |
|---------|------|------|
| ESLint | 缺失 | JS 代码无静态检查 |
| Prettier | 缺失 | 代码格式不统一 |
| TypeScript | 缺失 | 无类型安全 |
| SCSS 编译器 | 缺失 | `.scss` 文件无法直接使用 |
| 构建工具 (Vite/Webpack) | 缺失 | 无模块打包、无资源优化 |
| 测试框架 | 缺失 | 无法回归验证 |
| Git LFS | 缺失 | 大文件直接污染 Git 历史 |
| Husky / lint-staged | 缺失 | 提交前无质量门禁 |
| Renovate/Dependabot | 部分（仅 renovate.json） | 未实际配置自动化依赖更新 |

---

## 6. 子项目间不一致

### 6.1 技术栈分裂

| 子项目 | 框架 | 路径风格 | 内容格式 |
|-------|------|---------|---------|
| `ppt/poaa/` | reveal.js (HTML) | 相对路径 `../../` | 纯 HTML |
| `ppt/light-travel/` | reveal.js (HTML) | 绝对路径 `/` | 纯 HTML |
| `ppt/demo/` | reveal.js (HTML) | 绝对路径 `/` | 官方示例复制 |
| `ppt/claude-from-zero/` | 无（仅有设计文档） | N/A | Markdown 设计稿 |
| `ppt/demo-slidev/` | **Slidev**（空目录） | N/A | N/A |

### 6.2 路径引用混乱

- `poaa` 使用 `../../dist/reveal.js`（假设从 `/ppt/poaa/` 运行，服务器根在仓库根）
- `light-travel` 使用 `/dist/reveal.js`（假设服务器根在仓库根）
- 两者无法在同一基路径下同时正常工作，除非通过 `http-server ./` 从仓库根启动。

### 6.3 主题与样式不统一

- `poaa` 使用 `serif.css` 主题
- `light-travel` 也使用 `serif.css` 主题，但额外引入了 `/plugin/styles/ppt.css`
- `demo` 使用 `black.css` 主题
- 无统一的品牌或视觉规范

---

## 7. Slidev 迁移相关关注点

### 7.1 demo-slidev 为空目录

- `ppt/demo-slidev/` 创建于 2026-04-28 但完全为空，说明 Slidev 迁移处于非常早期的探索阶段。
- 需要决定：是全新创建 Slidev 项目，还是将现有 reveal.js 内容迁移过去。

### 7.2 内容迁移复杂度

- **poaa** 和 **light-travel** 均大量使用 reveal.js 特有功能：
  - `data-background-iframe`（嵌入 iframe 作为幻灯片背景）
  - `data-preload`（预加载 iframe）
  - `data-background-interactive`（允许 iframe 交互）
  - `fragment` 类（逐段显示动画）
  - `data-auto-animate`（跨幻灯片自动动画）
- Slidev 不支持 `data-background-iframe`，这是最大的迁移障碍。poaa 和 light-travel 中超过 50% 的幻灯片依赖此功能展示交互式 CSS 演示。

### 7.3 设计文档与实现脱节

- `claude-from-zero/design.md` 是一份详细的内容设计文档（约 290 行），但：
  - 未指定使用 reveal.js 还是 Slidev 实现
  - 提到需要 "mermaid 图表" 和 "可运行的 HTML 动画或视频"
  - 引用外部路径（`~/Github/...`）在其他环境不可访问
- 需要明确技术选型后才能开始实现。

### 7.4 迁移策略建议

| 子项目 | 建议策略 | 理由 |
|-------|---------|------|
| `poaa` | 保留 reveal.js 或重写为独立页面 | 大量 iframe 背景，Slidev 不支持 |
| `light-travel` | 同上 | 同上 |
| `claude-from-zero` | **优先使用 Slidev** | 新内容，无历史包袱，适合 Markdown 驱动 |
| `demo` | 删除 | 官方示例，无业务价值 |
| `demo-slidev` | 初始化为正式 Slidev 项目 | 作为 claude-from-zero 的实现载体 |

---

## 8. 优先级排序

### P0（立即处理）

1. **将大文件移出 Git**：使用 Git LFS 或外部存储托管 `snapshot.mp4` 和 `cover.png`
2. **统一路径引用**：所有子项目使用一致的相对路径或绝对路径策略
3. **修复 Readme.md 拼写错误**：`claude-from-zerro` → `claude-from-zero`

### P1（近期处理）

4. **初始化 demo-slidev 为正式 Slidev 项目**，作为 claude-from-zero 的实现载体
5. **引入构建工具链**（Vite + Slidev 或保持 reveal.js 但添加构建流程）
6. **添加 ESLint + Prettier 配置**
7. **为外部资源添加 SRI 或迁移到本地**

### P2（中期规划）

8. **评估 reveal.js 子项目向 Slidev 的可迁移性**，特别是 iframe 背景功能
9. **引入 TypeScript** 提升类型安全
10. **建立 CI/CD 流程**（GitHub Actions）自动构建和部署
11. **添加测试覆盖**（至少验证各幻灯片能正常加载）

### P3（长期优化）

12. **统一视觉主题和品牌规范**
13. **重构 iframe 演示为可复用组件**
14. **引入内容管理系统或 Markdown 驱动的工作流**
