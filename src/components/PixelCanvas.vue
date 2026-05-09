<template>
  <div class="pixel-canvas-wrapper">
    <canvas
      ref="canvasRef"
      class="pixel-canvas"
      :width="canvasSize"
      :height="canvasSize"
      @mousedown="onMouseDown"
      @mousemove="onMouseMove"
      @mouseup="onMouseUp"
      @mouseleave="onMouseLeave"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue';
import { store, actions } from '../store';
import type { Pixel } from '../types';

const props = defineProps<{
  zoom: number;
}>(); 

const canvasRef = ref<HTMLCanvasElement | null>(null);
const isDrawing = ref(false);
const lastPixel = ref<{ x: number; y: number } | null>(null);

const canvasSize = computed(() => store.width * props.zoom);

const render = () => {
  const canvas = canvasRef.value;
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (const layer of store.layers) {
    if (!layer.visible) continue;
    for (let y = 0; y < store.height; y++) {
      for (let x = 0; x < store.width; x++) {
        const color = layer.pixels[y][x];
        if (color) {
          ctx.fillStyle = color;
          ctx.fillRect(x * props.zoom, y * props.zoom, props.zoom, props.zoom);
        }
      }
    }
  }

  if (props.zoom >= 6) {
    ctx.strokeStyle = 'rgba(0,0,0,0.08)';
    ctx.lineWidth = 0.5;
    for (let x = 0; x <= store.width; x++) {
      ctx.beginPath();
      ctx.moveTo(x * props.zoom, 0);
      ctx.lineTo(x * props.zoom, canvas.height);
      ctx.stroke();
    }
    for (let y = 0; y <= store.height; y++) {
      ctx.beginPath();
      ctx.moveTo(0, y * props.zoom);
      ctx.lineTo(canvas.width, y * props.zoom);
      ctx.stroke();
    }
  }
};

const getPixelFromEvent = (e: MouseEvent): { x: number; y: number } | null => {
  const canvas = canvasRef.value;
  if (!canvas) return null;
  const rect = canvas.getBoundingClientRect();
  const x = Math.floor((e.clientX - rect.left) / props.zoom);
  const y = Math.floor((e.clientY - rect.top) / props.zoom);
  if (x < 0 || x >= store.width || y < 0 || y >= store.height) return null;
  return { x, y };
};

const handlePixelAction = (x: number, y: number) => {
  const layer = store.layers.find((l) => l.id === store.activeLayerId);

  if (store.activeTool === 'eyedropper') {
    for (let i = store.layers.length - 1; i >= 0; i--) {
      const l = store.layers[i];
      if (l.visible && l.pixels[y][x]) {
        store.currentColor = l.pixels[y][x];
        return;
      }
    }
    return;
  }

  if (!layer || layer.locked) return;

  switch (store.activeTool) {
    case 'pencil':
      actions.setPixel(x, y, store.currentColor);
      break;
    case 'eraser':
      actions.setPixel(x, y, null);
      break;
    case 'bucket':
      actions.useBucket(x, y, store.currentColor);
      break;
  }
};

const onMouseDown = (e: MouseEvent) => {
  const p = getPixelFromEvent(e);
  if (!p) return;
  if (store.activeTool === 'bucket') {
    actions.saveHistory();
    handlePixelAction(p.x, p.y);
    return;
  }
  isDrawing.value = true;
  actions.saveHistory();
  handlePixelAction(p.x, p.y);
  lastPixel.value = p;
};

const onMouseMove = (e: MouseEvent) => {
  if (!isDrawing.value) return;
  const p = getPixelFromEvent(e);
  if (!p) return;
  if (lastPixel.value && lastPixel.value.x === p.x && lastPixel.value.y === p.y) return;
  handlePixelAction(p.x, p.y);
  lastPixel.value = p;
};

const onMouseUp = () => {
  isDrawing.value = false;
  lastPixel.value = null;
};

const onMouseLeave = () => {
  isDrawing.value = false;
  lastPixel.value = null;
};

onMounted(() => {
  render();
});

watch(
  () => [store.layers, store.width, store.height, props.zoom],
  () => render(),
  { deep: true }
);

defineExpose({ render });
</script>

<style scoped>
.pixel-canvas-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  background: repeating-conic-gradient(#eee 0 25%, #fff 0 50%) 50% / 16px 16px;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}
.pixel-canvas {
  cursor: crosshair;
  image-rendering: pixelated;
  image-rendering: crisp-edges;
  border: 1px solid #ddd;
}
</style>
