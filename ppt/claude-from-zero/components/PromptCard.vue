<script setup lang="ts">
const props = withDefaults(defineProps<{
  title?: string
  body?: string[]
}>(), {
  title: '系统提示',
  body: () => [
    '你是一位资深的 AI Native 工作流教练。',
    '你要帮助产研团队在 90 分钟内完成从概念理解到产物上线。',
    '输出要清晰、克制、有结构，优先给出下一步行动。',
  ],
})
</script>

<template>
  <div class="cmpt-prompt-card">
    <div class="cmpt-prompt-card__eyebrow">Role Card</div>
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
  padding: 1.5rem;
  border-radius: 1.5rem;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.12), rgba(255, 255, 255, 0.04)),
    linear-gradient(135deg, rgba(99, 102, 241, 0.18), rgba(236, 72, 153, 0.12));
  border: 1px solid rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(16px);
  box-shadow: 0 18px 50px rgba(9, 12, 30, 0.45);
}

.cmpt-prompt-card__eyebrow {
  color: rgba(244, 114, 182, 0.9);
  text-transform: uppercase;
  letter-spacing: 0.14em;
  font-size: 0.72rem;
}

.cmpt-prompt-card__title {
  margin-top: 0.55rem;
  color: white;
  font-size: 1.2rem;
  font-weight: 700;
}

.cmpt-prompt-card__body {
  margin-top: 1rem;
  display: grid;
  gap: 0.7rem;
  color: rgba(226, 232, 240, 0.92);
  font-size: 0.95rem;
  line-height: 1.6;
}
</style>
