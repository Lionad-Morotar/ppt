<script setup lang="ts">
import { ref } from 'vue'
import { useIntervalFn } from '@vueuse/core'

const stages = [
  { label: '推理', angle: -90, color: '#a33124' },
  { label: '行动', angle: -10, color: '#16110f' },
  { label: '观察', angle: 70, color: '#6e1f16' },
  { label: '恢复', angle: 150, color: '#7f7467' },
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
      <div class="cmpt-react-orbit__title">智能体</div>
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
  border: 2px solid #16110f;
}

.cmpt-react-orbit__core {
  position: absolute;
  inset: 6.9rem;
  display: grid;
  place-content: center;
  text-align: center;
  border-radius: 999px;
  background: #f8f1e6;
  border: 2px solid #16110f;
}

.cmpt-react-orbit__title {
  font-size: 1.35rem;
  font-weight: 700;
  color: #16110f;
}

.cmpt-react-orbit__hint {
  margin-top: 0.45rem;
  font-size: 0.88rem;
  color: #6e1f16;
}

.cmpt-react-orbit__node {
  position: absolute;
  top: 50%;
  left: 50%;
  display: grid;
  place-content: center;
  width: 6rem;
  height: 6rem;
  border-radius: 0;
  background: #f8f1e6;
  border: 2px solid #16110f;
  color: #16110f;
  font-size: 0.92rem;
  transform:
    translate(-50%, -50%)
    rotate(var(--cmpt-react-orbit-angle))
    translateY(-8.8rem)
    rotate(calc(var(--cmpt-react-orbit-angle) * -1));
  transition: transform 260ms ease, box-shadow 260ms ease, border-color 260ms ease;
}

.cmpt-react-orbit__node.is-active {
  color: #f8f1e6;
  background: var(--cmpt-react-orbit-color);
  border-color: #16110f;
  transform:
    translate(-50%, -50%)
    rotate(var(--cmpt-react-orbit-angle))
    translateY(-9.35rem)
    rotate(calc(var(--cmpt-react-orbit-angle) * -1))
    scale(1.06);
}
</style>
