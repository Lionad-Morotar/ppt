# 页面与入口清单

<!-- refreshed: 261006 -->

数据来源：`scripts/build-all-decks.mjs` 的 `SLIDEV_DECKS` / `STATIC_DECKS` 注册表（线上部署 deck 的权威清单）× 根 `package.json` 的 `scripts` 字段 × `ppt/` 目录实扫。本仓库是 PPT 集合而非多页应用，无前端路由体系——「页面」语义落地为各 deck 的演示入口；preflight 探针在 `ppt/demo-slidev/pages/` 检出的前端信号实为 Slidev 辅助目录（无 vue-router / 文件系统路由），不构成路由族，故不设前端路由分节。

## Deck 总览（线上入口）

| 目录 | 标题 | 形态 | 线上路径 | 部署 |
| ---- | ---- | ---- | -------- | ---- |
| `ppt/boris-five-roles-in-ai-native-teams` | AI 原生团队，该凑齐哪五种人 | Slidev 构建 | `/ppt/boris-five-roles-in-ai-native-teams/` | ✅ |
| `ppt/claude-from-zero` | Claude from Zero | Slidev 构建 | `/ppt/claude-from-zero/` | ✅ |
| `ppt/demo-slidev` | Slidev 功能演示 | Slidev 构建 | `/ppt/demo-slidev/` | ✅ |
| `ppt/poaa` | CSS 抗锯齿方案 POAA | 静态 HTML | `/ppt/poaa/` | ✅ |
| `ppt/light-travel` | CSS 光影魔法 | 静态 HTML | `/ppt/light-travel/` | ✅ |
| `ppt/demo` | reveal.js 官方测试 demo | 静态 HTML | — | ❌ 不部署 |

站点聚合首页 `/ppt/`（线上 `https://lionad-morotar.github.io/ppt/`）由构建脚本 `generateIndex()` 生成，卡片清单即上表部署项。`ppt/demo` 因依赖根级缺失的 reveal.js 插件（zoom / notes / search / markdown）初始化白屏，构建脚本显式排除、源文件保留。Slidev deck 的 base 路径在构建时经 `--base` 注入，静态 deck 的 `dist` / `plugin` 共享资源引用由构建脚本重写为站点绝对路径（详见 `scripts/build-all-decks.mjs` 头注释）。

## 命令总览

| 命令 | 说明 |
| ---- | ---- |
| `pnpm dev` | http-server 起根目录静态服务（9999 端口，禁缓存） |
| `pnpm start` | http-server 起根目录静态服务（9999 端口，带缓存） |
| `pnpm dev:boris` | 进入 boris deck 目录跑 Slidev dev |
| `pnpm dev:cfz` | 进入 claude-from-zero deck 目录跑 Slidev dev |
| `pnpm dev:demo` | 进入 demo-slidev deck 目录跑 Slidev dev |
| `pnpm build:all` | 聚合构建全部部署 deck → `dist-pages/ppt/` |
| `pnpm build:all:install` | 同上，构建前先对各 Slidev deck `pnpm install` |
| `pnpm preview:all` | http-server 预览 `dist-pages/`（8080 端口，子路径结构与线上一致） |

静态 deck（poaa / light-travel / demo）无独立 dev 命令，经根目录 `pnpm dev` 以静态服务方式预览；各 Slidev deck 内部另有 `build` / `export` 脚本（SPA 构建与 PDF/PEG 导出），由聚合构建与人工导出使用，不在根命令族重复登记。新增 deck 的登记点收敛在 `scripts/build-all-decks.mjs` 的 `SLIDEV_DECKS` / `STATIC_DECKS` 数组——本清单与线上导航页同源，两者以构建脚本为唯一事实源。
