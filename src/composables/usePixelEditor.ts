import { ref, reactive, computed, watch } from 'vue'
import type { ToolType, PixelLayer, AvatarProject, SavedPalette, GridSize, ColorMapping } from '../types'
import TEMPLATES from '../data/templates'

const STORAGE_KEY = 'pixel-avatar-workshop'
const PALETTE_KEY = 'pixel-avatar-palettes'

function createLayer(id: string, name: string): PixelLayer {
  return { id, name, visible: true, locked: false, pixels: {} }
}

function createDefaultProject(gridSize: GridSize): AvatarProject {
  const base = createLayer('base', '底色层')
  const face = createLayer('face', '五官层')
  const deco = createLayer('deco', '装饰层')
  return {
    gridSize,
    layers: [base, face, deco],
    activeLayerId: 'base'
  }
}

const project = reactive<AvatarProject>(createDefaultProject(32))
const currentTool = ref<ToolType>('pencil')
const currentColor = ref('#000000')
const mirrorMode = ref(false)
const showGrid = ref(true)
const gridSize = ref<GridSize>(32)
const history = ref<string[]>([])
const historyIndex = ref(-1)
const savedPalettes = ref<SavedPalette[]>([])
const isDrawing = ref(false)

function cloneProject(p: AvatarProject): AvatarProject {
  return JSON.parse(JSON.stringify(p))
}

function pushHistory() {
  const snapshot = JSON.stringify(cloneProject(project))
  if (historyIndex.value < history.value.length - 1) {
    history.value = history.value.slice(0, historyIndex.value + 1)
  }
  history.value.push(snapshot)
  if (history.value.length > 50) {
    history.value.shift()
  }
  historyIndex.value = history.value.length - 1
}

function undo() {
  if (historyIndex.value > 0) {
    historyIndex.value--
    const snapshot = JSON.parse(history.value[historyIndex.value]) as AvatarProject
    Object.assign(project, snapshot)
  }
}

function redo() {
  if (historyIndex.value < history.value.length - 1) {
    historyIndex.value++
    const snapshot = JSON.parse(history.value[historyIndex.value]) as AvatarProject
    Object.assign(project, snapshot)
  }
}

function getActiveLayer(): PixelLayer | undefined {
  return project.layers.find(l => l.id === project.activeLayerId)
}

function setPixel(x: number, y: number, color: string) {
  const layer = getActiveLayer()
  if (!layer || layer.locked) return
  const key = `${x},${y}`
  if (x < 0 || x >= project.gridSize || y < 0 || y >= project.gridSize) return
  if (color === '') {
    delete layer.pixels[key]
  } else {
    layer.pixels[key] = color
  }
}

function floodFill(startX: number, startY: number, fillColor: string) {
  const layer = getActiveLayer()
  if (!layer || layer.locked) return
  const key = `${startX},${startY}`
  const targetColor = layer.pixels[key] || ''
  if (targetColor === fillColor) return

  const stack: [number, number][] = [[startX, startY]]
  const visited = new Set<string>()
  const gs = project.gridSize

  while (stack.length > 0) {
    const [cx, cy] = stack.pop()!
    const ck = `${cx},${cy}`
    if (visited.has(ck)) continue
    if (cx < 0 || cx >= gs || cy < 0 || cy >= gs) continue
    const currentPixelColor = layer.pixels[ck] || ''
    if (currentPixelColor !== targetColor) continue

    visited.add(ck)
    layer.pixels[ck] = fillColor

    stack.push([cx + 1, cy], [cx - 1, cy], [cx, cy + 1], [cx, cy - 1])
  }
}

function eyedrop(x: number, y: number): string {
  const key = `${x},${y}`
  for (let i = project.layers.length - 1; i >= 0; i--) {
    const layer = project.layers[i]
    if (layer.visible && layer.pixels[key]) {
      return layer.pixels[key]
    }
  }
  return ''
}

function applyTemplate(templateIndex: number) {
  const tpl = TEMPLATES[templateIndex]
  if (!tpl) return
  const layer = getActiveLayer()
  if (!layer || layer.locked) return
  pushHistory()
  for (const [key, color] of Object.entries(tpl.pixels)) {
    layer.pixels[key] = color
  }
  pushHistory()
}

function batchRecolor(mappings: ColorMapping[]) {
  pushHistory()
  const map = new Map<string, string>()
  for (const m of mappings) {
    map.set(m.from.toLowerCase(), m.to.toLowerCase())
  }
  for (const layer of project.layers) {
    const newPixels: Record<string, string> = {}
    for (const [key, color] of Object.entries(layer.pixels)) {
      const lower = color.toLowerCase()
      newPixels[key] = map.get(lower) || color
    }
    layer.pixels = newPixels
  }
  pushHistory()
}

function changeGridSize(newSize: GridSize) {
  if (newSize === project.gridSize) return
  pushHistory()
  const newProject = createDefaultProject(newSize)
  for (const oldLayer of project.layers) {
    const newLayer = newProject.layers.find(l => l.id === oldLayer.id)
    if (newLayer) {
      newLayer.visible = oldLayer.visible
      newLayer.locked = oldLayer.locked
      const newPixels: Record<string, string> = {}
      for (const [key, color] of Object.entries(oldLayer.pixels)) {
        const [x, y] = key.split(',').map(Number)
        if (x < newSize && y < newSize) {
          newPixels[key] = color
        }
      }
      newLayer.pixels = newPixels
    }
  }
  newProject.activeLayerId = project.activeLayerId
  Object.assign(project, newProject)
  gridSize.value = newSize
  pushHistory()
}

function clearLayer() {
  const layer = getActiveLayer()
  if (!layer || layer.locked) return
  pushHistory()
  layer.pixels = {}
  pushHistory()
}

function newProject(gs?: GridSize) {
  pushHistory()
  Object.assign(project, createDefaultProject(gs || project.gridSize as GridSize))
  gridSize.value = project.gridSize as GridSize
  pushHistory()
}

function saveProject() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cloneProject(project)))
  } catch { /* ignore */ }
}

function loadProject() {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    if (data) {
      const parsed = JSON.parse(data) as AvatarProject
      Object.assign(project, parsed)
      gridSize.value = parsed.gridSize as GridSize
    }
  } catch { /* ignore */ }
}

function savePalettes() {
  try {
    localStorage.setItem(PALETTE_KEY, JSON.stringify(savedPalettes.value))
  } catch { /* ignore */ }
}

function loadPalettes() {
  try {
    const data = localStorage.getItem(PALETTE_KEY)
    if (data) {
      savedPalettes.value = JSON.parse(data)
    }
  } catch { /* ignore */ }
}

function addPalette(name: string, colors: string[]) {
  savedPalettes.value.push({
    id: Date.now().toString(),
    name,
    colors: [...colors]
  })
  savePalettes()
}

function removePalette(id: string) {
  savedPalettes.value = savedPalettes.value.filter(p => p.id !== id)
  savePalettes()
}

function exportPNG(scale: number = 16): void {
  const size = project.gridSize * scale
  const exportCanvas = document.createElement('canvas')
  exportCanvas.width = size
  exportCanvas.height = size
  const ctx = exportCanvas.getContext('2d')!

  ctx.imageSmoothingEnabled = false
  ctx.clearRect(0, 0, size, size)

  for (const layer of project.layers) {
    if (!layer.visible) continue
    for (const [key, color] of Object.entries(layer.pixels)) {
      const [x, y] = key.split(',').map(Number)
      ctx.fillStyle = color
      ctx.fillRect(x * scale, y * scale, scale, scale)
    }
  }

  const link = document.createElement('a')
  link.download = 'pixel-avatar.png'
  link.href = exportCanvas.toDataURL('image/png')
  link.click()
}

function exportJSON(): void {
  const data = JSON.stringify(cloneProject(project), null, 2)
  const blob = new Blob([data], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.download = 'pixel-avatar.json'
  link.href = url
  link.click()
  URL.revokeObjectURL(url)
}

function getAllColorsInProject(): string[] {
  const colorSet = new Set<string>()
  for (const layer of project.layers) {
    for (const color of Object.values(layer.pixels)) {
      colorSet.add(color.toLowerCase())
    }
  }
  return Array.from(colorSet)
}

const canUndo = computed(() => historyIndex.value > 0)
const canRedo = computed(() => historyIndex.value < history.value.length - 1)

watch(() => project, () => {
  saveProject()
}, { deep: true })

loadProject()
loadPalettes()

if (history.value.length === 0) {
  pushHistory()
}

export function usePixelEditor() {
  return {
    project,
    currentTool,
    currentColor,
    mirrorMode,
    showGrid,
    gridSize,
    isDrawing,
    canUndo,
    canRedo,
    savedPalettes,
    pushHistory,
    undo,
    redo,
    getActiveLayer,
    setPixel,
    floodFill,
    eyedrop,
    applyTemplate,
    batchRecolor,
    changeGridSize,
    clearLayer,
    newProject,
    saveProject,
    loadProject,
    addPalette,
    removePalette,
    savePalettes,
    exportPNG,
    exportJSON,
    getAllColorsInProject,
  }
}
