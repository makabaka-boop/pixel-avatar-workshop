<template>
  <div class="color-panel">
    <h3>调色板</h3>

    <div class="current-color">
      <div class="color-preview" :style="{ background: currentColor }" />
      <input type="color" v-model="currentColor" class="color-input" />
      <span class="color-hex">{{ currentColor }}</span>
    </div>

    <div v-for="theme in THEMES" :key="theme.name" class="theme-section">
      <div class="theme-title">{{ theme.name }}</div>
      <div class="color-grid">
        <button
          v-for="c in theme.colors"
          :key="c"
          :class="['color-swatch', { active: currentColor === c }]"
          :style="{ background: c }"
          @click="currentColor = c"
          :title="c"
        />
      </div>
    </div>

    <div class="theme-section">
      <div class="theme-title">自定义色板</div>
      <div v-if="savedPalettes.length === 0" class="empty-hint">暂无保存的色板</div>
      <div v-for="palette in savedPalettes" :key="palette.id" class="saved-palette">
        <div class="palette-header">
          <span class="palette-name">{{ palette.name }}</span>
          <button class="del-btn" @click="removePalette(palette.id)">✕</button>
        </div>
        <div class="color-grid">
          <button
            v-for="c in palette.colors"
            :key="c"
            :class="['color-swatch', { active: currentColor === c }]"
            :style="{ background: c }"
            @click="currentColor = c"
            :title="c"
          />
        </div>
      </div>
      <div class="add-palette">
        <input v-model="newPaletteName" placeholder="色板名称" class="palette-name-input" />
        <button class="add-btn" @click="onAddPalette">保存当前色板</button>
      </div>
    </div>

    <div class="recent-section">
      <div class="theme-title">最近使用</div>
      <div class="color-grid">
        <button
          v-for="c in recentColors"
          :key="c"
          :class="['color-swatch', { active: currentColor === c }]"
          :style="{ background: c }"
          @click="currentColor = c"
          :title="c"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { usePixelEditor } from '../composables/usePixelEditor'
import { THEMES } from '../data/palettes'

const { currentColor, savedPalettes, removePalette, addPalette } = usePixelEditor()

const newPaletteName = ref('')
const recentColors = ref<string[]>([])

watch(currentColor, (c) => {
  const idx = recentColors.value.indexOf(c)
  if (idx !== -1) recentColors.value.splice(idx, 1)
  recentColors.value.unshift(c)
  if (recentColors.value.length > 20) recentColors.value.pop()
})

function onAddPalette() {
  if (!newPaletteName.value.trim()) return
  const colors = [currentColor.value, ...recentColors.value.slice(0, 11)]
  addPalette(newPaletteName.value.trim(), [...new Set(colors)])
  newPaletteName.value = ''
}
</script>

<style scoped>
.color-panel {
  width: 220px;
  padding: 12px;
  background: #2c2c2c;
  border-left: 1px solid #444;
  overflow-y: auto;
}

h3 {
  color: #ddd;
  font-size: 14px;
  margin: 0 0 12px 0;
  text-align: center;
  letter-spacing: 2px;
}

.current-color {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
  padding: 8px;
  background: #3a3a3a;
  border-radius: 6px;
}

.color-preview {
  width: 32px;
  height: 32px;
  border: 2px solid #666;
  border-radius: 4px;
  flex-shrink: 0;
}

.color-input {
  width: 0;
  height: 0;
  padding: 0;
  border: none;
  opacity: 0;
  position: absolute;
}

.color-hex {
  color: #aaa;
  font-size: 12px;
  font-family: monospace;
}

.theme-section {
  margin-bottom: 14px;
}

.theme-title {
  color: #aaa;
  font-size: 12px;
  margin-bottom: 6px;
  font-weight: 600;
}

.color-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 3px;
}

.color-swatch {
  width: 22px;
  height: 22px;
  border: 2px solid #555;
  border-radius: 3px;
  cursor: pointer;
  transition: transform 0.1s, border-color 0.1s;
  padding: 0;
}

.color-swatch:hover {
  transform: scale(1.2);
  border-color: #fff;
}

.color-swatch.active {
  border-color: #4a90d9;
  box-shadow: 0 0 4px #4a90d9;
}

.saved-palette {
  background: #3a3a3a;
  border-radius: 6px;
  padding: 8px;
  margin-bottom: 6px;
}

.palette-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.palette-name {
  color: #ccc;
  font-size: 12px;
}

.del-btn {
  background: transparent;
  border: none;
  color: #888;
  cursor: pointer;
  font-size: 12px;
  padding: 2px 4px;
}

.del-btn:hover {
  color: #ff5555;
}

.empty-hint {
  color: #666;
  font-size: 11px;
  padding: 4px 0;
}

.add-palette {
  display: flex;
  gap: 4px;
  margin-top: 6px;
}

.palette-name-input {
  flex: 1;
  background: #3a3a3a;
  border: 1px solid #555;
  color: #ddd;
  border-radius: 4px;
  padding: 4px 6px;
  font-size: 11px;
  outline: none;
}

.add-btn {
  background: #4a90d9;
  border: none;
  color: #fff;
  border-radius: 4px;
  padding: 4px 8px;
  font-size: 11px;
  cursor: pointer;
  white-space: nowrap;
}

.add-btn:hover {
  background: #5aa0e9;
}

.recent-section {
  margin-top: 10px;
}
</style>
