import type { PresetAsset, ColorPalette } from './types'
import { getPixelKey } from './utils'

function createPixelMap(coords: [number, number][], color: string) {
  const pixels: { [key: string]: string } = {}
  coords.forEach(([x, y]) => {
    pixels[getPixelKey(x, y)] = color
  })
  return pixels
}

export const presetAssets: PresetAsset[] = [
  {
    id: 'hair-short',
    name: '短发',
    category: '发型',
    pixels: {
      ...createPixelMap([[12, 6], [13, 5], [14, 5], [15, 4], [16, 4], [17, 5], [18, 5], [19, 6]], '#4a3728'),
      ...createPixelMap([[11, 7], [12, 7], [13, 6], [14, 6], [15, 5], [16, 5], [17, 6], [18, 6], [19, 7], [20, 7]], '#4a3728'),
      ...createPixelMap([[10, 8], [11, 8], [12, 8], [13, 7], [14, 7], [15, 6], [16, 6], [17, 7], [18, 7], [19, 8], [20, 8], [21, 8]], '#4a3728'),
      ...createPixelMap([[10, 9], [11, 9], [12, 9], [20, 9], [21, 9]], '#4a3728'),
      ...createPixelMap([[10, 10], [11, 10], [21, 10]], '#4a3728')
    }
  },
  {
    id: 'hair-long',
    name: '长发',
    category: '发型',
    pixels: {
      ...createPixelMap([[12, 6], [13, 5], [14, 5], [15, 4], [16, 4], [17, 5], [18, 5], [19, 6]], '#5c4033'),
      ...createPixelMap([[11, 7], [12, 7], [13, 6], [14, 6], [15, 5], [16, 5], [17, 6], [18, 6], [19, 7], [20, 7]], '#5c4033'),
      ...createPixelMap([[10, 8], [11, 8], [12, 8], [13, 7], [14, 7], [15, 6], [16, 6], [17, 7], [18, 7], [19, 8], [20, 8], [21, 8]], '#5c4033'),
      ...createPixelMap([[9, 9], [10, 9], [11, 9], [20, 9], [21, 9], [22, 9]], '#5c4033'),
      ...createPixelMap([[9, 10], [10, 10], [11, 10], [21, 10], [22, 10]], '#5c4033'),
      ...createPixelMap([[9, 11], [10, 11], [21, 11], [22, 11]], '#5c4033'),
      ...createPixelMap([[9, 12], [10, 12], [21, 12], [22, 12]], '#5c4033'),
      ...createPixelMap([[9, 13], [10, 13], [21, 13], [22, 13]], '#5c4033'),
      ...createPixelMap([[9, 14], [22, 14]], '#5c4033')
    }
  },
  {
    id: 'hair-curly',
    name: '卷发',
    category: '发型',
    pixels: {
      ...createPixelMap([[11, 5], [12, 4], [14, 4], [15, 3], [16, 3], [17, 4], [19, 4], [20, 5]], '#8b4513'),
      ...createPixelMap([[10, 6], [11, 6], [12, 5], [13, 5], [14, 5], [15, 4], [16, 4], [17, 5], [18, 5], [19, 5], [20, 6], [21, 6]], '#8b4513'),
      ...createPixelMap([[9, 7], [10, 7], [11, 7], [12, 6], [13, 6], [14, 6], [15, 5], [16, 5], [17, 6], [18, 6], [19, 6], [20, 7], [21, 7], [22, 7]], '#8b4513'),
      ...createPixelMap([[9, 8], [10, 8], [11, 8], [20, 8], [21, 8], [22, 8]], '#8b4513'),
      ...createPixelMap([[9, 9], [10, 9], [21, 9], [22, 9]], '#8b4513')
    }
  },
  {
    id: 'glasses-round',
    name: '圆框眼镜',
    category: '眼镜',
    pixels: {
      ...createPixelMap([[11, 13], [12, 12], [13, 12], [14, 13], [12, 14], [13, 14]], '#333333'),
      ...createPixelMap([[17, 13], [18, 12], [19, 12], [20, 13], [18, 14], [19, 14]], '#333333'),
      ...createPixelMap([[15, 13], [16, 13]], '#333333')
    }
  },
  {
    id: 'glasses-sun',
    name: '墨镜',
    category: '眼镜',
    pixels: {
      ...createPixelMap([[11, 13], [12, 12], [13, 12], [14, 13], [11, 14], [12, 14], [13, 14], [14, 14]], '#1a1a1a'),
      ...createPixelMap([[17, 13], [18, 12], [19, 12], [20, 13], [17, 14], [18, 14], [19, 14], [20, 14]], '#1a1a1a'),
      ...createPixelMap([[15, 13], [16, 13]], '#1a1a1a')
    }
  },
  {
    id: 'hat-cap',
    name: '鸭舌帽',
    category: '帽子',
    pixels: {
      ...createPixelMap([[10, 7], [11, 6], [12, 6], [13, 5], [14, 5], [15, 5], [16, 5], [17, 5], [18, 6], [19, 6], [20, 7], [21, 7]], '#e74c3c'),
      ...createPixelMap([[9, 8], [10, 8], [11, 8], [12, 7], [13, 7], [14, 6], [15, 6], [16, 6], [17, 6], [18, 7], [19, 7], [20, 8], [21, 8], [22, 8]], '#e74c3c'),
      ...createPixelMap([[8, 9], [9, 9], [10, 9], [11, 9], [20, 9], [21, 9], [22, 9], [23, 9]], '#e74c3c'),
      ...createPixelMap([[23, 10], [24, 10], [25, 10]], '#c0392b')
    }
  },
  {
    id: 'hat-beanie',
    name: '针织帽',
    category: '帽子',
    pixels: {
      ...createPixelMap([[14, 3], [15, 2], [16, 2], [17, 3]], '#3498db'),
      ...createPixelMap([[12, 5], [13, 4], [14, 4], [15, 3], [16, 3], [17, 4], [18, 4], [19, 5]], '#3498db'),
      ...createPixelMap([[10, 6], [11, 6], [12, 6], [13, 5], [14, 5], [15, 4], [16, 4], [17, 5], [18, 5], [19, 6], [20, 6], [21, 6]], '#3498db'),
      ...createPixelMap([[9, 7], [10, 7], [11, 7], [12, 7], [13, 6], [14, 6], [15, 5], [16, 5], [17, 6], [18, 6], [19, 7], [20, 7], [21, 7], [22, 7]], '#3498db'),
      ...createPixelMap([[9, 8], [10, 8], [11, 8], [12, 8], [20, 8], [21, 8], [22, 8]], '#2980b9')
    }
  },
  {
    id: 'earring-stud',
    name: '耳钉',
    category: '耳饰',
    pixels: {
      [getPixelKey(9, 15)]: '#f1c40f',
      [getPixelKey(22, 15)]: '#f1c40f'
    }
  },
  {
    id: 'earring-ring',
    name: '耳环',
    category: '耳饰',
    pixels: {
      ...createPixelMap([[8, 15], [8, 16], [9, 17], [10, 16], [10, 15]], '#f1c40f'),
      ...createPixelMap([[21, 15], [21, 16], [22, 17], [23, 16], [23, 15]], '#f1c40f')
    }
  },
  {
    id: 'mouth-smile',
    name: '微笑',
    category: '五官',
    pixels: {
      ...createPixelMap([[14, 19], [15, 20], [16, 20], [17, 19]], '#c0392b')
    }
  },
  {
    id: 'mouth-open',
    name: '张嘴',
    category: '五官',
    pixels: {
      ...createPixelMap([[14, 19], [15, 19], [16, 19], [17, 19]], '#c0392b'),
      ...createPixelMap([[14, 20], [17, 20]], '#c0392b')
    }
  },
  {
    id: 'eyes-blink',
    name: '眨眼',
    category: '五官',
    pixels: {
      ...createPixelMap([[12, 13], [13, 13]], '#333'),
      ...createPixelMap([[18, 13], [19, 13]], '#333')
    }
  }
]

export const defaultPalettes: ColorPalette[] = [
  {
    id: 'basic',
    name: '基础色板',
    colors: [
      '#000000', '#ffffff', '#ff0000', '#00ff00', '#0000ff',
      '#ffff00', '#ff00ff', '#00ffff', '#808080', '#800000',
      '#808000', '#008000', '#800080', '#008080', '#000080',
      '#ffa500', '#ffc0cb', '#a52a2a', '#ffd700', '#c0c0c0'
    ]
  },
  {
    id: 'skin',
    name: '肤色',
    colors: [
      '#ffdbac', '#f1c27d', '#e0ac69', '#c68642', '#8d5524',
      '#f5d0c5', '#e8b9a8', '#d4a395', '#b8957c', '#9c7c5d'
    ]
  },
  {
    id: 'hair',
    name: '发色',
    colors: [
      '#000000', '#2c1810', '#4a3728', '#6b4423', '#8b4513',
      '#a0522d', '#cd853f', '#daa520', '#ffd700', '#ff6347',
      '#ff69b4', '#9370db', '#4169e1', '#32cd32'
    ]
  },
  {
    id: 'pastel',
    name: '柔和色',
    colors: [
      '#ffb3ba', '#ffdfba', '#ffffba', '#baffc9', '#bae1ff',
      '#e8d5ff', '#d5e8ff', '#d5ffe8', '#ffe8d5', '#ffd5e8'
    ]
  }
]

export const themePresets: { name: string; skin: string; hair: string; clothes: string }[] = [
  { name: '暖棕系', skin: '#f1c27d', hair: '#4a3728', clothes: '#e74c3c' },
  { name: '冷蓝系', skin: '#ffdbac', hair: '#4169e1', clothes: '#3498db' },
  { name: '清新绿', skin: '#f5d0c5', hair: '#32cd32', clothes: '#2ecc71' },
  { name: '梦幻紫', skin: '#ffdbac', hair: '#9370db', clothes: '#8e44ad' },
  { name: '阳光橙', skin: '#e0ac69', hair: '#ff6347', clothes: '#e67e22' },
  { name: '经典黑', skin: '#f1c27d', hair: '#000000', clothes: '#2c3e50' }
]
