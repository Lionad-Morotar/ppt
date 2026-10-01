# CONCERNS.md

> 代码库问题、风险与改进机会分析
> 分析日期：2026-04-28 · 更新：2026-10-02
> 仓库：/Users/lionad/Github/Lionad-Morotar/ppt

---

## 1. 技术债务

### 1.1 框架版本陈旧且存在安全风险

- **reveal.js 版本未声明**：根目录的 `dist/` 和 `plugin/` 目录中直接内嵌了 reveal.js 的编译产物，但 `package.json` 中未将其声明为依赖，
  无法通过 `npm outdated` 检查版本状态。
- **jQuery 直接内嵌**：`plugin/js/jquery.js` 以单文件形式存在，版本未知，可能包含已知 CVE 漏洞。
- **highlight.js 同样内嵌**：`plugin/highlight/` 目录包含 highlight.js 的编译产物，版本不可追溯。

### 1.2 二进制/大文件混入版本控制

- `ppt/poaa/snapshot.mp4`（11MB）和 `cover.png`（112KB）直接提交到 Git，导致仓库体积膨胀，克隆速度受影响。
- 多个 iframe 演示文件体积巨大：
  - `ppt/poaa/iframes/aritecture/index.html` — 63KB（近 3000 行内联 CSS/JS）
  - `ppt/poaa/iframes/artdraw/index.html` — 73KB（近 1600 行）
  - `ppt/light-travel/iframes/flash/index.html` — 372KB（内联了 base64 图片或大量 CSS）

### 1.3 路径引用不一致（部署层面已缓解）

- **poaa/index.html** 使用相对路径 `../../dist/...`（基于 `/ppt/poaa/` 目录深度）
- **light-travel/index.html** 使用绝对路径 `/dist/...`
- **更新（2026-10-02）**：源码层面的不一致仍然存在，但"无法统一部署"的结论已不成立——
  `scripts/build-all-decks.mjs` 的 `rewriteRevealPaths()` 在构建期用正则 `REVEAL_REF_RE` 把所有
  `dist/`、`plugin/` 引用统一重写为 `/ppt/dist|plugin/`，两个子项目已可共存于同一基路径（GitHub Pages 聚合部署）。
- 残留风险：构建期重写依赖正则匹配双引号 `src/href` 属性，单引号或新引用写法会被**静默跳过**，导致线上 404。

### 1.4 代码重复与内联膨胀

- 所有 iframe 演示均为独立的 `.html` 文件，内含大量重复的 CSS 和 HTML 结构，没有抽取公共模板或组件。
- `ppt/demo/demo.html` 是 reveal.js 官方示例的完整复制，约 479 行，与业务无关，属于仓库噪音。
  **更新（2026-10-02）**：该目录已从部署中剔除（`build-all-decks.mjs` 注释说明其依赖的 zoom/notes/search/markdown
  插件在根级缺失、初始化即白屏），但源文件仍保留在仓库中。

### 1.5 多 deck 依赖与锁文件分裂（新增）

- **claude-from-zero 使用 npm 锁文件**：`ppt/claude-from-zero/` 下是 `package-lock.json`（npm 产物），
  而 `ppt/boris-five-roles-in-ai-native-teams/pnpm-lock.yaml` 和 `ppt/demo-slidev/pnpm-lock.yaml` 用 pnpm。
  `.github/workflows/deploy-pages.yml` 的 `cache-dependency-path: 'ppt/**/pnpm-lock.yaml'` 覆盖不到它，
  CI 中 `pnpm install`（`build-all-decks.mjs --install`）对该 deck 无锁文件可依，构建不可复现。
- **@slidev/cli 版本分裂**：boris 与 claude-from-zero 用 `^0.49.0`，demo-slidev 用 `^52.14.2`（Slidev 已弃用 0.x 版本线），
  三者无法共享升级经验，主题/组件 API 可能不兼容。
- **主题依赖用 `latest`**：三个 deck 的 `@slidev/theme-default`、`@slidev/theme-seriph` 均未锁版本，上游发布即漂移。
- **无 workspace**：每个 deck 独立 `node_modules`，CI 每次部署全量安装三个 deck，磁盘与时间成本随 deck 数线性增长。
- Fix approach：为 claude-from-zero 生成 `pnpm-lock.yaml` 并删除 `package-lock.json`；评估 pnpm workspace 统一管理；
  `latest` 改为显式版本。

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

- `ppt/poaa/index.html` 将 `https://www.baidu.com/s?wd=水箱` 作为 `data-background-iframe`，存在点击劫持和信息泄露风险。
- `ppt/light-travel/index.html` 嵌入 `https://image.baidu.com/...` 和 `https://www.cssworld.cn/`，同样存在不可控风险。

### 2.3 无 Content Security Policy

- 所有 HTML 文件均未设置 `<meta http-equiv="Content-Security-Policy">`，无法限制脚本来源、阻止内联脚本执行或限制 iframe 加载目标。

### 2.4 控制台输出敏感信息

- `ppt/poaa/index.html` 的 `slidechanged` 事件处理器中通过 `console.log` 输出帮助信息，包含可直接执行的 DOM 操作代码片段，在生产环境中可能暴露内部调试信息。

---

## 3. 性能瓶颈

### 3.1 首屏加载问题

- reveal.js 的 `dist/reveal.js` 和 `dist/reveal.css` 未压缩版本直接提供服务（通过 `http-server`）。
- 多个 iframe 背景幻灯片使用 `data-preload` 属性，导致页面初始化时并行加载大量 iframe 内容，首屏时间严重恶化。
- `ppt/light-travel/iframes/flash/index.html` 体积达 372KB，疑似内联了 base64 编码的图片资源。

### 3.2 大文件阻塞 Git 操作

- `ppt/poaa/snapshot.mp4`（11MB）每次修改都会生成新的 Git blob，即使只修改几字节也会复制整个文件，长期累积将严重拖慢 `git clone` 和 `git status`。

### 3.3 无资源优化策略

- 无图片压缩流程（ppt/poaa/cover.png 112KB 对一张封面图来说偏大）。
- 无代码分割：每个 iframe 都是独立的完整 HTML，公共 CSS/JS 未抽取。
- 无懒加载机制：非首屏 iframe 内容在页面加载时即全部请求。

---

## 4. 可维护性问题

### 4.1 构建工具链不完整（部分改善）

- **更新（2026-10-02）**：根 `package.json` 已不再是裸 `http-server`——新增 `dev:boris`/`dev:cfz`/`dev:demo`（子包转发）、
  `build:all`/`build:all:install`（`scripts/build-all-decks.mjs` 聚合构建）、`preview:all`（`dist-pages` 静态预览）；
  三个 Slidev deck 由 Slidev 内置 Vite 构建。
- **仍缺失**：根级 SCSS 文件（`css/reveal.scss`、`css/layout.scss`）仍无编译脚本，实际使用的是预编译的 `dist/reveal.css`，
  `.scss` 源文件与 `.css` 产物可能已不同步；老 reveal.js 分享（poaa/light-travel）依旧无构建、无打包。

### 4.2 根级包管理锁定文件的有效性存疑

- 根 `pnpm-lock.yaml` 仍为占位（114 字节），根 `package.json` 未声明任何生产依赖，根锁定文件实际未锁定任何有意义的依赖版本；
  实际依赖管理已下沉到各 deck（见 1.5，但各 deck 之间不一致）。
- `http-server` 仍未作为项目依赖管理：`start`/`dev` 脚本假定全局安装，`preview:all` 用 `npx --yes http-server` 临时拉取。

### 4.3 文档与代码脱节（部分修复）

- **已修复（2026-10-02）**：`Readme.md` 已重写为多 deck 线上入口清单，原 `claude-from-zerro` 拼写错误不复存在。
- `ppt/poaa/index.md` 是讲稿/提纲，但 `ppt/poaa/index.html` 是实际演示文件，两者内容不同步（HTML 中无 Markdown 内容引用机制）。
- `ppt/claude-from-zero/design.md` 中引用的外部路径（如 `~/Github/Lionad-Morotar/claude-from-zero/...`）使用绝对路径，
  在其他机器上无法访问；该 deck 已用 Slidev 实现落地，design.md 现为历史设计稿。

### 4.4 有部署流水线、无测试（部分改善）

- **更新（2026-10-02）**：`.github/workflows/deploy-pages.yml` 已建立 CI/CD——push main 且 `ppt/**`、构建脚本或 workflow 自身变更时，
  聚合构建全部分享并发布 GitHub Pages（pnpm 缓存按 `ppt/**/pnpm-lock.yaml` glob 命中，concurrency 排队不取消，避免半成品上线）。
- **仍缺失**：无任何测试框架配置——静态 deck 无"能打开、能翻页"的冒烟验证，Slidev deck 无组件/引擎测试
  （boris deck 的自研 ThreeJS 引擎见 7.5）；预提交钩子仍不存在。

---

## 5. 缺失工具链

| 工具类型 | 状态 | 影响 |
|---------|------|------|
| ESLint | 缺失 | JS 代码无静态检查（唯一近似物：cfz 的 `pnpm lint:terms` 术语校验，`ppt/claude-from-zero/scripts/validate-terms.mjs`） |
| Prettier | 缺失（仓库级配置） | 代码格式不统一 |
| TypeScript | 部分 | 仅 boris deck 有 `tsconfig.engine.json` 覆盖其引擎代码，其余 deck 与根层面无类型检查 |
| SCSS 编译器 | 缺失 | 根级 `.scss` 文件无法直接使用 |
| 构建工具 (Vite/Webpack) | 部分（2026-10-02） | 三个 Slidev deck 已由 Vite 构建并聚合到 `dist-pages/`；老 reveal.js 分享仍无构建、无资源优化 |
| 测试框架 | 缺失 | 无法回归验证 |
| Git LFS | 缺失 | 大文件直接污染 Git 历史 |
| Husky / lint-staged | 缺失 | 提交前无质量门禁 |
| CI/CD | 已有部署流水线（2026-10-02） | `deploy-pages.yml` 负责构建发布；无测试门禁，坏 deck 会被照常部署上线 |
| Renovate/Dependabot | 部分（仅 renovate.json） | 未实际配置自动化依赖更新 |

---

## 6. 子项目间不一致

### 6.1 技术栈分裂

| 子项目 | 框架 | 路径风格 | 内容格式 |
|-------|------|---------|---------|
| `ppt/poaa/` | reveal.js (HTML) | 相对路径 `../../` | 纯 HTML |
| `ppt/light-travel/` | reveal.js (HTML) | 绝对路径 `/` | 纯 HTML |
| `ppt/demo/` | reveal.js (HTML) | 绝对路径 `/` | 官方示例复制（不部署） |
| `ppt/boris-five-roles-in-ai-native-teams/` | **Slidev ^0.49.0**（2026-10-02 新增） | 构建期注入 `--base` | Markdown + Vue 组件 + 自研 ThreeJS 引擎 |
| `ppt/claude-from-zero/` | **Slidev ^0.49.0**（已实现） | 构建期注入 `--base` | Markdown + Vue 组件 |
| `ppt/demo-slidev/` | **Slidev ^52.14.2**（已初始化） | 构建期注入 `--base` | Markdown 功能演示 |

- Slidev deck 内部也分裂：boris/cfz 停在 0.49 版本线，demo-slidev 用 52.x（见 1.5）。

### 6.2 路径引用混乱（构建期已兜底）

- `ppt/poaa/` 使用 `../../dist/reveal.js`，`ppt/light-travel/` 使用 `/dist/reveal.js`，源码层面仍不统一。
- **更新（2026-10-02）**：`scripts/build-all-decks.mjs` 在构建期统一重写为 `/ppt/dist|plugin/` 并把根级 `dist/`、`plugin/`
  复制到部署根，两者已在同一基路径（`github.io/ppt/<deck>/`）下正常工作；源码统一降为低优先的整洁问题。

### 6.3 主题与样式不统一

- `ppt/poaa/` 使用 `serif.css` 主题
- `ppt/light-travel/` 也使用 `serif.css` 主题，但额外引入了 `/plugin/styles/ppt.css`
- `ppt/demo/` 使用 `black.css` 主题
- Slidev deck 使用 `theme-default`/`theme-seriph`，各 deck 另带自定义样式（如 `ppt/boris-five-roles-in-ai-native-teams/setup/deck.css`）
- 无统一的品牌或视觉规范

---

## 7. Slidev 迁移现状

### 7.1 demo-slidev 已初始化（已解决）

- **更新（2026-10-02）**：`ppt/demo-slidev/` 已从空目录变为正式 Slidev 项目（`slides.md`、`pages/`、`snippets/`、
  `pnpm-lock.yaml`），定位为 Slidev 功能演示 deck；目录内残留 `netlify.toml`、`vercel.json` 等其他平台部署配置，
  与当前 GitHub Pages 部署策略无关，属于配置噪音。

### 7.2 内容迁移复杂度（仍然成立）

- **poaa** 和 **light-travel** 均大量使用 reveal.js 特有功能：
  - `data-background-iframe`（嵌入 iframe 作为幻灯片背景）
  - `data-preload`（预加载 iframe）
  - `data-background-interactive`（允许 iframe 交互）
  - `fragment` 类（逐段显示动画）
  - `data-auto-animate`（跨幻灯片自动动画）
- Slidev 不支持 `data-background-iframe`，这是最大的迁移障碍。poaa 和 light-travel 中超过 50% 的幻灯片依赖此功能展示交互式 CSS 演示。

### 7.3 claude-from-zero 已实现（已解决）

- **更新（2026-10-02）**：原"设计文档与实现脱节"已消除——`ppt/claude-from-zero/` 已用 Slidev 落地
  （`slides.md`、`setup/`、`components/`、`styles/`），mermaid 等诉求由 Slidev 生态满足；
  `design.md` 保留为历史设计稿。项目附带的 `.claude/slidev-dom-structure.md` 记录了 Slidev DOM 常驻、
  跨 slide 查询需过滤可见页的测试经验。

### 7.4 各子项目落地状态

| 子项目 | 当前策略 | 状态 |
|-------|---------|------|
| `ppt/poaa/` | 保留 reveal.js，构建期路径重写 | 已落地，未迁移 |
| `ppt/light-travel/` | 同上 | 已落地，未迁移 |
| `ppt/claude-from-zero/` | Slidev 实现 | 已完成 |
| `ppt/demo/` | 保留源码、不纳入部署 | 按此处理（依赖插件缺失，白屏） |
| `ppt/demo-slidev/` | Slidev 功能演示 | 已完成 |
| `ppt/boris-five-roles-in-ai-native-teams/` | Slidev + 自研 ThreeJS 引擎 | 已完成（2026-10-02 新增） |

### 7.5 自研 ThreeJS 引擎无测试（新增）

- `ppt/boris-five-roles-in-ai-native-teams/three/`（`core/`、`effects/`、`stage/`、`index.ts`、`types.ts`，配套 `tsconfig.engine.json`）
  与 `setup/main.ts`（270 行）构成一套自研 ThreeJS 引擎：camera/renderer/sizes/debug、waveGrid、cubeInspector、mouseTrail、
  自定义 shader 等，约 10 个模块仅服务这一个 deck 的演示效果。
- 影响：修改引擎或升级 `three`（当前 ^0.185.1）无回归保障；复用到其他 deck 需要先行抽象。
- 建议：作为演示代码可接受；若后续第二个 deck 复用，再抽为共享包并补最小渲染冒烟测试。

---

## 8. 优先级排序

### P0（立即处理）

1. **将大文件移出 Git**：使用 Git LFS 或外部存储托管 `ppt/poaa/snapshot.mp4` 和 `cover.png`（仍开放）
2. ~~统一路径引用~~ → 部署层面已由 `scripts/build-all-decks.mjs` 构建期重写解决（2026-10-02）；源码层面统一降为低优先
3. ~~修复 Readme.md 拼写错误~~ → 已完成，`Readme.md` 已重写为多 deck 入口清单（2026-10-02）

### P1（近期处理）

4. ~~初始化 demo-slidev 为正式 Slidev 项目~~ → 已完成（2026-10-02）
5. ~~引入构建工具链~~ → 部分完成：Slidev deck + `build:all` 聚合构建已落地；老 reveal.js 分享与根级 SCSS 编译仍缺
6. **统一 deck 包管理器与锁文件**（新增，2026-10-02）：为 `ppt/claude-from-zero/` 补 `pnpm-lock.yaml` 并删除 `package-lock.json`，
   对齐三个 deck 的 `@slidev/cli` 版本线，主题依赖去 `latest`（见 1.5）
7. **添加 ESLint + Prettier 配置**（仍开放）
8. **为外部资源添加 SRI 或迁移到本地**（仍开放）

### P2（中期规划）

9. **评估 reveal.js 子项目向 Slidev 的可迁移性**，特别是 iframe 背景功能（仍开放）
10. ~~建立 CI/CD 流程~~ → 部署流水线已完成（`.github/workflows/deploy-pages.yml`，2026-10-02）；补测试门禁仍开放
11. ~~引入 TypeScript~~ → 部分达成：boris deck 引擎代码已用 TS（`tsconfig.engine.json`）；推广到其余 deck 仍开放
12. **添加测试覆盖**（至少验证各 deck 能正常构建/加载）（仍开放）

### P3（长期优化）

13. **统一视觉主题和品牌规范**（仍开放）
14. **重构 iframe 演示为可复用组件**（仍开放）
15. **评估 pnpm workspace 统一管理多 deck 依赖**（新增，2026-10-02，见 1.5）

---

*初析 2026-04-28 · 更新 2026-10-02（forge → boris deck 迁移、GitHub Pages 聚合部署、多 deck 构建编排落地后修订）*
