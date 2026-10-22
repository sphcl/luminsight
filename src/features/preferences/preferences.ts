// Única exceção ao "nada em localStorage": preferência de interface, sem PII nem token (docs/seguranca.md).
export const THEME_STORAGE_KEY = 'luminsight:theme'
export const FONT_SIZE_STORAGE_KEY = 'luminsight:font-size'

export type Theme = 'light' | 'dark'
export type FontSize = 'md' | 'lg' | 'xl'

export const FONT_SIZES: FontSize[] = ['md', 'lg', 'xl']

// Escala da fonte raiz do site inteiro; o theme-init.js aplica os mesmos valores antes da primeira pintura.
export const FONT_SCALE: Record<FontSize, number> = { md: 1, lg: 1.15, xl: 1.3 }

const THEMES: Theme[] = ['light', 'dark']

function readStorage(key: string): string | null {
  try {
    return window.localStorage.getItem(key)
  } catch {
    return null
  }
}

function writeStorage(key: string, value: string) {
  try {
    window.localStorage.setItem(key, value)
  } catch {
    // Navegação privada ou storage cheio: a escolha vale só pra esta aba, sem quebrar nada.
  }
}

// Valor de fora (storage editável pelo usuário) só passa se estiver no enum.
export function readStoredTheme(): Theme | null {
  const value = readStorage(THEME_STORAGE_KEY)
  return THEMES.find((theme) => theme === value) ?? null
}

export function readStoredFontSize(): FontSize | null {
  const value = readStorage(FONT_SIZE_STORAGE_KEY)
  return FONT_SIZES.find((size) => size === value) ?? null
}

export function getSystemTheme(): Theme {
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function prefersReducedMotion(): boolean {
  return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
}

export function applyTheme(theme: Theme) {
  document.documentElement.classList.toggle('dark', theme === 'dark')
}

export function applyFontSize(fontSize: FontSize) {
  const root = document.documentElement
  if (fontSize === 'md') {
    root.removeAttribute('data-font-size')
    root.style.removeProperty('--reading-scale')
    return
  }
  root.setAttribute('data-font-size', fontSize)
  // eslint-disable-next-line security/detect-object-injection -- chave restrita por union type
  root.style.setProperty('--reading-scale', String(FONT_SCALE[fontSize]))
}

export function storeTheme(theme: Theme) {
  writeStorage(THEME_STORAGE_KEY, theme)
}

export function storeFontSize(fontSize: FontSize) {
  writeStorage(FONT_SIZE_STORAGE_KEY, fontSize)
}
