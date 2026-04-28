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
  background: #e4d7c3;
  border: 2px solid #16110f;
  color: #16110f;
  transition: all 240ms ease;
}

.cmpt-tokenization-flow__token.is-active {
  color: #f8f1e6;
  background: #a33124;
  border-color: #16110f;
  transform: translateY(-4px);
}

.cmpt-tokenization-flow__hint {
  color: #6e1f16;
  font-size: 0.93rem;
}
</style>
