<template>
  <div class="template-panel">
    <h3>素材模板</h3>
    <div class="template-list">
      <div
        v-for="(tpl, idx) in TEMPLATES"
        :key="tpl.name"
        class="template-item"
        @click="onApply(idx)"
      >
        <span class="tpl-icon">{{ tpl.preview }}</span>
        <span class="tpl-name">{{ tpl.name }}</span>
        <span class="tpl-category">{{ tpl.category }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import TEMPLATES from '../data/templates'
import { usePixelEditor } from '../composables/usePixelEditor'

const { applyTemplate } = usePixelEditor()

function onApply(idx: number) {
  applyTemplate(idx)
}
</script>

<style scoped>
.template-panel {
  padding: 12px;
  background: #2c2c2c;
  border-top: 1px solid #444;
}

h3 {
  color: #ddd;
  font-size: 14px;
  margin: 0 0 10px 0;
  text-align: center;
  letter-spacing: 2px;
}

.template-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  justify-content: center;
}

.template-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: 8px 12px;
  background: #3a3a3a;
  border: 1px solid #555;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.15s;
  min-width: 70px;
}

.template-item:hover {
  background: #505050;
  border-color: #4a90d9;
  transform: translateY(-2px);
}

.tpl-icon {
  font-size: 22px;
}

.tpl-name {
  color: #ddd;
  font-size: 11px;
}

.tpl-category {
  color: #888;
  font-size: 10px;
}
</style>
