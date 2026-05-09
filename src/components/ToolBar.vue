<template>
  <div class="toolbar">
    <div class="tool-group">
      <button
        v-for="t in tools"
        :key="t.type"
        :class="['tool-btn', { active: currentTool === t.type }]"
        :title="t.label"
        @click="currentTool = t.type"
      >
        {{ t.icon }}
      </button>
    </div>
    <div class="separator" />
    <button
      :class="['tool-btn', { active: mirrorMode }]"
      title="对称模式（配合铅笔/橡皮使用）"
      @click="mirrorMode = !mirrorMode"
    >↔️</button>
    <button
      :class="['tool-btn', { active: showGrid }]"
      title="网格显隐"
      @click="showGrid = !showGrid"
    >⊞</button>
    <div class="separator" />
    <button class="tool-btn" title="撤销 (Ctrl+Z)" @click="undo" :disabled="!canUndo">↩️</button>
    <button class="tool-btn" title="重做 (Ctrl+Y)" @click="redo" :disabled="!canRedo">↪️</button>
    <div class="separator" />
    <select v-model.number="gridSize" @change="onGridSizeChange" class="grid-select">
      <option :value="32">32×32</option>
      <option :value="48">48×48</option>
    </select>
    <div class="separator" />
    <button class="tool-btn" title="清空当前图层" @click="clearLayer">🗑️</button>
    <button class="tool-btn" title="新建项目" @click="onNewProject">📄</button>
    <div class="separator" />
    <button class="tool-btn" title="导出PNG" @click="onExportPNG">💾 PNG</button>
    <button class="tool-btn" title="导出JSON" @click="onExportJSON">📋 JSON</button>
  </div>
</template>

<script setup lang="ts">
import { usePixelEditor } from '../composables/usePixelEditor'
import type { GridSize, ToolType } from '../types'

const {
  currentTool, mirrorMode, showGrid, gridSize,
  canUndo, canRedo, undo, redo,
  changeGridSize, clearLayer, newProject,
  exportPNG, exportJSON
} = usePixelEditor()

const tools: { type: ToolType; icon: string; label: string }[] = [
  { type: 'pencil', icon: '✏️', label: '铅笔' },
  { type: 'eraser', icon: '🧹', label: '橡皮' },
  { type: 'eyedropper', icon: '💉', label: '吸管' },
  { type: 'bucket', icon: '🪣', label: '油漆桶' },
  { type: 'mirror', icon: '↔️', label: '对称绘制' },
]

function onGridSizeChange() {
  changeGridSize(gridSize.value as GridSize)
}

function onNewProject() {
  if (confirm('确定要新建项目吗？未保存的内容将丢失。')) {
    newProject(gridSize.value as GridSize)
  }
}

function onExportPNG() {
  exportPNG()
}

function onExportJSON() {
  exportJSON()
}
</script>

<style scoped>
.toolbar {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 8px 12px;
  background: #2c2c2c;
  border-bottom: 1px solid #444;
  flex-wrap: wrap;
}

.tool-group {
  display: flex;
  gap: 2px;
}

.tool-btn {
  width: 36px;
  height: 36px;
  border: 1px solid #555;
  background: #3a3a3a;
  color: #ddd;
  border-radius: 6px;
  cursor: pointer;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s;
  padding: 0;
}

.tool-btn:hover:not(:disabled) {
  background: #555;
}

.tool-btn.active {
  background: #4a90d9;
  border-color: #6ab0ff;
}

.tool-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.separator {
  width: 1px;
  height: 24px;
  background: #555;
  margin: 0 4px;
}

.grid-select {
  background: #3a3a3a;
  color: #ddd;
  border: 1px solid #555;
  border-radius: 6px;
  padding: 4px 8px;
  font-size: 13px;
  outline: none;
}
</style>
