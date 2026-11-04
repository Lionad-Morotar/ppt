---
name: write-ppt
description: 技术分享讲稿与 Slidev 演示文稿制作：将原始文档压缩为限时讲稿，搭建定制背景与交互组件的 Slidev 工程并做信息减负。当用户想写讲稿、做 PPT、压缩幻灯片时触发
argument-hint: "[--mode script|deck|slim] [--slug <slug>] [--duration <min>] [<素材路径或主题>]"
metadata:
  version: alpha
---

# write-ppt：技术分享讲稿与 Slidev 演示工程制作

## 要求

- 意图路由先行：按参数或用户意图分流至 `script`（写讲稿）、`deck`（建或重写 Slidev 工程）、`slim`（存量幻灯片减负压缩）三条分支；若用户要求从素材一步到位产出讲稿与幻灯片，依次串联
  `script` 与 `deck`。
- 渐进披露：按阶段读取 `references/talk-script-guide.md` 与 `references/slidev-deck-guide.md`，禁止初始化时一口气全读。
- 观众视角优先：幻灯片屏幕只放给听众看的锚点（大标题、不超过三条单行短句或单个交互组件），时间标、章节出处、长段推导一律下沉至演讲者备注与独立讲稿文件。
- 强调纪律：非必要不使用星号加粗，依靠选词、结构与语序突出重点。
- 输出中文。

## 意图路由

- 显式 `--mode script`；或用户要求「写讲稿 / 压成 N 分钟分享 / 写分享大纲」：走 `Workflow script`
- 显式 `--mode deck`；或用户要求「做 PPT / 生成 Slidev / 重写背景与交互样式」：走 `Workflow deck`
- 显式 `--mode slim`；或用户反馈「PPT 信息太密 / 删掉无意义标记 / 压缩字数」：走 `Workflow slim`
- 其他未知 `--mode` 值：报错并列出合法值（`script`、`deck`、`slim`）后停止

## 外部依赖入口

- 环境与端口预检脚本：
  `node ~/.claude/skills/write-ppt/scripts/preflight.mjs --mode <script|deck|slim> [--slug <slug>] [--duration <min>]`
- 多分享聚合构建入口：在仓库根 `package.json` 所在目录执行 `pnpm build:all`

## Workflow script：撰写技术分享讲稿

0. 预检与定位
   - [ ] 运行 `node ~/.claude/skills/write-ppt/scripts/preflight.mjs --mode script [--slug <slug>] [--duration <min>]` 校验目标目录
   - [ ] 读取全部源素材（如输入技能的 `SKILL.md`、`cheatsheet.md`、章节笔记或业务调研文档），禁止仅凭摘要脑补细节
1. 结构设计与取舍
   - [ ] 读 `references/talk-script-guide.md`，按目标时长（默认 30 分钟）规划幕次弧线、每幕分钟预算与核心判断尺子
   - [ ] 明确列出每幕「刻意不讲」的内容，防止分享沦为工具罗列或编年史流水账
2. 起草与落盘
   - [ ] 在 `ppt/<slug>/` 下输出讲稿文件（如 `script-30min.md` 或 `thoughts.md`），含讲者备忘、逐幕逐字稿、反直觉开场案例与收尾随身决策卡

## Workflow deck：搭建或重写 Slidev 演示工程

0. 预检与环境隔离
   - [ ] 运行 `node ~/.claude/skills/write-ppt/scripts/preflight.mjs --mode deck --slug <slug>`，获取推荐唯一开发端口并确认无跨目录软链风险
1. 视觉与交互设计
   - [ ] 读 `references/slidev-deck-guide.md`，确定贴合主题的配色变量、静态全屏 Three.js 背景几何体与 3 至 5 个定制 Vue 交互组件
2. 搭建工程与编写幻灯片
   - [ ] 生成或更新 `package.json`、`tsconfig.engine.json`、`setup/main.ts`、`setup/deck.css`、`setup/mermaid.ts`、`three/` 与
     `components/`
   - [ ] 编写 `slides.md`：首页采用 `default` 布局配合 `.cmpt-hero` 避免触发空白首屏；正文页严控字数密度，将逐字讲稿写入每页底部的 HTML 演讲者注释
3. 构建验证
   - [ ] 确保 `ppt/<slug>/node_modules` 为真实本地目录而非跨目录软链接，执行 `slidev build` 验证零编译错误

## Workflow slim：幻灯片信息减负与压缩

0. 盘点噪音
   - [ ] 运行 `node ~/.claude/skills/write-ppt/scripts/preflight.mjs --mode slim --slug <slug>`
   - [ ] 读 `references/slidev-deck-guide.md` 中的减负清单，扫描 `slides.md` 与 `components/*.vue`
1. 删减与提纯
   - [ ] 移除对听众无意义的讲者元数据：右上角时间标、章节编号出处、英文序号前缀（如 `CASE 01`、`SIGNAL 01`）、底部冗余页码条
   - [ ] 压缩卡片与列表文案：每页不超过 3 条单行要点；交互组件内删去多段长文对比，只留一句话事实加一句话判据；调大标题字号与页面留白

## 红线与故障恢复

- 严禁将 `ppt/<slug>/node_modules` 软链接到其他子项目目录：跨目录软链会导致 Vite 预构建缓存与真实路径同时加载两份 `vue-router` 实例，引发 `useNav.ts` 报
  `Cannot read properties of undefined (reading 'currentRoute')`。
- Vue 组件 `<script setup>` 的字符串字面量内禁止直接书写未转义的 `<script` 子串，否则会触发 `@vue/compiler-sfc` 标签提前闭合解析错误。
- Three.js 背景必须采用斜俯视固定机位铺满全屏，且默认保持静止无波浪起伏（仅在跨幕次翻页时平滑过渡色彩），避免持续晃动干扰听众阅读。

## References 地图

- `references/talk-script-guide.md`：限时技术分享的叙事弧线、时长切分公式、开场破题三件套、正反对照案例与收尾决策卡规范；`Workflow script` Step 1 必读
- `references/slidev-deck-guide.md`：Slidev 目录骨架、高留白大字号排版规范、Three.js 静态全屏背景实现、交互组件设计准则与常见编译运行时排障；`Workflow deck`
  Step 1 与 `Workflow slim` Step 0 必读
