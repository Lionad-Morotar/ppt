<script setup lang="ts">
// Tool Call Sequence Diagram
// Visualizing: User -> LLM -> Tool -> LLM -> User
</script>

<template>
  <div class="tc-seq">
    <svg viewBox="0 0 480 200" class="tc-seq__svg">
      <!-- Actors -->
      <g class="tc-seq__actor" transform="translate(60, 20)">
        <rect x="-30" y="-14" width="60" height="28" rx="2" fill="#a33124" stroke="#16110f" stroke-width="2"/>
        <text y="4" text-anchor="middle" fill="#f8f1e6" font-size="11" font-weight="700">用户</text>
      </g>
      <line x1="60" y1="48" x2="60" y2="170" stroke="#16110f" stroke-width="1.5" stroke-dasharray="4,3" opacity="0.4"/>

      <g class="tc-seq__actor" transform="translate(200, 20)">
        <rect x="-35" y="-14" width="70" height="28" rx="2" fill="#16110f" stroke="#16110f" stroke-width="2"/>
        <text y="4" text-anchor="middle" fill="#f8f1e6" font-size="11" font-weight="700">LLM</text>
      </g>
      <line x1="200" y1="48" x2="200" y2="170" stroke="#16110f" stroke-width="1.5" stroke-dasharray="4,3" opacity="0.4"/>

      <g class="tc-seq__actor" transform="translate(340, 20)">
        <rect x="-30" y="-14" width="60" height="28" rx="2" fill="#d0bfa6" stroke="#16110f" stroke-width="2"/>
        <text y="4" text-anchor="middle" fill="#16110f" font-size="11" font-weight="700">工具</text>
      </g>
      <line x1="340" y1="48" x2="340" y2="170" stroke="#16110f" stroke-width="1.5" stroke-dasharray="4,3" opacity="0.4"/>

      <!-- Messages -->
      <!-- 1. User -> LLM -->
      <line x1="60" y1="65" x2="200" y2="65" stroke="#a33124" stroke-width="2.5" marker-end="url(#tc-arrow)"/>
      <text x="130" y="60" text-anchor="middle" fill="#16110f" font-size="9" font-weight="600">提示词</text>

      <!-- 2. LLM decides to call tool -->
      <line x1="200" y1="90" x2="340" y2="90" stroke="#16110f" stroke-width="2" marker-end="url(#tc-arrow)"/>
      <text x="270" y="85" text-anchor="middle" fill="#16110f" font-size="9" font-weight="600">工具调用</text>

      <!-- 3. Tool returns result -->
      <line x1="340" y1="115" x2="200" y2="115" stroke="#16110f" stroke-width="2" marker-end="url(#tc-arrow)"/>
      <text x="270" y="128" text-anchor="middle" fill="#16110f" font-size="9" font-weight="600">结果</text>

      <!-- 4. LLM -> User final response -->
      <line x1="200" y1="145" x2="60" y2="145" stroke="#a33124" stroke-width="2.5" marker-end="url(#tc-arrow)"/>
      <text x="130" y="158" text-anchor="middle" fill="#16110f" font-size="9" font-weight="600">回答</text>

      <!-- Arrow marker definition -->
      <defs>
        <marker id="tc-arrow" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
          <polygon points="0 0, 10 3.5, 0 7" fill="#16110f"/>
        </marker>
      </defs>
    </svg>

    <div class="tc-seq__caption">
      一次完整的工具调用：LLM 主动决定「需要查什么」，而不是用户手动触发
    </div>
  </div>
</template>

<style scoped>
.tc-seq {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.tc-seq__svg {
  width: 100%;
  max-width: 28rem;
  height: auto;
}

.tc-seq__caption {
  margin-top: 0.4rem;
  font-size: 0.75rem;
  color: #4d433d;
  font-style: italic;
  text-align: center;
}
</style>
