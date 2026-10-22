import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import themeInitSource from '../../../public/theme-init.js?raw'
import indexHtml from '../../../index.html?raw'
import {
  FONT_SCALE,
  FONT_SIZE_STORAGE_KEY,
  THEME_STORAGE_KEY,
  readStoredTheme,
} from './preferences'
import { FontSizeControl, ThemeToggle } from './PreferenceControls'
import { usePreferencesStore } from './usePreferences'

function mockMedia(queries: Record<string, boolean>) {
  const matching = new Map(Object.entries(queries))
  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    writable: true,
    value: vi.fn((query: string) => ({
      matches: matching.get(query) ?? false,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })),
  })
}

// Executo o arquivo de verdade que vai pro <head>, não uma cópia da lógica.
function runThemeInit() {
  new Function(themeInitSource)()
}

function resetDocument() {
  document.documentElement.className = ''
  document.documentElement.removeAttribute('data-font-size')
  document.documentElement.style.removeProperty('--reading-scale')
  window.localStorage.clear()
}

beforeEach(() => {
  resetDocument()
  mockMedia({})
})

afterEach(() => {
  Reflect.deleteProperty(window, 'matchMedia')
  vi.useRealTimers()
})

describe('theme-init.js (antes da primeira pintura)', () => {
  it('sem escolha salva segue o prefers-color-scheme do sistema', () => {
    mockMedia({ '(prefers-color-scheme: dark)': true })
    runThemeInit()
    expect(document.documentElement).toHaveClass('dark')

    resetDocument()
    mockMedia({ '(prefers-color-scheme: dark)': false })
    runThemeInit()
    expect(document.documentElement).not.toHaveClass('dark')
  })

  it('escolha salva sobrescreve o sistema', () => {
    mockMedia({ '(prefers-color-scheme: dark)': true })
    window.localStorage.setItem(THEME_STORAGE_KEY, 'light')

    runThemeInit()

    expect(document.documentElement).not.toHaveClass('dark')
  })

  it('valor fora do enum no storage é ignorado', () => {
    window.localStorage.setItem(THEME_STORAGE_KEY, '<script>')
    window.localStorage.setItem(FONT_SIZE_STORAGE_KEY, '999px')

    runThemeInit()

    expect(document.documentElement).not.toHaveClass('dark')
    expect(document.documentElement).not.toHaveAttribute('data-font-size')
    expect(readStoredTheme()).toBeNull()
  })

  it.each(['lg', 'xl'] as const)('aplica o tamanho %s salvo com a mesma escala do app', (size) => {
    window.localStorage.setItem(FONT_SIZE_STORAGE_KEY, size)
    runThemeInit()
    expect(document.documentElement).toHaveAttribute('data-font-size', size)
    expect(document.documentElement.style.getPropertyValue('--reading-scale')).toBe(
      // eslint-disable-next-line security/detect-object-injection -- chave restrita por union type
      String(FONT_SCALE[size])
    )
  })

  // Sem flash: o script precisa rodar antes de qualquer estilo ou do bundle, e não pode ser inline (CSP).
  it('o index.html carrega o script no head, antes do bundle, como arquivo e sem type=module', () => {
    const head = indexHtml.slice(0, indexHtml.indexOf('</head>'))
    const tag = '<script src="/theme-init.js"></script>'

    expect(head).toContain(tag)
    expect(indexHtml.indexOf(tag)).toBeLessThan(indexHtml.indexOf('type="module"'))
    expect(head.indexOf(tag)).toBeLessThan(head.search(/<link|<style/))
    expect(indexHtml).not.toMatch(/<script>(?!<\/script>)/)
  })
})

describe('alternador de tema', () => {
  beforeEach(() => {
    usePreferencesStore.setState({ theme: 'light', fontSize: 'md' })
  })

  it('troca a classe, persiste e o rótulo diz pra onde vai', async () => {
    const user = userEvent.setup()
    render(<ThemeToggle />)

    await user.click(screen.getByRole('button', { name: 'Ativar tema escuro' }))

    expect(document.documentElement).toHaveClass('dark')
    expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe('dark')
    expect(screen.getByRole('button', { name: 'Ativar tema claro' })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Ativar tema claro' }))
    expect(document.documentElement).not.toHaveClass('dark')
    expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe('light')
  })

  it('anima a troca, mas não com prefers-reduced-motion', async () => {
    const user = userEvent.setup()
    render(<ThemeToggle />)

    await user.click(screen.getByRole('button', { name: 'Ativar tema escuro' }))
    expect(document.documentElement).toHaveClass('theme-animating')

    resetDocument()
    act(() => usePreferencesStore.setState({ theme: 'light' }))
    mockMedia({ '(prefers-reduced-motion: reduce)': true })
    await user.click(screen.getByRole('button', { name: 'Ativar tema escuro' }))
    expect(document.documentElement).not.toHaveClass('theme-animating')
  })
})

describe('controle de tamanho de fonte', () => {
  beforeEach(() => {
    usePreferencesStore.setState({ theme: 'light', fontSize: 'md' })
  })

  it('tem três níveis, marca o atual e persiste a escolha', async () => {
    const user = userEvent.setup()
    render(<FontSizeControl />)

    const group = screen.getByRole('group', { name: 'Tamanho do texto' })
    expect(group.querySelectorAll('button')).toHaveLength(3)
    expect(screen.getByRole('button', { name: 'Texto normal' })).toHaveAttribute(
      'aria-pressed',
      'true'
    )

    await user.click(screen.getByRole('button', { name: 'Texto grande' }))

    expect(document.documentElement).toHaveAttribute('data-font-size', 'lg')
    expect(document.documentElement.style.getPropertyValue('--reading-scale')).toBe('1.15')
    expect(window.localStorage.getItem(FONT_SIZE_STORAGE_KEY)).toBe('lg')
    expect(screen.getByRole('button', { name: 'Texto grande' })).toHaveAttribute(
      'aria-pressed',
      'true'
    )

    await user.click(screen.getByRole('button', { name: 'Texto normal' }))
    expect(document.documentElement).not.toHaveAttribute('data-font-size')
    expect(document.documentElement.style.getPropertyValue('--reading-scale')).toBe('')
  })
})
