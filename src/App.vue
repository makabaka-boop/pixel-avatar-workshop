<template>
  <div class="app-container">
    <header class="app-header">
      <h1>🎨 像素头像工坊</h1>
    </header>
    <ToolBar />
    <div class="main-area">
      <LayerPanel />
      <div class="center-area">
        <PixelCanvas />
        <div class="bottom-panels">
          <TemplatePanel />
          <RecolorPanel />
        </div>
      </div>
      <ColorPanel />
    </div>
  </div>
</template>

<script setup lang="ts">
import ToolBar from './components/ToolBar.vue'
import LayerPanel from './components/LayerPanel.vue'
import PixelCanvas from './components/PixelCanvas.vue'
import ColorPanel from './components/ColorPanel.vue'
import TemplatePanel from './components/TemplatePanel.vue'
import RecolorPanel from './components/RecolorPanel.vue'
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body, #app {
  width: 100%;
  height: 100%;
  overflow: hidden;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

body {
  background: #1e1e1e;
  color: #ddd;
}
</style>

<style scoped>
.app-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100vw;
  overflow: hidden;
}

.app-header {
  padding: 8px 16px;
  background: linear-gradient(135deg, #1a1a2e, #16213e);
  border-bottom: 2px solid #4a90d9;
  text-align: center;
  flex-shrink: 0;
}

.app-header h1 {
  font-size: 18px;
  font-weight: 700;
  background: linear-gradient(90deg, #4a90d9, #e94fc4, #4a90d9);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: 3px;
}

.main-area {
  display: flex;
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

.center-area {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
  overflow: hidden;
}

.bottom-panels {
  display: flex;
  flex-shrink: 0;
  overflow-x: auto;
}

.bottom-panels > * {
  flex: 1;
  min-width: 280px;
}
</style>
