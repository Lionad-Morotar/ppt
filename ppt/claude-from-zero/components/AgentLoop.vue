<script setup lang="ts">
import { computed, ref } from 'vue'

const step = ref(0)
const isPlaying = ref(false)

const steps = [
  { label: '用户输入', desc: '帮我查昨日出海订单', color: '#3b82f6' },
  { label: '推理', desc: '我需要调用查询订单工具', color: '#8b5cf6' },
  { label: '工具调用', desc: 'query_orders(date="昨日")', color: '#f59e0b' },
  { label: '工具执行', desc: '数据库返回 42 单', color: '#22c55e' },
  { label: '观察', desc: '结果成立，可以继续', color: '#06b6d4' },
  { label: '输出', desc: '昨日出海订单共 42 单', color: '#ef4444' },
]

const connections = computed(() => {
  const result: { from: number; to: number; active: boolean }[] = []

  for (let index = 0; index < steps.length - 1; index += 1) {
    result.push({
      from: index,
      to: index + 1,
      active: step.value > index,
    })
  }

  return result
})

// Play the loop once to simulate a full tool-using agent turn.
function play() {
  if (isPlaying.value) return

  isPlaying.value = true
  step.value = 0

  const timer = setInterval(() => {
    step.value += 1

    if (step.value >= steps.length) {
      clearInterval(timer)
      isPlaying.value = false
    }
  }, 720)
}

// Reset the component back to the initial state.
function reset() {
  step.value = 0
  isPlaying.value = false
}

// Jump to a specific step when the user clicks a node.
function setStep(nextStep: number) {
  if (isPlaying.value) return

  step.value = nextStep
}
</script>

<template>
  <div class="cmpt-agent-loop">
    <svg viewBox="0 0 640 240" class="w-full h-56">
      <defs>
        <marker id="cmpt-agent-loop-arrow" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
          <polygon points="0 0, 6 3, 0 6" fill="#94a3b8" />
        </marker>
      </defs>

      <line
        v-for="(connection, index) in connections"
        :key="`line-${index}`"
        :x1="70 + connection.from * 98"
        y1="86"
        :x2="168 + connection.from * 98"
        y2="86"
        :stroke="connection.active ? steps[connection.to].color : '#334155'"
        stroke-width="3"
        stroke-dasharray="6 4"
        marker-end="url(#cmpt-agent-loop-arrow)"
      />

      <path
        d="M 560 96 Q 590 160, 325 194 Q 70 160, 88 112"
        fill="none"
        stroke="#334155"
        stroke-width="3"
        stroke-dasharray="6 4"
        marker-end="url(#cmpt-agent-loop-arrow)"
      />

      <g
        v-for="(item, index) in steps"
        :key="item.label"
        class="cursor-pointer"
        @click="setStep(index + 1)"
      >
        <rect
          :x="32 + index * 98"
          y="54"
          width="76"
          height="64"
          rx="18"
          :fill="step > index ? item.color : '#0f172a'"
          :stroke="step > index ? item.color : '#334155'"
          stroke-width="2"
        />
        <text
          :x="70 + index * 98"
          y="92"
          text-anchor="middle"
          font-size="13"
          font-weight="700"
          :fill="step > index ? 'white' : '#cbd5e1'"
        >
          {{ item.label }}
        </text>
      </g>

      <foreignObject x="60" y="154" width="520" height="56">
        <div
          xmlns="http://www.w3.org/1999/xhtml"
          class="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-center text-sm text-slate-200"
        >
          {{ step > 0 ? steps[step - 1].desc : '点击按钮，演示一次完整的 ReAct 循环。' }}
        </div>
      </foreignObject>
    </svg>

    <div class="mt-3 flex justify-center gap-3">
      <button
        class="rounded-full border border-fuchsia-400/40 bg-fuchsia-500/20 px-4 py-2 text-sm text-white"
        :disabled="isPlaying"
        @click="play"
      >
        {{ isPlaying ? '运行中...' : '演示循环' }}
      </button>
      <button
        class="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200"
        @click="reset"
      >
        重置
      </button>
    </div>
  </div>
</template>
