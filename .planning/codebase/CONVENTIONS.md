# 代码规范与模式

## 项目概述

本项目是基于 reveal.js 的演示文稿集合，包含多个独立 PPT 子项目。每个 PPT 是一个独立的 HTML 文件，通过 reveal.js 框架渲染为幻灯片。

## 命名规范

### 文件命名

- **PPT 入口文件**: `index.html` — 每个 PPT 子目录的标准入口
- **演示文件**: `demo.html` — 框架示例/演示用
- **设计文档**: `design.md` — PPT 讲稿设计文档（如 `claude-from-zero/design.md`）
- **README 文件**: `README.md` — 项目或单份 PPT 的说明文档
- **样式文件**: 主题使用颜色/风格命名，如 `black.scss`, `serif.scss`, `moon.scss`
- **SCSS 源码**: 位于 `css/theme/source/` 下，编译输出到 `dist/theme/`
- **iframe 演示**: 每个效果独立目录，如 `iframes/dropplets/index.html`

### 变量命名（CSS/SCSS）

- SCSS 变量使用 `$` 前缀 + 驼峰命名，如 `$backgroundColor`, `$mainFontSize`
- CSS 自定义属性（变量）使用 `--` 前缀 + 短横线命名，如 `--c1`, `--offsetX`
- 颜色变量使用语义化命名，如 `$linkColor`, `$headingColor`

### 类名命名（CSS）

- reveal.js 核心类名使用 `reveal-` 前缀或 `.reveal` 命名空间
- 布局辅助类使用 `r-` 前缀，如 `.r-stretch`, `.r-stack`, `.r-hstack`, `.r-vstack`
- 工具类参考 Tailwind 命名，如 `.items-center`, `.justify-between`
- 幻灯片片段动画类使用 `fragment` + 效果名，如 `.fragment.fade-up`, `.fragment.grow`
- PPT 自定义样式类使用语义化命名，如 `.pad-block`, `.label-idx`

## 代码风格模式

### HTML 结构

- 每个 PPT 遵循标准 reveal.js 结构：

```html
<div class="reveal">
  <div class="slides">
    <section><!-- 单页幻灯片 --></section>
    <section>
      <section><!-- 垂直嵌套幻灯片 --></section>
    </section>
  </div>
</div>
```

- 使用 HTML 注释标记章节，如 `<!-- 引言 -->`, `<!-- 材质贴图 -->`
- 幻灯片数据属性控制行为：`data-background-iframe`, `data-preload`, `data-auto-animate`, `data-markdown`

### CSS/SCSS 风格

- 使用 Sass 编写主题，通过变量覆盖实现主题定制
- 主题开发四步法（参见 `css/theme/README.md`）：
  1. 引入 `mixins.scss`
  2. 引入 `settings.scss`
  3. 覆盖变量
  4. 引入 `theme.scss` 模板
- 嵌套选择器使用缩进（2 空格）
- 数值计算使用括号明确优先级，如 `($controlArrowSize - $controlArrowLength)/2`
- 混合宏（Mixin）使用 `@mixin` 定义，如 `@mixin controlsArrowTransform($angle)`

### JavaScript 风格

- reveal.js 插件使用对象字面量模式定义，包含 `id` 和 `init` 方法
- 使用 `var` 声明变量（兼容旧版 reveal.js 风格）
- 事件监听使用 `Reveal.on('event', callback)`
- 初始化配置使用对象字面量：

```javascript
Reveal.initialize({
  hash: true,
  plugins: [RevealHighlight]
}).then(() => {
  Reveal.on('slidechanged', event => { /* ... */ });
});
```

## 导入/导出模式

### CSS 导入

- 主题模板通过 `@import` 引入依赖：
  - `@import "../template/mixins";`
  - `@import "../template/settings";`
  - `@import "../template/theme";`
- 字体通过 CSS `@import url(...)` 引入

### JS 导入/导出

- 插件使用 ES Module 导出：`export default () => Plugin;`
- 部分文件使用全局变量模式（如 jQuery 插件）

### 资源引用

- 根级别 PPT 使用绝对路径：`/dist/reveal.css`, `/dist/theme/black.css`
- 子目录 PPT 使用相对路径：`../../dist/reveal.css`
- iframe 内嵌演示使用相对路径：`./iframes/dropplets`

## 配置模式

### reveal.js 配置

- 通过 `Reveal.initialize({...})` 传入配置对象
- 常用配置项：`hash`, `controls`, `progress`, `center`, `plugins`
- 插件以数组形式传入，如 `[RevealZoom, RevealNotes, RevealSearch, RevealMarkdown, RevealHighlight]`

### 主题配置

- 主题通过修改 SCSS 变量实现定制
- 关键变量：`$backgroundColor`, `$mainColor`, `$headingColor`, `$mainFont`, `$linkColor`
- 使用 `@include light-bg-text-color(#222)` 处理亮色背景下的文字颜色

### 包管理配置

- 使用 pnpm（`pnpm-lock.yaml` 存在）
- `.npmrc` 配置：`min-release-age=7`
- 仅安装 http-server 作为开发服务器依赖

## 文档规范

### design.md（讲稿设计文档）

- 使用 YAML Front Matter 定义元数据：`title`, `description`
- 使用 `## 背景` 说明分享会目标和受众
- 使用 `## 制作要求` 列出技术需求
- 使用 `**Group: XXX**` 标记章节分组
- 使用数字列表 `1.`, `2.` 标记小节
- 使用 `<nb>` 标签包裹重要用户指示
- 嵌入 Mermaid 图表和外部链接

### README.md

- 包含项目简介和运行说明
- 使用 `<details>` 折叠运行步骤
- 分享列表使用日期前缀 + 链接格式：`- [YYYY-MM-DD《标题》](./path)`

### index.md（POAA 讲稿）

- 使用 Markdown 格式编写演讲稿
- 使用 `---` 分隔幻灯片
- 使用 `|` 标记演讲者备注（旁白提示）
- 代码块使用 ```js 和 ```css 标注语言
- 外部链接使用 `[文字](url)` 格式
