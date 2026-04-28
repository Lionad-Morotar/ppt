<script setup lang="ts">
import { ref } from 'vue'
import { useIntervalFn } from '@vueuse/core'

const stages = [
  { label: 'Reason', angle: -90, color: '#a855f7' },
  { label: 'Act', angle: -10, color: '#f97316' },
  { label: 'Observe', angle: 70, color: '#38bdf8' },
  { label: 'Recover', angle: 150, color: '#34d399' },
]

const activeIndex = ref(0)

// Rotate the active stage to suggest a continuous ReAct loop.
useIntervalFn(() => {
  activeIndex.value = (activeIndex.value + 1) % stages.length
}, 1500)
</script>

<template>
  <div class="cmpt-react-orbit">
    <div class="cmpt-react-orbit__ring" />

    <div
      v-for="(stage, index) in stages"
      :key="stage.label"
      class="cmpt-react-orbit__node"
      :class="{ 'is-active': index === activeIndex }"
      :style="{
        '--cmpt-react-orbit-angle': `${stage.angle}deg`,
        '--cmpt-react-orbit-color': stage.color,
      }"
    >
      <span>{{ stage.label }}</span>
    </div>

    <div class="cmpt-react-orbit__core">
      <div class="cmpt-react-orbit__title">Agent</div>
      <div class="cmpt-react-orbit__hint">让概率输出变得可控</div>
    </div>
  </div>
</template>

<style scoped>
.cmpt-react-orbit {
  position: relative;
  width: 24rem;
  height: 24rem;
  margin: 0 auto;
}

.cmpt-react-orbit__ring {
  position: absolute;
  inset: 2.2rem;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.14);
  box-shadow:
    inset 0 0 28px rgba(139, 92, 246, 0.15),
    0 0 45px rgba(56, 189, 248, 0.08);
}

.cmpt-react-orbit__core {
  position: absolute;
  inset: 6.9rem;
  display: grid;
  place-content: center;
  text-align: center;
  border-radius: 999px;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0.05)),
    rgba(12, 18, 46, 0.85);
  border: 1px solid rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(14px);
}

.cmpt-react-orbit__title {
  font-size: 1.35rem;
  font-weight: 700;
  color: white;
}

.cmpt-react-orbit__hint {
  margin-top: 0.45rem;
  font-size: 0.88rem;
  color: rgba(196, 181, 253, 0.95);
}

.cmpt-react-orbit__node {
  position: absolute;
  top: 50%;
  left: 50%;
  display: grid;
  place-content: center;
  width: 6rem;
  height: 6rem;
  border-radius: 999px;
  background: rgba(15, 23, 42, 0.84);
  border: 1px solid rgba(255, 255, 255, 0.11);
  color: rgba(255, 255, 255, 0.82);
  font-size: 0.92rem;
  transform:
    translate(-50%, -50%)
    rotate(var(--cmpt-react-orbit-angle))
    translateY(-8.8rem)
    rotate(calc(var(--cmpt-react-orbit-angle) * -1));
  transition: transform 260ms ease, box-shadow 260ms ease, border-color 260ms ease;
}

.cmpt-react-orbit__node.is-active {
  color: white;
  border-color: color-mix(in srgb, var(--cmpt-react-orbit-color) 68%, white);
  box-shadow: 0 0 32px color-mix(in srgb, var(--cmpt-react-orbit-color) 45%, transparent);
  transform:
    translate(-50%, -50%)
    rotate(var(--cmpt-react-orbit-angle))
    translateY(-9.35rem)
    rotate(calc(var(--cmpt-react-orbit-angle) * -1))
    scale(1.06);
}
</style>
