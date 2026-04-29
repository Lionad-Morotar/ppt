<script setup lang="ts">
/**
 * ReAct 循环流程图组件
 * 用纯 HTML/CSS 实现，不依赖 mermaid
 */
</script>

<template>
  <div class="react-cycle">
    <!-- 主流程：横向 -->
    <div class="react-cycle__main">
      <div class="react-node">用户目标</div>
      <div class="react-arrow">→</div>
      <div class="react-node react-node--highlight">推理</div>
      <div class="react-arrow">→</div>
      <div class="react-node">调用工具</div>
      <div class="react-arrow">→</div>
      <div class="react-node">观察结果</div>
      <div class="react-arrow">→</div>
      <div class="react-diamond">
        <span>任务完成了吗</span>
      </div>
    </div>

    <!-- 分支：否 -->
    <div class="react-cycle__branch react-cycle__branch--no">
      <div class="react-branch-line" />
      <div class="react-branch-label">否</div>
      <div class="react-arrow react-arrow--up">↑</div>
      <div class="react-node react-node--muted">继续推理</div>
    </div>

    <!-- 分支：是 -->
    <div class="react-cycle__branch react-cycle__branch--yes">
      <div class="react-branch-line" />
      <div class="react-branch-label">是</div>
      <div class="react-arrow react-arrow--down">↓</div>
      <div class="react-node react-node--success">最终回答</div>
    </div>
  </div>
</template>

<style scoped>
.react-cycle {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.6rem;
  padding: 0.8rem;
  font-size: 0.75rem;
  color: #16110f;
  min-width: 280px;
}

/* 主流程横向排列 */
.react-cycle__main {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  flex-wrap: wrap;
  justify-content: center;
}

/* 普通节点 */
.react-node {
  padding: 0.35rem 0.6rem;
  background: #e4d7c3;
  border: 1.5px solid #16110f;
  font-weight: 500;
  white-space: nowrap;
}

.react-node--highlight {
  background: #a33124;
  color: #f8f1e6;
  border-color: #16110f;
}

.react-node--muted {
  background: #d8c8b2;
  color: #4d433d;
  border-color: #8a7a6a;
}

.react-node--success {
  background: #2e5a6b;
  color: #f8f1e6;
  border-color: #16110f;
}

/* 箭头 */
.react-arrow {
  font-size: 0.9rem;
  color: #4d433d;
  line-height: 1;
}

.react-arrow--up,
.react-arrow--down {
  font-size: 1rem;
}

/* 判断菱形 */
.react-diamond {
  position: relative;
  width: 5rem;
  height: 3rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.react-diamond::before {
  content: '';
  position: absolute;
  inset: 0;
  background: #f8f1e6;
  border: 1.5px solid #16110f;
  transform: rotate(45deg) scale(0.7);
}

.react-diamond span {
  position: relative;
  z-index: 1;
  font-size: 0.65rem;
  font-weight: 600;
  text-align: center;
  line-height: 1.3;
}

/* 分支区域 */
.react-cycle__branch {
  display: flex;
  align-items: center;
  gap: 0.3rem;
}

.react-branch-line {
  width: 1.5rem;
  height: 1.5px;
  background: #8a7a6a;
}

.react-branch-label {
  font-size: 0.65rem;
  font-weight: 700;
  color: #a33124;
  padding: 0.1rem 0.3rem;
  border: 1px solid #a33124;
}
</style>
