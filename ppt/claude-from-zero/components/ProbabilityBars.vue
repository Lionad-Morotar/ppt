<script setup lang="ts">
import { computed, ref } from 'vue'
import { useIntervalFn } from '@vueuse/core'

const candidates = [
  { token: 'Agent', probability: 0.42, color: 'from-fuchsia-500 to-violet-500' },
  { token: 'Tool', probability: 0.24, color: 'from-sky-500 to-cyan-500' },
  { token: 'Prompt', probability: 0.18, color: 'from-amber-400 to-orange-500' },
  { token: 'Skill', probability: 0.1, color: 'from-emerald-400 to-teal-500' },
  { token: 'Hallucination', probability: 0.06, color: 'from-rose-500 to-pink-500' },
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
          :class="candidate.color"
          :style="{ width: `${candidate.probability * 100}%` }"
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
  color: rgba(255, 255, 255, 0.94);
}

.cmpt-probability-bars__value {
  color: rgba(226, 232, 240, 0.82);
  font-variant-numeric: tabular-nums;
}

.cmpt-probability-bars__track {
  overflow: hidden;
  height: 0.85rem;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.cmpt-probability-bars__fill {
  height: 100%;
  border-radius: 999px;
  box-shadow: 0 0 18px rgba(255, 255, 255, 0.18);
}

.cmpt-probability-bars__footer {
  margin-top: 0.6rem;
  color: rgba(196, 181, 253, 0.96);
  font-size: 0.92rem;
}
</style>
