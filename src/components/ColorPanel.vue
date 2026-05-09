<template>
  <div class="color-panel">
    <h3 class="panel-title">颜色</h3>
    <div class="current-color-row">
      <div
        class="current-color"
        :style="{ background: store.currentColor }"
      ></div>
      <input
        type="color"
        v-model="store.currentColor"
        class="color-picker"
      />
      <button class="save-btn" @click="saveCurrentColor">保存到色板</button>
    </div>

    <h4 class="section-title">快速主题 <span class="hint">（点击色块设为画笔）</span></h4>
    <div class="themes">
      <div
        v-for="theme in store.themes"
        :key="theme.id"
        class="theme-item"
        @click="applyTheme(theme)"
        :title="theme.name + ' - 点击应用主题换肤'"
      >
        <div class="theme-colors">
          <span
            :style="{ background: theme.skin }"
            @click.stop="store.currentColor = theme.skin"
            title="皮肤色：设为画笔"
          ></span>
          <span
            :style="{ background: theme.hair }"
            @click.stop="store.currentColor = theme.hair"
            title="发色：设为画笔"
          ></span>
          <span
            :style="{ background: theme.clothes }"
            @click.stop="store.currentColor = theme.clothes"
            title="衣服色：设为画笔"
          ></span>
        </div>
        <span class="theme-name">{{ theme.name }}</span>
      </div>
    </div>

    <h4 class="section-title">色板</h4>
    <select
      v-model="store.activePaletteId"
      class="palette-select"
    >
      <option v-for="p in store.palettes" :key="p.id" :value="p.id">
        {{ p.name }}
      </option>
    </select>
    <div class="palette-colors">
      <button
        v-for="(color, idx) in activePaletteColors"
        :key="idx"
        class="palette-color"
        :style="{ background: color }"
        @click="store.currentColor = color"
      >
      </button>
    </div>

    <div class="palette-actions">
      <input
        type="text"
        v-model="newPaletteName"
        placeholder="新色板名"
        class="name-input"
      />
      <button class="action-btn" @click="createPalette">新建色板</button>
      <button
        class="action-btn danger"
        @click="deleteCurrentPalette"
        v-if="canDelete"
      >
        删除色板
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { store, actions, getters } from '../store';
import type { ColorTheme } from '../types';

const newPaletteName = ref('');

const activePaletteColors = computed(() => getters.activePalette.value?.colors ?? []);

const canDelete = computed(() => {
  const ap = getters.activePalette.value;
  return ap && !ap.id.startsWith('p-');
});

const saveCurrentColor = () => {
  if (!store.activePaletteId) return;
  actions.addColorToPalette(store.activePaletteId, store.currentColor);
};

const emit = defineEmits<{
  applyTheme: [theme: ColorTheme];
}>();

const applyTheme = (theme: ColorTheme) => {
  emit('applyTheme', theme);
};

const createPalette = () => {
  const name = newPaletteName.value.trim();
  if (!name) return;
  actions.addPalette(name, [store.currentColor]);
  newPaletteName.value = '';
};

const deleteCurrentPalette = () => {
  if (store.activePaletteId && canDelete.value && confirm('确定删除该色板？')) {
    actions.deletePalette(store.activePaletteId);
  }
};
</script>

<style scoped>
.color-panel {
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
.section-title {
  margin: 6px 0 4px;
  font-size: 12px;
  font-weight: 600;
  color: #666;
}
.current-color-row {
  display: flex;
  align-items: center;
  gap: 8px;
}
.current-color {
  width: 40px;
  height: 40px;
  border-radius: 4px;
  border: 1px solid #ddd;
}
.color-picker {
  width: 40px;
  height: 40px;
  border: none;
  cursor: pointer;
  background: transparent;
}
.save-btn, .action-btn {
  flex: 1;
  padding: 6px 10px;
  border: 1px solid #ddd;
  background: white;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.15s;
}
.save-btn:hover, .action-btn:hover {
  background: #f0f0f0;
}
.action-btn.danger:hover {
  background: #ffebee;
  color: #d32f2f;
}
.themes {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 6px;
}
.theme-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  background: white;
  transition: all 0.15s;
}
.theme-item:hover {
  background: #f5f5f5;
}
.theme-colors {
  display: flex;
  gap: 2px;
}
.theme-colors span {
  width: 12px;
  height: 12px;
  border-radius: 2px;
}
.theme-name {
  font-size: 11px;
  color: #555;
}
.palette-select {
  padding: 6px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 12px;
}
.palette-colors {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 4px;
}
.palette-color {
  width: 28px;
  height: 28px;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  transition: transform 0.1s;
}
.palette-color:hover {
  transform: scale(1.15);
}
.palette-actions {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-top: 8px;
}
.name-input {
  padding: 6px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 12px;
}
</style>
