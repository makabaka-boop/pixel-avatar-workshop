<script setup lang="ts">
import type { ToolType } from '../types'

defineProps<{
  currentTool: ToolType
  currentColor: string
  symmetryEnabled: boolean
  showGrid: boolean
}>()

const emit = defineEmits<{
  'update:current-tool': [tool: ToolType]
  'update:current-color': [color: string]
  'update:symmetry-enabled': [value: boolean]
  'update:show-grid': [value: boolean]
}>()

const tools: { id: ToolType; icon: string; name: string }[] = [
  { id: 'pencil', icon: '✏️', name: '铅笔' },
  { id: 'eraser', icon: '🧹', name: '橡皮' },
  { id: 'eyedropper', icon: '💧', name: '吸管' },
  { id: 'paintbucket', icon: '🪣', name: '油漆桶' }
]
</script>

<template>
  <div class="toolbar">
    <div class="tool-group">
      <button
        v-for="tool in tools"
        :key="tool.id"
        class="tool-btn"
        :class="{ active: currentTool === tool.id }"
        :title="tool.name"
        @click="emit('update:current-tool', tool.id)"
      >
        <span class="tool-icon">{{ tool.icon }}</span>
        <span class="tool-name">{{ tool.name }}</span>
      </button>
    </div>

    <div class="divider"></div>

    <div class="color-picker-wrapper">
      <label class="color-label">颜色：</label>
      <input
        type="color"
        :value="currentColor"
        class="color-picker"
        @input="emit('update:current-color', ($event.target as HTMLInputElement).value)"
      />
      <span class="color-hex">{{ currentColor }}</span>
    </div>

    <div class="divider"></div>

    <div class="toggle-group">
      <button
        class="toggle-btn"
        :class="{ active: symmetryEnabled }"
        :title="左右对称绘制"
        @click="emit('update:symmetry-enabled', !symmetryEnabled)"
      >
        <span>↔️</span>
        <span>对称</span>
      </button>
      <button
        class="toggle-btn"
        :class="{ active: showGrid }"
        title="显示网格"
        @click="emit('update:show-grid', !showGrid)"
      >
        <span>📐</span>
        <span>网格</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.toolbar {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: white;
  border-radius: 8px;
  margin-bottom: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  flex-wrap: wrap;
}

.tool-group {
  display: flex;
  gap: 4px;
}

.tool-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8px 12px;
  border: 2px solid transparent;
  background: #f5f5f5;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  min-width: 60px;
}

.tool-btn:hover {
  background: #e8e8e8;
}

.tool-btn.active {
  border-color: #4a90d9;
  background: #e8f4ff;
}

.tool-icon {
  font-size: 20px;
  margin-bottom: 2px;
}

.tool-name {
  font-size: 12px;
  color: #666;
}

.divider {
  width: 1px;
  height: 40px;
  background: #e0e0e0;
  margin: 0 8px;
}

.color-picker-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
}

.color-label {
  font-size: 14px;
  color: #666;
}

.color-picker {
  width: 40px;
  height: 40px;
  border: 2px solid #ddd;
  border-radius: 6px;
  cursor: pointer;
  padding: 2px;
}

.color-picker::-webkit-color-swatch-wrapper {
  padding: 0;
}

.color-picker::-webkit-color-swatch {
  border: none;
  border-radius: 3px;
}

.color-hex {
  font-size: 12px;
  color: #999;
  font-family: monospace;
  min-width: 70px;
}

.toggle-group {
  display: flex;
  gap: 8px;
}

.toggle-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 8px 12px;
  border: 2px solid #ddd;
  background: white;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
  transition: all 0.2s;
}

.toggle-btn:hover {
  background: #f5f5f5;
}

.toggle-btn.active {
  border-color: #4a90d9;
  background: #e8f4ff;
  color: #4a90d9;
}
</style>
