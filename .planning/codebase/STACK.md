# 技术栈清单

## 项目概述

基于 reveal.js 的 HTML 幻灯片演示框架，用于托管多个技术分享 PPT。

## 编程语言

| 语言 | 用途 | 文件位置 |
|------|------|----------|
| HTML | 幻灯片内容结构 | `ppt/*/index.html`, `ppt/demo/demo.html` |
| CSS | 幻灯片样式、主题 | `dist/theme/*.css`, `plugin/styles/ppt.css` |
| SCSS | reveal.js 源码样式（预编译） | `css/reveal.scss`, `css/layout.scss`, `css/theme/source/` |
| JavaScript | 幻灯片交互逻辑、插件 | `dist/reveal.js`, `plugin/*/*.js` |
| Markdown | 讲稿文稿、设计文档 | `ppt/poaa/index.md`, `ppt/claude-from-zero/design.md` |

## 核心框架

### reveal.js v4.0.2

- **用途**: HTML 演示文稿框架
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

## 构建工具

本项目为**预构建分发版**，无构建步骤：

- reveal.js 的 `dist/` 目录包含已编译的 JS/CSS
- SCSS 源码存在但未配置构建脚本
- 无 webpack、vite、rollup 等现代打包工具配置

## 包管理器

- **pnpm**（由 `pnpm-lock.yaml` 确认）
- `.npmrc` 配置：`min-release-age=7`

## 开发服务器

| 工具 | 用途 | 配置 |
|------|------|------|
| http-server | 本地静态文件服务 | `npm start` → `http-server ./ -p9999` |
| http-server (dev) | 开发模式（无缓存） | `npm run dev` → `http-server ./ -p9999 -c0` |

## 项目结构

```
ppt/
├── css/                    # SCSS 源码（reveal.js 主题源码）
│   ├── reveal.scss
│   ├── layout.scss
│   ├── print/              # PDF 打印样式
│   └── theme/              # 主题源码与模板
├── dist/                   # 编译后的 reveal.js 资源
│   ├── reveal.js           # 核心框架（UMD，v4.0.2）
│   ├── reveal.esm.js       # ES Module 版本
│   ├── reveal.css          # 核心样式
│   ├── reset.css           # CSS Reset
│   └── theme/              # 编译后的主题 CSS
├── plugin/                 # 插件
│   ├── highlight/          # 代码高亮插件
│   ├── js/                 # jQuery
│   └── styles/             # 自定义样式
├── ppt/                    # 各期分享内容
│   ├── claude-from-zero/   # 《Claude from ZERO》设计文档
│   ├── demo/               # reveal.js 官方 demo
│   ├── light-travel/       # 《CSS 光影魔法》
│   └── poaa/               # 《CSS 抗锯齿方案 POAA》
├── package.json
├── pnpm-lock.yaml
└── .npmrc
```

## 各期分享技术特点

| 分享 | 路径 | 核心技术 |
|------|------|----------|
| CSS 抗锯齿方案 POAA | `ppt/poaa/` | CSS `repeating-linear-gradient`、CSS 变量、SVG filter |
| CSS 光影魔法 | `ppt/light-travel/` | SVG `feTurbulence`、`feDiffuseLighting`、CSS 滤镜、iframe 嵌入 demo |
| Claude from ZERO | `ppt/claude-from-zero/` | 纯 Markdown 设计文档，规划使用 Mermaid 图表 |
| Demo | `ppt/demo/` | reveal.js 官方完整功能演示 |

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
