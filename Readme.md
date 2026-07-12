# PPT

一些分享

## 线上访问

推送到 main 后自动构建并发布到 GitHub Pages：

👉 https://lionad-morotar.github.io/ppt/

每个分享的子路径：

- https://lionad-morotar.github.io/ppt/boris-five-roles-in-ai-native-teams/
- https://lionad-morotar.github.io/ppt/claude-from-zero/
- https://lionad-morotar.github.io/ppt/demo-slidev/
- https://lionad-morotar.github.io/ppt/poaa/
- https://lionad-morotar.github.io/ppt/light-travel/

## 本地预览

聚合构建全部分享，再起本地静态服务（行为与线上一致）：

```bash
pnpm build:all      # 聚合构建到 dist-pages/
pnpm preview:all    # 打开 http://localhost:8080/ppt/
```

单独预览某个 Slidev deck：

```bash
pnpm dev:boris      # boris deck（端口 4945）
pnpm dev:cfz        # claude-from-zero（端口 3411）
pnpm dev:demo       # demo-slidev（端口 12983）
```

## 分享列表

- [2026-07《AI 原生团队，该凑齐哪五种人》](./ppt/boris-five-roles-in-ai-native-teams)：Boris Cherny 眼中，AI 时代团队只剩五种人。
- [2026-04-29《Claude from Zero》](./ppt/claude-from-zero)：面向产研团队的 AI 入门指南，弥合 0 基础与上手 Claude 之间的鸿沟。
- [《Slidev 功能演示》](./ppt/demo-slidev)：Slidev 核心能力与高级特性展示。
- [2022-06-15《CSS 光影魔法》](./ppt/light-travel)：如何用 CSS 仿制拟真的阴影效果？
- [2021-04-20《CSS 抗锯齿方案 POAA》](./ppt/poaa)：如何解决 CSS 背景中的锯齿？

## 部署机制

`scripts/build-all-decks.mjs` 聚合构建全部分享；`.github/workflows/deploy-pages.yml` 在 push main 时触发，把 `dist-pages/ppt/` 发布为 GitHub Pages。新增 Slidev deck 只需放进 `ppt/<deck>/` 并在脚本顶部的 `SLIDEV_DECKS` 数组加一行。

> 新仓库首次部署需在 GitHub 仓库 Settings → Pages → Source 选择 "GitHub Actions"。
