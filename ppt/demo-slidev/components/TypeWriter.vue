<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const props = defineProps<{
  text: string
  speed?: number
  delay?: number
}>()

const displayed = ref('')
const isComplete = ref(false)
let interval: ReturnType<typeof setInterval>

function start() {
  displayed.value = ''
  isComplete.value = false
  let i = 0
  interval = setInterval(() => {
    if (i < props.text.length) {
      displayed.value += props.text[i]
      i++
    } else {
      isComplete.value = true
      clearInterval(interval)
    }
  }, props.speed || 80)
}

onMounted(() => {
  setTimeout(start, props.delay || 500)
})

onUnmounted(() => {
  clearInterval(interval)
})
</script>

<template>
  <span class="typewriter">
    <span>{{ displayed }}</span>
    <span
      v-if="!isComplete"
      class="cursor inline-block w-0.5 h-4 bg-current ml-0.5 animate-pulse"
    />
  </span>
</template>
