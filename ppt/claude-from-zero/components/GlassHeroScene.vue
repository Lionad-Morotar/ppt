<script setup lang="ts">
const panes = [
  { id: 'pane-a', height: '11rem', delay: '0s', rotate: '-22deg', tone: '#16110f' },
  { id: 'pane-b', height: '14rem', delay: '0.25s', rotate: '-8deg', tone: '#a33124' },
  { id: 'pane-c', height: '17rem', delay: '0.5s', rotate: '0deg', tone: '#16110f' },
  { id: 'pane-d', height: '13rem', delay: '0.75s', rotate: '9deg', tone: '#d0bfa6' },
  { id: 'pane-e', height: '10rem', delay: '1s', rotate: '18deg', tone: '#a33124' },
]
</script>

<template>
  <div class="cmpt-glass-hero-scene">
    <div class="cmpt-glass-hero-scene__poster" />
    <div class="cmpt-glass-hero-scene__disk" />
    <div class="cmpt-glass-hero-scene__beam" />

    <div class="cmpt-glass-hero-scene__stage">
      <div
        v-for="pane in panes"
        :key="pane.id"
        class="cmpt-glass-hero-scene__pane"
        :style="{
          height: pane.height,
          animationDelay: pane.delay,
          transform: `rotate(${pane.rotate})`,
          background: pane.tone,
        }"
      />
    </div>
  </div>
</template>

<style scoped>
.cmpt-glass-hero-scene {
  position: relative;
  min-height: 24rem;
  overflow: hidden;
  background: #f8f1e6;
  border: 2px solid #16110f;
}

.cmpt-glass-hero-scene__poster,
.cmpt-glass-hero-scene__disk,
.cmpt-glass-hero-scene__beam {
  position: absolute;
}

.cmpt-glass-hero-scene__poster {
  right: 5.2rem;
  top: -1rem;
  width: 2.1rem;
  height: 26rem;
  background: #a33124;
  transform: rotate(28deg);
}

.cmpt-glass-hero-scene__disk {
  right: 1.2rem;
  top: 1.2rem;
  width: 7rem;
  height: 7rem;
  border-radius: 999px;
  background: #16110f;
}

.cmpt-glass-hero-scene__beam {
  left: -1rem;
  bottom: 1.4rem;
  width: 14rem;
  height: 2rem;
  background: #16110f;
  transform: rotate(-18deg);
}

.cmpt-glass-hero-scene__stage {
  position: absolute;
  inset: 16% 0 1.4rem;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  gap: 0.7rem;
}

.cmpt-glass-hero-scene__pane {
  width: 2.9rem;
  border: 2px solid #16110f;
  animation: cmpt-glass-hero-scene-float 4.8s ease-in-out infinite;
}

@keyframes cmpt-glass-hero-scene-float {
  0%,
  100% {
    translate: 0 0;
  }

  50% {
    translate: 0 -10px;
  }
}
</style>
