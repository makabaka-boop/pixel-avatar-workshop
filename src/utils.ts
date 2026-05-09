import type { Pixel, Layer } from './types';

export const uid = (): string =>
  Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);

export const createEmptyGrid = (width: number, height: number) => {
  return Array.from({ length: height }, () => Array<Pixel>(width).fill(null));
};

export const cloneGrid = (grid: Pixel[][]): Pixel[][] =>
  grid.map((row) => row.slice());

export const cloneLayer = (layer: Layer): Layer => ({
  ...layer,
  pixels: cloneGrid(layer.pixels)
});

export const cloneLayers = (layers: Layer[]): Layer[] => layers.map(cloneLayer);

export const floodFill = (
  grid: Pixel[][],
  startX: number,
  startY: number,
  targetColor: string | null
): void => {
  const rows = grid.length;
  const cols = grid[0].length;
  const startColor = grid[startY][startX];
  if (startColor === targetColor) return;

  const stack: [number, number][] = [[startX, startY]];
  const visited = new Set<string>();

  while (stack.length) {
    const [x, y] = stack.pop()!;
    const key = `${x},${y}`;
    if (visited.has(key)) continue;
    if (x < 0 || x >= cols || y < 0 || y >= rows) continue;
    if (grid[y][x] !== startColor) continue;

    visited.add(key);
    grid[y][x] = targetColor;

    stack.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
  }
};

export const hexToRgb = (hex: string): { r: number; g: number; b: number } | null => {
  const m = hex.match(/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i);
  if (!m) return null;
  return {
    r: parseInt(m[1], 16),
    g: parseInt(m[2], 16),
    b: parseInt(m[3], 16)
  };
};

export const rgbToHex = (r: number, g: number, b: number): string => {
  return (
    '#' +
    [r, g, b]
      .map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0'))
      .join('')
  );
};

export const getContrastColor = (hex: string): string => {
  const rgb = hexToRgb(hex);
  if (!rgb) return '#000000';
  const brightness = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
  return brightness > 128 ? '#000000' : '#ffffff';
};

export const downloadFile = (data: string, filename: string, type: string): void => {
  const blob = new Blob([data], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export const downloadCanvas = (canvas: HTMLCanvasElement, filename: string): void => {
  canvas.toBlob((blob) => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 'image/png');
};
