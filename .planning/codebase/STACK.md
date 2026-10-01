# 技术栈清单

**更新日期：** 2026-10-02

## 项目概述

技术分享 PPT 集合仓库，双技术栈并存：

- **reveal.js 静态 HTML 分享**（`ppt/poaa/`、`ppt/light-travel/`）：预构建分发，无编译步骤，依赖根级 `dist/`、`plugin/` 共享资源
- **Slidev 分享**（`ppt/boris-five-roles-in-ai-native-teams/`、`ppt/claude-from-zero/`、`ppt/demo-slidev/`）：Vue 3 + Vite 驱动，各 deck 独立 `package.json` 与 lockfile

由 `scripts/build-all-decks.mjs` 聚合构建到 `dist-pages/`，经 `.github/workflows/deploy-pages.yml` 发布到 GitHub Pages。

## 编程语言

| 语言 | 用途 | 文件位置 |
|------|------|----------|
| HTML | 幻灯片内容结构 | `ppt/poaa/index.html`, `ppt/light-travel/index.html` |
| CSS | 幻灯片样式、主题 | `dist/theme/*.css`, `plugin/styles/ppt.css`, `ppt/*/setup/deck.css` |
| SCSS | reveal.js 源码样式（预编译） | `css/reveal.scss`, `css/layout.scss`, `css/theme/source/` |
| JavaScript | 幻灯片交互逻辑、插件、构建脚本 | `dist/reveal.js`, `plugin/*/*.js`, `scripts/build-all-decks.mjs` |
| TypeScript | Slidev deck 逻辑、Three.js 引擎 | `ppt/*/setup/*.ts`, `ppt/boris-five-roles-in-ai-native-teams/three/**/*.ts` |
| Vue SFC | Slidev 自定义幻灯片组件 | `ppt/*/components/*.vue` |
| Markdown | Slidev 幻灯片源、讲稿文稿、设计文档 | `ppt/*/slides.md`, `ppt/*/design.md`, `ppt/boris-five-roles-in-ai-native-teams/thoughts.md` |

## 核心框架

### reveal.js v4.0.2

- **用途**: HTML 演示文稿框架（老分享）
- **位置**: `dist/reveal.js`, `dist/reveal.esm.js`, `dist/reveal.css`
- **官网**: https://revealjs.com
- **作者**: Hakim El Hattab
- **许可证**: MIT
- **功能特性**:
  - 水平/垂直幻灯片导航
  - 幻灯片过渡动画（fade、slide、convex、concave、zoom 等）
  - 代码高亮（highlight.js 集成）
  - Markdown 支持
  - 演讲者视图（Speaker View）
  - PDF 导出
  - 自动动画（Auto-Animate）
  - 背景图片/视频/iframe 嵌入
  - 触摸设备优化
  - 键盘快捷键自定义
  - 片段动画（Fragments）

### Slidev

- **用途**: 开发者向 Markdown 幻灯片框架（新分享），内部基于 Vite + Vue 3
- **版本不一致注意**: `@slidev/cli` 在 boris/claude-from-zero 为 `^0.49.0`，在 demo-slidev 为 `^52.14.2`
- **位置**: `ppt/boris-five-roles-in-ai-native-teams/package.json`, `ppt/claude-from-zero/package.json`, `ppt/demo-slidev/package.json`
- **约定**: 每个 deck 的 `setup/main.ts` 为 Slidev 全局 setup 入口，`setup/mermaid.ts` 配置内置 Mermaid 主题，`setup/deck.css` 为 deck 级样式，`components/` 下的 Vue 组件可在 slides.md 中直接使用
- **导出**: `playwright-chromium`（仅 boris deck devDependencies）用于 `slidev export` 生成 PDF/PPTX

### Three.js ^0.185.1（仅 boris deck）

- **用途**: 首页 3D 波浪网格背景、立方体检视等效果
- **位置**: `ppt/boris-five-roles-in-ai-native-teams/three/`（自研引擎，框架无关，整目录可迁移）
  - `core/`: `camera.ts`、`renderer.ts`、`sizes.ts`（含 `capPixelRatio`）、`debug.ts`（lil-gui 面板）、`waveGridEngine.ts`
  - `effects/`: `cubeInspector.ts`、`mouseTrail.ts`、`vignetteRGBShiftShader.ts`（自定义后处理 shader）
  - `stage/`: `waveGridStage.ts`、`waveShaderChunks.ts`
  - `index.ts`: 统一出口；`types.ts`: `WaveParams`/`TrailPoint` 等类型
- **独立 TS 配置**: `ppt/boris-five-roles-in-ai-native-teams/tsconfig.engine.json`
- **配套依赖**: `@types/three`、`lil-gui`（调试面板）、`@vueuse/core`

## 插件系统

| 插件 | 用途 | 文件 |
|------|------|------|
| Highlight | 代码语法高亮 | `plugin/highlight/highlight.js`, `plugin/highlight/plugin.js` |
| Highlight Theme | 代码高亮主题（monokai、zenburn） | `plugin/highlight/monokai.css`, `plugin/highlight/zenburn.css` |
| Custom Styles | 自定义 PPT 样式覆盖 | `plugin/styles/ppt.css` |
| jQuery | DOM 操作辅助（部分 iframe demo） | `plugin/js/jquery.js` |

> 注：reveal.js 内置插件（zoom、notes、search、markdown）在 `dist/reveal.js` 中已打包，demo.html 中通过独立脚本引用。

## 主题系统

reveal.js 内置 11 款主题，位于 `dist/theme/`：

| 主题 | 文件 | 用途 |
|------|------|------|
| Black | `black.css` | 深色默认主题 |
| White | `white.css` | 浅色主题 |
| League | `league.css` | 深色加粗主题 |
| Sky | `sky.css` | 蓝色渐变主题 |
| Beige | `beige.css` | 米色主题 |
| Simple | `simple.css` | 极简主题 |
| Serif | `serif.css` | **POAA、Light Travel 使用** |
| Blood | `blood.css` | 暗红主题 |
| Night | `night.css` | 深蓝夜间主题 |
| Moon | `moon.css` | 蓝灰主题 |
| Solarized | `solarized.css` | Solarized 配色 |

主题源码（SCSS）位于 `css/theme/source/`，模板位于 `css/theme/template/`。

Slidev deck 使用 `@slidev/theme-default`、`@slidev/theme-seriph`（各 deck package.json 均声明 `latest`），deck 观感由 `setup/deck.css` 变量（如 boris deck 的 `--deck-bg` 暖色系）与 Mermaid 主题配置定制。

## 构建工具

双构建形态：

- **reveal.js 老分享**：预构建分发，`dist/` 内为已编译 JS/CSS，SCSS 源码存在但无编译脚本
- **Slidev deck**：`slidev build`（内部 Vite），聚合构建时通过 `--base /ppt/<deck>/` 注入子路径、`--out` 指定输出目录
- **聚合编排**：`scripts/build-all-decks.mjs`（Node ESM，仅用 `node:fs`/`node:path`/`node:child_process`，无三方依赖）
  - deck 清单集中在脚本顶部 `SLIDEV_DECKS` / `STATIC_DECKS` 数组，新增 deck 只改这一处
  - 将根级 `dist/`、`plugin/` 复制到 `dist-pages/ppt/` 站点根，并用正则重写静态 HTML 中 `../../dist/`、`/dist/` 等引用为 `/ppt/dist|plugin/`（避免子路径部署 404）
  - 生成聚合入口 `dist-pages/ppt/index.html`
  - `ppt/demo/`（reveal.js 官方测试 demo）因缺插件会白屏，**不纳入部署**（源文件保留）
  - `--install` 标志：先对全部 Slidev deck 执行 `pnpm install`（CI 使用）
- **CI**：`.github/workflows/deploy-pages.yml` 在 push main 时跑 `node scripts/build-all-decks.mjs --install`

## 包管理器

- **pnpm**（根目录及各 Slidev deck 均有 `pnpm-lock.yaml`）
- CI 固定 pnpm 9（`pnpm/action-setup@v4`），依赖缓存经 `cache-dependency-path: ppt/**/pnpm-lock.yaml`
- 例外：`ppt/claude-from-zero/` 使用 `package-lock.json`（npm），与其余 deck 不一致
- `.npmrc` 配置：`min-release-age=7`

## 开发服务器

| 命令 | 用途 | 端口 |
|------|------|------|
| `pnpm start` / `pnpm dev` | 根目录静态服务（http-server，dev 无缓存） | 9999 |
| `pnpm dev:boris` | boris deck（Slidev） | 4945 |
| `pnpm dev:cfz` | claude-from-zero deck（Slidev） | 3411 |
| `pnpm dev:demo` | demo-slidev deck（Slidev） | 12983 |
| `pnpm build:all` | 聚合构建全部分享到 `dist-pages/ppt/` | - |
| `pnpm build:all:install` | 同上，先对各 deck `pnpm install` | - |
| `pnpm preview:all` | http-server 服务 `dist-pages/`（与线上一致，访问 `/ppt/`） | 8080 |

## 项目结构

```
ppt/                                      # 仓库根
├── .github/workflows/
│   └── deploy-pages.yml                  # GitHub Pages 聚合部署 workflow
├── scripts/
│   └── build-all-decks.mjs               # 多 deck 聚合构建编排
├── css/                                  # SCSS 源码（reveal.js 主题源码）
│   ├── reveal.scss
│   ├── layout.scss
│   ├── print/                            # PDF 打印样式
│   └── theme/                            # 主题源码与模板
├── dist/                                 # 编译后的 reveal.js 资源（老分享共享，部署时复制到站点根）
│   ├── reveal.js                         # 核心框架（UMD，v4.0.2）
│   ├── reveal.esm.js                     # ES Module 版本
│   ├── reveal.css / reset.css
│   └── theme/                            # 编译后的主题 CSS
├── plugin/                               # reveal.js 插件（老分享共享）
│   ├── highlight/                        # 代码高亮插件
│   ├── js/                               # jQuery
│   └── styles/                           # 自定义样式
├── ppt/                                  # 各期分享内容
│   ├── boris-five-roles-in-ai-native-teams/  # 《AI 原生团队五种人》Slidev deck（Three.js 引擎）
│   ├── claude-from-zero/                 # 《Claude from ZERO》Slidev deck（Vue 组件可视化）
│   ├── demo-slidev/                      # 《Slidev 功能演示》deck
│   ├── demo/                             # reveal.js 官方 demo（不部署）
│   ├── light-travel/                     # 《CSS 光影魔法》静态 HTML
│   └── poaa/                             # 《CSS 抗锯齿方案 POAA》静态 HTML
├── dist-pages/                           # 聚合构建产物（gitignore，部署根为 dist-pages/ppt/）
├── package.json                          # 根编排 scripts（dev:* / build:all* / preview:all）
├── pnpm-lock.yaml
└── .npmrc
```

## 各期分享技术特点

| 分享 | 路径 | 核心技术 |
|------|------|----------|
| AI 原生团队五种人 | `ppt/boris-five-roles-in-ai-native-teams/` | Slidev 0.49 + Three.js 自研波浪网格引擎（waveGrid、cubeInspector、mouseTrail、vignette/RGBShift 后处理）、Mermaid 图表、自定义组件（`components/CmptPanel.vue` 放大 overlay、`PreviewIcon.vue`、`SlideFooter.vue`）、Boris Cherny 访谈 transcript（`assets/youtube/en|zh/` 各 6 份） |
| Claude from ZERO | `ppt/claude-from-zero/` | Slidev 0.49、Mermaid、18 个自定义 Vue 组件（`NeuralNetwork.vue`、`GradientDescentViz.vue`、`ReActCycle.vue`、`OpenClawArchitecture.vue`、`TokenizationFlow.vue` 等）、术语校验脚本 `scripts/validate-terms.mjs`（`lint:terms`） |
| Slidev 功能演示 | `ppt/demo-slidev/` | Slidev 52 模板演示（含 `pages/`、`snippets/`） |
| CSS 抗锯齿方案 POAA | `ppt/poaa/` | CSS `repeating-linear-gradient`、CSS 变量、SVG filter |
| CSS 光影魔法 | `ppt/light-travel/` | SVG `feTurbulence`、`feDiffuseLighting`、CSS 滤镜、iframe 嵌入 demo |
| Demo | `ppt/demo/` | reveal.js 官方完整功能演示（不纳入部署） |

## 嵌入 Demo（iframe）

### light-travel 光影效果 demo

位于 `ppt/light-travel/iframes/`，均为独立 HTML 页面：

- `shadow-normal/` - 普通阴影效果
- `long-shadow/` - 长阴影效果
- `color-shadow/` - 彩色阴影
- `reflect/` - 倒影效果
- `flash/` - 高光效果
- `material-picture/` - 材质贴图（含 small 版本）
- `soil-material/` - 土壤纹理（SVG feTurbulence）
- `stone-material/` - 石英石纹理
- `zebra-material/` - 斑马纹理
- `dropplets/` - 水滴效果（菲涅尔效应）
- `book-cover/1.html`, `2.html`, `3.html` - 书籍封面效果

### poaa 交互 demo

位于 `ppt/poaa/iframes/`：

- `blueprint/` - CSS 蓝图效果
- `accordion/` - 手风琴动画
- `artdraw/` - CSS 艺术绘画
- `aritecture/` - CSS 建筑/3D 效果

---

*Stack 更新：2026-10-02*
