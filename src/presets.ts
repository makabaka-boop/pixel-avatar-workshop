import type { ColorPalette, ColorTheme, AssetTemplate } from './types';

export const defaultPalettes: ColorPalette[] = [
  {
    id: 'p-default',
    name: '默认色板',
    colors: [
      '#000000', '#ffffff', '#ff6b6b', '#ffd93d',
      '#6bcb77', '#4d96ff', '#9b59b6', '#e67e22',
      '#1abc9c', '#e74c3c', '#2c3e50', '#95a5a6',
      '#ffeaa7', '#dfe6e9', '#fab1a0', '#a29bfe'
    ]
  },
  {
    id: 'p-skin',
    name: '肤色系',
    colors: [
      '#ffe0bd', '#f5d0a9', '#d4a574', '#c68642',
      '#8d5524', '#5d3a1a', '#ffd5b5', '#f0c8a0',
      '#e0b68a', '#b8956e', '#9a7b5a', '#6b4423'
    ]
  },
  {
    id: 'p-hair',
    name: '发色系',
    colors: [
      '#1a1a1a', '#3d2314', '#5c3317', '#8b4513',
      '#a0522d', '#d4a574', '#f5deb3', '#ffd700',
      '#ff6347', '#ff69b4', '#9370db', '#2e8b57'
    ]
  },
  {
    id: 'p-clothes',
    name: '衣服系',
    colors: [
      '#e74c3c', '#c0392b', '#3498db', '#2980b9',
      '#27ae60', '#16a085', '#f39c12', '#d68910',
      '#9b59b6', '#8e44ad', '#1abc9c', '#2c3e50',
      '#ecf0f1', '#95a5a6', '#34495e', '#7f8c8d'
    ]
  }
];

export const defaultThemes: ColorTheme[] = [
  { id: 't1', name: '自然棕', skin: '#f5d0a9', hair: '#5c3317', clothes: '#2980b9' },
  { id: 't2', name: '白皙金发', skin: '#ffe0bd', hair: '#ffd700', clothes: '#e74c3c' },
  { id: 't3', name: '深肤黑发', skin: '#8d5524', hair: '#1a1a1a', clothes: '#27ae60' },
  { id: 't4', name: '粉紫梦幻', skin: '#ffd5b5', hair: '#9b59b6', clothes: '#ff69b4' },
  { id: 't5', name: '经典灰', skin: '#d4a574', hair: '#2c3e50', clothes: '#7f8c8d' }
];

const makePixelGrid = (pattern: string[], colorMap: Record<string, string | null>): (string | null)[][] => {
  return pattern.map(row =>
    row.split('').map(ch => colorMap[ch] ?? null)
  );
};

export const defaultAssets: AssetTemplate[] = [
  {
    id: 'a-hair-1',
    name: '短直发',
    category: 'hair',
    layerType: 'decoration',
    offsetX: 8,
    offsetY: 6,
    pixels: makePixelGrid([
      '..HHHHHHHH..',
      '.HHHHHHHHHH.',
      'HHHHHHHHHHHH',
      'HHHHHHHHHHHH',
      'HHHHHHHHHHHH',
      'HHHHHHHHHHHH'
    ], { H: '#3d2314', '.': null })
  },
  {
    id: 'a-hair-2',
    name: '爆炸头',
    category: 'hair',
    layerType: 'decoration',
    offsetX: 6,
    offsetY: 4,
    pixels: makePixelGrid([
      '..HHHHHHHHHH..',
      '.HHHHHHHHHHHH.',
      'HHHHHHHHHHHHHH',
      'HHHHHHHHHHHHHH',
      'HHHHHHHHHHHHHH',
      '.HHHHHHHHHHHH.',
      '..HHHHHHHHHH..',
      '...HHHHHHHH...'
    ], { H: '#8b4513', '.': null })
  },
  {
    id: 'a-hair-3',
    name: '马尾',
    category: 'hair',
    layerType: 'decoration',
    offsetX: 8,
    offsetY: 5,
    pixels: makePixelGrid([
      '..HHHHHHHH..',
      '.HHHHHHHHHH.',
      'HHHHHHHHHHHH',
      'HHHHHHHHHHHH',
      'HHHHHHHHHHHH',
      '.HHHHHHHHHH.',
      '..H....HH...',
      '...H...H....',
      '...H...H....',
      '...HH.H.....'
    ], { H: '#1a1a1a', '.': null })
  },
  {
    id: 'a-glasses-1',
    name: '圆框眼镜',
    category: 'glasses',
    layerType: 'decoration',
    offsetX: 9,
    offsetY: 14,
    pixels: makePixelGrid([
      '............',
      '.GG.....GG..',
      'GGGG...GGGG.',
      'G..G.G.G..G.',
      'GGGG...GGGG.',
      '.GGG...GGG..'
    ], { G: '#2c3e50', '.': null })
  },
  {
    id: 'a-glasses-2',
    name: '太阳镜',
    category: 'glasses',
    layerType: 'decoration',
    offsetX: 8,
    offsetY: 14,
    pixels: makePixelGrid([
      '............',
      '.BBB.BBBB...',
      'BBBBBBBBBB..',
      'BBBBBBBBBB..',
      '.BBB.BBBB...'
    ], { B: '#1a1a1a', '.': null })
  },
  {
    id: 'a-hat-1',
    name: '棒球帽',
    category: 'hat',
    layerType: 'decoration',
    offsetX: 7,
    offsetY: 4,
    pixels: makePixelGrid([
      '............',
      '...HHHHHH...',
      '..HHHHHHHH..',
      '.HHHHHHHHHH.',
      'HHHHHHHHHHHH',
      'HHHHHHHHHHHH',
      '.BBBBBBBBBB.'
    ], { H: '#e74c3c', B: '#c0392b', '.': null })
  },
  {
    id: 'a-hat-2',
    name: '圣诞帽',
    category: 'hat',
    layerType: 'decoration',
    offsetX: 9,
    offsetY: 0,
    pixels: makePixelGrid([
      '.....R......',
      '....RRR.....',
      '...RRRRR....',
      '..RRRRRRR...',
      '.RRRRRRRRR..',
      'WWWWWWWWWWW.',
      '.RRRRRRRRR..'
    ], { R: '#e74c3c', W: '#ffffff', '.': null })
  },
  {
    id: 'a-earring-1',
    name: '耳环',
    category: 'earring',
    layerType: 'decoration',
    offsetX: 6,
    offsetY: 17,
    pixels: makePixelGrid([
      'Y.........Y.',
      'Y.........Y.'
    ], { Y: '#ffd700', '.': null })
  },
  {
    id: 'a-eyes-1',
    name: '眨眼',
    category: 'eyes',
    layerType: 'face',
    offsetX: 10,
    offsetY: 14,
    pixels: makePixelGrid([
      '.E.......E..',
      'EE.......EE.'
    ], { E: '#1a1a1a', '.': null })
  },
  {
    id: 'a-mouth-1',
    name: '微笑',
    category: 'mouth',
    layerType: 'face',
    offsetX: 12,
    offsetY: 22,
    pixels: makePixelGrid([
      '.MM...MM.',
      '..MMMMM..'
    ], { M: '#c0392b', '.': null })
  },
  {
    id: 'a-mouth-2',
    name: '惊讶',
    category: 'mouth',
    layerType: 'face',
    offsetX: 14,
    offsetY: 22,
    pixels: makePixelGrid([
      '.MM.',
      'MMMM',
      '.MM.'
    ], { M: '#c0392b', '.': null })
  }
];
