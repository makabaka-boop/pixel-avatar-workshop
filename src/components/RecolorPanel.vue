<template>
  <div class="recolor-panel">
    <h3>批量换肤</h3>
    <p class="hint">基于当前头像一键生成多套配色变体，点击即可应用</p>

    <div v-if="projectColors.length === 0" class="empty-hint">
      请先在画布上绘制内容，再使用批量换肤
    </div>

    <template v-else>
      <div class="color-source">
        <div class="section-title">当前头像颜色</div>
        <div class="color-chips">
          <span
            v-for="c in projectColors"
            :key="c"
            class="color-chip"
            :style="{ background: c }"
            :title="c"
          />
        </div>
      </div>

      <div class="variant-section">
        <div class="section-title">配色变体</div>
        <div class="variants-grid">
          <div
            v-for="(variant, idx) in variants"
            :key="idx"
            class="variant-item"
            @click="onApplyVariant(variant)"
          >
            <canvas
              :ref="(el: any) => setRef(el, idx)"
              width="96"
              height="96"
              class="variant-canvas"
            />
            <span class="variant-name">{{ variant.label }}</span>
          </div>
        </div>
      </div>

      <div class="manual-section">
        <div class="section-title">手动颜色映射</div>
        <div class="color-map-list">
          <div v-for="(mapping, idx) in mappings" :key="idx" class="color-map-row">
            <input
              type="color"
              v-model="mapping.from"
              class="map-color-input"
              :title="'原色: ' + mapping.from"
            />
            <span class="arrow">→</span>
            <input
              type="color"
              v-model="mapping.to"
              class="map-color-input"
              :title="'目标色: ' + mapping.to"
            />
            <button class="remove-map-btn" @click="mappings.splice(idx, 1)">✕</button>
          </div>
        </div>
        <div class="recolor-actions">
          <button class="recolor-btn add" @click="addMappingFromProject">从作品提取颜色</button>
          <button class="recolor-btn add" @click="addEmptyMapping">添加映射</button>
          <button class="recolor-btn apply" @click="onApplyMapping" :disabled="mappings.length === 0">应用映射</button>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, nextTick, watch, computed } from 'vue'
import { usePixelEditor } from '../composables/usePixelEditor'
import type { ColorMapping, PixelLayer } from '../types'

interface VariantData {
  label: string
  mappings: ColorMapping[]
  layers: PixelLayer[]
}

const { batchRecolor, getAllColorsInProject, project } = usePixelEditor()

const mappings = reactive<ColorMapping[]>([])
const variants = ref<VariantData[]>([])
const canvasRefMap = new Map<number, HTMLCanvasElement>()

const projectColors = computed(() => getAllColorsInProject())

function setRef(el: any, idx: number) {
  if (el instanceof HTMLCanvasElement) {
    canvasRefMap.set(idx, el)
    nextTick(() => renderVariant(idx))
  }
}

function addEmptyMapping() {
  mappings.push({ from: '#000000', to: '#ffffff' })
}

function addMappingFromProject() {
  const colors = getAllColorsInProject()
  mappings.length = 0
  for (const c of colors) {
    mappings.push({ from: c, to: c })
  }
}

function onApplyMapping() {
  batchRecolor(mappings.map(m => ({ ...m })))
}

function shiftHue(hex: string, degrees: number): string {
  const r = parseInt(hex.slice(1, 3), 16) / 255
  const g = parseInt(hex.slice(3, 5), 16) / 255
  const b = parseInt(hex.slice(5, 7), 16) / 255

  const max = Math.max(r, g, b), min = Math.min(r, g, b)
  let h = 0, s = 0
  const l = (max + min) / 2

  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6
    else if (max === g) h = ((b - r) / d + 2) / 6
    else h = ((r - g) / d + 4) / 6
  }

  h = (h + degrees / 360) % 1
  if (h < 0) h += 1

  function hue2rgb(p: number, q: number, t: number) {
    if (t < 0) t += 1
    if (t > 1) t -= 1
    if (t < 1 / 6) return p + (q - p) * 6 * t
    if (t < 1 / 2) return q
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
    return p
  }

  let rr: number, gg: number, bb: number
  if (s === 0) {
    rr = gg = bb = l
  } else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s
    const p = 2 * l - q
    rr = hue2rgb(p, q, h + 1 / 3)
    gg = hue2rgb(p, q, h)
    bb = hue2rgb(p, q, h - 1 / 3)
  }

  const toHex = (v: number) => {
    const hex = Math.round(v * 255).toString(16)
    return hex.length === 1 ? '0' + hex : hex
  }

  return '#' + toHex(rr) + toHex(gg) + toHex(bb)
}

function adjustSaturation(hex: string, factor: number): string {
  const r = parseInt(hex.slice(1, 3), 16) / 255
  const g = parseInt(hex.slice(3, 5), 16) / 255
  const b = parseInt(hex.slice(5, 7), 16) / 255

  const max = Math.max(r, g, b), min = Math.min(r, g, b)
  let h = 0, s = 0
  const l = (max + min) / 2

  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6
    else if (max === g) h = ((b - r) / d + 2) / 6
    else h = ((r - g) / d + 4) / 6
  }

  s = Math.min(1, s * factor)

  function hue2rgb(p: number, q: number, t: number) {
    if (t < 0) t += 1
    if (t > 1) t -= 1
    if (t < 1 / 6) return p + (q - p) * 6 * t
    if (t < 1 / 2) return q
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
    return p
  }

  let rr: number, gg: number, bb: number
  if (s === 0) {
    rr = gg = bb = l
  } else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s
    const p = 2 * l - q
    rr = hue2rgb(p, q, h + 1 / 3)
    gg = hue2rgb(p, q, h)
    bb = hue2rgb(p, q, h - 1 / 3)
  }

  const toHex = (v: number) => {
    const hex = Math.round(v * 255).toString(16)
    return hex.length === 1 ? '0' + hex : hex
  }

  return '#' + toHex(rr) + toHex(gg) + toHex(bb)
}

function adjustLightness(hex: string, factor: number): string {
  const r = parseInt(hex.slice(1, 3), 16) / 255
  const g = parseInt(hex.slice(3, 5), 16) / 255
  const b = parseInt(hex.slice(5, 7), 16) / 255

  const max = Math.max(r, g, b), min = Math.min(r, g, b)
  let h = 0, s = 0
  let l = (max + min) / 2

  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6
    else if (max === g) h = ((b - r) / d + 2) / 6
    else h = ((r - g) / d + 4) / 6
  }

  l = Math.min(1, Math.max(0, l * factor))

  function hue2rgb(p: number, q: number, t: number) {
    if (t < 0) t += 1
    if (t > 1) t -= 1
    if (t < 1 / 6) return p + (q - p) * 6 * t
    if (t < 1 / 2) return q
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
    return p
  }

  let rr: number, gg: number, bb: number
  if (s === 0) {
    rr = gg = bb = l
  } else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s
    const p = 2 * l - q
    rr = hue2rgb(p, q, h + 1 / 3)
    gg = hue2rgb(p, q, h)
    bb = hue2rgb(p, q, h - 1 / 3)
  }

  const toHex = (v: number) => {
    const hex = Math.round(v * 255).toString(16)
    return hex.length === 1 ? '0' + hex : hex
  }

  return '#' + toHex(rr) + toHex(gg) + toHex(bb)
}

function applyMappingToLayers(colorMappings: ColorMapping[]): PixelLayer[] {
  const map = new Map<string, string>()
  for (const m of colorMappings) {
    map.set(m.from.toLowerCase(), m.to.toLowerCase())
  }
  return project.layers.map(layer => {
    const newPixels: Record<string, string> = {}
    for (const [key, color] of Object.entries(layer.pixels)) {
      newPixels[key] = map.get(color.toLowerCase()) || color
    }
    return { ...layer, pixels: newPixels }
  })
}

function generateVariants() {
  const colors = getAllColorsInProject()
  if (colors.length === 0) {
    variants.value = []
    return
  }

  const newVariants: VariantData[] = []

  const presetSchemes: { label: string; transform: (c: string) => string }[] = [
    { label: '暖色调', transform: c => shiftHue(c, 30) },
    { label: '冷色调', transform: c => shiftHue(c, 180) },
    { label: '复古色', transform: c => shiftHue(c, 60) },
    { label: '梦幻色', transform: c => shiftHue(c, 270) },
    { label: '高饱和', transform: c => adjustSaturation(c, 1.5) },
    { label: '低饱和', transform: c => adjustSaturation(c, 0.4) },
    { label: '明亮', transform: c => adjustLightness(c, 1.4) },
    { label: '暗调', transform: c => adjustLightness(c, 0.6) },
  ]

  for (const scheme of presetSchemes) {
    const colorMappings: ColorMapping[] = colors.map(c => ({
      from: c,
      to: scheme.transform(c)
    }))
    newVariants.push({
      label: scheme.label,
      mappings: colorMappings,
      layers: applyMappingToLayers(colorMappings)
    })
  }

  variants.value = newVariants

  nextTick(() => {
    for (let i = 0; i < newVariants.length; i++) {
      renderVariant(i)
    }
  })
}

function renderVariant(idx: number) {
  const canvas = canvasRefMap.get(idx)
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  ctx.imageSmoothingEnabled = false
  ctx.clearRect(0, 0, 96, 96)

  const variant = variants.value[idx]
  if (!variant) return

  const cs = 96 / project.gridSize
  for (const layer of variant.layers) {
    if (!layer.visible) continue
    for (const [key, color] of Object.entries(layer.pixels)) {
      const [x, y] = key.split(',').map(Number)
      ctx.fillStyle = color
      ctx.fillRect(x * cs, y * cs, cs, cs)
    }
  }
}

function onApplyVariant(variant: VariantData) {
  const maps = variant.mappings.filter(m => m.from.toLowerCase() !== m.to.toLowerCase())
  if (maps.length > 0) {
    batchRecolor(maps)
  }
}

watch(
  () => JSON.stringify(project.layers.map(l => l.pixels)),
  () => {
    generateVariants()
  }
)

generateVariants()
</script>

<style scoped>
.recolor-panel {
  padding: 12px;
  background: #2c2c2c;
  border-top: 1px solid #444;
}

h3 {
  color: #ddd;
  font-size: 14px;
  margin: 0 0 6px 0;
  text-align: center;
  letter-spacing: 2px;
}

.hint {
  color: #888;
  font-size: 11px;
  margin: 0 0 10px 0;
  text-align: center;
}

.empty-hint {
  color: #666;
  font-size: 12px;
  text-align: center;
  padding: 16px 0;
}

.section-title {
  color: #aaa;
  font-size: 12px;
  margin-bottom: 6px;
  font-weight: 600;
}

.color-source {
  margin-bottom: 12px;
}

.color-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 3px;
}

.color-chip {
  width: 18px;
  height: 18px;
  border: 1px solid #555;
  border-radius: 3px;
  display: inline-block;
}

.variant-section {
  margin-bottom: 12px;
}

.variants-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.variant-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  cursor: pointer;
  padding: 6px;
  background: #3a3a3a;
  border-radius: 6px;
  border: 1px solid #555;
  transition: all 0.15s;
}

.variant-item:hover {
  border-color: #4a90d9;
  background: #404040;
  transform: translateY(-1px);
}

.variant-canvas {
  image-rendering: pixelated;
  image-rendering: crisp-edges;
  width: 64px;
  height: 64px;
  border: 1px solid #444;
  border-radius: 2px;
}

.variant-name {
  color: #bbb;
  font-size: 10px;
}

.manual-section {
  border-top: 1px solid #444;
  padding-top: 10px;
}

.color-map-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 10px;
  max-height: 160px;
  overflow-y: auto;
}

.color-map-row {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 6px;
  background: #3a3a3a;
  border-radius: 4px;
}

.map-color-input {
  width: 32px;
  height: 24px;
  border: none;
  background: transparent;
  cursor: pointer;
  padding: 0;
}

.arrow {
  color: #888;
  font-size: 14px;
}

.remove-map-btn {
  background: transparent;
  border: none;
  color: #888;
  cursor: pointer;
  font-size: 12px;
  margin-left: auto;
}

.remove-map-btn:hover {
  color: #ff5555;
}

.recolor-actions {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.recolor-btn {
  background: #4a90d9;
  border: none;
  color: #fff;
  border-radius: 4px;
  padding: 6px 10px;
  font-size: 11px;
  cursor: pointer;
  transition: background 0.15s;
}

.recolor-btn:hover:not(:disabled) {
  background: #5aa0e9;
}

.recolor-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.recolor-btn.add {
  background: #3a7a3a;
}

.recolor-btn.add:hover {
  background: #4a9a4a;
}
</style>
