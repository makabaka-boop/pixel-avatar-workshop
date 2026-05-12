<script setup lang="ts">import { ref, reactive, computed, onMounted, watch } from 'vue';
import type { Layer, ColorPalette, ToolType, ThemeColors } from './types';
import { GRID_SIZE, getPixelKey, floodFill, applySymmetry, createEmptyPixels, deepClone, generateColorVariants, createThemeMappings, getAllColorsFromLayers } from './utils';
import { presetAssets, defaultPalettes, themePresets } from './presets';
import PixelCanvas from './components/PixelCanvas.vue';
import LayerPanel from './components/LayerPanel.vue';
import ColorPalettePanel from './components/ColorPalettePanel.vue';
import ToolBar from './components/ToolBar.vue';
import PresetAssets from './components/PresetAssets.vue';
import SkinChanger from './components/SkinChanger.vue';
const STORAGE_KEY_LAYERS = 'pixel-avatar-layers';
const STORAGE_KEY_PALETTES = 'pixel-avatar-palettes';
const canvasRef = ref<HTMLCanvasElement | null>(null);
const currentTool = ref<ToolType>('pencil');
const currentColor = ref('#000000');
const symmetryEnabled = ref(false);
const gridSize = ref(GRID_SIZE);
const showGrid = ref(true);
const isDrawing = ref(false);
const layers = ref<Layer[]>([
 { id: 'base', name: '底色层', pixels: createEmptyPixels(), visible: true, locked: false },
 { id: 'features', name: '五官层', pixels: createEmptyPixels(), visible: true, locked: false },
 { id: 'decorations', name: '装饰层', pixels: createEmptyPixels(), visible: true, locked: false }
]);
const currentLayerId = ref('features');
const history = ref<Layer[][]>([]);
const historyIndex = ref(-1);
const palettes = ref<ColorPalette[]>([...defaultPalettes]);
const currentPaletteId = ref('basic');
const showSkinChanger = ref(false);
const themeColors = reactive<ThemeColors>({
 skin: '#f1c27d',
 hair: '#4a3728',
 clothes: '#e74c3c'
});
const currentLayer = computed(() => {
 return layers.value.find(l => l.id === currentLayerId.value) || layers.value[0];
});
const currentPalette = computed(() => {
 return palettes.value.find(p => p.id === currentPaletteId.value) || palettes.value[0];
});
function saveToHistory() {
 const newState = deepClone(layers.value);
 history.value = history.value.slice(0, historyIndex.value + 1);
 history.value.push(newState);
 historyIndex.value = history.value.length - 1;
 if (history.value.length > 50) {
 history.value.shift();
 historyIndex.value--;
 }
}
function undo() {
 if (historyIndex.value > 0) {
 historyIndex.value--;
 layers.value = deepClone(history.value[historyIndex.value]);
 }
}
function redo() {
 if (historyIndex.value < history.value.length - 1) {
 historyIndex.value++;
 layers.value = deepClone(history.value[historyIndex.value]);
 }
}
function getPixelFromEvent(e: MouseEvent | TouchEvent): {
 x: number;
 y: number;
} | null {
 const canvas = canvasRef.value?.canvasRef;
 if (!canvas)
 return null;
 const rect = canvas.getBoundingClientRect();
 const pixelSize = canvas.width / gridSize.value;
 let clientX: number, clientY: number;
 if ('touches' in e) {
 clientX = e.touches[0].clientX;
 clientY = e.touches[0].clientY;
 }
 else {
 clientX = e.clientX;
 clientY = e.clientY;
 }
 const x = Math.floor((clientX - rect.left) / pixelSize);
 const y = Math.floor((clientY - rect.top) / pixelSize);
 if (x >= 0 && x < gridSize.value && y >= 0 && y < gridSize.value) {
 return { x, y };
 }
 return null;
}
function handleDrawStart(e: MouseEvent | TouchEvent) {
 if (currentLayer.value.locked)
 return;
 isDrawing.value = true;
 handleDraw(e);
}
function handleDraw(e: MouseEvent | TouchEvent) {
 if (!isDrawing.value || currentLayer.value.locked)
 return;
 const pos = getPixelFromEvent(e);
 if (!pos)
 return;
 const { x, y } = pos;
 const key = getPixelKey(x, y);
 if (currentTool.value === 'pencil') {
 if (symmetryEnabled.value) {
 currentLayer.value.pixels = applySymmetry(currentLayer.value.pixels, x, y, currentColor.value, gridSize.value);
 }
 else {
 currentLayer.value.pixels = { ...currentLayer.value.pixels, [key]: currentColor.value };
 }
 }
 else if (currentTool.value === 'eraser') {
 if (symmetryEnabled.value) {
 currentLayer.value.pixels = applySymmetry(currentLayer.value.pixels, x, y, '', gridSize.value);
 }
 else {
 const newPixels = { ...currentLayer.value.pixels };
 delete newPixels[key];
 currentLayer.value.pixels = newPixels;
 }
 }
 else if (currentTool.value === 'eyedropper') {
 const color = currentLayer.value.pixels[key];
 if (color) {
 currentColor.value = color;
 currentTool.value = 'pencil';
 }
 }
 else if (currentTool.value === 'paintbucket') {
 const targetColor = currentLayer.value.pixels[key] || '';
 currentLayer.value.pixels = floodFill(currentLayer.value.pixels, x, y, targetColor, currentColor.value, gridSize.value);
 }
}
function handleDrawEnd() {
 if (isDrawing.value) {
 isDrawing.value = false;
 saveToHistory();
 saveToLocalStorage();
 }
}
function applyPreset(asset: typeof presetAssets[0]) {
 if (currentLayer.value.locked)
 return;
 for (const [key, color] of Object.entries(asset.pixels)) {
 currentLayer.value.pixels = { ...currentLayer.value.pixels, [key]: color };
 }
 saveToHistory();
 saveToLocalStorage();
}
function clearCurrentLayer() {
 if (currentLayer.value.locked)
 return;
 if (confirm(`确定要清空「${currentLayer.value.name}」吗？`)) {
 currentLayer.value.pixels = createEmptyPixels();
 saveToHistory();
 saveToLocalStorage();
 }
}
function clearAllLayers() {
 if (confirm('确定要清空所有图层吗？此操作不可撤销。')) {
 layers.value.forEach(layer => {
 layer.pixels = createEmptyPixels();
 });
 saveToHistory();
 saveToLocalStorage();
 }
}
function exportPNG() {
 const canvas = document.createElement('canvas');
 canvas.width = gridSize.value;
 canvas.height = gridSize.value;
 const ctx = canvas.getContext('2d');
 if (!ctx)
 return;
 ctx.fillStyle = '#ffffff';
 ctx.fillRect(0, 0, gridSize.value, gridSize.value);
 layers.value.forEach(layer => {
 if (!layer.visible)
 return;
 for (const [key, color] of Object.entries(layer.pixels)) {
 const [x, y] = key.split(',').map(Number);
 ctx.fillStyle = color;
 ctx.fillRect(x, y, 1, 1);
 }
 });
 const link = document.createElement('a');
 link.download = `pixel-avatar-${Date.now()}.png`;
 link.href = canvas.toDataURL('image/png');
 link.click();
}
function exportJSON() {
 const data = {
 gridSize: gridSize.value,
 layers: layers.value.map(l => ({
 name: l.name,
 pixels: l.pixels
 }))
 };
 const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
 const link = document.createElement('a');
 link.download = `pixel-avatar-${Date.now()}.json`;
 link.href = URL.createObjectURL(blob);
 link.click();
}
function applyTheme(theme: typeof themePresets[0]) {
 const mappings = createThemeMappings(themeColors, {
 skin: theme.skin,
 hair: theme.hair,
 clothes: theme.clothes
 });
 layers.value = generateColorVariants(layers.value, mappings);
 themeColors.skin = theme.skin;
 themeColors.hair = theme.hair;
 themeColors.clothes = theme.clothes;
 saveToHistory();
 saveToLocalStorage();
}
function saveToLocalStorage() {
 localStorage.setItem(STORAGE_KEY_LAYERS, JSON.stringify(layers.value));
 localStorage.setItem(STORAGE_KEY_PALETTES, JSON.stringify(palettes.value));
}
function loadFromLocalStorage() {
 const savedLayers = localStorage.getItem(STORAGE_KEY_LAYERS);
 const savedPalettes = localStorage.getItem(STORAGE_KEY_PALETTES);
 if (savedLayers) {
 try {
 layers.value = JSON.parse(savedLayers);
 saveToHistory();
 }
 catch (e) {
 console.error('Failed to load layers:', e);
 }
 }
 else {
 saveToHistory();
 }
 if (savedPalettes) {
 try {
 palettes.value = JSON.parse(savedPalettes);
 }
 catch (e) {
 console.error('Failed to load palettes:', e);
 }
 }
}
function addCustomPalette(name: string, colors: string[]) {
 const newPalette: ColorPalette = {
 id: `custom-${Date.now()}`,
 name,
 colors
 };
 palettes.value.push(newPalette);
 saveToLocalStorage();
 return newPalette.id;
}
function deletePalette(id: string) {
 if (defaultPalettes.some(p => p.id === id))
 return;
 const index = palettes.value.findIndex(p => p.id === id);
 if (index > -1) {
 palettes.value.splice(index, 1);
 if (currentPaletteId.value === id) {
 currentPaletteId.value = 'basic';
 }
 saveToLocalStorage();
 }
}
function getColorsFromCurrent() {
 return getAllColorsFromLayers(layers.value);
}
watch(palettes, () => {
 saveToLocalStorage();
}, { deep: true });
onMounted(() => {
 loadFromLocalStorage();
});
defineExpose({
 canvasRef
});
</script>

<template>
  <div class="app">
    <header class="header">
      <h1>🎨 像素头像工坊</h1>
      <div class="header-actions">
        <button @click="undo" :disabled="historyIndex <= 0" title="撤销 (Ctrl+Z)">↶ 撤销</button>
        <button @click="redo" :disabled="historyIndex >= history.length - 1" title="重做 (Ctrl+Y)">↷ 重做</button>
        <button @click="exportPNG">📥 导出 PNG</button>
        <button @click="exportJSON">📄 导出 JSON</button>
        <button @click="showSkinChanger = true" class="btn-primary">🎭 批量换肤</button>
      </div>
    </header>

    <div class="main-content">
      <aside class="sidebar left">
        <LayerPanel
          :layers="layers"
          :current-layer-id="currentLayerId"
          @update:current-layer-id="currentLayerId = $event"
          @update:layer="(id, key, value) => {
            const layer = layers.find(l => l.id === id)
            if (layer) (layer as any)[key] = value
          }"
          @clear-current="clearCurrentLayer"
          @clear-all="clearAllLayers"
        />
      </aside>

      <main class="canvas-area">
        <ToolBar
          :current-tool="currentTool"
          :current-color="currentColor"
          :symmetry-enabled="symmetryEnabled"
          :show-grid="showGrid"
          @update:current-tool="currentTool = $event"
          @update:current-color="currentColor = $event"
          @update:symmetry-enabled="symmetryEnabled = $event"
          @update:show-grid="showGrid = $event"
        />
        
        <PixelCanvas
          ref="canvasRef"
          :layers="layers"
          :grid-size="gridSize"
          :show-grid="showGrid"
          @mousedown="handleDrawStart"
          @mousemove="handleDraw"
          @mouseup="handleDrawEnd"
          @mouseleave="handleDrawEnd"
          @touchstart="handleDrawStart"
          @touchmove="handleDraw"
          @touchend="handleDrawEnd"
        />

        <PresetAssets
          :presets="presetAssets"
          @apply="applyPreset"
        />
      </main>

      <aside class="sidebar right">
        <ColorPalettePanel
          :palettes="palettes"
          :current-palette-id="currentPaletteId"
          :current-color="currentColor"
          :theme-colors="themeColors"
          :theme-presets="themePresets"
          :current-work-colors="getColorsFromCurrent()"
          @update:current-palette-id="currentPaletteId = $event"
          @update:current-color="currentColor = $event"
          @update:theme-colors="(key, color) => (themeColors as any)[key] = color"
          @apply-theme="applyTheme"
          @add-palette="addCustomPalette"
          @delete-palette="deletePalette"
        />
      </aside>
    </div>

    <SkinChanger
      v-if="showSkinChanger"
      :layers="layers"
      :grid-size="gridSize"
      @close="showSkinChanger = false"
      @apply="(newLayers) => { layers = newLayers; saveToHistory(); saveToLocalStorage() }"
    />
  </div>
</template>
