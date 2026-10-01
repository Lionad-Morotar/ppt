<!-- refreshed: 2026-10-02 -->
# PPT 项目架构文档

## 1. 整体系统概述

本项目是一个多技术分享 PPT 集合仓库，采用"共享框架 + 子项目 + 聚合部署"的架构模式，两类技术栈并存：

- **根目录**：reveal.js 核心框架（CSS、JS、插件、主题），服务老式静态 deck
- **`ppt/` 目录**：各个独立的演示文稿子项目
- **聚合构建与部署层**：`scripts/build-all-decks.mjs` + `.github/workflows/deploy-pages.yml`，统一构建到 `dist-pages/ppt/` 发布 GitHub Pages

两类 deck 技术栈：

| 栈 | deck | 构建方式 |
|----|------|----------|
| reveal.js 静态 HTML | `ppt/poaa/`、`ppt/light-travel/`、`ppt/demo/` | 无构建，静态直浏览 |
| Slidev（Vue 3） | `ppt/boris-five-roles-in-ai-native-teams/`、`ppt/claude-from-zero/`、`ppt/demo-slidev/` | `slidev build --base`，各 deck 自含 `package.json` 与 lockfile |

### 1.1 设计哲学

- **单文件 HTML 演示**（reveal.js deck）：每个 PPT 是一个独立的 `index.html`，通过 `<section>` 标签定义幻灯片
- **框架共享**（reveal.js deck）：所有老 deck 共享根目录的 reveal.js 运行时、主题和插件
- **iframe 嵌入**（reveal.js deck）：复杂交互/动画通过 `data-background-iframe` 嵌入独立 HTML 页面
- **Markdown + 组件**（Slidev deck）：`slides.md` 单文件承载内容，`components/*.vue` 自动注册，`setup/main.ts` 注入全局常驻行为
- **deck 清单集中维护**：新增分享只需放进 `ppt/<deck>/` 并在 `scripts/build-all-decks.mjs` 顶部的数组加一行
- **本地可复现 CI**：聚合行为收口在独立 Node 脚本，`pnpm build:all` + `pnpm preview:all` 与线上形态一致
- **子路径部署对齐**：所有产物路径对齐 `https://lionad-morotar.github.io/ppt/<deck>/`（base = `/ppt/<deck>/`）

---

## 2. reveal.js 框架结构

### 2.1 核心运行时

```
dist/
├── reset.css          # CSS 重置（Normalize）
├── reveal.css         # 核心样式（幻灯片布局、过渡动画、控制组件）
├── reveal.js          # UMD 格式核心 JS
└── reveal.esm.js      # ESM 格式核心 JS
```

核心框架提供以下能力：

| 能力 | 说明 |
|------|------|
| 幻灯片导航 | 水平/垂直方向键盘/触摸导航 |
| 过渡动画 | slide、convex、concave、zoom、cube、page、fade、none 等 |
| Fragment 动画 | 逐元素出现动画（fade、grow、shrink、highlight 等） |
| 背景系统 | 支持颜色、图片、视频、iframe 背景 |
| 概览模式 | 缩略图总览 |
| 演讲者备注 | `aside.notes` 隐藏备注 |
| 打印/PDF 导出 | 专用打印样式 |

### 2.2 幻灯片数据模型

```html
<div class="reveal">
  <div class="slides">
    <!-- 水平幻灯片 -->
    <section>Slide 1</section>
    <!-- 嵌套垂直幻灯片 -->
    <section>
      <section>Sub 1</section>
      <section>Sub 2</section>
    </section>
  </div>
</div>
```

- 一级 `<section>`：水平方向幻灯片
- 嵌套 `<section>`：垂直方向子幻灯片（按 Space 遍历全部）
- `data-*` 属性：控制过渡、背景、动画等行为

---

## 3. 插件架构

插件位于 `plugin/` 目录，采用 reveal.js 标准插件接口：

```
plugin/
├── highlight/         # 代码高亮插件
│   ├── plugin.js      # 插件入口（highlight.js 集成 + 行号）
│   ├── highlight.js   # highlight.js UMD 构建
│   ├── highlight.esm.js
│   ├── monokai.css    # 代码主题：Monokai
│   └── zenburn.css    # 代码主题：Zenburn
├── js/
│   └── jquery.js      # jQuery（遗留依赖）
└── styles/
    └── ppt.css        # 自定义 PPT 全局样式覆盖
```

### 3.1 插件加载方式

在 HTML 中通过 `<script>` 标签引入插件脚本，reveal.js 初始化时自动识别：

```html
<script src="../../plugin/highlight/highlight.js"></script>
<script>
  Reveal.initialize({
    plugins: [RevealHighlight]
  });
</script>
```

### 3.2 自定义样式插件 `ppt.css`

项目级全局样式覆盖，包含：

- 滚动条隐藏
- `.pad-block` 浮动信息卡片
- `.fullpage` 全屏定位
- CSS 变量 `--c-theme` 主题色
- 图片/视频/iframe 无边框
- `.label-idx` 序号标签
- `del` 删除线透明度

---

## 4. 主题系统

### 4.1 主题架构（Sass 驱动）

```
css/
├── reveal.scss              # 核心样式入口（导入 layout + 所有组件）
├── layout.scss              # 布局工具类（stretch、stack、flex 等）
├── print/                   # 打印样式
│   ├── pdf.scss
│   └── paper.scss
└── theme/                   # 主题系统
    ├── source/              # 主题源文件（.scss）
    ├── template/            # 主题模板
    └── README.md
```

### 4.2 主题编译流程

```
css/theme/source/*.scss  →  Sass 编译  →  dist/theme/*.css
```

### 4.3 主题模板四步构建法

每个主题 `.scss` 文件遵循固定结构[^1]：

1. **导入 mixins** — `../template/mixins.scss`（渐变、背景色适配工具）
2. **导入 settings** — `../template/settings.scss`（默认变量定义）
3. **覆盖变量** — 自定义颜色、字体、尺寸等
4. **导入 theme** — `../template/theme.scss`（基于变量生成最终 CSS）

### 4.4 可用主题

| 主题名 | 风格 | 使用场景 |
|--------|------|----------|
| `black` | 深色背景 + 白色文字 | 默认演示 |
| `serif` | 浅色背景 + 衬线字体 | POAA、Light Travel 使用 |
| `white` | 纯白背景 | 打印友好 |
| `moon` / `night` / `sky` / `beige` / `blood` / `league` / `simple` / `solarized` | 多样化预设 | 按需选用 |

### 4.5 字体资源

```
dist/theme/fonts/
├── league-gothic/         # League Gothic 字体族
└── source-sans-pro/       # Source Sans Pro 字体族
```

---

## 5. 根框架与子项目关系

### 5.1 目录结构关系

```
/Users/lionad/Github/Lionad-Morotar/ppt/          # 根：reveal.js 框架 + 聚合构建
├── css/ dist/ plugin/    # reveal.js 框架（Sass 源码 / 编译产物 / 插件）
├── scripts/
│   └── build-all-decks.mjs       # 多 deck 聚合构建编排（deck 清单唯一定义点）
├── .github/workflows/
│   └── deploy-pages.yml          # GitHub Pages 聚合部署
└── ppt/                          # 子项目目录
    ├── boris-five-roles-in-ai-native-teams/  # Slidev deck（含自研 three/ 引擎）
    ├── claude-from-zero/         # Slidev deck
    ├── demo-slidev/              # Slidev deck
    ├── demo/                     # reveal.js 官方演示（不纳入部署）
    ├── light-travel/             # 静态 reveal.js 分享
    └── poaa/                     # 静态 reveal.js 分享
```

### 5.2 资源引用路径

reveal.js deck 通过相对路径引用根框架资源：

```html
<!-- 以 ppt/poaa/index.html 为例 -->
<link rel="stylesheet" href="../../dist/reset.css">
<link rel="stylesheet" href="../../dist/reveal.css">
<link rel="stylesheet" href="../../dist/theme/serif.css">
<link rel="stylesheet" href="../../plugin/highlight/monokai.css">
```

Slidev deck 不引用根框架资源：依赖装在各 deck 自己的 `node_modules`，构建产物自包含。

### 5.3 子项目类型

| 子项目 | 类型 | 内容形式 | 特点 |
|--------|------|----------|------|
| `boris-five-roles-in-ai-native-teams/` | Slidev deck | slides.md + Vue 组件 + ThreeJS 全局背景 | 含自研波浪网格引擎与双语访谈 transcript |
| `claude-from-zero/` | Slidev deck | slides.md + 18 个可视化 Vue 组件 | 含术语校验脚本 `scripts/validate-terms.mjs` |
| `demo-slidev/` | Slidev deck | slides.md + 功能演示组件 | Slidev 核心能力展示 |
| `poaa/` | 静态 reveal.js | HTML + iframe 嵌入 | CSS 抗锯齿主题，含视频 |
| `light-travel/` | 静态 reveal.js | HTML + iframe 嵌入 | CSS 光影效果，大量 iframe demo |
| `demo/` | 官方示例 | 纯 HTML section | 依赖根框架缺失的 zoom/notes/search/markdown 插件，初始化白屏，不纳入部署（源文件保留） |

### 5.4 iframe 嵌入模式

复杂交互演示（CSS 动画、WebGL、第三方页面）通过 iframe 嵌入（仅 reveal.js deck 使用）：

```html
<!-- 嵌入外部页面 -->
<section data-background-iframe="https://example.com" data-background-interactive></section>

<!-- 嵌入本地 demo -->
<section data-preload data-background-iframe="./iframes/blueprint" data-background-interactive></section>
```

- `data-background-iframe`：指定 iframe URL
- `data-background-interactive`：允许 iframe 内交互
- `data-preload`：预加载（避免切换时的白屏）

---

## 6. 关键技术决策

### 6.1 为什么选择 reveal.js

- 纯前端方案，无需后端
- 单文件 HTML 即可运行
- 丰富的过渡动画和插件生态
- iframe 背景支持嵌入复杂交互

### 6.2 为什么使用 iframe 嵌入 demo

- CSS 动画/复杂效果需要独立渲染上下文
- 避免样式冲突
- 支持第三方页面嵌入（CodePen、在线工具等）
- 每个 iframe demo 可独立开发调试

### 6.3 构建与运行流程

- **reveal.js deck**：无构建。`pnpm dev`（根 `package.json`）启动 `http-server -p9999` 直接浏览各子项目 `index.html`
- **Slidev deck**：各 deck 自含 `package.json`，根 `package.json` 以 `pnpm -C` 转发 dev（`dev:boris` / `dev:cfz` / `dev:demo`，端口在各 deck 的 dev 脚本中定义）
- **聚合构建**：`pnpm build:all` 运行 `scripts/build-all-decks.mjs`，产物输出到 `dist-pages/ppt/`；`pnpm preview:all` 以 `http-server dist-pages -p 8080` 本地复现线上形态
- **CI 部署**：push main 自动触发 `.github/workflows/deploy-pages.yml`，执行 `node scripts/build-all-decks.mjs --install` 后发布 GitHub Pages

主题 CSS 为预编译产物（已提交到 `dist/theme/`），如需修改主题需手动编译 Sass。

---

## 7. Slidev Deck 架构

以 `ppt/boris-five-roles-in-ai-native-teams/` 为最完整样本（`ppt/claude-from-zero/`、`ppt/demo-slidev/` 同构）。

### 7.1 分层结构

| 层 | 位置 | 职责 |
|----|------|------|
| 内容层 | `slides.md` | frontmatter 定义 theme/fonts/mdc，页面用 `---` 分隔，正文直接写 HTML + `cmpt-*` class |
| 组件层 | `components/*.vue` | Slidev 约定自动注册，slides.md 中直接以 PascalCase 标签使用 |
| setup 层 | `setup/main.ts` | Slidev `AppSetup` 入口，注入 deck 级全局行为 |
| 引擎层 | `three/` | 框架无关的 ThreeJS 引擎，可整体迁移 |
| 素材层 | `assets/`、`public/` | transcript 文本与静态图片 |

### 7.2 setup 层全局行为（`ppt/boris-five-roles-in-ai-native-teams/setup/main.ts`）

`setupMain` 做两件事：

1. **Mermaid 交互增强**（`initMermaidInteractions`）：MutationObserver 监听 ShadowRoot，注入 `max-width: 100%` 防 SVG 越界；单击弹出全屏 zoom overlay
2. **全局常驻 ThreeJS 背景**（`initWaveBackground`）：
   - 动态 `import('../three')` 保证 SSR 安全（Slidev build 不触 WebGL）
   - 创建 `.deck-bg-canvas` + `.deck-bg-veil` 挂到 body，z-index 在 Slidev 内容之下
   - 背景跨页连续、立方体不重建，因此挂全局 fixed canvas 而非每页 layout
   - 翻页感知：劫持 `history.pushState/replaceState` + `popstate` + `hashchange` 三重信号（兼容 Slidev hash/history 两种路由模式）
   - 按页型分治：首页持续随机波纹 + 开场中心绽放，正文页静止，翻页瞬间触发方向波纹
   - 调试入口：engine 挂 `window.__deckBg`，inspector 挂 `window.__deckInspector`（cmd/ctrl 高亮方块，仅首页激活）

### 7.3 引擎层（`three/`）

- `three/index.ts` 桶文件导出：`WaveGridEngine`、`Sizes`、`capPixelRatio`、`CubeInspector`、`worldToGrid`、`DEFAULT_WAVE_PARAMS`
- `core/`：`camera.ts` / `renderer.ts` / `sizes.ts` / `debug.ts` / `waveGridEngine.ts`（引擎组装）
- `stage/`：`waveGridStage.ts`（立方体网格场景）+ `waveShaderChunks.ts`（GLSL 片段）
- `effects/`：`mouseTrail.ts`（波纹轨迹，`addPoint`/`addRandomPoint` 是 sleep 模式下唯一波纹驱动入口）、`cubeInspector.ts`（调试探针）、`vignetteRGBShiftShader.ts`（后期着色器）
- `three/types.ts` 定义 `WaveParams` / `TrailPoint` / `TrailOptions`
- `tsconfig.engine.json`：three/ 的独立 tsconfig

### 7.4 Slidev DOM 常驻陷阱

Slidev 将所有 `.slidev-page` 常驻 DOM，仅以 `display: none` 切换显隐。跨页 `document.querySelectorAll` 必须先限定当前可见 slide（取 `.slidev-page:not([style*="display: none"])`），否则会命中不可见页面的同名组件实例。详见 `ppt/claude-from-zero/.claude/slidev-dom-structure.md`。

---

## 8. 聚合构建与部署管线

### 8.1 构建编排（`scripts/build-all-decks.mjs`）

deck 清单唯一定义点，分两组：

- `SLIDEV_DECKS`：逐个在 deck 目录内执行 `pnpm exec slidev build --base "/ppt/<deck>/" --out "dist-pages/ppt/<deck>/"`
- `STATIC_DECKS`（`poaa` / `light-travel`）：整目录复制（过滤 `node_modules` / `.git`），并用 `REVEAL_REF_RE` 把 html 内 `../../dist/`、`/dist/` 等引用重写为 `/ppt/dist/` 站点绝对路径

其他职责：

- 把根级共享资源 `dist/`、`plugin/` 复制到站点根 `dist-pages/ppt/`，供老 deck 子路径部署后引用不 404
- 生成卡片式目录页 `dist-pages/ppt/index.html`
- `--install` 参数：逐 deck `pnpm install`（CI 使用）

### 8.2 CI 部署（`.github/workflows/deploy-pages.yml`）

- 触发：push main 且 paths 命中 `ppt/**`、`scripts/build-all-decks.mjs`、workflow 自身；另支持手动 `workflow_dispatch`
- 环境：pnpm 9 + Node LTS，`cache-dependency-path: 'ppt/**/pnpm-lock.yaml'` 覆盖各 deck 独立 lockfile
- 构建：`node scripts/build-all-decks.mjs --install`
- 上传 artifact 路径为 `dist-pages/ppt`（部署根，对齐 `github.io/ppt/`）
- `concurrency: group pages, cancel-in-progress: false`——排队不取消，避免半成品上线

### 8.3 路径映射核心

```
线上 URL            https://lionad-morotar.github.io/ppt/<deck>/
artifact 路径        dist-pages/ppt/<deck>/
本地预览 (8080)      http://localhost:8080/ppt/<deck>/
```

仓库根目录名 `ppt` 即 URL 前缀（脚本内 `URL_PREFIX = '/ppt'`），repo 改名需同步。

---

## 9. 文件引用关系图

```
根框架
├── dist/reset.css ─────┐
├── dist/reveal.css ────┼──→ 各 reveal.js 子项目 index.html
├── dist/theme/*.css ───┤      ├── <section> 幻灯片
├── plugin/highlight/ ──┤      ├── <section data-background-iframe> 嵌入 demo
└── plugin/styles/ppt.css┘      └── iframes/ 本地交互演示

scripts/build-all-decks.mjs
├── slidev build --base ──→ dist-pages/ppt/<Slidev deck>/
├── 整目录复制 + 引用重写 ──→ dist-pages/ppt/<静态 deck>/
├── 根级 dist/ plugin/ 复制 ──→ dist-pages/ppt/dist|plugin/
└── 生成目录页 ──→ dist-pages/ppt/index.html ──→ GitHub Pages
```

[^1]: reveal.js 官方主题构建文档：`css/theme/README.md`

---

*Architecture analysis: 2026-10-02*
