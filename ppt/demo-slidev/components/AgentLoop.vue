<script setup lang="ts">
import { ref, computed } from 'vue'

const step = ref(0)
const isPlaying = ref(false)

const steps = [
  { label: '用户输入', desc: '"帮我查昨日出海订单"', color: '#3b82f6' },
  { label: '推理', desc: '我需要调用查询订单工具', color: '#8b5cf6' },
  { label: '工具调用', desc: '调用 query_orders(date="昨日", type="出海")', color: '#f59e0b' },
  { label: '工具执行', desc: '数据库查询 → 返回 42 单', color: '#22c55e' },
  { label: '观察结果', desc: '昨日出海订单共 42 单', color: '#06b6d4' },
  { label: '再次推理', desc: '结果已确认，可以回答用户', color: '#8b5cf6' },
  { label: '输出回答', desc: '昨日出海订单共 42 单', color: '#ef4444' },
]

const connections = computed(() => {
  const result: { from: number; to: number; active: boolean }[] = []
  for (let i = 0; i < steps.length - 1; i++) {
    result.push({
      from: i,
      to: i + 1,
      active: step.value > i
    })
  }
  // ReAct 循环：从最后回到推理
  result.push({
    from: steps.length - 1,
    to: 1,
    active: false
  })
  return result
})

function play() {
  if (isPlaying.value) return
  isPlaying.value = true
  step.value = 0
  const interval = setInterval(() => {
    step.value++
    if (step.value >= steps.length) {
      clearInterval(interval)
      setTimeout(() => {
        isPlaying.value = false
      }, 500)
    }
  }, 900)
}

function reset() {
  step.value = 0
  isPlaying.value = false
}

function setStep(s: number) {
  if (isPlaying.value) return
  step.value = s
}
</script>

<template>
  <div class="agent-loop">
    <!-- SVG Canvas -->
    <svg viewBox="0 0 600 200" class="w-full h-48">
      <!-- 连接线 -->
      <g>
        <line
          v-for="(conn, i) in connections.slice(0, -1)"
          :key="`conn-${i}`"
          :x1="60 + i * 85"
          :y1="60"
          :x2="60 + (i + 1) * 85"
          :y2="60"
          :stroke="conn.active ? steps[i+1].color : '#e2e8f0'"
          stroke-width="2"
          stroke-dasharray="4 2"
        />
        <!-- 循环箭头 -->
        <path
          v-if="step >= steps.length - 1"
          d="M 560 60 Q 580 120, 300 150 Q 20 120, 60 80"
          fill="none"
          stroke="#e2e8f0"
          stroke-width="2"
          stroke-dasharray="4 2"
          marker-end="url(#arrowhead)"
        />
        <defs>
          <marker id="arrowhead" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
            <polygon points="0 0, 6 3, 0 6" fill="#94a3b8" />
          </marker>
        </defs>
      </g>

      <!-- 节点 -->
      <g
        v-for="(s, i) in steps"
        :key="`node-${i}`"
        class="cursor-pointer"
        @click="setStep(i + 1)"
      >
        <!-- 节点圆/方 -->
        <rect
          :x="40 + i * 85"
          :y="40"
          width="40"
          height="40"
          rx="8"
          :fill="step > i ? s.color : '#f1f5f9'"
          :stroke="step > i ? s.color : '#cbd5e1'"
          stroke-width="2"
          class="transition-all duration-300"
        />
        <!-- 序号 -->
        <text
          :x="60 + i * 85"
          :y="64"
          text-anchor="middle"
          :fill="step > i ? 'white' : '#94a3b8'"
          font-size="14"
          font-weight="bold"
        >{{ i + 1 }}</text>
        <!-- 标签 -->
        <text
          :x="60 + i * 85"
          :y="100"
          text-anchor="middle"
          :fill="step > i ? s.color : '#94a3b8'"
          font-size="10"
          font-weight="500"
        >{{ s.label }}</text>
      </g>

      <!-- 当前步骤描述 -->
      <g v-if="step > 0 && step <= steps.length">
        <rect
          x="50"
          y="130"
          width="500"
          height="50"
          rx="8"
          :fill="steps[step - 1].color"
          opacity="0.1"
        />
        <text
          x="300"
          y="155"
          text-anchor="middle"
          :fill="steps[step - 1].color"
          font-size="12"
          font-weight="500"
        >{{ steps[step - 1].desc }}</text>
      </g>
    </svg>

    <!-- Controls -->
    <div class="flex gap-2 justify-center mt-2">
      <button
        class="px-3 py-1 text-xs rounded bg-purple-500 text-white hover:bg-purple-600 disabled:opacity-50"
        :disabled="isPlaying"
        @click="play"
      >
        {{ isPlaying ? '运行中...' : '演示 ReAct 循环' }}
      </button>
      <button
        class="px-3 py-1 text-xs rounded border border-gray-300 hover:bg-gray-100"
        @click="reset"
      >
        重置
      </button>
    </div>
  </div>
</template>
