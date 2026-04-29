#!/usr/bin/env node
/**
 * 术语批量替换脚本
 * 将 slides.md 中的裸写术语替换为 <terms> 组件
 * 核心策略：基于位置追踪，一次性替换所有非重叠匹配
 */

import { readFileSync, writeFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const slidesPath = resolve(__dirname, '../slides.md')

// ── 读取原始内容 ──────────────────────────────────────────
const original = readFileSync(slidesPath, 'utf-8')
const lines = original.split('\n')

// ── 中文术语替换规则（按长度降序，长的优先）───────────────
const cnRules = [
  ['模型上下文协议', 'mcp'],
  ['Agent 间通信协议', 'a2a'],
  ['上下文溢出', 'context-overflow'],
  ['提示词工程', 'prompt-engineering'],
  ['系统提示', 'system-prompt'],
  ['推理预算', 'reasoning-budget'],
  ['梯度下降', 'gradient-descent'],
  ['长程任务', 'long-horizon-task'],
  ['工具调用', 'tool-call'],
  ['检索增强生成', 'rag'],
  ['大语言模型', 'llm'],
  ['神经网络', 'neural-network'],
  ['输入层', 'input-layer'],
  ['隐藏层', 'hidden-layer'],
  ['输出层', 'output-layer'],
  ['上下文', 'context'],
  ['提示词', 'prompt'],
  ['权重', 'weights'],
  ['损失', 'loss'],
  ['涌现', 'emergence'],
  ['微调', 'fine-tuning'],
  ['幻觉', 'hallucination'],
  ['技能', 'skills'],
]

// ── 英文术语替换规则（按特定性排序，复合词优先）──────────
const enRules = [
  // 复合词（优先匹配）
  { pattern: /\bVibe Coding\b/g, id: 'vibe-coding', display: 'Vibe Coding' },
  { pattern: /\bvibe coding\b/g, id: 'vibe-coding', display: 'vibe coding' },
  { pattern: /\bClaude Code\b/g, id: 'claude-code', display: 'Claude Code' },
  { pattern: /\bReasoning Budget\b/g, id: 'reasoning-budget', display: 'Reasoning Budget' },
  { pattern: /\bContext Overflow\b/g, id: 'context-overflow', display: 'Context Overflow' },
  { pattern: /\bPrompt Engineering\b/g, id: 'prompt-engineering', display: 'Prompt Engineering' },
  { pattern: /\bSystem Prompt\b/g, id: 'system-prompt', display: 'System Prompt' },
  { pattern: /\bTool Call\b/g, id: 'tool-call', display: 'Tool Call' },
  { pattern: /\bError Recovery\b/g, id: 'error-recovery', display: 'Error Recovery' },
  { pattern: /\bLong-Horizon Task\b/g, id: 'long-horizon-task', display: 'Long-Horizon Task' },
  { pattern: /\bLong Horizon Task\b/g, id: 'long-horizon-task', display: 'Long Horizon Task' },
  { pattern: /\bModel Context Protocol\b/g, id: 'mcp', display: 'Model Context Protocol' },
  { pattern: /\bAgent to Agent\b/g, id: 'a2a', display: 'Agent to Agent' },
  { pattern: /\bAgent To Agent\b/g, id: 'a2a', display: 'Agent To Agent' },
  { pattern: /\bFine-tuning\b/g, id: 'fine-tuning', display: 'Fine-tuning' },
  { pattern: /\bFine-Tuning\b/g, id: 'fine-tuning', display: 'Fine-Tuning' },
  { pattern: /\bGradient Descent\b/g, id: 'gradient-descent', display: 'Gradient Descent' },
  { pattern: /\bNeural Network\b/g, id: 'neural-network', display: 'Neural Network' },
  { pattern: /\bInput Layer\b/g, id: 'input-layer', display: 'Input Layer' },
  { pattern: /\bHidden Layer\b/g, id: 'hidden-layer', display: 'Hidden Layer' },
  { pattern: /\bOutput Layer\b/g, id: 'output-layer', display: 'Output Layer' },
  { pattern: /\bReAct\b/g, id: 'react', display: 'ReAct' },
  { pattern: /\bCRISPE\b/g, id: 'crispe', display: 'CRISPE' },
  { pattern: /\bOpenClaw\b/g, id: 'openclaw', display: 'OpenClaw' },
  // 单/双词
  { pattern: /\bReasoning\b/g, id: 'reasoning-budget', display: 'Reasoning' },
  { pattern: /\bHallucination\b/g, id: 'hallucination', display: 'Hallucination' },
  { pattern: /\bEmergence\b/g, id: 'emergence', display: 'Emergence' },
  { pattern: /\bHarness\b/g, id: 'harness', display: 'Harness' },
  { pattern: /\bWeights\b/g, id: 'weights', display: 'Weights' },
  { pattern: /\bSkills\b/g, id: 'skills', display: 'Skills' },
  { pattern: /\bskills\b/g, id: 'skills', display: 'skills' },
  // 缩写
  { pattern: /\bLLM\b/g, id: 'llm', display: 'LLM' },
  { pattern: /\bMCP\b/g, id: 'mcp', display: 'MCP' },
  { pattern: /\bA2A\b/g, id: 'a2a', display: 'A2A' },
  { pattern: /\bRAG\b/g, id: 'rag', display: 'RAG' },
  // 普通词（最后匹配）
  { pattern: /\bToken\b/g, id: 'token', display: 'Token' },
  { pattern: /\btoken\b/g, id: 'token', display: 'token' },
  { pattern: /\bChat\b/g, id: 'chat', display: 'Chat' },
  { pattern: /\bchat\b/g, id: 'chat', display: 'chat' },
  { pattern: /\bAgent\b/g, id: 'agent', display: 'Agent' },
  { pattern: /\bagent\b/g, id: 'agent', display: 'agent' },
]

// ── 需要跳过的行 ──────────────────────────────────────────
function shouldSkipLine(line) {
  const trimmed = line.trim()
  if (trimmed.startsWith('```')) return 'code-block-boundary'
  // 只跳过 Vue 组件标签行（以大写字母开头，如 <NeuralNetwork、<CmptPanel）
  // 不跳过普通 HTML 标签（<div>、<li>、<strong> 等），因为这些行中包含术语
  if (/^\s*<[A-Z]/.test(line)) return 'vue-component'
  // 跳过 Vue 组件的闭合标签（</CmptPanel>）
  if (/^\s*<\/[A-Z]/.test(line)) return 'vue-component-close'
  // 跳过 slide 分隔符
  if (/^\s*---\s*$/.test(line)) return 'slide-separator'
  return null
}

// ── 核心替换逻辑：基于位置追踪 ────────────────────────────
function replaceLine(line, lineNum) {
  const log = []

  // 1. 收集所有匹配（在原始文本上）
  const matches = []

  // 中文匹配
  for (const [cn, id] of cnRules) {
    let idx = line.indexOf(cn)
    while (idx !== -1) {
      matches.push({
        start: idx,
        end: idx + cn.length,
        text: cn,
        id,
        display: cn,
        priority: cn.length, // 长的优先级高
      })
      idx = line.indexOf(cn, idx + 1)
    }
  }

  // 英文匹配
  for (const rule of enRules) {
    rule.pattern.lastIndex = 0
    let m
    while ((m = rule.pattern.exec(line)) !== null) {
      matches.push({
        start: m.index,
        end: m.index + m[0].length,
        text: m[0],
        id: rule.id,
        display: rule.display,
        priority: m[0].length,
      })
    }
  }

  // 2. 按起始位置排序，起始位置相同则按优先级（长的优先）
  matches.sort((a, b) => {
    if (a.start !== b.start) return a.start - b.start
    return b.priority - a.priority
  })

  // 3. 过滤重叠：保留不重叠的匹配
  const accepted = []
  for (const m of matches) {
    let overlaps = false
    for (const a of accepted) {
      // 检查是否重叠
      if (m.start < a.end && m.end > a.start) {
        overlaps = true
        break
      }
    }
    if (!overlaps) {
      accepted.push(m)
    }
  }

  // 4. 从后往前替换（避免位置偏移）
  accepted.sort((a, b) => b.start - a.start)

  let result = line
  for (const m of accepted) {
    const before = result.slice(0, m.start)
    const after = result.slice(m.end)
    result = before + `<terms :term="${m.id}">${m.display}</terms>` + after
    log.push(`L${lineNum}: "${m.text}" -> <terms :term="${m.id}">`)
  }

  return { result, log }
}

// ── 处理每一行 ────────────────────────────────────────────
let inCodeBlock = false
let totalReplaced = 0
let skippedLines = 0
const allLogs = []

const result = lines.map((line, idx) => {
  const lineNum = idx + 1

  // 切换代码块状态
  if (line.trim().startsWith('```')) {
    inCodeBlock = !inCodeBlock
    return line
  }

  // 跳过代码块内部
  if (inCodeBlock) {
    skippedLines++
    return line
  }

  // 跳过特定行
  const skipReason = shouldSkipLine(line)
  if (skipReason) {
    skippedLines++
    return line
  }

  const { result: newLine, log } = replaceLine(line, lineNum)
  totalReplaced += log.length
  allLogs.push(...log)

  return newLine
})

// ── 输出结果 ──────────────────────────────────────────────
writeFileSync(slidesPath, result.join('\n'))

console.log(`\n📋 术语替换报告`)
console.log(`────────────────────────────────────────`)
console.log(`总行数: ${lines.length}`)
console.log(`替换次数: ${totalReplaced}`)
console.log(`跳过行数: ${skippedLines}`)
console.log(`\n替换日志 (前 60 条):`)
allLogs.slice(0, 60).forEach(l => console.log(`  ${l}`))
if (allLogs.length > 60) {
  console.log(`  ... 还有 ${allLogs.length - 60} 条`)
}
console.log(`────────────────────────────────────────\n`)
