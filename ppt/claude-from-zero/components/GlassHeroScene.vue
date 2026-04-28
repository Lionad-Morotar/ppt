<script setup lang="ts">
const panes = [
  { id: 'pane-a', height: '15rem', delay: '0s', rotate: '-14deg' },
  { id: 'pane-b', height: '19rem', delay: '0.25s', rotate: '-7deg' },
  { id: 'pane-c', height: '22rem', delay: '0.5s', rotate: '0deg' },
  { id: 'pane-d', height: '18rem', delay: '0.75s', rotate: '7deg' },
  { id: 'pane-e', height: '14rem', delay: '1s', rotate: '14deg' },
]
</script>

<template>
  <div class="cmpt-glass-hero-scene">
    <div class="cmpt-glass-hero-scene__halo cmpt-glass-hero-scene__halo--primary" />
    <div class="cmpt-glass-hero-scene__halo cmpt-glass-hero-scene__halo--secondary" />
    <div class="cmpt-glass-hero-scene__orbit cmpt-glass-hero-scene__orbit--outer" />
    <div class="cmpt-glass-hero-scene__orbit cmpt-glass-hero-scene__orbit--inner" />

    <div class="cmpt-glass-hero-scene__stage">
      <div
        v-for="pane in panes"
        :key="pane.id"
        class="cmpt-glass-hero-scene__pane"
        :style="{
          height: pane.height,
          animationDelay: pane.delay,
          transform: `rotate(${pane.rotate})`,
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
}

.cmpt-glass-hero-scene__halo {
  position: absolute;
  filter: blur(26px);
  border-radius: 999px;
  opacity: 0.85;
}

.cmpt-glass-hero-scene__halo--primary {
  inset: 10% 8% auto auto;
  width: 18rem;
  height: 18rem;
  background:
    radial-gradient(circle at 30% 30%, rgba(255, 172, 90, 0.9), transparent 42%),
    radial-gradient(circle at 70% 70%, rgba(168, 85, 247, 0.95), transparent 60%);
}

.cmpt-glass-hero-scene__halo--secondary {
  inset: auto auto -12% -2%;
  width: 20rem;
  height: 20rem;
  background:
    radial-gradient(circle at 50% 45%, rgba(56, 189, 248, 0.9), transparent 44%),
    radial-gradient(circle at 72% 72%, rgba(236, 72, 153, 0.75), transparent 62%);
}

.cmpt-glass-hero-scene__orbit {
  position: absolute;
  left: 50%;
  bottom: 1.75rem;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.16);
  transform: translateX(-50%);
}

.cmpt-glass-hero-scene__orbit--outer {
  width: 22rem;
  height: 6rem;
  box-shadow: 0 0 60px rgba(124, 58, 237, 0.22);
}

.cmpt-glass-hero-scene__orbit--inner {
  bottom: 2.65rem;
  width: 14rem;
  height: 3.2rem;
  border-color: rgba(255, 255, 255, 0.22);
}

.cmpt-glass-hero-scene__stage {
  position: absolute;
  inset: 18% 0 2rem;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  gap: 0.9rem;
}

.cmpt-glass-hero-scene__pane {
  width: 3.4rem;
  border-radius: 1.4rem;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.4), rgba(255, 255, 255, 0.06)),
    linear-gradient(135deg, rgba(99, 102, 241, 0.52), rgba(236, 72, 153, 0.35) 58%, rgba(255, 183, 77, 0.38));
  border: 1px solid rgba(255, 255, 255, 0.22);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.3),
    0 0 30px rgba(255, 120, 199, 0.28),
    0 14px 36px rgba(11, 15, 37, 0.55);
  backdrop-filter: blur(16px);
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
