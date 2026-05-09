<template>
  <div class="layer-panel">
    <h3>图层</h3>
    <div class="layer-list">
      <div
        v-for="layer in [...project.layers].reverse()"
        :key="layer.id"
        :class="['layer-item', { active: project.activeLayerId === layer.id }]"
        @click="project.activeLayerId = layer.id"
      >
        <span class="layer-name">{{ layer.name }}</span>
        <div class="layer-actions">
          <button
            :class="['layer-btn', { off: !layer.visible }]"
            @click.stop="layer.visible = !layer.visible"
            :title="layer.visible ? '隐藏' : '显示'"
          >👁️</button>
          <button
            :class="['layer-btn', { off: !layer.locked }]"
            @click.stop="layer.locked = !layer.locked"
            :title="layer.locked ? '解锁' : '锁定'"
          >🔒</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { usePixelEditor } from '../composables/usePixelEditor'

const { project } = usePixelEditor()
</script>

<style scoped>
.layer-panel {
  width: 180px;
  padding: 12px;
  background: #2c2c2c;
  border-right: 1px solid #444;
  overflow-y: auto;
}

h3 {
  color: #ddd;
  font-size: 14px;
  margin: 0 0 12px 0;
  text-align: center;
  letter-spacing: 2px;
}

.layer-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.layer-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 10px;
  border-radius: 6px;
  cursor: pointer;
  background: #3a3a3a;
  border: 1px solid transparent;
  transition: all 0.15s;
}

.layer-item:hover {
  background: #454545;
}

.layer-item.active {
  border-color: #4a90d9;
  background: #3a5070;
}

.layer-name {
  color: #ddd;
  font-size: 13px;
}

.layer-actions {
  display: flex;
  gap: 4px;
}

.layer-btn {
  width: 26px;
  height: 26px;
  border: none;
  background: transparent;
  cursor: pointer;
  font-size: 14px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
}

.layer-btn:hover {
  background: #555;
}

.layer-btn.off {
  opacity: 0.35;
}
</style>
