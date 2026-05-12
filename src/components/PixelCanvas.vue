<script setup lang="ts">
import { ref, watch, onMounted, computed } from 'vue'
import type { Layer } from '../types'
import { PIXEL_SIZE } from '../utils'

const props = defineProps<{
  layers: Layer[]
  gridSize: number
  showGrid: boolean
}>()

const canvasRef = ref<HTMLCanvasElement | null>(null)
const containerRef = ref<HTMLDivElement | null>(null)

const canvasSize = computed(() => props.gridSize * PIXEL_SIZE)

function render() {
  const canvas = canvasRef.value
  if (!canvas) return

  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const pixelSize = canvasSize.value / props.gridSize

  ctx.clearRect(0, 0, canvasSize.value, canvasSize.value)

  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, canvasSize.value, canvasSize.value)

  for (const layer of props.layers) {
    if (!layer.visible) continue

    for (const [key, color] of Object.entries(layer.pixels)) {
      const [x, y] = key.split(',').map(Number)
      ctx.fillStyle = color
      ctx.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize)
    }
  }

  if (props.showGrid) {
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)'
    ctx.lineWidth = 1

    for (let i = 0; i <= props.gridSize; i++) {
      ctx.beginPath()
      ctx.moveTo(i * pixelSize, 0)
      ctx.lineTo(i * pixelSize, canvasSize.value)
      ctx.stroke()

      ctx.beginPath()
      ctx.moveTo(0, i * pixelSize)
      ctx.lineTo(canvasSize.value, i * pixelSize)
      ctx.stroke()
    }
  }
}

watch(() => [props.layers, props.showGrid, props.gridSize], () => {
  render()
}, { deep: true, immediate: true })

onMounted(() => {
  render()
})

defineExpose({
  canvasRef
})
</script>

<template>
  <div class="canvas-container" ref="containerRef">
    <canvas
      ref="canvasRef"
      :width="canvasSize"
      :height="canvasSize"
      class="pixel-canvas"
      @mousedown="$emit('mousedown', $event)"
      @mousemove="$emit('mousemove', $event)"
      @mouseup="$emit('mouseup', $event)"
      @mouseleave="$emit('mouseleave', $event)"
      @touchstart.prevent="$emit('touchstart', $event)"
      @touchmove.prevent="$emit('touchmove', $event)"
      @touchend="$emit('touchend', $event)"
    />
  </div>
</template>

<style scoped>
.canvas-container {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
  background: #f5f5f5;
  border-radius: 8px;
  box-shadow: inset 0 2px 8px rgba(0, 0, 0, 0.1);
}

.pixel-canvas {
  image-rendering: pixelated;
  image-rendering: crisp-edges;
  cursor: crosshair;
  border: 2px solid #ddd;
  border-radius: 4px;
  background: 
    linear-gradient(45deg, #eee 25%, transparent 25%),
    linear-gradient(-45deg, #eee 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, #eee 75%),
    linear-gradient(-45deg, transparent 75%, #eee 75%);
  background-size: 20px 20px;
  background-position: 0 0, 0 10px, 10px -10px, -10px 0px;
}
</style>
