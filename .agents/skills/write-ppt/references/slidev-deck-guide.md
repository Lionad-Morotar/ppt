# Slidev 演示工程与高留白视觉指南

用于在 `ppt/<slug>/` 下搭建、重写或瘦身 Slidev 演示文稿项目，参考基准为 `ppt/boris-five-roles-in-ai-native-teams/` 与 `ppt/js-20-years/`。

## 1. 标准目录骨架

每个 Slidev 分享在 `ppt/<slug>/` 下自包含运行，目录职责如下：

- `slides.md`：幻灯片主入口，顶部 frontmatter 声明 `theme: default`、`title`、`mdc: true` 与 `fonts`，每页底部用 HTML 注释存放演讲者口播稿。
- `script-30min.md` 或 `thoughts.md`：完整讲稿与构思底稿。
- `package.json`：固定包含 `dev`（指定唯一端口，如 `slidev --port 4946`）、`build`（`slidev build`）、`export`（`slidev export`）三条脚本。
- `tsconfig.engine.json`：约束 `three/**/*.ts` 的严格类型检查配置。
- `setup/main.ts`：导出 `AppSetup`，负责挂载全局 `deck.css`、Mermaid 点击放大检视浮层、以及跨页常驻的 Three.js 背景画布。
- `setup/deck.css`：定义 `--deck-*` 设计变量、大字号排版、卡片样式与翻页逐项浮现动画。
- `setup/mermaid.ts`：统一配置 Mermaid 图表配色与 `max-width: 100%` 防越界样式。
- `three/`：框架无关的 Three.js 背景引擎（`types.ts`、`index.ts` 与核心场景类），禁止在其中直接引入 Vue。
- `components/`：按主题定制的交互式 Vue 组件（如案例沙盒、四道闸模拟器、红线自检清单、随身决策罗盘）。

## 2. 屏幕信息减负纪律（观众视角 vs 讲者视角）

幻灯片屏幕是给听众扫视的视觉锚点，绝不是讲者的提词器。编写 `slides.md` 与 `components/*.vue` 时严守以下减负原则：

- 剔除讲者元数据：严禁在屏幕上展示右上角时间标（如 `03:00 - 05:00`）、章节出处编号（如 `Ch 1 · Ch 2`）、底部进度页码条或冗长的英文编号前缀（如 `CASE 01`、`SIGNAL 01`）。
- 严控单页密度：每页除 `cmpt-kicker` 与 `h2` 大标题外，正文要点不超过 3 条，且每条控制在单行以内；若页面放了交互组件，则不再叠加额外正文段落或底部大段注释。
- 交互卡片极简化：组件内部切换卡片只保留「一句话事实 + 一句话判据」，删去多栏长篇背景叙述；详细故事与数据全部移入 `slides.md` 每页底部的演讲者注释。
- 大字号与高留白：`h1` 保持在 `3.6rem` 左右，`h2` 保持在 `2.35rem` 左右，正文与列表保持在 `1.05rem` 至 `1.12rem`，页面四周留足内边距（如 `2.8rem 3.8rem`）。

## 3. Three.js 全局背景规范

背景需要跨页连续存在且不随翻页销毁重建，
因此由 `setup/main.ts` 动态 `import('../three')` 后将 `<canvas class="deck-bg-canvas">` 与半透明遮罩 `<div class="deck-bg-veil">` 直接挂
到 `document.body`：

- 铺满全屏无死角：网格规模建议不少于 `50 × 50`（约 2500 至 3200 个 InstancedMesh 节点），相机采用斜俯视固定机位（例如 `position.set(0, 11.5, 6.2)`，
  `up.set(0, 0, -1)`，`lookAt(0, 0, 0)`），使几何晶格从屏幕顶部到底部、从左到右完全铺满，不留空白天际线。
- 静止克制、移除波动：默认使用确定性哈希生成静态错落高度，禁止运行正弦波起伏、翻页冲击波或镜头摇晃，防止干扰听众阅读文字。
- 随幕次平滑变色：在 `setup/main.ts` 中监听 `pushState`、`replaceState`、`popstate` 与 `hashchange`，按页码映射幕次情绪（`EraMood`），
  同步更新 `document.documentElement.dataset.eraMood` 与 Three.js 材质主副色调；颜色插值收敛后立即停止 `requestAnimationFrame` 循环以节省功耗。

## 4. 关键红线与排障经验

- 独立实体 `node_modules`（防 `useNav.ts` 崩溃）：每个 Slidev 子项目必须拥有独立的实体 `node_modules` 目录与 `pnpm-lock.yaml`。
  严禁将 `node_modules` 软链接到相邻 deck 目录，否则 Vite 预构建缓存与 `/@fs/` 路径会分别加载两份 `vue-router` 实例，
  导致 `@slidev/client/composables/useNav.ts` 中的 `useRouter()` 返回 `undefined` 并抛出 
  `Cannot read properties of undefined (reading 'currentRoute')`。
- Vue SFC 字符串避坑：在 `components/*.vue` 的 `<script setup>` 块内编写字符串常量时，禁止直接出现 `<script` 字面量（可改写为 `script 标签`），
  否则 Slidev 的预处理器与 `@vue/compiler-sfc` 会误判标签边界导致编译失败。
- 首屏防空页：`slides.md` 全局 frontmatter 之后直接写第一页内容（使用 `<div class="cmpt-hero ..."></div>`），不要在第一页前再加一组 `---` frontmatter，
  以免生成多余空白封面页。
- DOM 常驻注意：Slidev 会将所有 `.slidev-page` 常驻 DOM 并用 `display: none` 切换显隐；若需在脚本中做 DOM 查询，
  先限定 `.slidev-page:not([style*="display: none"])`。
