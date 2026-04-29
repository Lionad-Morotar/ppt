<script setup lang="ts">
const props = withDefaults(defineProps<{
  title?: string
  body?: string[]
}>(), {
  title: '系统提示',
  body: () => [
    '# 角色',
    '你是一位专精村上春树写作风格的文学顾问，帮助用户以村上式的笔触创作和改写文本。',
    '# 目标',
    '第一人称视角，带有疏离感的冷静叙述，简洁、克制的短句为主',
    '## 输出示例',
    '**原文**：我很难过，失恋了。',
    '**村上化改写**：说实话，我并不觉得特别难过。只是有种感觉，平时放在桌角的咖啡杯丢了，明知道它不会再回来，却还是会时不时看向那个空荡荡的位置。',
  ],
})
</script>

<template>
  <div class="cmpt-prompt-card">
    <div class="cmpt-prompt-card__bg"></div>
    <div class="cmpt-prompt-card__eyebrow">角色卡片</div>
    <div class="cmpt-prompt-card__title">{{ props.title }}</div>

    <div class="cmpt-prompt-card__body">
      <p
        v-for="line in props.body"
        :key="line"
      >
        {{ line }}
      </p>
    </div>
  </div>
</template>

<style scoped>
.cmpt-prompt-card {
  position: relative;
  overflow-x: visible;
}

/* 背景图片层：absolute 定位，z-index 0 */
.cmpt-prompt-card__bg {
  margin: -2em;
  width: 170%;
  height: auto;
  min-height: 50vh;
  position: absolute;
  inset: 0;
  background-image: url('/assets/images/system-prompt-persona.jpg');
  background-size: cover;
  background-position: center;
  -webkit-mask-image: linear-gradient(to right, rgba(0, 0, 0, 0.1) 10%, rgba(0, 0, 0, 0.2) 35%, rgba(0, 0, 0, 0.5) 45%, rgba(0, 0, 0, 0.22) 80%, rgba(0, 0, 0, 0) 100%);
  mask-image: linear-gradient(to right, rgba(0, 0, 0, 0.1) 10%, rgba(0, 0, 0, 0.2) 35%, rgba(0, 0, 0, 0.5) 45%, rgba(0, 0, 0, 0.22) 80%, rgba(0, 0, 0, 0) 100%);
  pointer-events: none;
  z-index: 0;
}

/* 内容层：relative 定位，z-index 1 */
.cmpt-prompt-card__eyebrow,
.cmpt-prompt-card__title,
.cmpt-prompt-card__body {
  position: relative;
  z-index: 1;
}

.cmpt-prompt-card__eyebrow {
  color: #a33124;
  text-transform: uppercase;
  letter-spacing: 0.14em;
  font-size: 0.72rem;
  font-weight: 700;
}

.cmpt-prompt-card__title {
  margin-top: 0.55rem;
  color: #16110f;
  font-size: 1.2rem;
  font-weight: 700;
}

.cmpt-prompt-card__body {
  margin-top: 1rem;
  display: grid;
  gap: 0rem;
  color: #4d433d;
  font-size: 0.95rem;
  line-height: 1.6;

  p {
    margin: 0.5em;
  }
}
</style>
