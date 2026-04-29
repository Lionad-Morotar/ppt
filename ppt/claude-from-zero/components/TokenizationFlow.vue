<script setup lang="ts">
/**
 * Tokenization Pipeline 可视化组件
 *
 * 展示核心概念：离散 token（整数索引）从不"进入"神经网络，
 * 它只是在门口被 Embedding 查找表翻译成了一个连续向量。
 */
import { ref, computed } from 'vue'
import { useIntervalFn, useTimeoutFn } from '@vueuse/core'

/** 动画阶段枚举 */
type Phase = 'text' | 'tokens' | 'ids' | 'embedding' | 'pos-enc' | 'input'

const PHASES: Phase[] = ['text', 'tokens', 'ids', 'embedding', 'pos-enc', 'input']
const PHASE_LABELS: Record<Phase, string> = {
  text: '原始文本',
  tokens: 'Tokenizer 切分',
  ids: 'Token IDs（整数索引）',
  embedding: 'Embedding 查找表',
  'pos-enc': '+ 位置编码',
  input: 'Transformer 输入',
}

/** 示例数据：中文句子被切分的过程 */
const pipeline = {
  text: '苹果多少钱一斤？',
  tokens: ['苹果', '多少', '钱', '一', '斤', '?'],
  ids: [15496, 8823, 4121, 298, 1567, 30],
  /** 每个 token 对应的"向量"——用 5 维可视化示意 */
  vectors: [
    [0.23, -0.41, 0.88, 0.15, -0.67],
    [0.71, 0.12, -0.33, 0.54, -0.21],
    [-0.15, 0.67, 0.44, -0.82, 0.31],
    [0.91, -0.23, 0.05, 0.76, -0.44],
    [0.33, 0.55, -0.71, 0.28, 0.62],
    [-0.62, 0.18, 0.39, -0.15, 0.77],
  ],
  /** 位置编码向量示意 */
  posVectors: [
    [0.0, 1.0, 0.0, 1.0, 0.0],
    [0.84, 0.54, 0.84, 0.54, 0.84],
    [0.91, -0.42, 0.91, -0.42, 0.91],
    [0.14, -0.99, 0.14, -0.99, 0.14],
    [-0.76, -0.65, -0.76, -0.65, -0.76],
    [-0.96, 0.28, -0.96, 0.28, -0.96],
  ],
}

/** 当前激活的阶段 */
const phaseIndex = ref(0)
const currentPhase = computed(() => PHASES[phaseIndex.value])

/** 每个 token 在该阶段是否"已处理"（用于 stagger 动画） */
const tokenProgress = ref(0)

/** 推进动画：每个阶段先展示标签，再逐个 token 流动 */
function advance() {
  const phase = currentPhase.value
  const tokenCount = pipeline.tokens.length

  // 阶段内进度：0 = 刚进入阶段，1~tokenCount = 逐个 token 处理，tokenCount+1 = 阶段完成
  if (tokenProgress.value < tokenCount + 1) {
    tokenProgress.value += 1
    return
  }

  // 进入下一阶段
  tokenProgress.value = 0
  phaseIndex.value = (phaseIndex.value + 1) % PHASES.length
}

useIntervalFn(advance, 700)

/** 判断某个 token 在当前阶段是否应高亮 */
function isTokenActive(index: number) {
  return tokenProgress.value > index
}

/** 判断某个阶段是否已激活（用于 pipeline 箭头流动） */
function isPhaseActive(phase: Phase) {
  const idx = PHASES.indexOf(phase)
  return idx < phaseIndex.value || (idx === phaseIndex.value && tokenProgress.value > 0)
}

/** 判断某个阶段是否当前正在展示 */
function isPhaseCurrent(phase: Phase) {
  return phase === currentPhase.value
}

/** 向量数值颜色映射：正数暖色，负数冷色 */
function cellColor(value: number) {
  if (value > 0.5) return '#a33124'
  if (value > 0) return '#c97a5b'
  if (value > -0.5) return '#6b8fa8'
  return '#2e5a6b'
}

/** 向量数值背景透明度 */
function cellBg(value: number) {
  const abs = Math.abs(value)
  return `rgba(22, 17, 15, ${abs * 0.15})`
}
</script>

<template>
  <div class="cmpt-tokenization-flow">
    <!-- ===== Pipeline 阶段指示器 ===== -->
    <div class="pipeline-header">
      <div
        v-for="(phase, idx) in PHASES"
        :key="phase"
        class="phase-step"
        :class="{
          'is-active': isPhaseActive(phase),
          'is-current': isPhaseCurrent(phase),
        }"
      >
        <span class="phase-dot">{{ idx + 1 }}</span>
        <span class="phase-name">{{ PHASE_LABELS[phase] }}</span>
        <span v-if="idx < PHASES.length - 1" class="phase-arrow">→</span>
      </div>
    </div>

    <!-- ===== 阶段 1: 原始文本 ===== -->
    <div class="stage" :class="{ 'is-visible': isPhaseCurrent('text') || isPhaseActive('text') }">
      <div class="stage-label">原始文本（字符串）</div>
      <div class="text-block">
        <span
          v-for="(char, i) in pipeline.text"
          :key="i"
          class="text-char"
          :class="{ 'is-active': isTokenActive(Math.floor(i / 2)) && isPhaseCurrent('text') }"
        >
          {{ char }}
        </span>
      </div>
    </div>

    <!-- ===== 阶段 2: Tokenizer 切分 ===== -->
    <div class="stage" :class="{ 'is-visible': isPhaseCurrent('tokens') || isPhaseActive('tokens') }">
      <div class="stage-label">Tokenizer 切分（模型外部预处理）</div>
      <div class="token-line">
        <div
          v-for="(token, i) in pipeline.tokens"
          :key="i"
          class="token-box"
          :class="{ 'is-active': isTokenActive(i) }"
        >
          {{ token }}
        </div>
      </div>
    </div>

    <!-- ===== 阶段 3: Token IDs ===== -->
    <div class="stage" :class="{ 'is-visible': isPhaseCurrent('ids') || isPhaseActive('ids') }">
      <div class="stage-label">Token IDs（离散整数索引 — 神经网络的"地址"）</div>
      <div class="id-line">
        <div
          v-for="(id, i) in pipeline.ids"
          :key="i"
          class="id-box"
          :class="{ 'is-active': isTokenActive(i) }"
        >
          <span class="id-num">{{ id }}</span>
        </div>
      </div>
    </div>

    <!-- ===== 阶段 4: Embedding 查找表 ===== -->
    <div class="stage" :class="{ 'is-visible': isPhaseCurrent('embedding') || isPhaseActive('embedding') }">
      <div class="stage-label">
        Embedding 查找表
        <span class="dim-tag">[vocab_size × hidden_dim]</span>
      </div>
      <div class="lookup-grid">
        <div
          v-for="(vec, i) in pipeline.vectors"
          :key="i"
          class="vector-card"
          :class="{ 'is-active': isTokenActive(i) }"
        >
          <div class="vector-header">
            <span class="vector-id">ID {{ pipeline.ids[i] }}</span>
            <span class="vector-token">{{ pipeline.tokens[i] }}</span>
          </div>
          <div class="vector-cells">
            <div
              v-for="(v, j) in vec"
              :key="j"
              class="vector-cell"
              :style="{
                backgroundColor: cellBg(v),
                color: cellColor(v),
              }"
            >
              {{ v.toFixed(2) }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ===== 阶段 5: 位置编码 ===== -->
    <div class="stage" :class="{ 'is-visible': isPhaseCurrent('pos-enc') || isPhaseActive('pos-enc') }">
      <div class="stage-label">+ 位置编码（为 Transformer 注入顺序信息）</div>
      <div class="posenc-formula">
        Input = Token_Embedding + Position_Embedding
      </div>
      <div class="lookup-grid">
        <div
          v-for="(vec, i) in pipeline.posVectors"
          :key="i"
          class="vector-card"
          :class="{ 'is-active': isTokenActive(i) }"
        >
          <div class="vector-header">
            <span class="vector-id">位置 {{ i + 1 }}</span>
          </div>
          <div class="vector-cells">
            <div
              v-for="(v, j) in vec"
              :key="j"
              class="vector-cell"
              :style="{
                backgroundColor: cellBg(v),
                color: cellColor(v),
              }"
            >
              {{ v.toFixed(2) }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ===== 阶段 6: Transformer 输入 ===== -->
    <div class="stage" :class="{ 'is-visible': isPhaseCurrent('input') || isPhaseActive('input') }">
      <div class="stage-label">最终输入：连续向量序列 → Self-Attention</div>
      <div class="transformer-input">
        <div
          v-for="(vec, i) in pipeline.vectors"
          :key="i"
          class="final-vector"
          :class="{ 'is-active': isTokenActive(i) }"
        >
          <div class="final-vector__token">{{ pipeline.tokens[i] }}</div>
          <div class="final-vector__dims">
            <div
              v-for="j in 5"
              :key="j"
              class="final-dim"
              :class="{ 'is-lit': isTokenActive(i) }"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- ===== 核心洞察提示 ===== -->
    <div class="insight-box">
      <strong>关键洞察：</strong>token 作为离散符号从不"进入"神经网络。
      它只是在门口被 Embedding 查找表翻译成一个连续向量。
      真正在网络中流动、被乘、被加、被激活的，永远是这些连续向量。
    </div>
  </div>
</template>

<style scoped>
/* ===== 容器 ===== */
.cmpt-tokenization-flow {
  display: grid;
  gap: 1.2rem;
  padding: 1rem;
}

/* ===== Pipeline 头部阶段指示器 ===== */
.pipeline-header {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.4rem;
  padding: 0.6rem 0.8rem;
  background: #f8f1e6;
  border: 2px solid #16110f;
}

.phase-step {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 0.8rem;
  color: #8a7a6a;
  transition: color 300ms ease;
}

.phase-step.is-active {
  color: #16110f;
}

.phase-step.is-current {
  font-weight: 700;
}

.phase-step.is-current .phase-dot {
  background: #a33124;
  color: #f8f1e6;
}

.phase-dot {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.4rem;
  height: 1.4rem;
  border-radius: 50%;
  background: #e4d7c3;
  border: 1.5px solid #16110f;
  font-size: 0.7rem;
  font-weight: 700;
  transition: all 300ms ease;
}

.phase-name {
  white-space: nowrap;
}

.phase-arrow {
  margin: 0 0.2rem;
  font-size: 0.9rem;
}

/* ===== 通用 stage ===== */
.stage {
  opacity: 0.3;
  transition: opacity 400ms ease;
}

.stage.is-visible {
  opacity: 1;
}

.stage-label {
  font-size: 0.85rem;
  font-weight: 600;
  color: #6e1f16;
  margin-bottom: 0.5rem;
}

.dim-tag {
  font-size: 0.75rem;
  font-weight: 400;
  color: #8a7a6a;
  margin-left: 0.4rem;
}

/* ===== 阶段 1: 原始文本 ===== */
.text-block {
  display: flex;
  flex-wrap: wrap;
  gap: 0.1rem;
  padding: 0.8rem 1rem;
  background: #e4d7c3;
  border: 2px solid #16110f;
  font-size: 1.3rem;
  font-weight: 500;
  color: #16110f;
}

.text-char {
  transition: all 200ms ease;
  padding: 0.1rem 0;
}

.text-char.is-active {
  color: #a33124;
  font-weight: 700;
  background: rgba(163, 49, 36, 0.1);
}

/* ===== 阶段 2: Tokens ===== */
.token-line {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.token-box {
  padding: 0.5rem 0.9rem;
  background: #e4d7c3;
  border: 2px solid #16110f;
  font-size: 1rem;
  font-weight: 500;
  color: #16110f;
  transition: all 250ms ease;
}

.token-box.is-active {
  background: #a33124;
  color: #f8f1e6;
  transform: translateY(-3px);
  box-shadow: 3px 3px 0 #16110f;
}

/* ===== 阶段 3: Token IDs ===== */
.id-line {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.id-box {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 3.5rem;
  padding: 0.5rem 0.7rem;
  background: #f8f1e6;
  border: 2px solid #16110f;
  font-family: 'Courier New', monospace;
  font-size: 0.95rem;
  font-weight: 600;
  color: #16110f;
  transition: all 250ms ease;
}

.id-box.is-active {
  background: #2e5a6b;
  color: #f8f1e6;
  transform: translateY(-3px);
  box-shadow: 3px 3px 0 #16110f;
}

/* ===== 阶段 4 & 5: Embedding / 位置编码 ===== */
.lookup-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
}

.vector-card {
  padding: 0.5rem;
  background: #f8f1e6;
  border: 2px solid #c4b5a5;
  transition: all 250ms ease;
  min-width: 6rem;
}

.vector-card.is-active {
  border-color: #16110f;
  box-shadow: 3px 3px 0 #16110f;
  transform: translateY(-2px);
}

.vector-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.3rem;
  font-size: 0.7rem;
}

.vector-id {
  font-weight: 700;
  color: #a33124;
}

.vector-token {
  color: #8a7a6a;
}

.vector-cells {
  display: flex;
  gap: 0.15rem;
}

.vector-cell {
  width: 2.2rem;
  height: 2.2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Courier New', monospace;
  font-size: 0.65rem;
  font-weight: 600;
  border: 1px solid rgba(22, 17, 15, 0.15);
  transition: all 200ms ease;
}

/* ===== 阶段 5: 位置编码公式 ===== */
.posenc-formula {
  font-family: 'Courier New', monospace;
  font-size: 0.9rem;
  padding: 0.4rem 0.8rem;
  background: #e4d7c3;
  border: 1.5px solid #16110f;
  margin-bottom: 0.6rem;
  display: inline-block;
}

/* ===== 阶段 6: Transformer 输入 ===== */
.transformer-input {
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
}

.final-vector {
  display: grid;
  gap: 0.3rem;
  padding: 0.5rem;
  background: #e4d7c3;
  border: 2px solid #c4b5a5;
  transition: all 250ms ease;
  min-width: 4rem;
}

.final-vector.is-active {
  border-color: #a33124;
  background: #16110f;
  transform: translateY(-3px);
  box-shadow: 3px 3px 0 #a33124;
}

.final-vector__token {
  font-size: 0.8rem;
  font-weight: 600;
  text-align: center;
  color: #16110f;
  transition: color 250ms ease;
}

.final-vector.is-active .final-vector__token {
  color: #f8f1e6;
}

.final-vector__dims {
  display: flex;
  gap: 0.2rem;
  justify-content: center;
}

.final-dim {
  width: 0.5rem;
  height: 1.2rem;
  background: #c4b5a5;
  transition: all 200ms ease;
}

.final-dim.is-lit {
  background: #a33124;
  box-shadow: 0 0 4px rgba(163, 49, 36, 0.5);
}

/* ===== 洞察提示 ===== */
.insight-box {
  margin-top: 0.5rem;
  padding: 0.8rem 1rem;
  background: #6e1f16;
  color: #f8f1e6;
  font-size: 0.9rem;
  line-height: 1.6;
  border: 2px solid #16110f;
}

.insight-box strong {
  font-weight: 700;
  text-decoration: underline;
  text-underline-offset: 3px;
}
</style>
