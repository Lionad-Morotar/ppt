# 外部集成与依赖清单

**更新日期：** 2026-10-02

## CI/CD 与部署（GitHub Pages）

- **Workflow**: `.github/workflows/deploy-pages.yml`
- **触发**: push 到 main 且 paths 命中（`ppt/**`、`scripts/build-all-decks.mjs`、workflow 自身），或手动 `workflow_dispatch`
- **并发控制**: group `pages`，排队不取消（避免半成品上线）
- **步骤链**: `actions/checkout@v4` → `pnpm/action-setup@v4`（pnpm 9）→ `actions/setup-node@v4`（`lts/*`，cache pnpm，`cache-dependency-path: ppt/**/pnpm-lock.yaml`）→ `node scripts/build-all-decks.mjs --install` → `actions/configure-pages@v4` → `actions/upload-pages-artifact@v3`（path `dist-pages/ppt`）→ `actions/deploy-pages@v4`
- **认证**: GitHub Pages OIDC（`pages: write` + `id-token: write`），仅用内置 GITHUB_TOKEN，无自定义 secrets
- **线上地址**: `https://lionad-morotar.github.io/ppt/<deck>/`，deck 清单由 `scripts/build-all-decks.mjs` 顶部数组维护
- **注意**: 新仓库首次部署需在 GitHub 仓库 Settings → Pages → Source 选择 "GitHub Actions"

### 遗留的第三方部署配置（未使用）

- `ppt/demo-slidev/netlify.toml`、`ppt/demo-slidev/vercel.json` 为 Slidev 模板残留（`npm run build`），实际部署统一走 GitHub Pages，不生效

## CDN 与外部资源

### 图片资源

| 服务 | 用途 | 引用位置 |
|------|------|----------|
| **mgear-image.oss-cn-shanghai.aliyuncs.com** | 个人图床（阿里云 OSS），存放分享用截图和素材 | `ppt/light-travel/index.html`, `ppt/poaa/index.html`, `ppt/claude-from-zero/design.md` |
| **cdn.jsdelivr.net/gh/Lionad-Morotar/blog-cdn/** | jsDelivr CDN（GitHub 图床加速），存放 GIF 演示 | `ppt/poaa/index.html` |
| **static.slid.es** | reveal.js 官方静态资源（logo、箭头、占位图） | `ppt/demo/demo.html` |

> Slidev deck（boris、claude-from-zero、demo-slidev）的资源全部本地打包（`assets/`、`public/`），不依赖外部 CDN。

### 外部网站嵌入（iframe）

| 网站 | 用途 | 引用位置 |
|------|------|----------|
| **baidu.com** | 百度搜索页面演示（展示页面由盒子组成） | `ppt/poaa/index.html` |
| **cssworld.cn** | 张鑫旭 CSS 世界网站展示 | `ppt/light-travel/index.html` |
| **elrumordelaluz.github.io/csshake** | CSS Shake 库演示 | `ppt/poaa/index.html` |
| **bert.stuy.edu/pbrooks/graphics/demos/BresenhamDemo.htm** | Bresenham 直线算法演示 | `ppt/poaa/index.html` |
| **hakim.se** | reveal.js 作者主页（iframe 背景演示） | `ppt/demo/demo.html` |
| **slideshare.net** | SlideShare 嵌入（PDF 导出演示） | `ppt/demo/demo.html` |
| **image.baidu.com** | 百度搜索图片（材质贴图关键词） | `ppt/light-travel/index.html` |
| **youmind.com** | Youmind AI 工具（Agent 模式展示） | `ppt/claude-from-zero/design.md` |

### 文档与参考链接

| 网站 | 用途 | 引用位置 |
|------|------|----------|
| **docs.unity.cn** | Unity 中文文档（三种光源类型图示） | `ppt/light-travel/index.html` |
| **revealjs.com** | reveal.js 官方文档链接 | `ppt/demo/demo.html` |
| **highlightjs.org** | Highlight.js 官网 | `ppt/demo/demo.html` |
| **github.com/hakimel/reveal.js** | reveal.js 源码仓库 | `ppt/demo/demo.html` |
| **api-docs.deepseek.com** | DeepSeek API 文档（V4 预览版新闻） | `ppt/claude-from-zero/design.md` |
| **sourcingdenis.medium.com** | CRISPE 提示词框架文章（`PreviewIcon` 外链） | `ppt/claude-from-zero/slides.md` |
| **modelcontextprotocol.io** | MCP 官方文档（`PreviewIcon` 外链） | `ppt/claude-from-zero/slides.md` |

> `components/PreviewIcon.vue`（boris 与 claude-from-zero deck 各有一份）仅渲染可点击外链，不抓取外部截图、无运行时网络请求。

## 第三方库与工具

### 直接引入（本地文件 / npm 依赖）

| 库 | 版本 | 用途 | 位置 |
|----|------|------|------|
| **reveal.js** | 4.0.2 | HTML 演示框架核心 | `dist/reveal.js`, `dist/reveal.esm.js` |
| **highlight.js** | 内置 | 代码语法高亮 | `plugin/highlight/highlight.js` |
| **jQuery** | 未标注 | DOM 操作（部分 demo 使用） | `plugin/js/jquery.js` |
| **@slidev/cli** | ^0.49.0 / ^52.14.2 | Markdown 幻灯片框架（boris、claude-from-zero 用 0.49；demo-slidev 用 52） | 各 deck `package.json` |
| **three** | ^0.185.1 | Three.js 3D 渲染（自研波浪网格引擎） | `ppt/boris-five-roles-in-ai-native-teams/three/` |
| **@vueuse/core** | ^10.9.0 | Vue 组合式工具（如 `onKeyStroke`，用于放大 overlay 快捷键） | boris、claude-from-zero deck |
| **lil-gui** | ^0.21.0 | Three.js 引擎调试面板（`three/core/debug.ts`） | boris deck |
| **lucide-vue-next** | ^1.0.0 | Vue 图标组件 | boris、claude-from-zero deck |
| **playwright-chromium** | ^1.61.1（devDep） | `slidev export` 导出 PDF/PPTX | boris deck |

### Slidev 内置能力（经配置使用，非直接依赖）

- **Mermaid**: Slidev 内置渲染，主题经 `ppt/boris-five-roles-in-ai-native-teams/setup/mermaid.ts`、`ppt/claude-from-zero/setup/mermaid.ts` 配置（base 主题 + 暖色 themeVariables + themeCSS 注入）；交互增强（双击放大）在 `setup/main.ts`

### CodePen 外部 demo 引用

poaa 讲稿中引用的外部 CodePen 示例（仅链接，非直接嵌入）：

| CodePen | 作者 | 效果 |
|---------|------|------|
| [oliviale/moLrBq](https://codepen.io/oliviale/pen/moLrBq) | oliviale | 蓝图（Blueprint） |
| [danwilson/BRdJVZ](https://codepen.io/danwilson/pen/BRdJVZ) | danwilson | 手风琴（Accordion） |
| [hailedev/OJyvvVQ](https://codepen.io/hailedev/pen/OJyvvVQ) | hailedev | CSS MC |
| [ricardoolivaalonso/yLOpNdZ](https://codepen.io/ricardoolivaalonso/pen/yLOpNdZ) | ricardoolivaalonso | CSS 建筑 |
| [ivorjetski/xxGYWQG](https://codepen.io/ivorjetski/full/xxGYWQG) | ivorjetski | CSS 风景 |
| [cobra_winfrey/zYvdKPG](https://codepen.io/cobra_winfrey/pen/zYvdKPG) | cobra_winfrey | SVG Pattern |
| [connoratherton.com/loaders](https://connoratherton.com/loaders) | connoratherton | CSS Loading |
| [css-doodle.com](https://css-doodle.com/) | yuanchuan | CSS Doodle |
| [marc-roig/Bresenham2D](https://marc-roig.github.io/Bresenham_Visualization/Bresenham2D/) | marc-roig | Bresenham 2D 可视化 |

light-travel 中部分 iframe demo 参考了 CodePen 作品（源码注释标注原始链接）。

## 字体

| 字体 | 来源 | 用途 |
|------|------|------|
| **League Gothic** 等 | 主题内置（`dist/theme/fonts/`） | reveal.js 主题字体 |
| **Google Fonts (Roboto Condensed, Oswald)** | CDN | light-travel book-cover demo |
| **Avenir Next, PingFang SC 等** | 系统字体栈 | boris deck Mermaid 配置（`setup/mermaid.ts` 的 `fontFamily`），无外部字体请求 |

## 媒体资源

| 文件 | 类型 | 用途 | 位置 |
|------|------|------|------|
| `cover.png` | PNG 图片 | POAA 分享封面 | `ppt/poaa/cover.png` |
| `snapshot.mp4` | MP4 视频 | POAA 演示录像 | `ppt/poaa/snapshot.mp4` |
| `boris-cherny.jpg` | PNG/JPG 图片 | boris deck 封面人物图 | `ppt/boris-five-roles-in-ai-native-teams/public/boris-cherny.jpg` |
| `assets/youtube/en/*.txt` | 文本 | Boris Cherny 访谈英文 transcript（6 份：lenny、scale、acquired、yc、kantrowitz、sequoia） | `ppt/boris-five-roles-in-ai-native-teams/assets/youtube/en/` |
| `assets/youtube/zh/*.txt` | 文本 | 上述访谈的中文译 transcript（6 份） | `ppt/boris-five-roles-in-ai-native-teams/assets/youtube/zh/` |

## 个人服务与账号

| 服务 | 用途 |
|------|------|
| **GitHub (Lionad-Morotar)** | 源码托管、博客 CDN（jsDelivr 加速）、GitHub Pages 部署 |
| **阿里云 OSS (mgear-image)** | 个人图床，存放分享素材 |
| **lionad.art** | 个人博客，POAA 文章原文 |

## claude-from-zero 原规划集成的落地现状

`ppt/claude-from-zero/design.md` 中规划的集成已随 deck Slidev 化大部分落地：

- **Mermaid 图表**: 已实现 — `ppt/claude-from-zero/setup/mermaid.ts` 主题配置 + `setup/main.ts` 交互增强
- **HTML 动画/可视化**: 已实现 — `ppt/claude-from-zero/components/` 下 18 个自定义 Vue 组件（`NeuralNetwork.vue`、`GradientDescentViz.vue`、`ReActCycle.vue`、`ReActOrbit.vue`、`OpenClawArchitecture.vue`、`TokenizationFlow.vue`、`ProbabilityBars.vue` 等）
- **部署**: 已实现 — GitHub Pages 聚合部署（见上文 CI/CD 节），原规划的 "Nuxt 网站部署" 方案未采用
- **Youmind 实时演示**: 仍仅停留在 `design.md` 规划，未进入 `slides.md`

---

*Integration 更新：2026-10-02*
