<template>
  <div class="app">
    <header class="app-header">
      <h1>🎨 像素头像工坊</h1>
      <div class="header-actions">
        <div class="size-selector">
          <label>画布尺寸：</label>
          <select v-model="canvasSize" @change="onResize">
            <option value="32">32 × 32</option>
            <option value="48">48 × 48</option>
          </select>
        </div>
        <div class="zoom-selector">
          <label>缩放：</label>
          <select v-model.number="zoom">
            <option :value="8">×8</option>
            <option :value="12">×12</option>
            <option :value="16">×16</option>
          </select>
        </div>
      </div>
    </header>

    <div class="main-content">
      <aside class="sidebar left-sidebar">
        <LayerPanel />
        <div class="history-section">
          <h3 class="panel-title">操作</h3>
          <div class="history-buttons">
            <button class="hist-btn" @click="actions.undo()" :disabled="store.undoStack.length === 0">
              ↩ 撤销 ({{ store.undoStack.length }})
            </button>
            <button class="hist-btn" @click="actions.redo()" :disabled="store.redoStack.length === 0">
              ↪ 重做 ({{ store.redoStack.length }})
            </button>
          </div>
        </div>
        <AssetPanel />
      </aside>

      <main class="canvas-area">
        <ToolBar />
        <PixelCanvas :zoom="zoom" ref="pixelCanvasRef" />
        <div class="action-bar">
          <button class="action-btn export" @click="exportPNG">📥 导出 PNG</button>
          <button class="action-btn export" @click="exportJSON">📄 导出 JSON</button>
          <button class="action-btn variant" @click="showSkinModal = true">🎭 批量换肤</button>
          <button class="action-btn clear" @click="clearAll">🗑 清空全部</button>
        </div>
      </main>

      <aside class="sidebar right-sidebar">
        <ColorPanel @apply-theme="onApplyTheme" />
      </aside>
    </div>

    <SkinVariantModal
      :visible="showSkinModal"
      :initial-theme="pendingTheme"
      @close="onCloseSkinModal"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import PixelCanvas from './components/PixelCanvas.vue';
import LayerPanel from './components/LayerPanel.vue';
import ColorPanel from './components/ColorPanel.vue';
import ToolBar from './components/ToolBar.vue';
import AssetPanel from './components/AssetPanel.vue';
import SkinVariantModal from './components/SkinVariantModal.vue';
import { store, actions } from './store';
import { downloadCanvas, downloadFile } from './utils';
import type { ColorTheme } from './types';

const zoom = ref(12);
const canvasSize = ref('32');
const pixelCanvasRef = ref<InstanceType<typeof PixelCanvas> | null>(null);
const showSkinModal = ref(false);
const pendingTheme = ref<ColorTheme | null>(null);

const onResize = () => {
  if (confirm('调整画布尺寸将清空所有内容，确定继续？')) {
    const size = parseInt(canvasSize.value);
    actions.resize(size, size);
  } else {
    canvasSize.value = store.width.toString();
  }
};

const exportPNG = () => {
  const scale = 8;
  const w = store.width * scale;
  const h = store.height * scale;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, w, h);

  for (const layer of store.layers) {
    if (!layer.visible) continue;
    for (let y = 0; y < store.height; y++) {
      for (let x = 0; x < store.width; x++) {
        const color = layer.pixels[y][x];
        if (color) {
          ctx.fillStyle = color;
          ctx.fillRect(x * scale, y * scale, scale, scale);
        }
      }
    }
  }

  downloadCanvas(canvas, `pixel-avatar-${Date.now()}.png`);
};

const exportJSON = () => {
  const data = {
    version: 1,
    width: store.width,
    height: store.height,
    createdAt: Date.now(),
    layers: store.layers.map(layer => ({
      id: layer.id,
      name: layer.name,
      type: layer.type,
      pixels: layer.pixels
    }))
  };
  downloadFile(JSON.stringify(data, null, 2), `pixel-avatar-${Date.now()}.json`, 'application/json');
};

const clearAll = () => {
  if (confirm('确定要清空所有图层吗？此操作不可撤销。')) {
    actions.saveHistory();
    for (const layer of store.layers) {
      if (!layer.locked) {
        for (let y = 0; y < store.height; y++) {
          for (let x = 0; x < store.width; x++) {
            layer.pixels[y][x] = null;
          }
        }
      }
    }
  }
};

const hexToRgb = (hex: string) => {
  const m = hex.match(/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i);
  if (!m) return null;
  return {
    r: parseInt(m[1], 16),
    g: parseInt(m[2], 16),
    b: parseInt(m[3], 16)
  };
};

const getBrightness = (hex: string) => {
  const rgb = hexToRgb(hex);
  if (!rgb) return 0;
  return (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
};

const onApplyTheme = (theme: ColorTheme) => {
  const used = actions.collectUsedColors();
  if (used.length === 0) {
    store.currentColor = theme.skin;
    return;
  }
  
  const sorted = [...used].sort((a, b) => getBrightness(b) - getBrightness(a));
  
  const map: { [key: string]: string } = {};
  sorted.forEach((color, i) => {
    if (i === 0) map[color] = theme.skin;
    else if (i === sorted.length - 1) map[color] = theme.hair;
    else map[color] = theme.clothes;
  });
  
  actions.saveHistory();
  actions.applyColorMapAll(map);
};

const onCloseSkinModal = () => {
  showSkinModal.value = false;
  pendingTheme.value = null;
};

const onKeyDown = (e: KeyboardEvent) => {
  if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
    e.preventDefault();
    if (e.shiftKey) {
      actions.redo();
    } else {
      actions.undo();
    }
  }
  if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
    e.preventDefault();
    actions.redo();
  }
  if (e.key === 's') store.activeTool = 'pencil';
  if (e.key === 'e') store.activeTool = 'eraser';
  if (e.key === 'i') store.activeTool = 'eyedropper';
  if (e.key === 'b' || e.key === 'g') store.activeTool = 'bucket';
};

onMounted(() => {
  window.addEventListener('keydown', onKeyDown);
});

onUnmounted(() => {
  window.removeEventListener('keydown', onKeyDown);
});
</script>

<style>
* {
  box-sizing: border-box;
}

body {
  margin: 0;
  padding: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  background: #f5f7fa;
  color: #333;
}

#app {
  min-height: 100vh;
}
</style>

<style scoped>
.app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.app-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.app-header h1 {
  margin: 0;
  font-size: 20px;
}

.header-actions {
  display: flex;
  gap: 16px;
}

.size-selector, .zoom-selector {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
}

.size-selector select, .zoom-selector select {
  padding: 4px 8px;
  border-radius: 4px;
  border: none;
  font-size: 13px;
  background: rgba(255,255,255,0.2);
  color: white;
}

.size-selector select option, .zoom-selector select option {
  color: #333;
}

.main-content {
  display: flex;
  flex: 1;
  gap: 16px;
  padding: 16px;
}

.sidebar {
  width: 260px;
  background: white;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.06);
  display: flex;
  flex-direction: column;
  gap: 16px;
  overflow-y: auto;
  max-height: calc(100vh - 100px);
}

.left-sidebar {
  order: 1;
}

.canvas-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  order: 2;
}

.right-sidebar {
  order: 3;
}

.history-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.panel-title {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: #333;
  border-bottom: 1px solid #eee;
  padding-bottom: 8px;
}

.history-buttons {
  display: flex;
  gap: 6px;
}

.hist-btn {
  flex: 1;
  padding: 8px 10px;
  border: 1px solid #ddd;
  background: white;
  border-radius: 6px;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.15s;
}

.hist-btn:hover:not(:disabled) {
  background: #e3f2fd;
  border-color: #2196f3;
}

.hist-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.action-bar {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  justify-content: center;
}

.action-btn {
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s;
  color: white;
}

.action-btn.export {
  background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
}

.action-btn.export:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(17, 153, 142, 0.3);
}

.action-btn.variant {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.action-btn.variant:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(245, 87, 108, 0.3);
}

.action-btn.clear {
  background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
}

.action-btn.clear:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(231, 76, 60, 0.3);
}
</style>
