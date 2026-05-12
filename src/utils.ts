import type { PixelData, Layer, ThemeColors } from './types'

export const GRID_SIZE = 32
export const PIXEL_SIZE = 16

export function getPixelKey(x: number, y: number): string {
  return `${x},${y}`
}

export function parsePixelKey(key: string): [number, number] {
  const [x, y] = key.split(',').map(Number)
  return [x, y]
}

export function createEmptyPixels(): PixelData {
  return {}
}

export function floodFill(
  pixels: PixelData,
  x: number,
  y: number,
  targetColor: string,
  fillColor: string,
  gridSize: number
): PixelData {
  const result = { ...pixels }
  const key = getPixelKey(x, y)
  const currentColor = result[key] || ''

  if (currentColor === fillColor || currentColor !== targetColor) {
    return result
  }

  const stack: [number, number][] = [[x, y]]
  const visited = new Set<string>()

  while (stack.length > 0) {
    const [cx, cy] = stack.pop()!
    const ckey = getPixelKey(cx, cy)

    if (visited.has(ckey)) continue
    if (cx < 0 || cx >= gridSize || cy < 0 || cy >= gridSize) continue

    const pixelColor = result[ckey] || ''
    if (pixelColor !== targetColor) continue

    visited.add(ckey)
    result[ckey] = fillColor

    stack.push([cx + 1, cy], [cx - 1, cy], [cx, cy + 1], [cx, cy - 1])
  }

  return result
}

export function applySymmetry(
  pixels: PixelData,
  x: number,
  y: number,
  color: string,
  gridSize: number
): PixelData {
  const result = { ...pixels }
  const key = getPixelKey(x, y)
  const symX = gridSize - 1 - x
  const symKey = getPixelKey(symX, y)

  if (color) {
    result[key] = color
    result[symKey] = color
  } else {
    delete result[key]
    delete result[symKey]
  }

  return result
}

export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      }
    : null
}

export function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('')
}

export function generateColorVariants(
  layers: Layer[],
  colorMappings: { from: string; to: string }[]
): Layer[] {
  return layers.map(layer => {
    const newPixels: PixelData = {}
    for (const [key, color] of Object.entries(layer.pixels)) {
      let newColor = color
      for (const mapping of colorMappings) {
        if (color.toLowerCase() === mapping.from.toLowerCase()) {
          newColor = mapping.to
          break
        }
      }
      newPixels[key] = newColor
    }
    return { ...layer, pixels: newPixels }
  })
}

export function getAllColorsFromLayers(layers: Layer[]): string[] {
  const colors = new Set<string>()
  layers.forEach(layer => {
    Object.values(layer.pixels).forEach(color => colors.add(color))
  })
  return Array.from(colors)
}

export function createThemeMappings(
  originalColors: ThemeColors,
  newColors: ThemeColors
): { from: string; to: string }[] {
  return [
    { from: originalColors.skin, to: newColors.skin },
    { from: originalColors.hair, to: newColors.hair },
    { from: originalColors.clothes, to: newColors.clothes }
  ].filter(m => m.from && m.to)
}

export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj))
}
