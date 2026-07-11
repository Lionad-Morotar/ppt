# PPT 项目架构文档

## 1. 整体系统概述

本项目是一个基于 reveal.js 的 HTML 演示文稿框架，用于托管和展示多个技术分享 PPT。项目采用"框架 + 子项目"的架构模式：

- **根目录**：reveal.js 核心框架（CSS、JS、插件、主题）
- **`ppt/` 目录**：各个独立的演示文稿子项目

### 1.1 设计哲学

- **单文件 HTML 演示**：每个 PPT 是一个独立的 `index.html`，通过 `<section>` 标签定义幻灯片
- **框架共享**：所有子项目共享根目录的 reveal.js 运行时、主题和插件
- **iframe 嵌入**：复杂交互/动画通过 `data-background-iframe` 嵌入独立 HTML 页面
- **静态托管**：通过 `http-server` 本地运行，无需构建步骤

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
/Users/lionad/Github/Lionad-Morotar/ppt/          # 根：reveal.js 框架
├── css/              # Sass 源码
├── dist/             # 编译产物（CSS/JS/主题/字体）
├── plugin/           # 插件
├── package.json      # http-server 脚本
└── ppt/              # 子项目目录
    ├── demo/         # reveal.js 官方演示
    ├── demo-slidev/  # Slidev 演示项目（空，待初始化）
    ├── light-travel/ # 《CSS 光影魔法》分享
    ├── poaa/         # 《CSS 抗锯齿方案 POAA》分享
    └── claude-from-zero/  # 《Claude from ZERO》分享（设计稿）
```

### 5.2 资源引用路径

子项目通过相对路径引用根框架资源：

```html
<!-- 以 ppt/poaa/index.html 为例 -->
<link rel="stylesheet" href="../../dist/reset.css">
<link rel="stylesheet" href="../../dist/reveal.css">
<link rel="stylesheet" href="../../dist/theme/serif.css">
<link rel="stylesheet" href="../../plugin/highlight/monokai.css">
```

### 5.3 子项目类型

| 子项目 | 类型 | 内容形式 | 特点 |
|--------|------|----------|------|
| `demo/` | 官方示例 | 纯 HTML section | 展示 reveal.js 全部特性 |
| `poaa/` | 技术分享 | HTML + iframe 嵌入 | CSS 抗锯齿主题，含视频 |
| `light-travel/` | 技术分享 | HTML + iframe 嵌入 | CSS 光影效果，大量 iframe demo |
| `claude-from-zero/` | 技术分享 | 设计稿 (Markdown) | AI 入门分享，仅 design.md |
| `demo-slidev/` | 实验项目 | — | Slidev 框架实验（空） |

### 5.4 iframe 嵌入模式

复杂交互演示（CSS 动画、WebGL、第三方页面）通过 iframe 嵌入：

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

### 6.3 构建流程

项目**无构建步骤**，运行时直接加载：

1. `npm start` 启动 `http-server -p9999`
2. 浏览器访问 `http://localhost:9999/ppt/`
3. 直接浏览各子项目 `index.html`

主题 CSS 为预编译产物（已提交到 `dist/theme/`），如需修改主题需手动编译 Sass。

---

## 7. 文件引用关系图

```
根框架
├── dist/reset.css ─────┐
├── dist/reveal.css ────┼──→ 各子项目 index.html
├── dist/theme/*.css ───┤      ├── <section> 幻灯片
├── plugin/highlight/ ──┤      ├── <section data-background-iframe> 嵌入 demo
└── plugin/styles/ppt.css┘      └── iframes/ 本地交互演示
```

[^1]: reveal.js 官方主题构建文档：`css/theme/README.md`
