import { useEffect, useId, useRef, useState } from 'react'
import { MoonIcon, SunIcon } from '@/components/layout/icons'
import { cn } from '@/utils/helpers/classnames'
import { FONT_SIZES, type FontSize } from './preferences'
import { usePreferencesStore } from './usePreferences'

const controlClass =
  'inline-flex h-11 min-w-11 items-center justify-center text-ink-soft transition-colors hover:bg-surface-muted hover:text-ink motion-reduce:transition-none'

// O rótulo diz pra onde a pessoa vai, não onde está: é a ação que o botão executa.
export function ThemeToggle({ className }: { className?: string }) {
  const theme = usePreferencesStore((state) => state.theme)
  const toggleTheme = usePreferencesStore((state) => state.toggleTheme)
  const isDark = theme === 'dark'

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? 'Ativar tema claro' : 'Ativar tema escuro'}
      className={cn(controlClass, className)}
    >
      {isDark ? (
        <SunIcon className="h-5 w-5" aria-hidden="true" />
      ) : (
        <MoonIcon className="h-5 w-5" aria-hidden="true" />
      )}
    </button>
  )
}

const FONT_SIZE_LABELS: Record<FontSize, { label: string; glyph: string }> = {
  md: { label: 'Texto normal', glyph: 'text-[13px]' },
  lg: { label: 'Texto grande', glyph: 'text-[16px]' },
  xl: { label: 'Texto muito grande', glyph: 'text-[19px]' },
}

export function FontSizeControl({ className }: { className?: string }) {
  const fontSize = usePreferencesStore((state) => state.fontSize)
  const setFontSize = usePreferencesStore((state) => state.setFontSize)

  return (
    <div role="group" aria-label="Tamanho do texto" className={cn('flex', className)}>
      {FONT_SIZES.map((size) => {
        // eslint-disable-next-line security/detect-object-injection -- chave restrita por union type
        const { label, glyph } = FONT_SIZE_LABELS[size]
        const isActive = fontSize === size
        return (
          <button
            key={size}
            type="button"
            aria-label={label}
            aria-pressed={isActive}
            onClick={() => setFontSize(size)}
            className={cn(
              controlClass,
              'font-serif',
              glyph,
              isActive && 'border-b-2 border-accent text-accent hover:text-accent'
            )}
          >
            <span aria-hidden="true">A</span>
          </button>
        )
      })}
    </div>
  )
}

// Versão compacta pro celular: um botão só que abre os três tamanhos, sem esconder o tema junto.
export function FontSizeMenu({ className }: { className?: string }) {
  const [isOpen, setIsOpen] = useState(false)
  const panelId = useId()
  const containerRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!isOpen) return

    function handlePointerDown(event: PointerEvent) {
      if (!containerRef.current?.contains(event.target as Node)) setIsOpen(false)
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== 'Escape') return
      setIsOpen(false)
      buttonRef.current?.focus()
    }

    document.addEventListener('pointerdown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen])

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      <button
        ref={buttonRef}
        type="button"
        aria-label="Tamanho do texto"
        aria-expanded={isOpen}
        aria-controls={panelId}
        onClick={() => setIsOpen((open) => !open)}
        className={cn(controlClass, 'font-serif', isOpen && 'text-accent')}
      >
        <span aria-hidden="true">Aa</span>
      </button>
      {isOpen && (
        <div
          id={panelId}
          className="absolute right-0 top-full z-50 border border-rule bg-surface p-1 shadow-sm"
        >
          <FontSizeControl />
        </div>
      )}
    </div>
  )
}
