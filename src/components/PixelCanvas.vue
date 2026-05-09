<template>
  <div class="pixel-canvas-wrapper">
    <canvas
      ref="canvasRef"
      :width="canvasSize"
      :height="canvasSize"
      @mousedown="onMouseDown"
      @mousemove="onMouseMove"
      @mouseup="onMouseUp"
      @mouseleave="onMouseUp"
      @contextmenu.prevent
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, nextTick } from 'vue'
import { usePixelEditor } from '../composables/usePixelEditor'

const {
  project, currentTool, currentColor, mirrorMode, showGrid,
  isDrawing, pushHistory, setPixel, floodFill, eyedrop
} = usePixelEditor()

const canvasRef = ref<HTMLCanvasElement | null>(null)
const CANVAS_PX = 576
const canvasSize = CANVAS_PX

const cellSize = computed(() => CANVAS_PX / project.gridSize)

function getGridPos(e: MouseEvent) {
  const canvas = canvasRef.value
  if (!canvas) return null
  const rect = canvas.getBoundingClientRect()
  const scaleX = canvas.width / rect.width
  const scaleY = canvas.height / rect.height
  const x = Math.floor((e.clientX - rect.left) * scaleX / cellSize.value)
  const y = Math.floor((e.clientY - rect.top) * scaleY / cellSize.value)
  if (x < 0 || x >= project.gridSize || y < 0 || y >= project.gridSize) return null
  return { x, y }
}

function onMouseDown(e: MouseEvent) {
  isDrawing.value = true
  const pos = getGridPos(e)
  if (!pos) return
  pushHistory()
  applyTool(pos.x, pos.y)
  render()
}

function onMouseMove(e: MouseEvent) {
  if (!isDrawing.value) return
  const pos = getGridPos(e)
  if (!pos) return
  if (currentTool.value === 'pencil' || currentTool.value === 'eraser' || currentTool.value === 'mirror') {
    applyTool(pos.x, pos.y)
    render()
  }
}

function onMouseUp() {
  if (isDrawing.value) {
    isDrawing.value = false
    pushHistory()
  }
}

function applyTool(x: number, y: number) {
  const tool = currentTool.value
  if (tool === 'pencil') {
    setPixel(x, y, currentColor.value)
    if (mirrorMode.value) {
      const mirrorX = project.gridSize - 1 - x
      setPixel(mirrorX, y, currentColor.value)
    }
  } else if (tool === 'eraser') {
    setPixel(x, y, '')
    if (mirrorMode.value) {
      const mirrorX = project.gridSize - 1 - x
      setPixel(mirrorX, y, '')
    }
  } else if (tool === 'mirror') {
    setPixel(x, y, currentColor.value)
    const mirrorX = project.gridSize - 1 - x
    setPixel(mirrorX, y, currentColor.value)
  } else if (tool === 'eyedropper') {
    const color = eyedrop(x, y)
    if (color) currentColor.value = color
  } else if (tool === 'bucket') {
    floodFill(x, y, currentColor.value)
  }
}

function render() {
  const canvas = canvasRef.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const gs = project.gridSize
  const cs = cellSize.value

  ctx.clearRect(0, 0, CANVAS_PX, CANVAS_PX)

  for (let y = 0; y < gs; y++) {
    for (let x = 0; x < gs; x++) {
      if ((x + y) % 2 === 0) {
        ctx.fillStyle = '#f0f0f0'
      } else {
        ctx.fillStyle = '#e0e0e0'
      }
      ctx.fillRect(x * cs, y * cs, cs, cs)
    }
  }

  for (const layer of project.layers) {
    if (!layer.visible) continue
    for (const [key, color] of Object.entries(layer.pixels)) {
      const [px, py] = key.split(',').map(Number)
      ctx.fillStyle = color
      ctx.fillRect(px * cs, py * cs, cs, cs)
    }
  }

  if (showGrid.value) {
    ctx.strokeStyle = 'rgba(0,0,0,0.1)'
    ctx.lineWidth = 0.5
    for (let i = 0; i <= gs; i++) {
      ctx.beginPath()
      ctx.moveTo(i * cs, 0)
      ctx.lineTo(i * cs, CANVAS_PX)
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(0, i * cs)
      ctx.lineTo(CANVAS_PX, i * cs)
      ctx.stroke()
    }
  }
}

watch(
  () => JSON.stringify(project.layers.map(l => ({ v: l.visible, p: l.pixels }))) + project.gridSize + showGrid.value,
  () => nextTick(render)
)

onMounted(() => {
  nextTick(render)
})
</script>

<style scoped>
.pixel-canvas-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 1;
  min-height: 0;
}

canvas {
  image-rendering: pixelated;
  image-rendering: crisp-edges;
  border: 2px solid #444;
  cursor: crosshair;
  max-width: 100%;
  max-height: 70vh;
}
</style>
