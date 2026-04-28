<script setup lang="ts">
import { computed, ref } from 'vue'

const props = withDefaults(defineProps<{
  inputLabels?: string[]
  hiddenSize?: number
  outputLabel?: string
}>(), {
  inputLabels: () => ['颜色', '形状', '气味', '质地'],
  hiddenSize: 5,
  outputLabel: '苹果',
})

const activeStep = ref(0)
const isPlaying = ref(false)

const nodes = computed(() => {
  const inputY: number[] = []
  const hiddenY: number[] = []

  for (let index = 0; index < props.inputLabels.length; index += 1) {
    inputY.push(24 + (index * 96) / Math.max(props.inputLabels.length - 1, 1))
  }

  for (let index = 0; index < props.hiddenSize; index += 1) {
    hiddenY.push(12 + (index * 116) / Math.max(props.hiddenSize - 1, 1))
  }

  return {
    inputY,
    hiddenY,
    outputY: 72,
  }
})

const inputHiddenConnections = computed(() => {
  const connections: { key: string; x1: number; y1: number; x2: number; y2: number }[] = []

  for (let inputIndex = 0; inputIndex < nodes.value.inputY.length; inputIndex += 1) {
    for (let hiddenIndex = 0; hiddenIndex < nodes.value.hiddenY.length; hiddenIndex += 1) {
      connections.push({
        key: `ih-${inputIndex}-${hiddenIndex}`,
        x1: 72,
        y1: nodes.value.inputY[inputIndex],
        x2: 220,
        y2: nodes.value.hiddenY[hiddenIndex],
      })
    }
  }

  return connections
})

const hiddenOutputConnections = computed(() => {
  return nodes.value.hiddenY.map((hiddenY, hiddenIndex) => ({
    key: `ho-${hiddenIndex}`,
    x1: 220,
    y1: hiddenY,
    x2: 370,
    y2: nodes.value.outputY,
  }))
})

// Play the staged reveal from inputs to the final output node.
function play() {
  if (isPlaying.value) return

  isPlaying.value = true
  activeStep.value = 0

  const timer = setInterval(() => {
    activeStep.value += 1

    if (activeStep.value > 3) {
      clearInterval(timer)
      isPlaying.value = false
    }
  }, 720)
}

// Reset the network back to its unplayed state.
function reset() {
  activeStep.value = 0
  isPlaying.value = false
}
</script>

<template>
  <div class="cmpt-neural-network">
    <svg viewBox="0 0 430 180" class="w-full h-72">
      <line
        v-if="activeStep >= 1"
        v-for="connection in inputHiddenConnections"
        :key="connection.key"
        :x1="connection.x1"
        :y1="connection.y1"
        :x2="connection.x2"
        :y2="connection.y2"
        stroke="#475569"
        stroke-width="1.2"
        opacity="0.36"
      />

      <line
        v-if="activeStep >= 2"
        v-for="connection in hiddenOutputConnections"
        :key="connection.key"
        :x1="connection.x1"
        :y1="connection.y1"
        :x2="connection.x2"
        :y2="connection.y2"
        stroke="#475569"
        stroke-width="1.2"
        opacity="0.36"
      />

      <g v-for="(label, index) in props.inputLabels" :key="label">
        <circle cx="72" :cy="nodes.inputY[index]" r="12" fill="#16110f" />
        <text x="48" :y="nodes.inputY[index] + 4" text-anchor="end" font-size="11" fill="#4d433d">
          {{ label }}
        </text>
      </g>

      <g v-if="activeStep >= 1" v-for="(hiddenY, index) in nodes.hiddenY" :key="`hidden-${index}`">
        <rect x="206" :y="hiddenY - 14" width="28" height="28" fill="#a33124" opacity="0.95" />
      </g>
      <text v-if="activeStep >= 1" x="220" y="18" text-anchor="middle" font-size="11" fill="#4d433d">
        隐藏层
      </text>

      <g v-if="activeStep >= 2">
        <circle cx="370" :cy="nodes.outputY" r="18" :fill="activeStep >= 3 ? '#a33124' : '#d0bfa6'" />
        <text x="370" :y="nodes.outputY + 4" text-anchor="middle" font-size="12" font-weight="700" :fill="activeStep >= 3 ? '#f8f1e6' : '#16110f'">
          {{ activeStep >= 3 ? props.outputLabel : '?' }}
        </text>
      </g>
      <text v-if="activeStep >= 3" x="402" :y="nodes.outputY - 6" font-size="12" fill="#6e1f16">
        0.95
      </text>
    </svg>

    <div class="mt-3 flex justify-center gap-3">
      <button
        class="border-2 border-[#16110f] bg-[#a33124] px-4 py-2 text-sm text-[#f8f1e6]"
        :disabled="isPlaying"
        @click="play"
      >
        {{ isPlaying ? '计算中...' : '前向传播' }}
      </button>
      <button
        class="border-2 border-[#16110f] bg-[#f8f1e6] px-4 py-2 text-sm text-[#16110f]"
        @click="reset"
      >
        重置
      </button>
    </div>
  </div>
</template>
