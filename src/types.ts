export interface PixelData {
  [key: string]: string
}

export interface Layer {
  id: string
  name: string
  pixels: PixelData
  visible: boolean
  locked: boolean
}

export interface ColorPalette {
  id: string
  name: string
  colors: string[]
}

export interface PresetAsset {
  id: string
  name: string
  category: string
  pixels: PixelData
}

export interface HistoryState {
  layers: Layer[]
}

export type ToolType = 'pencil' | 'eraser' | 'eyedropper' | 'paintbucket'

export interface ThemeColors {
  skin: string
  hair: string
  clothes: string
}
