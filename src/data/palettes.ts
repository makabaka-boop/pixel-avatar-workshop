import type { ColorTheme } from '../types'

export const SKIN_THEME: ColorTheme = {
  name: '肤色',
  colors: ['#FDDCB5', '#F5C5A3', '#E8AD8A', '#D4956B', '#B87850', '#8D5524', '#6B3A1F', '#4A2511']
}

export const HAIR_THEME: ColorTheme = {
  name: '发色',
  colors: ['#1A0A00', '#3B2507', '#5C3317', '#8B6914', '#C4A35A', '#E8D5A3', '#B22222', '#FF6347', '#FF69B4', '#4169E1', '#32CD32', '#9400D3', '#FFFFFF', '#C0C0C0', '#808080']
}

export const CLOTHES_THEME: ColorTheme = {
  name: '衣服色',
  colors: ['#FFFFFF', '#F5F5DC', '#FFE4B5', '#FFD700', '#FF6347', '#FF1493', '#8B008B', '#4169E1', '#000080', '#006400', '#2F4F4F', '#000000', '#808080', '#C0C0C0', '#CD853F']
}

export const EYE_THEME: ColorTheme = {
  name: '瞳色',
  colors: ['#000000', '#3B2507', '#8B6914', '#2E8B57', '#4169E1', '#6A5ACD', '#FF6347', '#C0C0C0']
}

export const THEMES: ColorTheme[] = [SKIN_THEME, HAIR_THEME, CLOTHES_THEME, EYE_THEME]
