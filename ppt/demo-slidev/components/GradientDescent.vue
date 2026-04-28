<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'

const canvasRef = ref<HTMLCanvasElement | null>(null)
const ballX = ref(150)
const ballY = ref(50)
const isAnimating = ref(false)
const learningRate = ref(0.05)
const iteration = ref(0)
const maxIterations = 200

// 损失函数: z = x^2 + y^2 (简单抛物面)
function lossFunction(x: number, y: number): number {
  const scaleX = (x - 200) / 100
  const scaleY = (y - 150) / 100
  return scaleX * scaleX + scaleY * scaleY
}

// 梯度
function gradient(x: number, y: number): [number, number] {
  const scaleX = (x - 200) / 100
  const scaleY = (y - 150) / 100
  return [2 * scaleX * 0.5, 2 * scaleY * 0.5]
}

function draw() {
  const canvas = canvasRef.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const w = canvas.width
  const h = canvas.height

  ctx.clearRect(0, 0, w, h)

  // 绘制等高线背景
  for (let x = 0; x < w; x += 4) {
    for (let y = 0; y < h; y += 4) {
      const loss = lossFunction(x, y)
      const intensity = Math.min(1, loss / 4)
      const color = Math.floor(255 * (1 - intensity * 0.3))
      ctx.fillStyle = `rgb(${color + 20}, ${color + 40}, ${color + 60})`
      ctx.fillRect(x, y, 4, 4)
    }
  }

  // 绘制等高线
  ctx.strokeStyle = 'rgba(100, 149, 237, 0.3)'
  ctx.lineWidth = 1
  for (let c = 0.2; c < 3; c += 0.4) {
    ctx.beginPath()
    for (let angle = 0; angle < Math.PI * 2; angle += 0.05) {
      const r = Math.sqrt(c) * 100
      const x = 200 + r * Math.cos(angle)
      const y = 150 + r * Math.sin(angle)
      if (angle === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    }
    ctx.closePath()
    ctx.stroke()
  }

  // 最低点标记
  ctx.fillStyle = '#22c55e'
  ctx.beginPath()
  ctx.arc(200, 150, 6, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = '#166534'
  ctx.font = '10px sans-serif'
  ctx.fillText('最优解', 210, 154)

  // 绘制小球
  ctx.fillStyle = '#ef4444'
  ctx.beginPath()
  ctx.arc(ballX.value, ballY.value, 8, 0, Math.PI * 2)
  ctx.fill()
  ctx.strokeStyle = '#b91c1c'
  ctx.lineWidth = 2
  ctx.stroke()

  // 小球标签
  ctx.fillStyle = '#374151'
  ctx.font = 'bold 10px sans-serif'
  ctx.fillText('参数小球', ballX.value + 12, ballY.value - 8)
}

let animId: number

function animate() {
  if (!isAnimating.value) return

  const [gx, gy] = gradient(ballX.value, ballY.value)
  ballX.value -= gx * learningRate.value * 50
  ballY.value -= gy * learningRate.value * 50
  iteration.value++

  draw()

  if (iteration.value < maxIterations) {
    animId = requestAnimationFrame(animate)
  } else {
    isAnimating.value = false
  }
}

function start() {
  if (isAnimating.value) return
  // 随机起始位置
  ballX.value = 50 + Math.random() * 300
  ballY.value = 50 + Math.random() * 200
  iteration.value = 0
  isAnimating.value = true
  animate()
}

function reset() {
  isAnimating.value = false
  cancelAnimationFrame(animId)
  ballX.value = 150
  ballY.value = 50
  iteration.value = 0
  draw()
}

onMounted(() => {
  draw()
})

onUnmounted(() => {
  cancelAnimationFrame(animId)
})
</script>

<template>
  <div class="gradient-descent">
    <canvas
      ref="canvasRef"
      width="400"
      height="300"
      class="w-full rounded border bg-slate-50"
    />

    <div class="flex items-center justify-between mt-3">
      <div class="text-xs text-gray-500">
        迭代: {{ iteration }} / {{ maxIterations }}
      </div>
      <div class="flex gap-2">
        <button
          class="px-3 py-1 text-xs rounded bg-green-500 text-white hover:bg-green-600 disabled:opacity-50"
          :disabled="isAnimating"
          @click="start"
        >
          {{ isAnimating ? '训练中...' : '开始梯度下降' }}
        </button>
        <button
          class="px-3 py-1 text-xs rounded border border-gray-300 hover:bg-gray-100"
          @click="reset"
        >
          重置
        </button>
      </div>
    </div>

    <div class="mt-2 text-xs text-gray-400">
      小球从随机位置出发，沿梯度方向滚动到最低点（最优解）
    </div>
  </div>
</template>
