<template>
  <div class="layer-panel">
    <h3 class="panel-title">图层</h3>
    <div class="layers-list">
      <div
        v-for="layer in reversedLayers"
        :key="layer.id"
        class="layer-item"
        :class="{ active: layer.id === store.activeLayerId, locked: layer.locked }"
        @click="actions.setActiveLayer(layer.id)"
      >
        <div class="layer-info">
          <span class="layer-name">{{ layer.name }}</span>
        </div>
        <div class="layer-actions">
            <button
              class="icon-btn"
              :class="{ active: layer.visible }"
              @click.stop="actions.toggleLayerVisible(layer.id)"
              :title="layer.visible ? '隐藏' : '显示'"
            >
              {{ layer.visible ? '👁' : '🙈' }}
            </button>
            <button
              class="icon-btn"
              :class="{ active: layer.locked }"
              @click.stop="actions.toggleLayerLocked(layer.id)"
              :title="layer.locked ? '解锁' : '锁定'"
            >
              {{ layer.locked ? '🔒' : '🔓' }}
            </button>
            <button
              class="icon-btn"
              @click.stop="onClear(layer.id)"
              title="清空图层"
              :disabled="layer.locked"
            >
              🗑
            </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { store, actions } from '../store';

const reversedLayers = computed(() => [...store.layers].reverse());

const onClear = (id: string) => {
  if (confirm('确定要清空该图层吗？')) {
    actions.saveHistory();
    actions.clearLayer(id);
  }
};
</script>

<style scoped>
.layer-panel {
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
.layers-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.layer-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 10px;
  border: 1px solid #ddd;
  border-radius: 6px;
  background: #fafafa;
  cursor: pointer;
  transition: all 0.15s;
}
.layer-item:hover {
  background: #f0f0f0;
}
.layer-item.active {
  background: #e3f2fd;
  border-color: #2196f3;
}
.layer-item.locked {
  opacity: 0.7;
}
.layer-name {
  font-size: 13px;
  color: #333;
}
.layer-actions {
  display: flex;
  gap: 4px;
}
.icon-btn {
  background: transparent;
  border: none;
  cursor: pointer;
  font-size: 14px;
  padding: 2px 6px;
  border-radius: 4px;
  opacity: 0.7;
  transition: all 0.15s;
}
.icon-btn:hover:not(:disabled) {
  background: #e0e0e0;
  opacity: 1;
}
.icon-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}
</style>
