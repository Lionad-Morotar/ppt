<script setup lang="ts">
defineProps<{
  group?: string
}>()
</script>

<template>
  <div class="slide-footer">
    <span v-if="group" class="slide-footer__group">{{ group }}</span>
    <span class="slide-footer__progress">
      <span class="slide-footer__bar" :style="{ width: (($nav.currentPage / $nav.total) * 100) + '%' }" />
      <span class="slide-footer__text">{{ $nav.currentPage }} / {{ $nav.total }}</span>
    </span>
  </div>
</template>

<style scoped>
.slide-footer {
  position: absolute;
  bottom: 0.55rem;
  left: 2.5rem;
  right: 2.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.7rem;
  color: #4d433d;
  opacity: 0.5;
  z-index: 10;
  pointer-events: none;
}

.slide-footer__group {
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.slide-footer__progress {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.slide-footer__bar {
  display: inline-block;
  width: 2.5rem;
  height: 2px;
  background: #a33124;
  opacity: 0.7;
}

.slide-footer__text {
  font-variant-numeric: tabular-nums;
  min-width: 2.2rem;
  text-align: right;
  font-weight: 600;
  flex-shrink: 0;
}
</style>
