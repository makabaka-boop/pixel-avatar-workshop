import { reactive, computed, watch } from 'vue';
import type {
  Layer,
  Tool,
  ColorPalette,
  ColorTheme,
  AssetTemplate,
  HistoryState,
  ColorMap
} from './types';
import { uid, createEmptyGrid, cloneLayers, floodFill } from './utils';
import { defaultPalettes, defaultThemes, defaultAssets } from './presets';

const STORAGE_KEY = 'pixel-avatar-workshop-v1';
const PALETTES_KEY = 'pixel-avatar-palettes-v1';

interface StoreState {
  width: number;
  height: number;
  layers: Layer[];
  activeLayerId: string | null;
  activeTool: Tool;
  currentColor: string;
  symmetry: boolean;
  palettes: ColorPalette[];
  activePaletteId: string | null;
  themes: ColorTheme[];
  undoStack: HistoryState[];
  redoStack: HistoryState[];
  assets: AssetTemplate[];
}

const createInitialLayers = (w: number, h: number): Layer[] => [
  {
    id: uid(),
    name: '底色层',
    type: 'background',
    visible: true,
    locked: false,
    pixels: createEmptyGrid(w, h)
  },
  {
    id: uid(),
    name: '五官层',
    type: 'face',
    visible: true,
    locked: false,
    pixels: createEmptyGrid(w, h)
  },
  {
    id: uid(),
    name: '装饰层',
    type: 'decoration',
    visible: true,
    locked: false,
    pixels: createEmptyGrid(w, h)
  }
];

const loadFromStorage = <T>(key: string, fallback: T): T => {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
};

const savePalettes = (palettes: ColorPalette[]) => {
  try {
    localStorage.setItem(PALETTES_KEY, JSON.stringify(palettes));
  } catch {}
};

const saveWorkspace = (state: StoreState) => {
  try {
    const data = {
      width: state.width,
      height: state.height,
      layers: state.layers,
      palettes: state.palettes
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {}
};

const initState = (): StoreState => {
  const saved = loadFromStorage<{
    width: number;
    height: number;
    layers: Layer[];
    palettes: ColorPalette[];
  } | null>(STORAGE_KEY, null);

  const savedPalettes = loadFromStorage<ColorPalette[] | null>(PALETTES_KEY, null);

  const w = saved?.width ?? 32;
  const h = saved?.height ?? 32;

  return {
    width: w,
    height: h,
    layers: saved?.layers ?? createInitialLayers(w, h),
    activeLayerId: null,
    activeTool: 'pencil',
    currentColor: '#000000',
    symmetry: false,
    palettes: savedPalettes ?? defaultPalettes,
    activePaletteId: defaultPalettes[0].id,
    themes: defaultThemes,
    undoStack: [],
    redoStack: [],
    assets: defaultAssets
  };
};

export const store = reactive<StoreState>(initState());

if (!store.activeLayerId && store.layers.length > 0) {
  store.activeLayerId = store.layers[1].id;
}

export const getters = {
  activeLayer: computed((): Layer | undefined =>
    store.layers.find((l) => l.id === store.activeLayerId)
  ),
  activePalette: computed((): ColorPalette | undefined =>
    store.palettes.find((p) => p.id === store.activePaletteId)
  )
};

export const actions = {
  saveToStorage() {
    saveWorkspace(store);
    savePalettes(store.palettes);
  },

  saveHistory() {
    store.undoStack.push({ layers: cloneLayers(store.layers) });
    if (store.undoStack.length > 100) store.undoStack.shift();
    store.redoStack = [];
  },

  undo() {
    if (store.undoStack.length === 0) return;
    const prev = store.undoStack.pop()!;
    store.redoStack.push({ layers: cloneLayers(store.layers) });
    store.layers = prev.layers;
  },

  redo() {
    if (store.redoStack.length === 0) return;
    const next = store.redoStack.pop()!;
    store.undoStack.push({ layers: cloneLayers(store.layers) });
    store.layers = next.layers;
  },

  setActiveLayer(id: string) {
    store.activeLayerId = id;
  },

  setTool(tool: Tool) {
    store.activeTool = tool;
  },

  setColor(color: string) {
    store.currentColor = color;
  },

  toggleSymmetry() {
    store.symmetry = !store.symmetry;
  },

  toggleLayerVisible(id: string) {
    const layer = store.layers.find((l) => l.id === id);
    if (layer) layer.visible = !layer.visible;
  },

  toggleLayerLocked(id: string) {
    const layer = store.layers.find((l) => l.id === id);
    if (layer) layer.locked = !layer.locked;
  },

  setPixel(x: number, y: number, color: string | null) {
    const layer = store.layers.find((l) => l.id === store.activeLayerId);
    if (!layer || layer.locked) return;
    if (x < 0 || x >= store.width || y < 0 || y >= store.height) return;
    layer.pixels[y][x] = color;
    if (store.symmetry) {
      const sx = store.width - 1 - x;
      if (sx !== x) {
        layer.pixels[y][sx] = color;
      }
    }
  },

  useBucket(x: number, y: number, color: string | null) {
    const layer = store.layers.find((l) => l.id === store.activeLayerId);
    if (!layer || layer.locked) return;
    if (x < 0 || x >= store.width || y < 0 || y >= store.height) return;
    floodFill(layer.pixels, x, y, color);
  },

  applyAsset(asset: AssetTemplate) {
    const targetLayer = store.layers.find((l) => l.type === asset.layerType);
    if (!targetLayer || targetLayer.locked) return;
    for (let py = 0; py < asset.pixels.length; py++) {
      for (let px = 0; px < asset.pixels[py].length; px++) {
        const color = asset.pixels[py][px];
        if (color === null) continue;
        const tx = asset.offsetX + px;
        const ty = asset.offsetY + py;
        if (tx < 0 || tx >= store.width || ty < 0 || ty >= store.height) continue;
        targetLayer.pixels[ty][tx] = color;
      }
    }
  },

  clearLayer(id: string) {
    const layer = store.layers.find((l) => l.id === id);
    if (!layer || layer.locked) return;
    for (let y = 0; y < store.height; y++) {
      for (let x = 0; x < store.width; x++) {
        layer.pixels[y][x] = null;
      }
    }
  },

  resize(width: number, height: number) {
    store.width = width;
    store.height = height;
    store.layers = createInitialLayers(width, height);
    store.activeLayerId = store.layers[1].id;
    store.undoStack = [];
    store.redoStack = [];
  },

  addPalette(name: string, colors: string[]) {
    const palette: ColorPalette = {
      id: uid(),
      name,
      colors
    };
    store.palettes.push(palette);
    store.activePaletteId = palette.id;
    savePalettes(store.palettes);
  },

  deletePalette(id: string) {
    const idx = store.palettes.findIndex((p) => p.id === id);
    if (idx === -1) return;
    store.palettes.splice(idx, 1);
    store.activePaletteId = store.palettes[0]?.id ?? null;
    savePalettes(store.palettes);
  },

  addColorToPalette(paletteId: string, color: string) {
    const palette = store.palettes.find((p) => p.id === paletteId);
    if (!palette) return;
    palette.colors.push(color);
    savePalettes(store.palettes);
  },

  applyTheme(theme: ColorTheme) {
    actions.setColor(theme.skin);
  },

  applyColorMapToLayer(layerId: string, colorMap: ColorMap) {
    const layer = store.layers.find((l) => l.id === layerId);
    if (!layer || layer.locked) return;
    for (let y = 0; y < store.height; y++) {
      for (let x = 0; x < store.width; x++) {
        const color = layer.pixels[y][x];
        if (color && colorMap[color]) {
          layer.pixels[y][x] = colorMap[color];
        }
      }
    }
  },

  generateColorMapFromLayers(): ColorMap {
    const map: ColorMap = {};
    for (const layer of store.layers) {
      for (const row of layer.pixels) {
        for (const pixel of row) {
          if (pixel && !map[pixel]) map[pixel] = pixel;
        }
      }
    }
    return map;
  },

  applyColorMapAll(colorMap: ColorMap) {
    for (const layer of store.layers) {
      if (layer.locked) continue;
      for (let y = 0; y < store.height; y++) {
        for (let x = 0; x < store.width; x++) {
          const color = layer.pixels[y][x];
          if (color && colorMap[color]) {
            layer.pixels[y][x] = colorMap[color];
          }
        }
      }
    }
  },

  collectUsedColors(): string[] {
    const set = new Set<string>();
    for (const layer of store.layers) {
      for (const row of layer.pixels) {
        for (const pixel of row) {
          if (pixel) set.add(pixel);
        }
      }
    }
    return Array.from(set);
  }
};

watch(
  () => [store.layers, store.palettes],
  () => actions.saveToStorage(),
  { deep: true }
);
