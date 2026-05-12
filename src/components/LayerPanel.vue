<script setup lang="ts">
import type { Layer } from '../types'

defineProps<{
  layers: Layer[]
  currentLayerId: string
}>()

const emit = defineEmits<{
  'update:current-layer-id': [id: string]
  'update:layer': [id: string, key: 'visible' | 'locked', value: boolean]
  'clear-current': []
  'clear-all': []
}>()
</script>

<template>
  <div class="layer-panel">
    <h3>📚 图层</h3>
    
    <div class="layer-list">
      <div
        v-for="layer in layers.slice().reverse()"
        :key="layer.id"
        class="layer-item"
        :class="{ active: currentLayerId === layer.id, locked: layer.locked }"
        @click="emit('update:current-layer-id', layer.id)"
      >
        <div class="layer-name">
          <span class="layer-icon">
            {{ layer.id === 'base' ? '🎨' : layer.id === 'features' ? '👁️' : '✨' }}
          </span>
          <span>{{ layer.name }}</span>
        </div>
        <div class="layer-actions">
          <button
            class="icon-btn"
            :class="{ active: layer.visible }"
            :title="layer.visible ? '隐藏' : '显示'"
            @click.stop="emit('update:layer', layer.id, 'visible', !layer.visible)"
          >
            {{ layer.visible ? '👁️' : '👁️‍🗨️' }}
          </button>
          <button
            class="icon-btn"
            :class="{ active: layer.locked }"
            :title="layer.locked ? '解锁' : '锁定'"
            @click.stop="emit('update:layer', layer.id, 'locked', !layer.locked)"
          >
            {{ layer.locked ? '🔒' : '🔓' }}
          </button>
        </div>
      </div>
    </div>

    <div class="layer-operations">
      <button class="btn-small" @click="emit('clear-current')">
        🗑️ 清空当前层
      </button>
      <button class="btn-small btn-danger" @click="emit('clear-all')">
        💥 清空全部
      </button>
    </div>

    <div class="layer-info">
      <p>💡 提示：</p>
      <ul>
        <li>底色层：皮肤、衣服等</li>
        <li>五官层：眼睛、嘴巴等</li>
        <li>装饰层：发型、配饰等</li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
.layer-panel {
  background: white;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.layer-panel h3 {
  margin: 0 0 12px 0;
  font-size: 16px;
  color: #333;
}

.layer-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
}

.layer-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px;
  background: #f8f9fa;
  border: 2px solid transparent;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.layer-item:hover {
  background: #e9ecef;
}

.layer-item.active {
  border-color: #4a90d9;
  background: #e8f4ff;
}

.layer-item.locked {
  opacity: 0.7;
}

.layer-name {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #333;
}

.layer-icon {
  font-size: 16px;
}

.layer-actions {
  display: flex;
  gap: 4px;
}

.icon-btn {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: transparent;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background 0.2s;
}

.icon-btn:hover {
  background: rgba(0, 0, 0, 0.1);
}

.icon-btn.active {
  background: rgba(74, 144, 217, 0.2);
}

.layer-operations {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
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

.btn-danger {
  color: #dc3545;
  border-color: #dc3545;
}

.btn-danger:hover {
  background: #fff5f5;
}

.layer-info {
  padding: 12px;
  background: #fff9e6;
  border-radius: 6px;
  font-size: 12px;
  color: #856404;
}

.layer-info p {
  margin: 0 0 8px 0;
  font-weight: bold;
}

.layer-info ul {
  margin: 0;
  padding-left: 16px;
}

.layer-info li {
  margin: 4px 0;
}
</style>
