<script setup lang="ts">
import { ref, computed } from 'vue'
import type { PresetAsset } from '../types'

const props = defineProps<{
  presets: PresetAsset[]
}>()

const emit = defineEmits<{
  apply: [asset: PresetAsset]
}>()

const selectedCategory = ref('发型')

const categories = computed(() => {
  return Array.from(new Set(props.presets.map(p => p.category)))
})

const filteredPresets = computed(() => {
  return props.presets.filter(p => p.category === selectedCategory.value)
})
</script>

<template>
  <div class="preset-assets">
    <h3>🎁 预设素材</h3>
    
    <div class="category-tabs">
      <button
        v-for="cat in categories"
        :key="cat"
        class="tab-btn"
        :class="{ active: selectedCategory === cat }"
        @click="selectedCategory = cat"
      >
        {{ cat }}
      </button>
    </div>

    <div class="asset-grid">
      <button
        v-for="asset in filteredPresets"
        :key="asset.id"
        class="asset-item"
        :title="asset.name"
        @click="emit('apply', asset)"
      >
        <div class="asset-preview">
          <div class="mini-canvas">
            <template v-for="(color, key) in asset.pixels" :key="key">
              <div
                class="mini-pixel"
                :style="{
                  background: color,
                  left: (parseInt(key.split(',')[0]) - 8) * 4 + 'px',
                  top: (parseInt(key.split(',')[1]) - 4) * 4 + 'px'
                }"
              />
            </template>
          </div>
        </div>
        <span class="asset-name">{{ asset.name }}</span>
      </button>
    </div>

    <p class="hint">点击素材将应用到当前选中的图层</p>
  </div>
</template>

<style scoped>
.preset-assets {
  margin-top: 16px;
  padding: 16px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.preset-assets h3 {
  margin: 0 0 12px 0;
  font-size: 16px;
  color: #333;
}

.category-tabs {
  display: flex;
  gap: 4px;
  margin-bottom: 12px;
  flex-wrap: wrap;
}

.tab-btn {
  padding: 6px 12px;
  border: 1px solid #ddd;
  background: white;
  border-radius: 16px;
  cursor: pointer;
  font-size: 13px;
  transition: all 0.2s;
}

.tab-btn:hover {
  background: #f5f5f5;
}

.tab-btn.active {
  background: #4a90d9;
  color: white;
  border-color: #4a90d9;
}

.asset-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
  gap: 8px;
}

.asset-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8px;
  border: 1px solid #ddd;
  background: white;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.asset-item:hover {
  border-color: #4a90d9;
  background: #e8f4ff;
}

.asset-preview {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f5f5;
  border-radius: 4px;
  margin-bottom: 4px;
}

.mini-canvas {
  position: relative;
  width: 64px;
  height: 64px;
  transform: scale(0.75);
}

.mini-pixel {
  position: absolute;
  width: 4px;
  height: 4px;
}

.asset-name {
  font-size: 11px;
  color: #666;
  text-align: center;
}

.hint {
  margin: 12px 0 0 0;
  font-size: 11px;
  color: #999;
  text-align: center;
}
</style>
