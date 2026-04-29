<script setup lang="ts">
import { ref, computed, nextTick } from 'vue'
import { onKeyStroke } from '@vueuse/core'
import { getTermById } from './terms-data'

const props = defineProps<{ term: string; prefer?: 'en' | 'cn' }>()
const termDef = computed(() => getTermById(props.term))
const show = ref(false)
const triggerRef = ref<HTMLElement | null>(null)
const tooltipPos = ref({ x: 0, y: 0 })
let closeTimer: ReturnType<typeof setTimeout> | null = null

const displayText = computed(() => {
  if (!termDef.value) return props.term
  const p = props.prefer ?? termDef.value.prefer
  return p === 'cn' ? termDef.value.cnName : termDef.value.enName
})

const tooltipStyle = computed(() => ({
  left: `${tooltipPos.value.x}px`,
  top: `${tooltipPos.value.y}px`,
  transform: 'translateX(-50%)',
}))

function updatePosition() {
  if (!triggerRef.value) return
  const rect = triggerRef.value.getBoundingClientRect()
  tooltipPos.value = {
    x: rect.left + rect.width / 2,
    y: rect.top - 4,
  }
}

function open() {
  if (closeTimer) {
    clearTimeout(closeTimer)
    closeTimer = null
  }
  show.value = true
  nextTick(updatePosition)
}

function close() {
  closeTimer = setTimeout(() => {
    show.value = false
  }, 100)
}

onKeyStroke('Escape', () => {
  show.value = false
})
</script>

<template>
  <span v-if="termDef"
    ref="triggerRef"
    class="terms-trigger"
    @mouseenter="open"
    @mouseleave="close"
  >
    <slot>{{ displayText }}</slot>

    <!-- tooltip：fixed 定位 + Teleport 到 body，避免被父容器裁剪 -->
    <Teleport to="body">
      <Transition name="terms-fade">
        <div
          v-show="show"
          class="terms-tooltip"
          :style="tooltipStyle"
          @mouseenter="open"
          @mouseleave="close"
        >
          <div class="terms-tooltip__title">
            {{ termDef.cnEnName }}
          </div>
          <div class="terms-tooltip__brief">
            {{ termDef.brief }}
          </div>
        </div>
      </Transition>
    </Teleport>
  </span>
  <span v-else>{{ term }}</span>
</template>

<style scoped>
/* 触发元素：无缝融入文本 */
.terms-trigger {
  position: relative;
  display: inline;
  cursor: inherit;
  /* 默认无下划线，与周围文本完全一致 */
  text-decoration: none;
  /* 继承所有文本样式 */
  font: inherit;
  color: inherit;
}

/* hover 时展示虚线下划线 */
.terms-trigger:hover {
  text-decoration: underline;
  text-decoration-style: dashed;
  text-decoration-thickness: 1px;
  text-underline-offset: 3px;
}

/* tooltip 容器 */
.terms-tooltip {
  position: fixed;
  z-index: 9999;
  background: #f8f1e6;
  border: 2px solid #16110f;
  padding: 0.5rem 0.75rem;
  min-width: 12rem;
  max-width: 22rem;
  box-shadow: 0.3rem 0.3rem 0 0 #16110f;
  pointer-events: auto;
}

.terms-tooltip__title {
  font-weight: 800;
  font-size: 0.92rem;
  color: #16110f;
  margin-bottom: 0.35rem;
}

.terms-tooltip__brief {
  font-size: 0.82rem;
  color: #4d433d;
  line-height: 1.6;
}

/* 淡入淡出动画 */
.terms-fade-enter-active,
.terms-fade-leave-active {
  transition: opacity 0.15s ease;
}

.terms-fade-enter-from,
.terms-fade-leave-to {
  opacity: 0;
}
</style>
