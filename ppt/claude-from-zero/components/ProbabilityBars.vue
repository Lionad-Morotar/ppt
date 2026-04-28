<script setup lang="ts">
import { computed, ref } from 'vue'
import { useIntervalFn } from '@vueuse/core'

const candidates = [
  { token: 'Agent', probability: 0.42, color: '#16110f' },
  { token: 'Tool', probability: 0.24, color: '#a33124' },
  { token: 'Prompt', probability: 0.18, color: '#7f7467' },
  { token: 'Skill', probability: 0.1, color: '#d0bfa6' },
  { token: 'Hallucination', probability: 0.06, color: '#6e1f16' },
]

const activeIndex = ref(0)

const activeCandidate = computed(() => candidates[activeIndex.value])

// Cycle the highlighted candidate to show shifting next-token probabilities.
useIntervalFn(() => {
  activeIndex.value = (activeIndex.value + 1) % candidates.length
}, 1600)
</script>

<template>
  <div class="cmpt-probability-bars">
    <div
      v-for="(candidate, index) in candidates"
      :key="candidate.token"
      class="cmpt-probability-bars__row"
      :class="{ 'is-active': index === activeIndex }"
    >
      <div class="cmpt-probability-bars__label">
        <span class="cmpt-probability-bars__token">{{ candidate.token }}</span>
        <span class="cmpt-probability-bars__value">{{ Math.round(candidate.probability * 100) }}%</span>
      </div>

      <div class="cmpt-probability-bars__track">
        <div
          class="cmpt-probability-bars__fill"
          :style="{ width: `${candidate.probability * 100}%`, background: candidate.color }"
        />
      </div>
    </div>

    <div class="cmpt-probability-bars__footer">
      当前最可能输出：
      <strong>{{ activeCandidate.token }}</strong>
    </div>
  </div>
</template>

<style scoped>
.cmpt-probability-bars {
  display: grid;
  gap: 0.95rem;
}

.cmpt-probability-bars__row {
  display: grid;
  gap: 0.45rem;
  transition: transform 220ms ease, opacity 220ms ease;
  opacity: 0.72;
}

.cmpt-probability-bars__row.is-active {
  opacity: 1;
  transform: translateX(10px);
}

.cmpt-probability-bars__label {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.94rem;
}

.cmpt-probability-bars__token {
  color: #16110f;
}

.cmpt-probability-bars__value {
  color: #6e1f16;
  font-variant-numeric: tabular-nums;
}

.cmpt-probability-bars__track {
  overflow: hidden;
  height: 0.85rem;
  background: #e4d7c3;
  border: 2px solid #16110f;
}

.cmpt-probability-bars__fill {
  height: 100%;
}

.cmpt-probability-bars__footer {
  margin-top: 0.6rem;
  color: #6e1f16;
  font-size: 0.92rem;
}
</style>
