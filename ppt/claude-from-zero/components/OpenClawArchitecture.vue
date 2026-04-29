<script setup lang="ts">
// OpenClaw Architecture Diagram
// Visualizing: Agent Core (ReAct) + Harness layers = Product
</script>

<template>
  <div class="openclaw-arch">
    <!-- Product outer box -->
    <div class="openclaw-arch__product">
      <div class="openclaw-arch__label openclaw-arch__label--product">产品</div>

      <!-- Harness layer -->
      <div class="openclaw-arch__harness">
        <div class="openclaw-arch__label openclaw-arch__label--harness">Harness</div>
        <div class="openclaw-arch__harness-grid">
          <div class="openclaw-arch__cell">系统提示词</div>
          <div class="openclaw-arch__cell">记忆</div>
          <div class="openclaw-arch__cell">文件系统</div>
          <div class="openclaw-arch__cell">权限</div>
          <div class="openclaw-arch__cell">技能</div>
          <div class="openclaw-arch__cell">插件</div>
          <div class="openclaw-arch__cell">聊天频道</div>
          <div class="openclaw-arch__cell">引导</div>
        </div>
      </div>

      <!-- Agent core -->
      <div class="openclaw-arch__agent">
        <div class="openclaw-arch__label openclaw-arch__label--agent">智能体核心</div>
        <div class="openclaw-arch__react">
          <div class="openclaw-arch__step">思考</div>
          <div class="openclaw-arch__arrow">→</div>
          <div class="openclaw-arch__step">行动</div>
          <div class="openclaw-arch__arrow">→</div>
          <div class="openclaw-arch__step">观察</div>
          <div class="openclaw-arch__arrow">→</div>
          <div class="openclaw-arch__step">循环</div>
        </div>
      </div>
    </div>

    <!-- Formula -->
    <div class="openclaw-arch__formula">
      Harness = 产品 − 智能体
    </div>
  </div>
</template>

<style scoped>
.openclaw-arch {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.2rem;
  padding: 1rem;
  font-family: 'Avenir Next', 'PingFang SC', sans-serif;
}

.openclaw-arch__product {
  position: relative;
  border: 3px solid #16110f;
  padding: 1.2rem;
  background: #f8f1e6;
  width: 100%;
  max-width: 32rem;
}

.openclaw-arch__label {
  position: absolute;
  font-size: 0.65rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  padding: 0.2rem 0.5rem;
}

.openclaw-arch__label--product {
  top: -0.7rem;
  left: 0.8rem;
  background: #a33124;
  color: #f8f1e6;
}

.openclaw-arch__harness {
  position: relative;
  border: 2px solid #16110f;
  padding: 1.2rem 1rem 0.8rem;
  background: #e4d7c3;
  margin-bottom: 0.8rem;
}

.openclaw-arch__label--harness {
  top: -0.7rem;
  left: 0.6rem;
  background: #d0bfa6;
  color: #16110f;
}

.openclaw-arch__harness-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.5rem;
}

.openclaw-arch__cell {
  font-size: 0.6rem;
  padding: 0.4rem 0.3rem;
  border: 1.5px solid #16110f;
  background: #f8f1e6;
  text-align: center;
  font-weight: 600;
  color: #16110f;
}

.openclaw-arch__agent {
  position: relative;
  border: 2px solid #16110f;
  padding: 1rem;
  background: #a33124;
}

.openclaw-arch__label--agent {
  top: -0.7rem;
  left: 0.6rem;
  background: #16110f;
  color: #f8f1e6;
}

.openclaw-arch__react {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.3rem;
}

.openclaw-arch__step {
  font-size: 0.75rem;
  font-weight: 700;
  color: #f8f1e6;
  padding: 0.3rem 0.5rem;
  border: 1.5px solid #f8f1e6;
  background: rgba(255, 255, 255, 0.1);
}

.openclaw-arch__arrow {
  font-size: 0.9rem;
  font-weight: 700;
  color: #f8f1e6;
}

.openclaw-arch__formula {
  font-size: 1.1rem;
  font-weight: 800;
  color: #a33124;
  letter-spacing: 0.02em;
}
</style>
