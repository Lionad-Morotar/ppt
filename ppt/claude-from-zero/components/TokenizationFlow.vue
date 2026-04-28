<script setup lang="ts">
import { ref } from 'vue'
import { useIntervalFn } from '@vueuse/core'

const tokens = [
  'Claude',
  'from',
  'Zero',
  '=>',
  'token',
  'prompt',
  'context',
  'agent',
]

const activeIndex = ref(0)

// Move the highlight across tokens to mimic a tokenization pipeline.
useIntervalFn(() => {
  activeIndex.value = (activeIndex.value + 1) % tokens.length
}, 900)
</script>

<template>
  <div class="cmpt-tokenization-flow">
    <div class="cmpt-tokenization-flow__line">
      <div
        v-for="(token, index) in tokens"
        :key="`${token}-${index}`"
        class="cmpt-tokenization-flow__token"
        :class="{ 'is-active': index === activeIndex }"
      >
        {{ token }}
      </div>
    </div>

    <div class="cmpt-tokenization-flow__hint">
      文本先被切成 token，再进入模型的向量与概率空间。
    </div>
  </div>
</template>

<style scoped>
.cmpt-tokenization-flow {
  display: grid;
  gap: 1rem;
}

.cmpt-tokenization-flow__line {
  display: flex;
  flex-wrap: wrap;
  gap: 0.8rem;
}

.cmpt-tokenization-flow__token {
  padding: 0.7rem 0.95rem;
  border-radius: 999px;
  background: rgba(15, 23, 42, 0.78);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: rgba(226, 232, 240, 0.86);
  transition: all 240ms ease;
}

.cmpt-tokenization-flow__token.is-active {
  color: white;
  background:
    linear-gradient(135deg, rgba(244, 114, 182, 0.35), rgba(59, 130, 246, 0.3)),
    rgba(15, 23, 42, 0.92);
  border-color: rgba(255, 255, 255, 0.22);
  box-shadow: 0 0 24px rgba(192, 132, 252, 0.22);
  transform: translateY(-4px);
}

.cmpt-tokenization-flow__hint {
  color: rgba(191, 219, 254, 0.86);
  font-size: 0.93rem;
}
</style>
