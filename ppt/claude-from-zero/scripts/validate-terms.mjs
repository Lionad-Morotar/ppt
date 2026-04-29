#!/usr/bin/env node
/**
 * 术语使用校验脚本
 * 检查 terms.yaml 中定义的术语是否在 slides 中被 <terms> 组件使用
 */

import { readFileSync, readdirSync, statSync } from 'node:fs'
import { resolve, dirname, extname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')

// ── 1. 读取并解析 terms.yaml ──────────────────────────────
const yamlPath = resolve(root, '../../docs/claude-from-zero/terms.yaml')
const yamlContent = readFileSync(yamlPath, 'utf-8')

/** 用正则从 YAML 中提取所有 id */
const definedTerms = new Set(
  [...yamlContent.matchAll(/^\s+-\s+id:\s*(\S+)/gm)].map(m => m[1])
)

// ── 2. 扫描 slides 中的 <terms> 使用 ────────────────────────
const usedTerms = new Set()

/** 递归收集指定目录下匹配扩展名的文件 */
function collectFiles(dir, exts, out = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    const s = statSync(full)
    if (s.isDirectory()) {
      collectFiles(full, exts, out)
    } else if (s.isFile() && exts.includes(extname(entry))) {
      out.push(full)
    }
  }
  return out
}

const scanTargets = [
  resolve(root, 'slides.md'),
  ...collectFiles(resolve(root, 'components'), ['.vue']),
]

for (const file of scanTargets) {
  const content = readFileSync(file, 'utf-8')
  // 匹配 <terms :term="xxx" 或 <Terms :term="xxx" 或 <terms term="xxx"
  const matches = content.matchAll(
    /<[Tt]erms\s+[:]?term=["']([^"']+)["']/g
  )
  for (const m of matches) {
    usedTerms.add(m[1])
  }
}

// ── 3. 对比并输出报告 ─────────────────────────────────────
const unused = [...definedTerms].filter(id => !usedTerms.has(id))
const undefined = [...usedTerms].filter(id => !definedTerms.has(id))

let exitCode = 0

console.log(`\n📋 术语使用校验报告`)
console.log(`────────────────────────────────────────`)
console.log(`定义术语数: ${definedTerms.size}`)
console.log(`使用术语数: ${usedTerms.size}`)

if (unused.length > 0) {
  console.log(`\n⚠️  未使用的术语 (${unused.length}):`)
  for (const id of unused) {
    console.log(`   · ${id}`)
  }
  exitCode = 1
}

if (undefined.length > 0) {
  console.log(`\n❌ 使用了但未定义的术语 (${undefined.length}):`)
  for (const id of undefined) {
    console.log(`   · ${id}`)
  }
  exitCode = 1
}

if (exitCode === 0) {
  console.log('\n✅ 所有术语均已使用，无异常。')
}

console.log(`────────────────────────────────────────\n`)
process.exit(exitCode)
