<script setup lang="ts">
// Gradient Descent 3D Visualization
// A stylized 3D surface with a rolling ball showing descent path
</script>

<template>
  <div class="gd-viz">
    <svg viewBox="0 0 400 280" class="gd-viz__svg">
      <!-- Grid / surface -->
      <defs>
        <linearGradient id="surfaceGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#f8f1e6;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#e4d7c3;stop-opacity:1" />
        </linearGradient>
        <linearGradient id="ballGrad" x1="30%" y1="30%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#d0bfa6;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#a33124;stop-opacity:1" />
        </linearGradient>
      </defs>

      <!-- Surface contours (ellipses showing bowl shape) -->
      <ellipse cx="200" cy="200" rx="160" ry="40" fill="none" stroke="#d0bfa6" stroke-width="1.5" />
      <ellipse cx="200" cy="185" rx="130" ry="34" fill="none" stroke="#d0bfa6" stroke-width="1.5" />
      <ellipse cx="200" cy="170" rx="100" ry="28" fill="none" stroke="#d0bfa6" stroke-width="1.5" />
      <ellipse cx="200" cy="155" rx="72" ry="22" fill="none" stroke="#d0bfa6" stroke-width="1.5" />
      <ellipse cx="200" cy="140" rx="46" ry="16" fill="none" stroke="#d0bfa6" stroke-width="1.5" />
      <ellipse cx="200" cy="125" rx="22" ry="10" fill="none" stroke="#d0bfa6" stroke-width="1.5" />

      <!-- Surface fill -->
      <ellipse cx="200" cy="200" rx="160" ry="40" fill="url(#surfaceGrad)" opacity="0.4" />

      <!-- Descent path (zigzag down) -->
      <polyline
        points="120,140 180,155 140,170 200,185 170,200 200,200"
        fill="none"
        stroke="#a33124"
        stroke-width="2.5"
        stroke-dasharray="6,4"
        opacity="0.85"
      />

      <!-- Ball at current position -->
      <circle cx="200" cy="200" r="10" fill="url(#ballGrad)" stroke="#16110f" stroke-width="2" />
      <circle cx="197" cy="197" r="3" fill="#f8f1e6" opacity="0.6" />

      <!-- Arrow pointing down to minimum -->
      <line x1="240" y1="120" x2="215" y2="195" stroke="#16110f" stroke-width="1.5" marker-end="url(#arrowhead)" opacity="0.5" />

      <!-- Labels -->
      <text x="80" y="100" class="gd-viz__label" fill="#a33124" font-weight="700">起点（高损失）</text>
      <text x="210" y="230" class="gd-viz__label" fill="#16110f" font-weight="700">最低点</text>
    </svg>

    <div class="gd-viz__caption">
      梯度下降：沿着最陡的方向，一步一步滚向谷底
    </div>
  </div>
</template>

<style scoped>
.gd-viz {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.gd-viz__svg {
  width: 100%;
  max-width: 24rem;
  height: auto;
}

.gd-viz__label {
  font-size: 0.7rem;
  font-family: 'Avenir Next', 'PingFang SC', sans-serif;
}

.gd-viz__caption {
  margin-top: 0.6rem;
  font-size: 0.75rem;
  color: #4d433d;
  font-style: italic;
  text-align: center;
}
</style>
