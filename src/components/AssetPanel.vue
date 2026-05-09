<template>
  <div class="asset-panel">
    <h3 class="panel-title">素材模板</h3>
    <div class="asset-categories">
      <button
        v-for="cat in categories"
        :key="cat.id"
        class="category-btn"
        :class="{ active: activeCategory === cat.id }"
        @click="activeCategory = cat.id"
      >
        {{ cat.name }}
      </button>
    </div>
    <div class="assets-grid">
      <div
        v-for="asset in filteredAssets"
        :key="asset.id"
        class="asset-item"
        @click="applyAsset(asset)"
        :title="asset.name"
      >
        <canvas
          :ref="el => renderAsset(el, asset)"
          :width="48"
          :height="48"
          class="asset-preview"
        ></canvas>
        <span class="asset-name">{{ asset.name }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, type ComponentPublicInstance } from 'vue';
import { store, actions } from '../store';
import type { AssetTemplate } from '../types';

const activeCategory = ref('hair');

const categories = [
  { id: 'hair', name: '发型' },
  { id: 'glasses', name: '眼镜' },
  { id: 'hat', name: '帽子' },
  { id: 'earring', name: '耳饰' },
  { id: 'eyes', name: '眼睛' },
  { id: 'mouth', name: '嘴巴' }
];

const filteredAssets = computed(() =>
  store.assets.filter((a) => a.category === activeCategory.value)
);

const renderedAssets = new Set<string>();

const renderAsset = (el: Element | ComponentPublicInstance | null, asset: AssetTemplate) => {
  if (!el || renderedAssets.has(asset.id)) return;
  renderedAssets.add(asset.id);
  const canvas = el as HTMLCanvasElement;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  
  ctx.fillStyle = 'rgba(0,0,0,0.05)';
  ctx.fillRect(0, 0, 48, 48);
  
  const maxDim = Math.max(asset.pixels[0]?.length || 1, asset.pixels.length || 1);
  const scale = Math.floor(48 / (maxDim + 2));
  const offsetX = Math.floor((48 - (asset.pixels[0]?.length || 0) * scale) / 2);
  const offsetY = Math.floor((48 - asset.pixels.length * scale) / 2);
  
  for (let y = 0; y < asset.pixels.length; y++) {
    for (let x = 0; x < asset.pixels[y].length; x++) {
      const color = asset.pixels[y][x];
      if (!color) continue;
      ctx.fillStyle = color;
      ctx.fillRect(offsetX + x * scale, offsetY + y * scale, scale, scale);
    }
  }
};

const applyAsset = (asset: AssetTemplate) => {
  actions.saveHistory();
  actions.applyAsset(asset);
};
</script>

<style scoped>
.asset-panel {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.panel-title {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: #333;
  border-bottom: 1px solid #eee;
  padding-bottom: 8px;
}
.asset-categories {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
}
.category-btn {
  padding: 4px 10px;
  border: 1px solid #ddd;
  background: white;
  border-radius: 12px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.15s;
}
.category-btn:hover {
  background: #f0f0f0;
}
.category-btn.active {
  background: #2196f3;
  color: white;
  border-color: #2196f3;
}
.assets-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  max-height: 200px;
  overflow-y: auto;
}
.asset-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 6px;
  border: 1px solid #ddd;
  border-radius: 6px;
  cursor: pointer;
  background: white;
  transition: all 0.15s;
}
.asset-item:hover {
  background: #e3f2fd;
  border-color: #2196f3;
}
.asset-preview {
  image-rendering: pixelated;
  border-radius: 4px;
}
.asset-name {
  font-size: 11px;
  color: #555;
  margin-top: 4px;
  text-align: center;
}
</style>
