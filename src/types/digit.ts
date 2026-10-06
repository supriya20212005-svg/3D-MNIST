export type Digit = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9
export type MaterialName = 'glass' | 'chrome' | 'candy'
export type DigitPoint = [number, number]
export type DigitStroke = DigitPoint[]

export interface ViewerSettings {
  thickness: number
  scale: number
  smoothness: number
  material: MaterialName
  wireframe: boolean
  lighting: 'studio' | 'warm' | 'neon'
}

export const DIGITS: Digit[] = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
