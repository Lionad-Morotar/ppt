# PPT 项目结构文档

## 1. 目录树（关键路径）

```
/Users/lionad/Github/Lionad-Morotar/ppt/
├── .planning/
│   └── codebase/              # 架构文档
│       ├── ARCHITECTURE.md
│       └── STRUCTURE.md
├── .vscode/                   # VS Code 配置
│   ├── settings.json
│   └── code-counter/          # 代码统计
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
├── ppt/                       # ===== 子项目目录 =====
│   ├── claude-from-zero/      # 《Claude from ZERO》
│   │   └── design.md          # 讲稿设计文档
│   ├── demo/                  # reveal.js 官方演示
│   │   └── demo.html
│   ├── demo-slidev/           # Slidev 实验项目（空）
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
├── .gitignore
├── .npmrc
├── package.json               # http-server 脚本
├── pnpm-lock.yaml
└── Readme.md                  # 项目总览
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

### 2.2 子项目层

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

---

## 3. 模块边界

### 3.1 框架模块（根目录）

**职责**：提供 reveal.js 运行时、主题系统、插件能力

**边界**：
- 不感知任何子项目的具体内容
- 仅通过相对路径被引用
- 主题 CSS 为预编译产物

**修改影响**：影响所有子项目

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
- 通过相对路径 (`../../`) 引用根框架资源
- iframe demo 目录内部完全独立，可单独运行

| 子项目 | 模块边界 |
|--------|----------|
| `demo/` | 官方示例，展示框架全部能力 |
| `poaa/` | CSS 抗锯齿主题分享，含视频 + 4 个 iframe demo |
| `light-travel/` | CSS 光影效果分享，含 12 个 iframe demo |
| `claude-from-zero/` | AI 入门分享，目前仅设计稿 |
| `demo-slidev/` | Slidev 框架实验，空目录 |

### 3.4 iframe Demo 模块（`ppt/*/iframes/`）

**职责**：独立的交互式演示片段

**边界特征**：
- 每个 iframe 是一个完整的独立 HTML 页面
- 不依赖 reveal.js 框架
- 可单独在浏览器中打开调试
- 通过 `data-background-iframe` 嵌入到幻灯片中

---

## 4. 资产组织

### 4.1 图片资产

| 位置 | 用途 | 类型 |
|------|------|------|
| `ppt/poaa/cover.png` | POAA 分享封面 | PNG |
| `ppt/*/iframes/*/` | iframe demo 内联图片 | 多种 |
| 外部 CDN | 在线图片资源 | URL 引用 |

### 4.2 视频资产

| 位置 | 用途 | 类型 |
|------|------|------|
| `ppt/poaa/snapshot.mp4` | POAA 演示录屏 | MP4 |

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
| `ppt/demo/demo.html` | reveal.js 官方完整演示 |
| `ppt/poaa/index.html` | CSS POAA 分享 |
| `ppt/light-travel/index.html` | CSS 光影魔法分享 |
| `ppt/claude-from-zero/design.md` | Claude 入门分享设计稿 |

### 5.3 配置文件

| 文件 | 作用 |
|------|------|
| `package.json` | 项目元数据 + http-server 脚本 |
| `.npmrc` | npm 配置 |
| `.gitignore` | Git 忽略规则 |
| `.vscode/settings.json` | VS Code 工作区配置 |

---

## 6. 路径约定速查

### 6.1 子项目引用框架资源

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

### 6.3 开发服务器访问路径

```
http://localhost:9999/            → 根目录
http://localhost:9999/ppt/        → 子项目列表
http://localhost:9999/ppt/poaa/   → POAA 分享
http://localhost:9999/ppt/light-travel/  → 光影魔法分享
```
