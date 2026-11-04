#!/usr/bin/env node
// write-ppt 预检脚本（preflight.mjs）
// 1. 校验运行环境与仓库根目录结构
// 2. 扫描各子项目 package.json 已占用端口，为新 deck 分配不冲突端口
// 3. 检查目标 ppt/<slug>/ 是否存在跨目录 node_modules 软链风险（防 vue-router 双实例报错）

import { existsSync, lstatSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const SKILL_ROOT = resolve(__dirname, '..')

function readSkillVersion() {
  try {
    const raw = readFileSync(join(SKILL_ROOT, 'SKILL.md'), 'utf8')
    const m = raw.match(/^\s*version:\s*(\S+)/m)
    return m ? m[1] : 'alpha'
  }
  catch {
    return 'alpha'
  }
}

function printHelp() {
  console.log(`Usage: node preflight.mjs --mode <script|deck|slim> [--slug <slug>] [--duration <min>]

Options:
  --mode <mode>       工作流模式：script | deck | slim（默认 script）
  --slug <slug>       目标分享目录名（对应 ppt/<slug>）
  --duration <min>    讲稿目标时长（分钟，默认 30）
  --help              显示帮助信息
  --version           显示技能版本`)
}

const argv = process.argv.slice(2)
if (argv.includes('--help') || argv.includes('-h')) {
  printHelp()
  process.exit(0)
}
if (argv.includes('--version') || argv.includes('-v')) {
  console.log(readSkillVersion())
  process.exit(0)
}

function getArg(flag, fallback = '') {
  const idx = argv.indexOf(flag)
  if (idx !== -1 && idx + 1 < argv.length)
    return argv[idx + 1]
  return fallback
}

const mode = getArg('--mode', 'script')
const slug = getArg('--slug', '')
const duration = Number.parseInt(getArg('--duration', '30'), 10) || 30
const VALID_MODES = new Set(['script', 'deck', 'slim'])

const errors = []
const warnings = []

if (!VALID_MODES.has(mode)) {
  errors.push(`非法 --mode "${mode}"，合法值为: script, deck, slim`)
}

const repoRoot = resolve(SKILL_ROOT, '../../..')
const pptRoot = join(repoRoot, 'ppt')

if (!existsSync(pptRoot)) {
  errors.push(`未找到 ppt/ 目录: ${pptRoot}`)
}

// 扫描既有端口
const usedPorts = []
if (existsSync(pptRoot)) {
  for (const entry of readdirSync(pptRoot)) {
    const pkgPath = join(pptRoot, entry, 'package.json')
    if (existsSync(pkgPath) && statSync(pkgPath).isFile()) {
      try {
        const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'))
        const devCmd = pkg?.scripts?.dev || ''
        const m = devCmd.match(/--port\s+(\d+)/)
        if (m)
          usedPorts.push({ deck: entry, port: Number.parseInt(m[1], 10) })
      }
      catch {
        // 忽略损坏的 package.json
      }
    }
  }
}

let recommendedPort = 4945
const portSet = new Set(usedPorts.map(p => p.port))
while (portSet.has(recommendedPort)) {
  recommendedPort += 1
}

let targetInfo = null
if (slug) {
  const targetDir = join(pptRoot, slug)
  const exists = existsSync(targetDir)
  let hasSymlinkNodeModules = false
  const nmPath = join(targetDir, 'node_modules')
  if (existsSync(nmPath)) {
    try {
      hasSymlinkNodeModules = lstatSync(nmPath).isSymbolicLink()
    }
    catch {
      hasSymlinkNodeModules = false
    }
  }
  if (hasSymlinkNodeModules) {
    warnings.push(`检测到 ${nmPath} 为符号链接，会导致 Vite 加载双份 vue-router 引发 useNav 报错，请替换为独立 node_modules`)
  }
  if (mode === 'slim' && !exists) {
    errors.push(`slim 模式要求目标目录已存在: ${targetDir}`)
  }
  targetInfo = {
    slug,
    dir: targetDir,
    exists,
    hasSymlinkNodeModules,
  }
}
else if (mode === 'deck' || mode === 'slim') {
  warnings.push(`未传入 --slug，请在后续步骤中确认 ppt/<slug> 目录名`)
}

const ok = errors.length === 0
const report = {
  ok,
  skill_version: readSkillVersion(),
  mode,
  duration,
  pptRoot,
  usedPorts,
  recommendedPort,
  target: targetInfo,
  warnings,
  errors,
}

console.log(JSON.stringify(report, null, 2))
process.exit(ok ? 0 : 1)
