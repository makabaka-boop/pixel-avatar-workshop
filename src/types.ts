export type Pixel = string | null;

export type LayerType = 'background' | 'face' | 'decoration';

export interface Layer {
  id: string;
  name: string;
  type: LayerType;
  visible: boolean;
  locked: boolean;
  pixels: Pixel[][];
}

export type Tool = 'pencil' | 'eraser' | 'eyedropper' | 'bucket';

export interface ColorPalette {
  id: string;
  name: string;
  colors: string[];
}

export interface ColorTheme {
  id: string;
  name: string;
  skin: string;
  hair: string;
  clothes: string;
}

export interface AssetTemplate {
  id: string;
  name: string;
  category: 'hair' | 'glasses' | 'hat' | 'earring' | 'mouth' | 'eyes';
  layerType: LayerType;
  pixels: Pixel[][];
  offsetX: number;
  offsetY: number;
}

export interface HistoryState {
  layers: Layer[];
}

export interface WorkspaceState {
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
}

export interface ColorMap {
  [oldColor: string]: string;
}

export interface SkinVariant {
  name: string;
  colorMap: ColorMap;
}
