<script setup lang="ts">
import { ref } from 'vue'
import type { ColorPalette, ThemeColors } from '../types'

const props = defineProps<{
  palettes: ColorPalette[]
  currentPaletteId: string
  currentColor: string
  themeColors: ThemeColors
  themePresets: { name: string; skin: string; hair: string; clothes: string }[]
  currentWorkColors: string[]
}>()

const emit = defineEmits<{
  'update:current-palette-id': [id: string]
  'update:current-color': [color: string]
  'update:theme-colors': [key: keyof ThemeColors, color: string]
  'apply-theme': [theme: typeof props.themePresets[0]]
  'add-palette': [name: string, colors: string[]]
  'delete-palette': [id: string]
}>()

const showAddPalette = ref(false)
const newPaletteName = ref('')

function addColorToCustom(color: string) {
  const customPalette = props.palettes.find(p => p.id.startsWith('custom-'))
  if (customPalette && !customPalette.colors.includes(color)) {
    customPalette.colors.push(color)
  }
}

function saveCurrentAsPalette() {
  const colors = props.currentWorkColors
  if (colors.length > 0 && newPaletteName.value) {
    emit('add-palette', newPaletteName.value, colors)
    newPaletteName.value = ''
    showAddPalette.value = false
  }
}

function addFavoriteColor() {
  const colors = props.currentWorkColors
  if (colors.length > 0) {
    emit('add-palette', '常用配色', colors)
  }
}
</script>

<template>
  <div class="palette-panel">
    <h3>🎨 调色板</h3>

    <div class="theme-presets">
      <h4>快速主题</h4>
      <div class="theme-list">
        <button
          v-for="theme in themePresets"
          :key="theme.name"
          class="theme-btn"
          :title="theme.name"
          @click="emit('apply-theme', theme)"
        >
          <span class="theme-color" :style="{ background: theme.skin }"></span>
          <span class="theme-color" :style="{ background: theme.hair }"></span>
          <span class="theme-color" :style="{ background: theme.clothes }"></span>
          <span class="theme-name">{{ theme.name }}</span>
        </button>
      </div>
    </div>

    <div class="theme-colors">
      <h4>主题颜色</h4>
      <div class="color-theme-row">
        <div class="color-theme-item">
          <span class="label">肤色</span>
          <input
            type="color"
            :value="themeColors.skin"
            @input="emit('update:theme-colors', 'skin', ($event.target as HTMLInputElement).value)"
          />
        </div>
        <div class="color-theme-item">
          <span class="label">发色</span>
          <input
            type="color"
            :value="themeColors.hair"
            @input="emit('update:theme-colors', 'hair', ($event.target as HTMLInputElement).value)"
          />
        </div>
        <div class="color-theme-item">
          <span class="label">衣服色</span>
          <input
            type="color"
            :value="themeColors.clothes"
            @input="emit('update:theme-colors', 'clothes', ($event.target as HTMLInputElement).value)"
          />
        </div>
      </div>
    </div>

    <div class="palette-selector">
      <h4>色板选择</h4>
      <select
        :value="currentPaletteId"
        @change="emit('update:current-palette-id', ($event.target as HTMLSelectElement).value)"
      >
        <option v-for="palette in palettes" :key="palette.id" :value="palette.id">
          {{ palette.name }}
        </option>
      </select>
      <button
        v-if="currentPaletteId.startsWith('custom-')"
        class="btn-small btn-danger"
        @click="emit('delete-palette', currentPaletteId)"
      >
        删除
      </button>
    </div>

    <div class="color-grid">
      <button
        v-for="color in palettes.find(p => p.id === currentPaletteId)?.colors || []"
        :key="color"
        class="color-swatch"
        :class="{ active: currentColor === color }"
        :style="{ background: color }"
        :title="color"
        @click="emit('update:current-color', color)"
      />
    </div>

    <div class="palette-actions">
      <button class="btn-small" @click="showAddPalette = !showAddPalette">
        ➕ 新建色板
      </button>
      <button class="btn-small" @click="addFavoriteColor">
        💾 保存当前配色
      </button>
    </div>

    <div v-if="showAddPalette" class="add-palette-form">
      <input
        v-model="newPaletteName"
        type="text"
        placeholder="色板名称"
        class="input-field"
      />
      <button class="btn-small btn-primary" @click="saveCurrentAsPalette">
        从当前作品创建
      </button>
    </div>
  </div>
</template>

<style scoped>
.palette-panel {
  background: white;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.palette-panel h3 {
  margin: 0 0 16px 0;
  font-size: 16px;
  color: #333;
}

.palette-panel h4 {
  margin: 0 0 8px 0;
  font-size: 13px;
  color: #666;
}

.theme-presets,
.theme-colors,
.palette-selector {
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid #eee;
}

.theme-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.theme-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  border: 1px solid #ddd;
  background: white;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 12px;
}

.theme-btn:hover {
  background: #f5f5f5;
  border-color: #4a90d9;
}

.theme-color {
  width: 16px;
  height: 16px;
  border-radius: 3px;
  border: 1px solid #ddd;
}

.theme-name {
  margin-left: auto;
  color: #666;
}

.color-theme-row {
  display: flex;
  gap: 12px;
}

.color-theme-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.color-theme-item .label {
  font-size: 12px;
  color: #666;
}

.color-theme-item input {
  width: 40px;
  height: 40px;
  border: 2px solid #ddd;
  border-radius: 6px;
  cursor: pointer;
  padding: 2px;
}

.palette-selector {
  display: flex;
  gap: 8px;
  align-items: center;
}

.palette-selector select {
  flex: 1;
  padding: 6px 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 13px;
}

.color-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 6px;
  margin-bottom: 16px;
}

.color-swatch {
  width: 100%;
  aspect-ratio: 1;
  border: 2px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
  padding: 0;
}

.color-swatch:hover {
  transform: scale(1.1);
}

.color-swatch.active {
  border-color: #4a90d9;
  box-shadow: 0 0 0 2px rgba(74, 144, 217, 0.3);
}

.palette-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.btn-small {
  padding: 8px 12px;
  font-size: 13px;
  border: 1px solid #ddd;
  background: white;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-small:hover {
  background: #f5f5f5;
}

.btn-primary {
  background: #4a90d9;
  color: white;
  border-color: #4a90d9;
}

.btn-primary:hover {
  background: #3a7bc8;
}

.btn-danger {
  color: #dc3545;
  border-color: #dc3545;
}

.btn-danger:hover {
  background: #fff5f5;
}

.add-palette-form {
  margin-top: 12px;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 6px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.input-field {
  padding: 8px 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 13px;
}
</style>
