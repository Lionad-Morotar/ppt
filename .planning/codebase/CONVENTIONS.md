# 代码规范与模式

## 项目概述

本项目是演示文稿集合，包含两类分享，均部署在 `ppt/` 目录下：

- **Slidev deck（Vue 3 + TypeScript）**：`ppt/boris-five-roles-in-ai-native-teams/`、`ppt/claude-from-zero/`、`ppt/demo-slidev/`，入口为 `slides.md`，组件化开发
- **reveal.js 静态 PPT（纯 HTML/CSS）**：`ppt/poaa/`、`ppt/light-travel/`、`ppt/demo/`，依赖仓库根级的共享资源 `dist/` 与 `plugin/`

原 `forge/` 目录已更名为 `ppt/boris-five-roles-in-ai-native-teams/`，其代码模式为所有新 Slidev deck 的参考实现。

## 命名规范

### 文件命名

**通用：**
- **设计文档**: `design.md` — PPT 讲稿设计文档（如 `ppt/claude-from-zero/design.md`）
- **README 文件**: `Readme.md`（根级，多 deck 线上入口清单）/ `README.md`（子项目说明）

**Slidev deck（新 deck 遵循）：**
- **deck 目录**: kebab-case 英文命名，如 `ppt/boris-five-roles-in-ai-native-teams/`
- **deck 入口**: `slides.md` — YAML frontmatter 定义 `theme`/`title`/`mdc`/`fonts`，`---` 分隔幻灯片
- **Vue 组件**: PascalCase + `.vue`，如 `components/CmptPanel.vue`、`components/SlideFooter.vue`
- **deck 级 setup**（Slidev 约定目录）: `setup/main.ts`（全局初始化，导出 `AppSetup`）、`setup/mermaid.ts`（导出 `MermaidConfig`）、`setup/deck.css`（deck 级全局样式，避免 SFC side-effect 标签报错）
- **自研引擎**: `three/` 目录，按 `core/`（engine 基础设施）、`effects/`（交互效果）、`stage/`（渲染场景）分层，配 `types.ts`（共享类型）与 `index.ts`（桶文件导出）
- **deck 级 lockfile**: `pnpm-lock.yaml` 与 deck 同目录（`ppt/claude-from-zero/` 例外，历史使用 `package-lock.json`）

**reveal.js 静态 PPT（老 deck 遵循）：**
- **PPT 入口文件**: `index.html` — 每个 PPT 子目录的标准入口
- **演示文件**: `demo.html` — 框架示例/演示用
- **样式文件**: 主题使用颜色/风格命名，如 `black.scss`, `serif.scss`, `moon.scss`
- **SCSS 源码**: 位于 `css/theme/source/` 下，编译输出到 `dist/theme/`
- **iframe 演示**: 每个效果独立目录，如 `ppt/light-travel/iframes/` 下各特效目录

### 变量命名（CSS/SCSS）

- SCSS 变量使用 `$` 前缀 + 驼峰命名，如 `$backgroundColor`, `$mainFontSize`
- CSS 自定义属性（变量）使用 `--` 前缀 + 短横线命名；deck 主题变量使用 `--deck-` 前缀，如 `--deck-bg: #efe6d6`, `--deck-ink: #16110f`（见 `ppt/boris-five-roles-in-ai-native-teams/setup/mermaid.ts` 顶部注释）

### 类名命名（CSS）

**Slidev deck（新代码）：**
- 组件样式使用 BEM 命名：块 `slide-footer`、元素 `slide-footer__bar`、修饰/状态类 `is-expanded`、`is-masked`（见 `ppt/boris-five-roles-in-ai-native-teams/components/SlideFooter.vue`、`components/CmptPanel.vue`）
- deck 级语义类使用 `cmpt-` 前缀，如 `cmpt-hero`, `cmpt-kicker`, `cmpt-glossary__term`

**reveal.js（老代码）：**
- reveal.js 核心类名使用 `reveal-` 前缀或 `.reveal` 命名空间
- 布局辅助类使用 `r-` 前缀，如 `.r-stretch`, `.r-stack`, `.r-hstack`, `.r-vstack`
- 工具类参考 Tailwind 命名，如 `.items-center`, `.justify-between`
- 幻灯片片段动画类使用 `fragment` + 效果名，如 `.fragment.fade-up`, `.fragment.grow`
- PPT 自定义样式类使用语义化命名，如 `.pad-block`, `.label-idx`

## 代码风格模式

### Slidev deck（Vue 3 + TS，新代码遵循）

**Vue SFC：**
- 统一使用 `<script setup lang="ts">`，props 用泛型 `defineProps<{...}>()` 并逐项中文 JSDoc 注释，默认值用 `withDefaults`（见 `ppt/boris-five-roles-in-ai-native-teams/components/CmptPanel.vue`）
- 模板中使用 HTML 注释标记区域（What），如 `<!-- 放大/缩小按钮 -->`
- 样式使用 `<style scoped>`，通过 Slidev 全局上下文（`$nav.currentPage`/`$nav.total`）读取导航状态

**TypeScript：**
- 引擎代码受 `ppt/boris-five-roles-in-ai-native-teams/tsconfig.engine.json` 约束：`strict: true` + `noUncheckedIndexedAccess: true` + `noEmit` + `moduleResolution: bundler`，仅覆盖 `three/**/*.ts`
- 禁止裸 `any`；需要挂 window 全局时用 `as unknown as { __deckBg?: unknown }` 精确断言（见 `setup/main.ts`）
- SSR 安全守卫：访问 `window`/`document` 前用 `typeof window === 'undefined'` 早退（Slidev 构建存在 SSR 阶段）；three 等重依赖用动态 `import()` 延迟加载
- 注释只解释 Why（隐含假设、折衷、次序敏感点），中文撰写；代码块内用 `/* ── 1. xxx ── */` 分节

**引擎类设计（`three/` 目录模式）：**
- 依赖注入容器而非单例：`WaveGridEngine` 构造时按序实例化子模块并传入自身引用，子模块经 `engine.sizes`/`engine.scene` 取共享状态（见 `three/core/waveGridEngine.ts`）
- `readonly` 字段 + 构造函数参数属性；需要回调绑定时用箭头函数类属性（`private readonly animate = (): void => {...}`）
- 必须提供 `dispose()` 逆序释放资源
- 框架无关：`three/` 内禁止 import Vue，保证整目录可迁移
- 单一来源常量：shader 模板与 TS 共用常量（如 `MAX_TRAIL`）只定义在 `three/types.ts`，经模板插值注入 shader

**格式化：**
- 无 Prettier/ESLint 强制；新代码主流风格为无分号 + 单引号 + 2 空格缩进（`setup/main.ts`、`three/`、`scripts/build-all-decks.mjs`）

### reveal.js 静态 PPT（老代码）

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

- 使用 Sass 编写 reveal.js 主题，通过变量覆盖实现主题定制
- 主题开发四步法（参见 `css/theme/README.md`）：
  1. 引入 `mixins.scss`
  2. 引入 `settings.scss`
  3. 覆盖变量
  4. 引入 `theme.scss` 模板
- 嵌套选择器使用缩进（2 空格）
- 数值计算使用括号明确优先级，如 `($controlArrowSize - $controlArrowLength)/2`
- 混合宏（Mixin）使用 `@mixin` 定义，如 `@mixin controlsArrowTransform($angle)`

### JavaScript 风格（reveal.js 插件）

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

### Slidev deck（新代码）

- 引擎桶文件统一具名导出（见 `three/index.ts`）：类与常量直接导出，类型用 `export type {}` 单独导出
- Slidev 约定入口：`setup/main.ts` 默认导出 `AppSetup` 函数；`setup/mermaid.ts` 默认导出 `Promise<MermaidConfig>`
- 全局 CSS 在 `setup/main.ts` 顶部 `import './deck.css'` 引入（避免 Vue SFC side-effect 标签错误）

### CSS 导入（reveal.js）

- 主题模板通过 `@import` 引入依赖：
  - `@import "../template/mixins";`
  - `@import "../template/settings";`
  - `@import "../template/theme";`
- 字体通过 CSS `@import url(...)` 引入

### 资源引用

- 老 revealjs 分享引用根级共享资源：绝对路径 `/dist/reveal.css` 或相对路径 `../../dist/reveal.css`
- 这些引用在聚合构建时被 `scripts/build-all-decks.mjs` 的正则 `REVEAL_REF_RE` 统一重写为 `/ppt/dist|plugin/`（站点绝对路径），deck 源码中无需自行适配
- iframe 内嵌演示使用相对路径：`./iframes/dropplets`

## 配置模式

### Slidev 配置

- deck 级 `package.json` scripts 固定三件套：`dev`（`slidev --port <固定端口>`）、`build`（`slidev build`）、`export`（`slidev export`）；端口各 deck 唯一（boris 4945、cfz 3411、demo 12983）
- 子路径部署的 `--base`/`--out` 不写在 deck 里，由 `scripts/build-all-decks.mjs` 构建时注入
- 根 `package.json` 用转发脚本暴露 deck dev：`dev:boris`/`dev:cfz`/`dev:demo`（命名模式 `dev:<deck-slug>`），另有 `build:all`、`build:all:install`、`preview:all`
- 新增 Slidev deck：放入 `ppt/<deck>/` 并在 `scripts/build-all-decks.mjs` 顶部 `SLIDEV_DECKS` 数组加一行

### reveal.js 配置

- 通过 `Reveal.initialize({...})` 传入配置对象
- 常用配置项：`hash`, `controls`, `progress`, `center`, `plugins`
- 插件以数组形式传入，如 `[RevealZoom, RevealNotes, RevealSearch, RevealMarkdown, RevealHighlight]`

### 主题配置

- reveal.js 主题通过修改 SCSS 变量实现定制，关键变量：`$backgroundColor`, `$mainColor`, `$headingColor`, `$mainFont`, `$linkColor`
- 使用 `@include light-bg-text-color(#222)` 处理亮色背景下的文字颜色
- Mermaid 图表主题在 `setup/mermaid.ts` 中以 `themeVariables` + `themeCSS` 对齐 deck 配色

### 包管理配置

- 使用 pnpm（根级与各 deck 各自持有 lockfile）
- `.npmrc` 配置：`min-release-age=7`
- `ppt/claude-from-zero/` 历史使用 npm（`package-lock.json`），其余 deck 使用 pnpm
- 根级不安装 deck 依赖，deck 依赖由各自 `pnpm install` 管理（`pnpm -C ./ppt/<deck>` 或 `pnpm build:all:install`）

## 文档规范

### design.md（讲稿设计文档）

- 使用 YAML Front Matter 定义元数据：`title`, `description`
- 使用 `## 背景` 说明分享会目标和受众
- 使用 `## 制作要求` 列出技术需求
- 使用 `**Group: XXX**` 标记章节分组
- 使用数字列表 `1.`, `2.` 标记小节
- 使用 `<nb>` 标签包裹重要用户指示
- 嵌入 Mermaid 图表和外部链接

### .claude/ 笔记（deck 级经验沉淀）

- 位置：`ppt/<deck>/.claude/<topic>.md`，如 `ppt/claude-from-zero/.claude/slidev-dom-structure.md`
- YAML Front Matter：`name`、`description`、`type: feedback`
- 正文三段式：**规则**（是什么）→ **Why**（踩坑现场）→ **How to apply**（可执行做法与代码片段）

### README.md / Readme.md

- 根级 `Readme.md`：线上访问地址、本地预览命令、分享列表、部署机制说明
- 分享列表使用日期前缀 + 链接格式：`- [YYYY-MM《标题》](./ppt/<deck>)`
- 子项目 README 包含项目简介和运行说明，使用 `<details>` 折叠运行步骤

### index.md（POAA 讲稿）

- 使用 Markdown 格式编写演讲稿
- 使用 `---` 分隔幻灯片
- 使用 `|` 标记演讲者备注（旁白提示）
- 代码块使用 ```js 和 ```css 标注语言
- 外部链接使用 `[文字](url)` 格式

---

*Convention analysis: 2026-10-02*
