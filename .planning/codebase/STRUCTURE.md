<!-- refreshed: 2026-10-02 -->
# PPT 项目结构文档

## 1. 目录树（关键路径）

```
/Users/lionad/Github/Lionad-Morotar/ppt/
├── .github/
│   └── workflows/
│       └── deploy-pages.yml   # GitHub Pages 聚合部署 workflow
├── .planning/
│   └── codebase/              # 架构文档
│       ├── ARCHITECTURE.md
│       └── STRUCTURE.md
├── .vscode/                   # VS Code 配置
│   ├── settings.json
│   └── code-counter/          # 代码统计
│       └── reports/
├── scripts/
│   └── build-all-decks.mjs    # 多 deck 聚合构建编排（deck 清单唯一定义点）
├── css/                       # Sass 源码（reveal.js 框架）
│   ├── reveal.scss            # 核心样式入口
│   ├── layout.scss            # 布局工具类
│   ├── print/
│   │   ├── pdf.scss           # PDF 打印样式
│   │   └── paper.scss         # 纸张打印样式
│   └── theme/
│       ├── source/            # 主题源文件（*.scss）
│       │   ├── beige.scss
│       │   ├── black.scss
│       │   ├── blood.scss
│       │   ├── league.scss
│       │   ├── moon.scss
│       │   ├── night.scss
│       │   ├── serif.scss     # POAA / Light Travel 使用
│       │   ├── simple.scss
│       │   ├── sky.scss
│       │   ├── solarized.scss
│       │   └── white.scss
│       └── template/          # 主题编译模板
│           ├── exposer.scss
│           ├── mixins.scss
│           ├── settings.scss
│           └── theme.scss
├── dist/                      # 编译产物（运行时依赖）
│   ├── reset.css              # CSS Reset
│   ├── reveal.css             # 核心样式（编译后）
│   ├── reveal.esm.js          # ESM 核心 JS
│   ├── reveal.js              # UMD 核心 JS
│   └── theme/                 # 编译后的主题 CSS
│       ├── *.css              # 各主题编译产物
│       └── fonts/             # 字体资源
│           ├── league-gothic/
│           └── source-sans-pro/
├── plugin/                    # reveal.js 插件
│   ├── highlight/             # 代码高亮
│   │   ├── plugin.js
│   │   ├── highlight.js
│   │   ├── highlight.esm.js
│   │   ├── monokai.css
│   │   └── zenburn.css
│   ├── js/
│   │   └── jquery.js          # jQuery 依赖
│   └── styles/
│       └── ppt.css            # 项目自定义全局样式
├── dist-pages/                # 聚合构建产物（git-ignored，preview:all 的服务根）
│   └── ppt/                   # 部署根，对齐 github.io/ppt/
├── ppt/                       # ===== 子项目目录 =====
│   ├── boris-five-roles-in-ai-native-teams/  # 《AI 原生团队，该凑齐哪五种人》（Slidev）
│   │   ├── slides.md          # 全部幻灯片内容（frontmatter 定主题/字体）
│   │   ├── components/        # CmptPanel.vue / PreviewIcon.vue / SlideFooter.vue
│   │   ├── setup/             # main.ts（全局背景 + Mermaid 增强）/ mermaid.ts / deck.css
│   │   ├── three/             # 自研波浪网格引擎
│   │   │   ├── index.ts       # 桶文件导出
│   │   │   ├── types.ts
│   │   │   ├── core/          # camera / renderer / sizes / debug / waveGridEngine
│   │   │   ├── stage/         # waveGridStage / waveShaderChunks
│   │   │   └── effects/       # mouseTrail / cubeInspector / vignetteRGBShiftShader
│   │   ├── assets/
│   │   │   ├── images/        # background-ref.png
│   │   │   └── youtube/       # Boris Cherny 访谈 transcript（en/ 与 zh/ 各 6 份）
│   │   ├── public/            # boris-cherny.jpg
│   │   ├── thoughts.md        # 思路笔记
│   │   ├── tsconfig.engine.json  # three/ 独立 tsconfig
│   │   └── package.json + pnpm-lock.yaml
│   ├── claude-from-zero/      # 《Claude from ZERO》（Slidev）
│   │   ├── slides.md          # 全部幻灯片内容
│   │   ├── design.md          # 讲稿设计文档
│   │   ├── components/        # 18 个可视化组件（AgentLoop / NeuralNetwork / ReActCycle 等）+ terms-data.ts
│   │   ├── setup/             # main.ts / mermaid.ts / deck.css
│   │   ├── scripts/           # validate-terms.mjs（pnpm lint:terms）/ replace-terms.mjs
│   │   ├── public/assets/     # 背景图 / 图片 / 视频
│   │   ├── assets/            # 设计素材（含 theme-where-ai-meets-artistry/ 26 张）
│   │   ├── .claude/           # slidev-dom-structure.md（Slidev DOM 常驻结构笔记）
│   │   └── package.json + package-lock.json
│   ├── demo-slidev/           # 《Slidev 功能演示》（Slidev）
│   │   ├── slides.md          # 主入口
│   │   ├── pages/             # imported-slides.md（导入页）
│   │   ├── snippets/          # external.ts
│   │   ├── components/        # Counter / AgentLoop / NeuralNetwork 等演示组件
│   │   ├── netlify.toml / vercel.json  # 遗留部署配置
│   │   └── package.json + pnpm-lock.yaml
│   ├── demo/                  # reveal.js 官方演示
│   │   └── demo.html          # 不纳入部署（源文件保留）
│   ├── light-travel/          # 《CSS 光影魔法》
│   │   ├── index.html         # 主入口
│   │   └── iframes/           # 嵌入 demo
│   │       ├── book-cover/    # 书籍封面效果
│   │       ├── color-shadow/  # 彩色阴影
│   │       ├── dropplets/     # 水滴效果
│   │       ├── flash/         # 高光效果
│   │       ├── long-shadow/   # 长阴影
│   │       ├── material-picture/  # 材质贴图
│   │       ├── reflect/       # 倒影效果
│   │       ├── shadow-normal/ # 普通阴影
│   │       ├── soil-material/ # 土壤材质
│   │       ├── stone-material/# 石头材质
│   │       └── zebra-material/# 斑马纹材质
│   └── poaa/                  # 《CSS 抗锯齿方案 POAA》
│       ├── index.html         # 主入口
│       ├── index.md           # 讲稿大纲
│       ├── README.md          # 项目说明
│       ├── cover.png          # 封面图
│       ├── snapshot.mp4       # 演示视频
│       └── iframes/           # 嵌入 demo
│           ├── accordion/     # 手风琴效果
│           ├── aritecture/    # CSS 建筑
│           ├── artdraw/       # CSS 绘画
│           └── blueprint/     # 蓝图效果
├── .gitignore                 # 忽略 node_modules / dist / dist-pages / *.pptx
├── .npmrc
├── package.json               # 根脚本：http-server + 各 deck dev/build/preview 转发
├── pnpm-lock.yaml
└── Readme.md                  # 项目总览 + 线上入口清单
```

---

## 2. 文件命名约定

### 2.1 框架层

| 类型 | 命名模式 | 示例 |
|------|----------|------|
| Sass 源码 | `*.scss` | `reveal.scss`, `serif.scss` |
| 编译产物 | `*.css`, `*.js` | `reveal.css`, `reveal.js` |
| 主题源文件 | 语义化名称 | `black.scss`, `moon.scss` |
| 字体目录 | 字体族名 | `source-sans-pro/` |

### 2.2 子项目层（reveal.js deck）

| 类型 | 命名模式 | 示例 |
|------|----------|------|
| 入口文件 | `index.html` | `ppt/poaa/index.html` |
| 讲稿文档 | `index.md` | `ppt/poaa/index.md` |
| 设计文档 | `design.md` | `ppt/claude-from-zero/design.md` |
| 说明文档 | `README.md` | `ppt/poaa/README.md` |
| 封面图 | `cover.png` | `ppt/poaa/cover.png` |
| 演示视频 | `snapshot.mp4` | `ppt/poaa/snapshot.mp4` |
| iframe demo | `index.html` | `iframes/*/index.html` |

### 2.3 iframe demo 目录命名

iframe demo 目录使用**语义化短横线命名**：

```
book-cover/        # 书籍封面
 color-shadow/      # 彩色阴影
 long-shadow/       # 长阴影
 material-picture/  # 材质贴图
 shadow-normal/     # 普通阴影
 soil-material/     # 土壤材质
 stone-material/    # 石头材质
 zebra-material/    # 斑马纹材质
 accordion/         # 手风琴
 aritecture/        # CSS 建筑
 artdraw/           # CSS 绘画
 blueprint/         # 蓝图
```

### 2.4 Slidev deck 层

| 类型 | 命名模式 | 示例 |
|------|----------|------|
| 内容入口 | `slides.md`（固定名） | `ppt/boris-five-roles-in-ai-native-teams/slides.md` |
| 组件 | PascalCase `.vue`，Slidev 自动注册 | `components/SlideFooter.vue` |
| 全局 setup | 固定名 `main.ts` / `mermaid.ts` / `deck.css` | `setup/main.ts` |
| 引擎目录 | 固定名 `three/`，按 core/stage/effects 分层 | `three/core/waveGridEngine.ts` |
| 静态资源 | `public/` | `public/boris-cherny.jpg` |
| 素材 | `assets/` 按来源建子目录 | `assets/youtube/en/` |
| deck 配置 | `package.json`（dev 脚本内定端口）+ lockfile | `pnpm dev --port 4945` |

---

## 3. 模块边界

### 3.1 框架模块（根目录）

**职责**：提供 reveal.js 运行时、主题系统、插件能力

**边界**：
- 不感知任何子项目的具体内容
- 仅通过相对路径被 reveal.js deck 引用
- 主题 CSS 为预编译产物

**修改影响**：影响所有 reveal.js deck（Slidev deck 不依赖）

### 3.2 插件模块（`plugin/`）

**职责**：扩展 reveal.js 功能

| 插件 | 职责边界 |
|------|----------|
| `highlight/` | 代码块语法高亮 + 行号 |
| `styles/ppt.css` | 项目级全局样式覆盖 |
| `js/jquery.js` | 遗留 jQuery 依赖 |

### 3.3 子项目模块（`ppt/*/`）

**职责**：独立的演示文稿内容

**边界特征**：
- 每个子项目是一个自包含的演示文稿
- reveal.js deck 通过相对路径 (`../../`) 引用根框架资源
- iframe demo 目录内部完全独立，可单独运行

| 子项目 | 模块边界 |
|--------|----------|
| `boris-five-roles-in-ai-native-teams/` | Slidev deck，自含依赖与 lockfile；额外携带自研 `three/` 引擎与双语访谈 transcript |
| `claude-from-zero/` | Slidev deck，18 个可视化组件 + 术语校验脚本 |
| `demo-slidev/` | Slidev deck，Slidev 功能演示 |
| `demo/` | 官方示例，展示框架全部能力，不纳入部署 |
| `poaa/` | CSS 抗锯齿主题分享，含视频 + 4 个 iframe demo |
| `light-travel/` | CSS 光影效果分享，含 12 个 iframe demo |

### 3.4 iframe Demo 模块（`ppt/*/iframes/`）

**职责**：独立的交互式演示片段

**边界特征**：
- 每个 iframe 是一个完整的独立 HTML 页面
- 不依赖 reveal.js 框架
- 可单独在浏览器中打开调试
- 通过 `data-background-iframe` 嵌入到幻灯片中

### 3.5 Slidev Deck 模块（`ppt/<deck>/`）

**职责**：Markdown 驱动的可编程演示文稿

**边界特征**：
- 自含 `package.json` + lockfile，不依赖根框架 `dist/` / `plugin/`
- `components/*.vue` 由 Slidev 自动注册，slides.md 内直接使用
- `setup/main.ts` 注入 deck 级全局行为（常驻背景、Mermaid 增强），不污染单页
- `three/`（仅 boris deck）框架无关，整体拷走即可迁移（见 `three/index.ts` 头注释）
- dev 端口各自独立定义，互不冲突（4945 / 3411 / 12983）

### 3.6 构建编排模块（`scripts/build-all-decks.mjs`）

**职责**：聚合构建全部 deck 到 `dist-pages/ppt/`

**边界特征**：
- deck 清单唯一定义点（顶部 `SLIDEV_DECKS` / `STATIC_DECKS` 数组）
- CI（`.github/workflows/deploy-pages.yml`）与本地 `pnpm build:all` 共用同一脚本
- 负责 reveal.js 共享资源复制与静态 html 引用路径重写

---

## 4. 资产组织

### 4.1 图片资产

| 位置 | 用途 | 类型 |
|------|------|------|
| `ppt/poaa/cover.png` | POAA 分享封面 | PNG |
| `ppt/*/iframes/*/` | iframe demo 内联图片 | 多种 |
| `ppt/boris-five-roles-in-ai-native-teams/public/` | Slidev 静态图片 | JPG |
| `ppt/claude-from-zero/public/assets/` | Slidev 背景图/图片 | JPG/PNG/GIF |
| 外部 CDN | 在线图片资源 | URL 引用 |

### 4.2 视频资产

| 位置 | 用途 | 类型 |
|------|------|------|
| `ppt/poaa/snapshot.mp4` | POAA 演示录屏 | MP4 |
| `ppt/claude-from-zero/assets/` | 100-nodes-network.mp4 等 | MP4 |

### 4.3 字体资产

| 位置 | 字体族 | 用途 |
|------|--------|------|
| `dist/theme/fonts/league-gothic/` | League Gothic | 标题字体 |
| `dist/theme/fonts/source-sans-pro/` | Source Sans Pro | 正文字体 |

### 4.4 外部资源引用

子项目中大量使用外部 CDN 资源：

```html
<!-- 在线图片 -->
<img src="https://mgear-image.oss-cn-shanghai.aliyuncs.com/image/other/..." />

<!-- 外部页面嵌入 -->
<section data-background-iframe="https://elrumordelaluz.github.io/csshake" ...></section>
```

### 4.5 文本素材

| 位置 | 用途 |
|------|------|
| `ppt/boris-five-roles-in-ai-native-teams/assets/youtube/en/` | 6 份 Boris Cherny 访谈英文 transcript（讲稿内容源头） |
| `ppt/boris-five-roles-in-ai-native-teams/assets/youtube/zh/` | 同上 6 份的中文译文 |
| `ppt/boris-five-roles-in-ai-native-teams/thoughts.md` | 讲稿思路笔记 |

---

## 5. 关键文件清单

### 5.1 框架核心文件

| 文件 | 作用 |
|------|------|
| `dist/reveal.css` | 幻灯片布局、过渡动画、控制组件样式 |
| `dist/reveal.js` | 幻灯片引擎、导航、事件处理 |
| `css/reveal.scss` | 核心样式 Sass 源码 |
| `css/layout.scss` | Flex/Grid 布局工具类 |
| `css/theme/template/theme.scss` | 主题生成模板 |

### 5.2 子项目入口文件

| 文件 | 说明 |
|------|------|
| `ppt/boris-five-roles-in-ai-native-teams/slides.md` | AI 原生团队分享（Slidev） |
| `ppt/claude-from-zero/slides.md` | Claude from Zero 分享（Slidev） |
| `ppt/demo-slidev/slides.md` | Slidev 功能演示（Slidev） |
| `ppt/demo/demo.html` | reveal.js 官方完整演示（不部署） |
| `ppt/poaa/index.html` | CSS POAA 分享 |
| `ppt/light-travel/index.html` | CSS 光影魔法分享 |
| `ppt/claude-from-zero/design.md` | Claude 入门分享设计稿 |

### 5.3 deck 设计文档（docs/）

claude-from-zero 分享的设计资料族，随仓库入库：

- [design.md](../../docs/claude-from-zero/design.md) — 分享设计稿主文档（叙事结构、页面规划）
- [design.components.md](../../docs/claude-from-zero/design.components.md) — 可视化组件设计清单
- [design.source.md](../../docs/claude-from-zero/design.source.md) — 设计素材与来源说明
- [2026-04-28-ppt-v1-review.md](../../docs/claude-from-zero/2026-04-28-ppt-v1-review.md) — 初版 PPT 评审记录
- [2026-04-28-source.md](../../docs/claude-from-zero/2026-04-28-source.md) — 评审同期的来源材料

### 5.4 配置与编排文件

| 文件 | 作用 |
|------|------|
| `package.json` | 根脚本：http-server 预览 + `dev:boris`/`dev:cfz`/`dev:demo` 转发 + `build:all`/`preview:all` |
| `scripts/build-all-decks.mjs` | 聚合构建编排，deck 清单唯一定义点 |
| `.github/workflows/deploy-pages.yml` | push main 自动构建并发布 GitHub Pages |
| `ppt/<deck>/package.json` | 各 deck 依赖与 dev 端口定义 |
| `.npmrc` | npm 配置 |
| `.gitignore` | 忽略 node_modules / dist / dist-pages / *.pptx |
| `.vscode/settings.json` | VS Code 工作区配置 |

---

## 6. 路径约定速查

### 6.1 子项目引用框架资源（reveal.js deck）

以 `ppt/poaa/index.html` 为例：

```
../../dist/reset.css              → /dist/reset.css
../../dist/reveal.css             → /dist/reveal.css
../../dist/theme/serif.css        → /dist/theme/serif.css
../../plugin/highlight/monokai.css → /plugin/highlight/monokai.css
```

### 6.2 iframe 路径

```
./iframes/blueprint               → ppt/poaa/iframes/blueprint/index.html
./iframes/long-shadow             → ppt/light-travel/iframes/long-shadow/index.html
```

### 6.3 开发命令与端口

```
pnpm dev          # http-server 根目录 -p9999（reveal.js deck 直浏览）
pnpm dev:boris    # boris deck（Slidev，端口 4945）
pnpm dev:cfz      # claude-from-zero（Slidev，端口 3411）
pnpm dev:demo     # demo-slidev（Slidev，端口 12983）
```

### 6.4 构建产物与线上路径映射

```
pnpm build:all    # 聚合构建 → dist-pages/ppt/
pnpm preview:all  # http-server dist-pages -p 8080

http://localhost:8080/ppt/<deck>/   ↔  dist-pages/ppt/<deck>/
https://lionad-morotar.github.io/ppt/<deck>/  ↔  dist-pages/ppt/<deck>/
```

URL 前缀 `/ppt` 即仓库名（`scripts/build-all-decks.mjs` 内 `URL_PREFIX`），repo 改名需同步。

---

## 7. 新增代码放置指引

**新增 Slidev deck：**
- 目录：`ppt/<deck-slug>/`，至少包含 `slides.md`、`package.json`（dev 脚本内定独立端口）、`pnpm-lock.yaml`
- 注册：`scripts/build-all-decks.mjs` 顶部 `SLIDEV_DECKS` 数组加一行（dir/title/desc）
- 可选：根 `package.json` 加 `dev:<slug>` 转发脚本；workflow 的 paths 已覆盖 `ppt/**`，无需改动

**新增静态 reveal.js deck：**
- 目录：`ppt/<slug>/`，入口 `index.html` + 可选 `iframes/`，引用根框架资源用 `../../dist/` 相对路径
- 注册：`scripts/build-all-decks.mjs` 的 `STATIC_DECKS` 数组加一行

**boris deck 新增背景/交互效果：**
- 实现：`ppt/boris-five-roles-in-ai-native-teams/three/effects/`
- 导出：经 `three/index.ts` 桶文件补充 export
- 场景/着色器扩展：`three/stage/`

**新增全局 deck 行为（非单页）：**
- `ppt/<deck>/setup/main.ts` 的 `setupMain` 内追加初始化函数

---

*Structure analysis: 2026-10-02*
