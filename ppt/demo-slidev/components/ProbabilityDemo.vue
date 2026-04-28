<script setup lang="ts">
import { ref, computed } from 'vue'

const temp = ref(0.7)
const isRolling = ref(false)
const results = ref<string[]>([])

const words = ['晴天', '多云', '阴天', '小雨', '大雨', '雷阵雨']
const probs = computed(() => {
  // 温度越高，分布越均匀
  const base = [0.4, 0.25, 0.15, 0.1, 0.05, 0.05]
  const t = temp.value
  const adjusted = base.map((p, i) => {
    const uniform = 1 / 6
    return p * (1 - t) + uniform * t
  })
  const sum = adjusted.reduce((a, b) => a + b, 0)
  return adjusted.map(p => p / sum)
})

function roll() {
  if (isRolling.value) return
  isRolling.value = true
  results.value = []
  let count = 0
  const interval = setInterval(() => {
    const r = Math.random()
    let cum = 0
    let selected = words[0]
    for (let i = 0; i < words.length; i++) {
      cum += probs.value[i]
      if (r <= cum) {
        selected = words[i]
        break
      }
    }
    results.value.push(selected)
    count++
    if (count >= 10) {
      clearInterval(interval)
      isRolling.value = false
    }
  }, 150)
}

function reset() {
  results.value = []
}

const stats = computed(() => {
  const map: Record<string, number> = {}
  results.value.forEach(r => {
    map[r] = (map[r] || 0) + 1
  })
  return map
})
</script>

<template>
  <div class="probability-demo">
    <!-- Temperature Slider -->
    <div class="mb-4">
      <label class="text-sm text-gray-500 flex justify-between">
        <span>温度 (Temperature)</span>
        <span class="font-mono">{{ temp.toFixed(2) }}</span>
      </label>
      <input
        v-model.number="temp"
        type="range"
        min="0"
        max="1"
        step="0.05"
        class="w-full mt-1 accent-blue-500"
        :disabled="isRolling"
      />
      <div class="flex justify-between text-xs text-gray-400 mt-1">
        <span>确定性</span>
        <span>随机性</span>
      </div>
    </div>

    <!-- Probability Bars -->
    <div class="space-y-1.5 mb-4">
      <div
        v-for="(word, i) in words"
        :key="word"
        class="flex items-center gap-2"
      >
        <span class="text-xs w-12 text-right">{{ word }}</span>
        <div class="flex-1 h-4 bg-gray-100 rounded overflow-hidden">
          <div
            class="h-full transition-all duration-300 rounded"
            :style="{
              width: `${probs[i] * 100}%`,
              backgroundColor: `hsl(${200 + i * 30}, 70%, 60%)`
            }"
          />
        </div>
        <span class="text-xs w-12 font-mono">{{ (probs[i] * 100).toFixed(1) }}%</span>
      </div>
    </div>

    <!-- Roll Results -->
    <div v-if="results.length" class="mb-3">
      <div class="text-xs text-gray-500 mb-1">生成结果：</div>
      <div class="flex flex-wrap gap-1.5">
        <span
          v-for="(r, i) in results"
          :key="i"
          class="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700"
          :style="{ animationDelay: `${i * 50}ms` }"
          style="animation: popIn 0.3s ease-out forwards; opacity: 0;"
        >
          {{ r }}
        </span>
      </div>
      <div v-if="!isRolling" class="mt-2 text-xs text-gray-400">
        统计: {{ Object.entries(stats).map(([k,v]) => `${k}:${v}`).join(', ') }}
      </div>
    </div>

    <!-- Controls -->
    <div class="flex gap-2">
      <button
        class="px-3 py-1.5 text-xs rounded bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50"
        :disabled="isRolling"
        @click="roll"
      >
        {{ isRolling ? '生成中...' : '生成 10 次' }}
      </button>
      <button
        class="px-3 py-1.5 text-xs rounded border border-gray-300 hover:bg-gray-100"
        @click="reset"
      >
        清空
      </button>
    </div>
  </div>
</template>

<style scoped>
@keyframes popIn {
  from {
    opacity: 0;
    transform: scale(0);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
</style>
