# 外部集成与依赖清单

## CDN 与外部资源

### 图片资源

| 服务 | 用途 | 引用位置 |
|------|------|----------|
| **mgear-image.oss-cn-shanghai.aliyuncs.com** | 个人图床（阿里云 OSS），存放分享用截图和素材 | `ppt/light-travel/index.html`, `ppt/poaa/index.html`, `ppt/claude-from-zero/design.md` |
| **cdn.jsdelivr.net/gh/Lionad-Morotar/blog-cdn/** | jsDelivr CDN（GitHub 图床加速），存放 GIF 演示 | `ppt/poaa/index.html` |
| **static.slid.es** | reveal.js 官方静态资源（logo、箭头、占位图） | `ppt/demo/demo.html` |

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

## 第三方库与工具

### 直接引入（本地文件）

| 库 | 版本 | 用途 | 位置 |
|----|------|------|------|
| **reveal.js** | 4.0.2 | HTML 演示框架核心 | `dist/reveal.js`, `dist/reveal.esm.js` |
| **highlight.js** | 内置 | 代码语法高亮 | `plugin/highlight/highlight.js` |
| **jQuery** | 未标注 | DOM 操作（部分 demo 使用） | `plugin/js/jquery.js` |

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

## 媒体资源

| 文件 | 类型 | 用途 | 位置 |
|------|------|------|------|
| `cover.png` | PNG 图片 | POAA 分享封面 | `ppt/poaa/cover.png` |
| `snapshot.mp4` | MP4 视频 | POAA 演示录像 | `ppt/poaa/snapshot.mp4` |

## 个人服务与账号

| 服务 | 用途 |
|------|------|
| **GitHub (Lionad-Morotar)** | 源码托管、博客 CDN（jsDelivr 加速） |
| **阿里云 OSS (mgear-image)** | 个人图床，存放分享素材 |
| **lionad.art** | 个人博客，POAA 文章原文 |

## 设计文档中规划但未实现的集成

`ppt/claude-from-zero/design.md` 中规划了以下尚未落地的集成：

- **Mermaid 图表**: 用于 PPT 中的神经网络、梯度下降、ReAct 循环等示意图
- **HTML 动画/视频**: 用于支撑 AI 概念的可视化演示
- **Youmind 实时演示**: 展示 Chat 模式与 Agent 模式的区别
- **OpenClaw 架构图**: 通用 Agent 架构说明
- **Nuxt 网站部署**: 计划通过 GitHub Pages 部署
