<template>
  <div class="toolbar">
    <button
      v-for="tool in tools"
      :key="tool.id"
      class="tool-btn"
      :class="{ active: store.activeTool === tool.id }"
      @click="actions.setTool(tool.id)"
      :title="tool.name"
    >
      <span class="tool-icon">{{ tool.icon }}</span>
      <span class="tool-name">{{ tool.name }}</span>
    </button>
    <div class="divider"></div>
    <button
      class="tool-btn"
      :class="{ active: store.symmetry }"
      @click="actions.toggleSymmetry()"
      title="左右对称绘制"
    >
      <span class="tool-icon">↔️</span>
      <span class="tool-name">对称</span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { store, actions } from '../store';
import type { Tool } from '../types';

const tools: { id: Tool; name: string; icon: string }[] = [
  { id: 'pencil', name: '铅笔', icon: '✏️' },
  { id: 'eraser', name: '橡皮', icon: '🧽' },
  { id: 'eyedropper', name: '吸管', icon: '💧' },
  { id: 'bucket', name: '油漆桶', icon: '🪣' }
];
</script>

<style scoped>
.toolbar {
  display: flex;
  gap: 4px;
  padding: 8px;
  background: #f8f9fa;
  border-radius: 8px;
  align-items: center;
}
.tool-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: 6px 10px;
  border: 1px solid transparent;
  background: white;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.15s;
  font-size: 11px;
  color: #555;
}
.tool-btn:hover {
  background: #e8f0fe;
}
.tool-btn.active {
  background: #2196f3;
  color: white;
  border-color: #1976d2;
}
.tool-icon {
  font-size: 18px;
}
.tool-name {
  font-size: 11px;
}
.divider {
  width: 1px;
  height: 36px;
  background: #ddd;
  margin: 0 4px;
}
</style>
