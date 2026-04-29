<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { onKeyStroke } from '@vueuse/core'
import { Maximize2, Minimize2 } from 'lucide-vue-next'

const props = withDefaults(
  defineProps<{
    /** 是否允许放大，默认 true */
    expandable?: boolean
    /** 未放大时是否模糊内容，默认 false */
    masked?: boolean
    /** 未放大时是否隐藏 .hide 元素，默认 true */
    autoHide?: boolean
  }>(),
  {
    expandable: true,
    masked: false,
    autoHide: true
  }
)

const isExpanded = ref(false)
const wrapperRef = ref<HTMLDivElement | null>(null)

function toggleExpand() {
  isExpanded.value = !isExpanded.value
}

onMounted(() => {
  if (wrapperRef.value) {
    wrapperRef.value.addEventListener('click', (e) => {
      e.stopPropagation()
      toggleExpand()
    })
  }
})

onKeyStroke('Escape', () => {
  isExpanded.value = false
})
</script>

<template>
  <!-- cmpt-panel-wrapper: 负责悬浮检测与全屏定位切换 -->
  <div
    ref="wrapperRef"
    class="cmpt-panel-wrapper"
    :class="{ 'is-expanded': isExpanded, 'is-masked': props.masked, 'is-auto-hide': props.autoHide }"
  >
    <!-- 放大/缩小按钮 -->
    <button
      v-if="expandable !== false"
      class="cmpt-panel-toggle"
      :title="isExpanded ? '缩小' : '放大'"
      @click.stop="toggleExpand"
    >
      <Minimize2 v-if="isExpanded" :size="16" />
      <Maximize2 v-else :size="16" />
    </button>

    <!-- panel 本体，保留原有 cmpt-panel 的全部视觉样式 -->
    <div class="cmpt-panel" :class="[$attrs.class, { 'is-masked': props.masked && !isExpanded }]">
      <slot />
    </div>
  </div>
</template>

<style scoped>
/* 默认状态：正常文档流，按钮相对于 wrapper 定位 */
.cmpt-panel-wrapper {
  position: relative;
}

/* 放大状态：fixed 覆盖整个视口 */
.cmpt-panel-wrapper.is-expanded {
  position: fixed;
  inset: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2.5rem;
  background: rgba(22, 17, 15, 0.45); /* 半透明遮罩 */
  border-radius: 0;
}

.cmpt-panel-wrapper.is-expanded .cmpt-panel {
  width: 100%;
  height: 100%;
  max-width: 100%;
  max-height: 100%;
  overflow: auto;
  box-shadow: 1rem 1rem 0 0 var(--deck-line);
}

/* 放大/缩小按钮 */
.cmpt-panel-toggle {
  position: absolute;
  top: 2em;
  right: 2em;
  z-index: 101;
  width: 2rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 0;
  background: var(--deck-paper);
  color: var(--deck-ink);
  font-size: 0.9rem;
  line-height: 1;
  cursor: pointer;
  opacity: 0;
  transform: scale(0.85);
  transition:
    opacity 0.2s ease,
    transform 0.2s ease,
    background 0.2s ease;
  pointer-events: none;
}

/* 悬浮或已放大时显示按钮 */
.cmpt-panel-wrapper:hover .cmpt-panel-toggle,
.cmpt-panel-wrapper.is-expanded .cmpt-panel-toggle {
  opacity: 1;
  transform: scale(1);
  pointer-events: auto;
}
.cmpt-panel-wrapper.is-expanded .cmpt-panel-toggle {
  top: 0;
  right: 0;
  background: unset;
}

.cmpt-panel-toggle:hover {
  background: var(--deck-red);
  color: var(--deck-paper);
}

/* 保留 cmpt-panel 原有视觉样式 */
.cmpt-panel {
  background: var(--deck-paper);
  border: 2px solid var(--deck-line);
  box-shadow: 0.6rem 0.6rem 0 0 var(--deck-line);
}

/* 未放大时模糊内容 */
.cmpt-panel.is-masked {
  filter: blur(3px);
  user-select: none;
  transition: filter 0.3s ease;
}

/* 放大后自动清晰 */
.cmpt-panel-wrapper.is-expanded .cmpt-panel.is-masked {
  filter: none;
}

/* masked 状态下始终显示放大按钮，提示用户可交互 */
.cmpt-panel-wrapper.is-masked .cmpt-panel-toggle {
  opacity: 1;
  transform: scale(1);
  pointer-events: auto;
}

/* 未放大时隐藏 slot 中的 .hide 元素 */
.cmpt-panel-wrapper.is-auto-hide:not(.is-expanded) :deep(.hide) {
  display: none;
}

/* 单个 img 或 video 时最大化展示 */
.cmpt-panel:has(> img:only-child),
.cmpt-panel:has(> video:only-child) {
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.cmpt-panel:has(> img:only-child) > img,
.cmpt-panel:has(> video:only-child) > video {
  display: block;
  max-width: 100%;
  max-height: 100%;
  width: 100%;
  height: 100%;
  object-fit: contain;
}
</style>
