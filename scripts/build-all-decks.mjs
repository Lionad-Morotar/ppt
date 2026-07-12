#!/usr/bin/env node
/**
 * 聚合构建所有分享 → dist-pages/ppt/，作为 GitHub Pages 部署根。
 *
 * 为什么是独立脚本而非 workflow 内联 shell：
 *   - 本地可完整复现 CI 的聚合行为（验证胜过猜测）
 *   - deck 清单集中维护，新增 deck 只改这一处
 *
 * 路径映射（关键）：
 *   Pages URL = https://lionad-morotar.github.io/ppt/<deck>/
 *   artifact path = dist-pages/ppt/
 *   故 dist-pages/ppt/<deck>/ 对应 github.io/ppt/<deck>/，base = /ppt/<deck>/
 *   本地预览：http-server dist-pages → http://localhost:8080/ppt/ 与线上一致
 *
 * 老 revealjs 分享（poaa/light-travel/demo）依赖根级 dist/ 与 plugin/ 共享资源。
 * 它们的 html 用 ../../dist/ 或 /dist/ 引用，子路径部署会 404，因此：
 *   - 共享 dist/ plugin/ 复制到站点根
 *   - 各 html 里对这些资源的引用统一重写为 ${URL_PREFIX}/dist|plugin/
 */
import { execSync } from 'node:child_process'
import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs'
import { join, resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const DECKS = join(ROOT, 'ppt')
const OUT_ROOT = join(ROOT, 'dist-pages')
const SERVE_ROOT = join(OUT_ROOT, 'ppt') // 部署根，对齐 github.io/ppt/
const URL_PREFIX = '/ppt' // 仓库名；若 repo 改名需同步

// Slidev deck：用 build --base --out 注入子路径
const SLIDEV_DECKS = [
  { dir: 'boris-five-roles-in-ai-native-teams', title: 'AI 原生团队，该凑齐哪五种人', desc: 'Boris Cherny 眼中，AI 时代团队只剩五种人' },
  { dir: 'claude-from-zero', title: 'Claude from Zero', desc: '面向产研团队的 AI 入门指南' },
  { dir: 'demo-slidev', title: 'Slidev 功能演示', desc: 'Slidev 核心能力与高级特性展示' },
]

// 静态 HTML 分享：整目录复制，保留相对资源路径
// 注：ppt/demo 是 revealjs 官方测试 demo，依赖 root 缺失的 zoom/notes/search/markdown
// 插件，初始化即白屏；且非分享内容，故不纳入部署（源文件保留）
const STATIC_DECKS = [
  { dir: 'poaa', title: 'CSS 抗锯齿方案 POAA', desc: '2021 · 解决 CSS 背景中的锯齿' },
  { dir: 'light-travel', title: 'CSS 光影魔法', desc: '2022 · 用 CSS 仿制拟真阴影' },
]

// revealjs 共享资源（根级 dist/plugin），多个老分享引用
const SHARED_REVEAL_DIRS = ['dist', 'plugin']
// 匹配 src/href 后跟可选(../)+ 或 / 再接 dist|plugin 的引用；不误伤 CDN 外链（=" 后必须是路径前缀）
const REVEAL_REF_RE = /(src|href)="((?:\.\.\/)+|\/)?(dist|plugin)\//g

const log = (m) => console.log(`\n▶ ${m}`)
const run = (cmd, opts) => execSync(cmd, { stdio: 'inherit', ...opts })

function buildSlidev(deck) {
  const dir = join(DECKS, deck.dir)
  const base = `${URL_PREFIX}/${deck.dir}/`
  const out = join(SERVE_ROOT, deck.dir)
  log(`build slidev: ${deck.dir}  (base=${base})`)
  run(`pnpm exec slidev build --base "${base}" --out "${out}"`, { cwd: dir })
}

// 复制根级 revealjs 共享资源到站点根，供老分享的 /ppt/dist|plugin/ 引用
function copySharedReveal() {
  for (const d of SHARED_REVEAL_DIRS) {
    const src = join(ROOT, d)
    if (!existsSync(src)) continue
    log(`copy shared reveal: ${d}/`)
    cpSync(src, join(SERVE_ROOT, d), { recursive: true })
  }
}

// 递归重写目录下所有 .html 里对 dist/plugin 的引用为站点绝对路径
function rewriteRevealPaths(dir) {
  for (const ent of readdirSync(dir)) {
    const p = join(dir, ent)
    if (statSync(p).isDirectory()) {
      rewriteRevealPaths(p)
    } else if (ent.endsWith('.html')) {
      const orig = readFileSync(p, 'utf8')
      const next = orig.replace(REVEAL_REF_RE, `$1="${URL_PREFIX}/$3/`)
      if (next !== orig) writeFileSync(p, next)
    }
  }
}

function copyStatic(deck) {
  const dst = join(SERVE_ROOT, deck.dir)
  log(`copy static: ${deck.dir}`)
  cpSync(join(DECKS, deck.dir), dst, {
    recursive: true,
    // 排除依赖与版本目录，避免把 node_modules 部署上线
    filter: (s) => !/(^|\/)(node_modules|\.git)(\/|$)/.test(s),
  })
  // 老 revealjs 分享的 dist/plugin 引用重写为站点绝对路径，避免子路径 404
  rewriteRevealPaths(dst)
}

function generateIndex() {
  const all = [...SLIDEV_DECKS, ...STATIC_DECKS]
  const cards = all.map((d) => `      <a class="card" href="${URL_PREFIX}/${d.dir}/">
        <h2>${d.title}</h2>
        <p>${d.desc}</p>
        <span class="path">/${d.dir}</span>
      </a>`).join('\n')

  const html = `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>分享 · Lionad-Morotar/ppt</title>
  <style>
    :root { color-scheme: light dark; }
    body { font-family: system-ui, -apple-system, 'PingFang SC', sans-serif; max-width: 920px; margin: 0 auto; padding: 48px 24px 80px; line-height: 1.6; color: #1f2937; }
    h1 { font-size: 1.6rem; margin: 0 0 .25em; }
    .sub { color: #6b7280; margin: 0 0 2.5rem; }
    .grid { display: grid; gap: 1rem; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); }
    .card { display: block; padding: 1.25rem 1.4rem; border: 1px solid #e5e7eb; border-radius: 12px; text-decoration: none; color: inherit; transition: transform .15s ease, border-color .15s ease, box-shadow .15s ease; }
    .card:hover { transform: translateY(-2px); border-color: #9ca3af; box-shadow: 0 8px 24px rgba(0,0,0,.08); }
    .card h2 { font-size: 1.05rem; margin: 0 0 .35em; }
    .card p { font-size: .9rem; color: #6b7280; margin: 0 0 .75em; }
    .card .path { font-family: ui-monospace, 'SF Mono', monospace; font-size: .78rem; color: #2563eb; }
    footer { margin-top: 3rem; color: #9ca3af; font-size: .85rem; }
    footer a { color: #6b7280; }
    @media (prefers-color-scheme: dark) {
      body { color: #e5e7eb; }
      .card { border-color: #374151; }
      .card p { color: #9ca3af; }
    }
  </style>
</head>
<body>
  <h1>Lionad 的分享</h1>
  <p class="sub">所有 PPT 与技术分享合集</p>
  <div class="grid">
${cards}
  </div>
  <footer>由 <code>scripts/build-all-decks.mjs</code> 自动生成 · <a href="https://github.com/Lionad-Morotar/ppt">repo</a></footer>
</body>
</html>`
  writeFileSync(join(SERVE_ROOT, 'index.html'), html)
  log('generated index.html')
}

// ── main ───────────────────────────────────────────────────────
const install = process.argv.includes('--install')
console.log(`OUT → ${SERVE_ROOT}`)

rmSync(OUT_ROOT, { recursive: true, force: true })
mkdirSync(SERVE_ROOT, { recursive: true })

if (install) {
  for (const d of SLIDEV_DECKS) {
    log(`install: ${d.dir}`)
    run('pnpm install', { cwd: join(DECKS, d.dir) })
  }
}

for (const d of SLIDEV_DECKS) buildSlidev(d)
if (STATIC_DECKS.length) copySharedReveal()
for (const d of STATIC_DECKS) copyStatic(d)
generateIndex()

console.log(`\n✓ done → ${SERVE_ROOT}`)
console.log(`  本地预览: pnpm preview:all  →  http://localhost:8080/ppt/`)
