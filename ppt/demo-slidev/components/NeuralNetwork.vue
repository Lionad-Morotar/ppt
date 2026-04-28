<script setup lang="ts">
import { ref, computed } from 'vue'

const props = defineProps<{
  inputLabels?: string[]
  hiddenSize?: number
  outputLabel?: string
}>()

const inputLabels = props.inputLabels || ['颜色', '形状', '气味', '质地']
const hiddenSize = props.hiddenSize || 5
const outputLabel = props.outputLabel || '苹果'

const activeStep = ref(0)
const isPlaying = ref(false)

const nodes = computed(() => {
  const inputY = Array.from({ length: inputLabels.length }, (_, i) =>
    20 + (i * 60) / (inputLabels.length - 1 || 1)
  )
  const hiddenY = Array.from({ length: hiddenSize }, (_, i) =>
    10 + (i * 80) / (hiddenSize - 1 || 1)
  )
  const outputY = [50]
  return { inputY, hiddenY, outputY }
})

const inputHiddenConnections = computed(() => {
  const result: { key: string; x1: number; y1: number; x2: number; y2: number }[] = []
  const { inputY, hiddenY } = nodes.value
  for (let i = 0; i < inputY.length; i++) {
    for (let h = 0; h < hiddenY.length; h++) {
      result.push({
        key: `ih-${i}-${h}`,
        x1: 60,
        y1: inputY[i],
        x2: 200,
        y2: hiddenY[h],
      })
    }
  }
  return result
})

const hiddenOutputConnections = computed(() => {
  const result: { key: string; x1: number; y1: number; x2: number; y2: number }[] = []
  const { hiddenY, outputY } = nodes.value
  for (let h = 0; h < hiddenY.length; h++) {
    result.push({
      key: `ho-${h}`,
      x1: 200,
      y1: hiddenY[h],
      x2: 340,
      y2: outputY[0],
    })
  }
  return result
})

function play() {
  if (isPlaying.value) return
  isPlaying.value = true
  activeStep.value = 0
  const interval = setInterval(() => {
    activeStep.value++
    if (activeStep.value > 3) {
      clearInterval(interval)
      isPlaying.value = false
    }
  }, 800)
}

function reset() {
  activeStep.value = 0
  isPlaying.value = false
}
</script>

<template>
  <div class="neural-network relative w-full h-64">
    <!-- SVG Canvas -->
    <svg viewBox="0 0 400 150" class="w-full h-full">
      <!-- Connections Input -> Hidden -->
      <g v-if="activeStep >= 1">
        <line
          v-for="conn in inputHiddenConnections"
          :key="conn.key"
          :x1="conn.x1"
          :y1="conn.y1"
          :x2="conn.x2"
          :y2="conn.y2"
          stroke="#94a3b8"
          stroke-width="0.5"
          opacity="0.3"
        />
      </g>

      <!-- Connections Hidden -> Output -->
      <g v-if="activeStep >= 2">
        <line
          v-for="conn in hiddenOutputConnections"
          :key="conn.key"
          :x1="conn.x1"
          :y1="conn.y1"
          :x2="conn.x2"
          :y2="conn.y2"
          stroke="#94a3b8"
          stroke-width="0.5"
          opacity="0.3"
        />
      </g>

      <!-- Input Layer -->
      <g>
        <circle
          v-for="(iy, i) in nodes.inputY"
          :key="`input-${i}`"
          cx="60"
          :cy="iy"
          r="8"
          :fill="activeStep >= 0 ? '#3b82f6' : '#cbd5e1'"
          :class="{ 'animate-pulse': activeStep >= 0 }"
        />
        <text
          v-for="(label, i) in inputLabels"
          :key="`ilabel-${i}`"
          x="30"
          :y="nodes.inputY[i] + 4"
          font-size="8"
          fill="#475569"
          text-anchor="end"
        >{{ label }}</text>
      </g>

      <!-- Hidden Layer -->
      <g v-if="activeStep >= 1">
        <rect
          v-for="(hy, i) in nodes.hiddenY"
          :key="`hidden-${i}`"
          x="190"
          :y="hy - 10"
          width="20"
          height="20"
          rx="4"
          fill="#8b5cf6"
          opacity="0.8"
        />
        <text x="200" y="5" font-size="8" fill="#64748b" text-anchor="middle">隐藏层</text>
      </g>

      <!-- Output Layer -->
      <g v-if="activeStep >= 2">
        <circle
          cx="340"
          :cy="nodes.outputY[0]"
          r="12"
          :fill="activeStep >= 3 ? '#22c55e' : '#f59e0b'"
        />
        <text
          x="340"
          :y="nodes.outputY[0] + 4"
          font-size="10"
          fill="white"
          text-anchor="middle"
          font-weight="bold"
        >{{ activeStep >= 3 ? outputLabel : '?' }}</text>
      </g>

      <!-- Output Value -->
      <g v-if="activeStep >= 3">
        <text x="370" :y="nodes.outputY[0] - 8" font-size="8" fill="#22c55e" font-weight="bold">0.95</text>
        <text x="370" :y="nodes.outputY[0] + 8" font-size="7" fill="#64748b">置信度</text>
      </g>
    </svg>

    <!-- Controls -->
    <div class="flex gap-2 justify-center mt-2">
      <button
        class="px-3 py-1 text-xs rounded bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50"
        :disabled="isPlaying"
        @click="play"
      >
        {{ isPlaying ? '运行中...' : '前向传播' }}
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
