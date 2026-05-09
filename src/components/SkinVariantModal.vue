<template>
  <div v-if="visible" class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content">
      <div class="modal-header">
        <h3>批量换肤</h3>
        <button class="close-btn" @click="$emit('close')">×</button>
      </div>
      <div class="modal-body">
        <div class="color-mapping-section">
          <h4>颜色映射（从当前颜色 → 目标颜色）</h4>
          <div class="color-mapping-list">
            <div
              v-for="(target, source) in colorMap"
              :key="source"
              class="mapping-row"
            >
              <div
              class="color-swatch"
              :style="{ background: source as string }"
              :title="source as string"
            ></div>
              <span class="arrow">→</span>
              <input
                type="color"
                v-model="colorMap[source]"
                class="color-input"
              />
            </div>
          </div>
        </div>

        <div class="preset-section">
          <h4>预设变体</h4>
          <div class="preset-grid">
            <button
              v-for="preset in presets"
              :key="preset.name"
              class="preset-btn"
              @click="applyPreset(preset)"
            >
              <div class="preset-colors">
                <span
                  v-for="(c, idx) in preset.colors"
                  :key="idx"
                  :style="{ background: c }"
                ></span>
              </div>
              <span>{{ preset.name }}</span>
            </button>
          </div>
        </div>

        <div class="preview-section">
          <h4>预览</h4>
          <canvas
            ref="previewCanvas"
            :width="store.width * 4"
            :height="store.height * 4"
            class="preview-canvas"
          ></canvas>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn" @click="apply">应用到当前</button>
        <button class="btn primary" @click="exportVariants">导出所有变体 PNG</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch, nextTick, computed } from 'vue';
import { store, actions } from '../store';
import { downloadCanvas } from '../utils';
import type { ColorMap } from '../types';

const props = defineProps<{
  visible: boolean;
}>();

const emit = defineEmits<{
  close: [];
}>();

const previewCanvas = ref<HTMLCanvasElement | null>(null);

const colorMap = reactive<ColorMap>({});

const skinTones = ['#ffe0bd', '#f5d0a9', '#d4a574', '#c68642', '#8d5524', '#5d3a1a'];
const hairColors = ['#1a1a1a', '#3d2314', '#8b4513', '#ffd700', '#9b59b6', '#e74c3c'];
const clothesColors = ['#2196f3', '#4caf50', '#ff9800', '#9c27b0', '#607d8b', '#f44336'];

const presets = computed(() => {
  const used = actions.collectUsedColors();
  if (used.length === 0) return [];
  return [
    {
      name: '暖色',
      colors: used.map((c, i) => adjustHue(c, 20 + i * 5))
    },
    {
      name: '冷色',
      colors: used.map((c, i) => adjustHue(c, -20 - i * 5))
    },
    {
      name: '灰度',
      colors: used.map((c) => toGrayscale(c))
    },
    {
      name: '复古',
      colors: used.map((c) => sepia(c))
    },
    {
      name: '高饱和',
      colors: used.map((c) => adjustSaturation(c, 1.5))
    },
    {
      name: '低饱和',
      colors: used.map((c) => adjustSaturation(c, 0.5))
    }
  ];
});

const initColorMap = () => {
  const colors = actions.collectUsedColors();
  for (const c of Object.keys(colorMap)) {
    if (!colors.includes(c)) delete colorMap[c];
  }
  for (const c of colors) {
    if (!(c in colorMap)) colorMap[c] = c;
  }
  nextTick(renderPreview);
};

watch(
  () => props.visible,
  (v) => {
    if (v) {
      initColorMap();
    }
  },
  { immediate: true }
);

watch(
  colorMap,
  () => {
    if (props.visible) renderPreview();
  },
  { deep: true }
);

const renderPreview = () => {
  const canvas = previewCanvas.value;
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const scale = 4;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (const layer of store.layers) {
    if (!layer.visible) continue;
    for (let y = 0; y < store.height; y++) {
      for (let x = 0; x < store.width; x++) {
        let color = layer.pixels[y][x];
        if (!color) continue;
        if (colorMap[color] && colorMap[color] !== color) {
          color = colorMap[color];
        }
        ctx.fillStyle = color;
        ctx.fillRect(x * scale, y * scale, scale, scale);
      }
    }
  }
};

const hexToHsl = (hex: string): { h: number; s: number; l: number } | null => {
  const rgb = storeHexToRgb(hex);
  if (!rgb) return null;
  const r = rgb.r / 255, g = rgb.g / 255, b = rgb.b / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  return { h: h * 360, s: s * 100, l: l * 100 };
};

const hslToHex = (h: number, s: number, l: number): string => {
  h = h / 360; s = s / 100; l = l / 100;
  let r, g, b;
  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }
  return '#' + [r, g, b].map(v => Math.round(v * 255).toString(16).padStart(2, '0')).join('');
};

const storeHexToRgb = (hex: string): { r: number; g: number; b: number } | null => {
  const m = hex.match(/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i);
  if (!m) return null;
  return { r: parseInt(m[1], 16), g: parseInt(m[2], 16), b: parseInt(m[3], 16) };
};

const adjustHue = (hex: string, degrees: number): string => {
  const hsl = hexToHsl(hex);
  if (!hsl) return hex;
  hsl.h = (hsl.h + degrees + 360) % 360;
  return hslToHex(hsl.h, hsl.s, hsl.l);
};

const adjustSaturation = (hex: string, factor: number): string => {
  const hsl = hexToHsl(hex);
  if (!hsl) return hex;
  hsl.s = Math.min(100, Math.max(0, hsl.s * factor));
  return hslToHex(hsl.h, hsl.s, hsl.l);
};

const toGrayscale = (hex: string): string => {
  const rgb = storeHexToRgb(hex);
  if (!rgb) return hex;
  const gray = Math.round(rgb.r * 0.299 + rgb.g * 0.587 + rgb.b * 0.114);
  return '#' + [gray, gray, gray].map(v => v.toString(16).padStart(2, '0')).join('');
};

const sepia = (hex: string): string => {
  const rgb = storeHexToRgb(hex);
  if (!rgb) return hex;
  const r = Math.min(255, rgb.r * 0.393 + rgb.g * 0.769 + rgb.b * 0.189);
  const g = Math.min(255, rgb.r * 0.349 + rgb.g * 0.686 + rgb.b * 0.168);
  const b = Math.min(255, rgb.r * 0.272 + rgb.g * 0.534 + rgb.b * 0.131);
  return '#' + [r, g, b].map(v => Math.round(v).toString(16).padStart(2, '0')).join('');
};

const applyPreset = (preset: { colors: string[] }) => {
  const used = actions.collectUsedColors();
  used.forEach((c, i) => {
    if (preset.colors[i]) colorMap[c] = preset.colors[i];
  });
};

const apply = () => {
  actions.saveHistory();
  actions.applyColorMapAll(colorMap);
  emit('close');
};

const renderVariant = (ctx: CanvasRenderingContext2D, map: ColorMap, scale: number) => {
  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  for (const layer of store.layers) {
    if (!layer.visible) continue;
    for (let y = 0; y < store.height; y++) {
      for (let x = 0; x < store.width; x++) {
        let color = layer.pixels[y][x];
        if (!color) continue;
        if (map[color] && map[color] !== color) color = map[color];
        ctx.fillStyle = color;
        ctx.fillRect(x * scale, y * scale, scale, scale);
      }
    }
  }
};

const exportVariants = () => {
  const scale = 8;
  const w = store.width * scale;
  const h = store.height * scale;
  const allMaps = [
    { name: 'original', map: Object.fromEntries(Object.keys(colorMap).map(c => [c, c])) },
    { name: 'current', map: { ...colorMap } },
    ...presets.value.map((p, i) => {
      const used = actions.collectUsedColors();
      const m: ColorMap = {};
      used.forEach((c, idx) => { if (p.colors[idx]) m[c] = p.colors[idx]; });
      return { name: `variant-${i}`, map: m };
    })
  ];

  allMaps.forEach((variant) => {
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    renderVariant(ctx, variant.map, scale);
    downloadCanvas(canvas, `avatar-${variant.name}.png`);
  });
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}
.modal-content {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
}
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #eee;
}
.modal-header h3 {
  margin: 0;
}
.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #666;
}
.modal-body {
  padding: 20px;
}
.modal-footer {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  padding: 16px 20px;
  border-top: 1px solid #eee;
}
.btn {
  padding: 8px 16px;
  border: 1px solid #ddd;
  background: white;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
}
.btn.primary {
  background: #2196f3;
  color: white;
  border-color: #2196f3;
}
.color-mapping-section h4, .preset-section h4, .preview-section h4 {
  margin: 0 0 10px;
  font-size: 13px;
  color: #666;
}
.color-mapping-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 20px;
}
.mapping-row {
  display: flex;
  align-items: center;
  gap: 6px;
}
.color-swatch {
  width: 30px;
  height: 30px;
  border-radius: 4px;
  border: 1px solid #ddd;
}
.arrow {
  color: #999;
}
.color-input {
  width: 40px;
  height: 30px;
  border: none;
  cursor: pointer;
}
.preset-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  margin-bottom: 20px;
}
.preset-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 8px;
  border: 1px solid #ddd;
  background: white;
  border-radius: 6px;
  cursor: pointer;
  font-size: 12px;
}
.preset-btn:hover {
  background: #f5f5f5;
}
.preset-colors {
  display: flex;
  gap: 2px;
}
.preset-colors span {
  width: 16px;
  height: 16px;
  border-radius: 2px;
}
.preview-canvas {
  background: repeating-conic-gradient(#eee 0 25%, #fff 0 50%) 50% / 16px 16px;
  border: 1px solid #ddd;
  image-rendering: pixelated;
}
</style>
