<script setup lang="ts">
import { ref, computed, nextTick } from 'vue'
import { onKeyStroke } from '@vueuse/core'
import { Eye, Maximize2, Minimize2 } from 'lucide-vue-next'

const props = defineProps<{
  /** 预览图片 URL */
  src?: string
  /** 外部链接 URL（传入时 tooltip 显示链接而非媒体） */
  url?: string
  /** 是否为视频 */
  video?: boolean
  /** tooltip 最大宽度 */
  maxWidth?: string
  /** 动态组件名 — 传入时 tooltip 渲染该组件 */
  component?: string
}>()

const show = ref(false)
const isExpanded = ref(false)
const triggerRef = ref<HTMLElement | null>(null)
const tooltipPos = ref({ x: 0, y: 0 })
const videoRef = ref<HTMLVideoElement | null>(null)
let closeTimer: ReturnType<typeof setTimeout> | null = null

const isVideo = () => props.video || (props.src?.endsWith('.mp4') || props.src?.endsWith('.webm') || props.src?.endsWith('.mov'))

const isUrl = () => !!props.url

const tooltipStyle = computed(() => {
  if (isExpanded.value) {
    return {
      left: '50%',
      top: '50%',
      transform: 'translate(-50%, -50%)',
      maxWidth: '85vw',
      maxHeight: '85vh',
    }
  }
  return {
    maxWidth: props.maxWidth || '320px',
    left: `${tooltipPos.value.x}px`,
    top: `${tooltipPos.value.y}px`,
    transform: 'translateX(-50%)',
  }
})

function updatePosition() {
  if (!triggerRef.value || isExpanded.value) return
  const rect = triggerRef.value.getBoundingClientRect()
  tooltipPos.value = {
    x: rect.left + rect.width / 2,
    y: rect.bottom + 6,
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
  if (isExpanded.value) return
  closeTimer = setTimeout(() => {
    show.value = false
  }, 100)
}

function toggleExpand() {
  isExpanded.value = !isExpanded.value
  if (isExpanded.value) {
    nextTick(() => {
      updatePosition()
      if (isVideo() && videoRef.value) {
        videoRef.value.currentTime = 0
        videoRef.value.play()
      }
    })
  }
}

function onTooltipClick(e: MouseEvent) {
  e.stopPropagation()
  toggleExpand()
}

onKeyStroke('Escape', () => {
  if (isExpanded.value) {
    isExpanded.value = false
  } else {
    show.value = false
  }
})
</script>

<template>
  <span
    ref="triggerRef"
    class="preview-trigger"
    @mouseenter="open"
    @mouseleave="close"
  >
    <!-- 预览图标：半灰、小巧、不吸引视线 -->
    <Eye class="preview-icon" :size="13" />

    <!-- 悬浮预览 tooltip — Teleport 到 body 避免被父容器裁剪 -->
    <Teleport to="body">
      <Transition name="preview-fade">
        <div
          v-show="show"
          class="preview-tooltip"
          :class="{ 'is-expanded': isExpanded }"
          :style="tooltipStyle"
          @mouseenter="open"
          @mouseleave="close"
          @click="onTooltipClick"
        >
          <!-- 放大/缩小按钮（仅媒体内容显示） -->
          <button
            v-if="!isUrl()"
            class="preview-tooltip-toggle"
            :title="isExpanded ? '缩小' : '放大'"
            @click.stop="toggleExpand"
          >
            <Minimize2 v-if="isExpanded" :size="14" />
            <Maximize2 v-else :size="14" />
          </button>

          <!-- URL 链接模式 -->
          <div v-if="isUrl()" class="preview-link">
            <a :href="url" target="_blank" rel="noopener noreferrer" @click.stop>
              {{ url }}
            </a>
          </div>

          <video
            v-else-if="isVideo()"
            ref="videoRef"
            :src="src"
            autoplay
            loop
            muted
            playsinline
            class="preview-media"
            :class="{ 'is-expanded': isExpanded }"
          />
          <component
            v-else-if="component"
            :is="component"
            class="preview-component"
            :class="{ 'is-expanded': isExpanded }"
          />
          <div
            v-else-if="$slots.default"
            class="preview-component"
            :class="{ 'is-expanded': isExpanded }"
          >
            <slot />
          </div>
          <img
            v-else
            :src="src"
            alt="预览"
            class="preview-media"
            :class="{ 'is-expanded': isExpanded }"
          />
        </div>
      </Transition>
    </Teleport>
  </span>
</template>

<style scoped>
/* 触发元素：与文本行内融合 */
.preview-trigger {
  position: relative;
  display: inline-flex;
  align-items: center;
  vertical-align: middle;
  margin-left: 0.15em;
  cursor: pointer;
}

/* 图标：半灰、小巧 */
.preview-icon {
  color: #4d433d;
  opacity: 0.45;
  transition: opacity 0.2s ease, color 0.2s ease;
}

.preview-trigger:hover .preview-icon {
  opacity: 0.85;
  color: #a33124;
}

/* tooltip 容器 — fixed 定位避免被父容器 overflow:hidden 裁剪 */
.preview-tooltip {
  position: fixed;
  z-index: 9999;
  background: #f8f1e6;
  border: 2px solid #16110f;
  padding: 0.4rem;
  box-shadow: 0.3rem 0.3rem 0 0 #16110f;
  pointer-events: auto;
  width: max-content;
  transition: all 0.2s ease;
}

.preview-tooltip.is-expanded {
  padding: 0.6rem;
  box-shadow: 0.6rem 0.6rem 0 0 var(--deck-line);
}

/* 放大/缩小按钮 */
.preview-tooltip-toggle {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  z-index: 10;
  width: 1.8rem;
  height: 1.8rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 0;
  background: var(--deck-paper);
  color: var(--deck-ink);
  font-size: 0.9rem;
  cursor: pointer;
  opacity: 0;
  transform: scale(0.85);
  transition:
    opacity 0.2s ease,
    transform 0.2s ease,
    background 0.2s ease;
}

.preview-tooltip:hover .preview-tooltip-toggle,
.preview-tooltip.is-expanded .preview-tooltip-toggle {
  opacity: 1;
  transform: scale(1);
}

.preview-tooltip-toggle:hover {
  background: var(--deck-red);
  color: var(--deck-paper);
}

/* URL 链接 */
.preview-link {
  display: block;
  max-width: 320px;
  padding: 0.3rem 0.5rem;
}

.preview-link a {
  color: var(--deck-red-dark);
  font-size: 0.82rem;
  line-height: 1.5;
  word-break: break-all;
  text-decoration: underline;
  text-underline-offset: 2px;
}

.preview-link a:hover {
  color: var(--deck-red);
}

/* 媒体内容 */
.preview-media {
  display: block;
  max-width: 100%;
  max-height: 60vh;
  height: auto;
  border-radius: 0;
  transition: max-height 0.2s ease;
}

.preview-media.is-expanded {
  max-height: 80vh;
  max-width: 80vw;
}

/* 组件预览 */
.preview-component {
  display: block;
  max-width: 100%;
  max-height: 60vh;
  overflow: auto;
  transition: max-height 0.2s ease;
}

.preview-component.is-expanded {
  max-height: 80vh;
  max-width: 80vw;
}

/* 淡入淡出动画 */
.preview-fade-enter-active,
.preview-fade-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}

.preview-fade-enter-from,
.preview-fade-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(-4px);
}
</style>
