<script setup lang="ts">
import { ref, computed, watch } from 'vue'

const text = ref('今天天气怎么样')
const isTokenizing = ref(false)
const showTokens = ref(false)

// 模拟 token 分词结果
const tokens = computed(() => {
  const t = text.value
  // 简化的分词逻辑
  const result: { text: string; id: number; color: string }[] = []
  let remaining = t
  let id = 100
  const colors = ['#3b82f6', '#8b5cf6', '#22c55e', '#f59e0b', '#ef4444', '#06b6d4', '#ec4899']

  // 简化的中文分词模拟
  const words = t.split('')
  for (let i = 0; i < words.length; i++) {
    result.push({
      text: words[i],
      id: id + i,
      color: colors[i % colors.length]
    })
  }
  return result
})

function tokenize() {
  if (isTokenizing.value) return
  isTokenizing.value = true
  showTokens.value = false
  setTimeout(() => {
    showTokens.value = true
    isTokenizing.value = false
  }, 600)
}

function reset() {
  showTokens.value = false
  text.value = '今天天气怎么样'
}
</script>

<template>
  <div class="token-flow">
    <!-- 输入文本 -->
    <div class="mb-4">
      <label class="text-sm text-gray-500 mb-1 block">输入文本</label>
      <input
        v-model="text"
        class="w-full px-3 py-2 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="输入文本..."
        :disabled="isTokenizing"
      />
    </div>

    <!-- Token 可视化 -->
    <div class="token-visualization min-h-[60px] p-3 bg-gray-50 rounded border">
      <div v-if="!showTokens" class="text-gray-400 text-sm text-center py-2">
        {{ isTokenizing ? '分词中...' : '点击"分词"查看 Token 序列' }}
      </div>

      <div v-else class="flex flex-wrap gap-2">
        <div
          v-for="(token, i) in tokens"
          :key="i"
          v-motion
          :initial="{ y: 20, opacity: 0 }"
          :enter="{ y: 0, opacity: 1, transition: { delay: i * 100 } }"
          class="token-item px-2 py-1 rounded text-xs text-white font-mono cursor-default"
          :style="{ backgroundColor: token.color }"
          :title="`Token ID: ${token.id}`"
        >
          {{ token.text }}
        </div>
      </div>
    </div>

    <!-- Token IDs 展示 -->
    <div v-if="showTokens" class="mt-3">
      <div class="text-xs text-gray-500 mb-1">Token ID 序列：</div>
      <div class="flex flex-wrap gap-1">
        <span
          v-for="(token, i) in tokens"
          :key="`id-${i}`"
          class="text-xs font-mono px-1.5 py-0.5 rounded bg-gray-100"
        >
          {{ token.id }}
        </span>
      </div>
    </div>

    <!-- Controls -->
    <div class="flex gap-2 mt-4">
      <button
        class="px-3 py-1.5 text-xs rounded bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50"
        :disabled="isTokenizing"
        @click="tokenize"
      >
        {{ isTokenizing ? '分词中...' : '分词' }}
      </button>
      <button
        class="px-3 py-1.5 text-xs rounded border border-gray-300 hover:bg-gray-100"
        @click="reset"
      >
        重置
      </button>
    </div>
  </div>
</template>
