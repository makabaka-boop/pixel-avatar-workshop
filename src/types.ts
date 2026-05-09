export type ToolType = 'pencil' | 'eraser' | 'eyedropper' | 'bucket' | 'mirror'

export interface PixelLayer {
  id: string
  name: string
  visible: boolean
  locked: boolean
  pixels: Record<string, string>
}

export interface AvatarProject {
  gridSize: number
  layers: PixelLayer[]
  activeLayerId: string
}

export interface ColorTheme {
  name: string
  colors: string[]
}

export interface SavedPalette {
  id: string
  name: string
  colors: string[]
}

export interface TemplateItem {
  name: string
  category: string
  pixels: Record<string, string>
  preview: string
}

export interface ColorMapping {
  from: string
  to: string
}

export type GridSize = 32 | 48
