import { useEffect } from 'react'
import { create } from 'zustand'
import {
  applyFontSize,
  applyTheme,
  getSystemTheme,
  prefersReducedMotion,
  readStoredFontSize,
  readStoredTheme,
  storeFontSize,
  storeTheme,
  type FontSize,
  type Theme,
} from './preferences'

const THEME_TRANSITION_MS = 250

interface PreferencesState {
  theme: Theme
  fontSize: FontSize
  toggleTheme: () => void
  setFontSize: (fontSize: FontSize) => void
}

// Começo do que o theme-init.js já aplicou no <html>, pra React e página nunca discordarem.
function initialTheme(): Theme {
  return document.documentElement.classList.contains('dark') ? 'dark' : 'light'
}

function initialFontSize(): FontSize {
  return readStoredFontSize() ?? 'md'
}

export const usePreferencesStore = create<PreferencesState>((set, get) => ({
  theme: initialTheme(),
  fontSize: initialFontSize(),
  toggleTheme: () => {
    const next: Theme = get().theme === 'dark' ? 'light' : 'dark'
    const root = document.documentElement
    if (!prefersReducedMotion()) {
      root.classList.add('theme-animating')
      window.setTimeout(() => root.classList.remove('theme-animating'), THEME_TRANSITION_MS)
    }
    applyTheme(next)
    storeTheme(next)
    set({ theme: next })
  },
  setFontSize: (fontSize) => {
    applyFontSize(fontSize)
    storeFontSize(fontSize)
    set({ fontSize })
  },
}))

// Sem escolha manual salva, acompanho o sistema se a pessoa trocar o tema do aparelho com a aba aberta.
export function useFollowSystemTheme() {
  useEffect(() => {
    const media = window.matchMedia?.('(prefers-color-scheme: dark)')
    if (!media) return

    function handleChange() {
      if (readStoredTheme()) return
      const theme = getSystemTheme()
      applyTheme(theme)
      usePreferencesStore.setState({ theme })
    }

    media.addEventListener('change', handleChange)
    return () => media.removeEventListener('change', handleChange)
  }, [])
}
