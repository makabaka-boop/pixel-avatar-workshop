<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { Layer } from '../types'
import { generateColorVariants, getAllColorsFromLayers, deepClone } from '../utils'
import { themePresets } from '../presets'

const props = defineProps<{
  layers: Layer[]
  gridSize: number
}>()

const emit = defineEmits<{
  close: []
  apply: [layers: Layer[]]
}>()

const colors = computed(() => getAllColorsFromLayers(props.layers))

const colorMappings = ref<{ from: string; to: string }[]>([])
const previewVariants = ref<{ name: string; layers: Layer[] }[]>([])

watch(() => props.layers, () => {
  colorMappings.value = colors.value.map(c => ({ from: c, to: c }))
}, { immediate: true, deep: true })

function generateVariants() {
  const currentColors = colors.value
  
  previewVariants.value = themePresets.slice(0, 6).map((theme, themeIndex) => {
    const themeColorList = [theme.skin, theme.hair, theme.clothes]
    
    const themeMappings = currentColors.map((color, colorIndex) => {
      const targetColor = themeColorList[(colorIndex + themeIndex) % themeColorList.length]
      return { from: color, to: targetColor }
    })
    
    return {
      name: theme.name,
      layers: generateColorVariants(deepClone(props.layers), themeMappings)
    }
  })
}

function applyVariant(variant: { name: string; layers: Layer[] }) {
  emit('apply', variant.layers)
}

function downloadAllVariants() {
  previewVariants.value.forEach((variant, index) => {
    setTimeout(() => {
      const canvas = document.createElement('canvas')
      canvas.width = props.gridSize
      canvas.height = props.gridSize
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, props.gridSize, props.gridSize)

      variant.layers.forEach(layer => {
        if (!layer.visible) return
        for (const [key, color] of Object.entries(layer.pixels)) {
          const [x, y] = key.split(',').map(Number)
          ctx.fillStyle = color
          ctx.fillRect(x, y, 1, 1)
        }
      })

      const link = document.createElement('a')
      link.download = `avatar-${variant.name}-${index}.png`
      link.href = canvas.toDataURL('image/png')
      link.click()
    }, index * 200)
  })
}

function renderVariantToCanvas(layers: Layer[], canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const pixelSize = canvas.width / props.gridSize

  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  layers.forEach(layer => {
    if (!layer.visible) return
    for (const [key, color] of Object.entries(layer.pixels)) {
      const [x, y] = key.split(',').map(Number)
      ctx.fillStyle = color
      ctx.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize)
    }
  })
}
</script>

<template>
  <div class="modal-overlay" @click.self="emit('close')">
    <div class="modal-content">
      <div class="modal-header">
        <h2>🎭 批量换肤</h2>
        <button class="close-btn" @click="emit('close')">✕</button>
      </div>

      <div class="modal-body">
        <div class="color-mapping">
          <h3>颜色映射</h3>
          <p class="desc">设置颜色替换规则，用于批量生成不同配色的头像</p>
          
          <div class="mapping-list">
            <div
              v-for="(mapping, index) in colorMappings"
              :key="mapping.from"
              class="mapping-item"
            >
              <div class="color-box">
                <div class="color-swatch" :style="{ background: mapping.from }"></div>
                <span class="color-hex">{{ mapping.from }}</span>
              </div>
              <span class="arrow">→</span>
              <div class="color-box">
                <input
                  type="color"
                  :value="mapping.to"
                  @input="mapping.to = ($event.target as HTMLInputElement).value"
                />
                <span class="color-hex">{{ mapping.to }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="variant-preview">
          <div class="preview-header">
            <h3>预设变体预览</h3>
            <button class="btn-small" @click="generateVariants">
              🔄 生成预览
            </button>
          </div>

          <div v-if="previewVariants.length > 0" class="variant-grid">
            <div
              v-for="variant in previewVariants"
              :key="variant.name"
              class="variant-card"
            >
              <canvas
                :ref="el => {
                  if (el) renderVariantToCanvas(variant.layers, el)
                }"
                :width="gridSize * 4"
                :height="gridSize * 4"
                class="variant-canvas"
              />
              <span class="variant-name">{{ variant.name }}</span>
              <button
                class="apply-btn"
                @click="applyVariant(variant)"
              >
                应用
              </button>
            </div>
          </div>

          <div v-else class="empty-state">
            <p>点击「生成预览」查看换肤效果</p>
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <button class="btn-secondary" @click="emit('close')">
          关闭
        </button>
        <button
          v-if="previewVariants.length > 0"
          class="btn-primary"
          @click="downloadAllVariants"
        >
          📥 下载全部变体
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 800px;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid #eee;
}

.modal-header h2 {
  margin: 0;
  font-size: 18px;
  color: #333;
}

.close-btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: #f5f5f5;
  border-radius: 50%;
  cursor: pointer;
  font-size: 16px;
  transition: background 0.2s;
}

.close-btn:hover {
  background: #e8e8e8;
}

.modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}

.modal-body h3 {
  margin: 0 0 8px 0;
  font-size: 15px;
  color: #333;
}

.desc {
  margin: 0 0 16px 0;
  font-size: 13px;
  color: #666;
}

.color-mapping {
  margin-bottom: 24px;
}

.mapping-list {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.mapping-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: #f8f9fa;
  border-radius: 6px;
}

.color-box {
  display: flex;
  align-items: center;
  gap: 6px;
}

.color-swatch {
  width: 24px;
  height: 24px;
  border-radius: 4px;
  border: 1px solid #ddd;
}

.color-box input {
  width: 32px;
  height: 24px;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
}

.color-hex {
  font-size: 11px;
  color: #999;
  font-family: monospace;
}

.arrow {
  color: #999;
}

.preview-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.variant-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 16px;
}

.variant-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 8px;
  gap: 8px;
}

.variant-canvas {
  image-rendering: pixelated;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: white;
}

.variant-name {
  font-size: 13px;
  color: #666;
}

.apply-btn {
  padding: 4px 12px;
  font-size: 12px;
  background: #4a90d9;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.2s;
}

.apply-btn:hover {
  background: #3a7bc8;
}

.empty-state {
  padding: 40px;
  text-align: center;
  color: #999;
}

.empty-state p {
  margin: 0;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 20px;
  border-top: 1px solid #eee;
}

.btn-small,
.btn-secondary,
.btn-primary {
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-small {
  padding: 6px 12px;
  font-size: 13px;
  border: 1px solid #ddd;
  background: white;
}

.btn-small:hover {
  background: #f5f5f5;
}

.btn-secondary {
  border: 1px solid #ddd;
  background: white;
  color: #333;
}

.btn-secondary:hover {
  background: #f5f5f5;
}

.btn-primary {
  border: none;
  background: #4a90d9;
  color: white;
}

.btn-primary:hover {
  background: #3a7bc8;
}
</style>
