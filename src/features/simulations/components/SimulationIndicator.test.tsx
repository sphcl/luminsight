import { describe, it, expect, vi, afterEach } from 'vitest'
import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { SimulationIndicator, SimulationIndicatorProvider } from './SimulationIndicator'

afterEach(() => {
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

const reserved = () =>
  document.documentElement.style.getPropertyValue('--simulation-indicator-height')

// O jsdom não calcula layout: simulo a altura medida do aviso e guardo o callback do ResizeObserver.
function fakeLayout(heights: { full: number; collapsed: number }) {
  const observers = new Set<() => void>()
  vi.stubGlobal(
    'ResizeObserver',
    class {
      constructor(private callback: () => void) {}
      observe() {
        observers.add(this.callback)
      }
      disconnect() {
        observers.delete(this.callback)
      }
    }
  )
  vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (
    this: HTMLElement
  ) {
    const isFull = this.textContent?.includes('Nada aqui') ?? false
    return { height: isFull ? heights.full : heights.collapsed } as DOMRect
  })
  return { resize: () => observers.forEach((callback) => callback()) }
}

// Imita a sessão trocando de fase: cada fase monta o seu próprio aviso.
function TwoPhases() {
  const [phase, setPhase] = useState<'intro' | 'running'>('intro')
  return (
    <SimulationIndicatorProvider>
      <button type="button" onClick={() => setPhase('running')}>
        Avançar
      </button>
      {phase === 'intro' ? (
        <SimulationIndicator key="intro" />
      ) : (
        <SimulationIndicator key="running" />
      )}
    </SimulationIndicatorProvider>
  )
}

describe('SimulationIndicator', () => {
  it('recolhe numa tarja que continua no rodapé dizendo que é simulação, e expande de novo', async () => {
    const user = userEvent.setup()
    render(<SimulationIndicator />)

    await user.click(screen.getByRole('button', { name: 'Recolher aviso de simulação' }))

    const banner = screen.getByRole('note', { name: 'Aviso de simulação' })
    expect(banner).toHaveClass('fixed', 'bottom-0', 'inset-x-0')
    expect(banner).toHaveTextContent('Simulação')
    expect(banner).not.toHaveTextContent('Nada aqui é uma comunicação real')

    await user.click(screen.getByRole('button', { name: 'Expandir aviso de simulação' }))
    expect(screen.getByRole('note')).toHaveTextContent('Nada aqui é uma comunicação real')
  })

  it('continua recolhido quando a simulação muda de fase', async () => {
    const user = userEvent.setup()
    render(<TwoPhases />)

    await user.click(screen.getByRole('button', { name: 'Recolher aviso de simulação' }))
    await user.click(screen.getByRole('button', { name: 'Avançar' }))

    expect(screen.getByRole('button', { name: 'Expandir aviso de simulação' })).toBeInTheDocument()
  })

  it('simulação nova começa com o aviso inteiro e nada vai pro localStorage', async () => {
    const setItem = vi.spyOn(Storage.prototype, 'setItem')
    const user = userEvent.setup()
    const { unmount } = render(<TwoPhases />)
    await user.click(screen.getByRole('button', { name: 'Recolher aviso de simulação' }))
    unmount()

    render(<TwoPhases />)

    expect(screen.getByRole('note')).toHaveTextContent('Nada aqui é uma comunicação real')
    expect(setItem).not.toHaveBeenCalled()
  })

  it('reserva no rodapé a altura medida do aviso e acompanha recolher, expandir e mudar de fonte', async () => {
    const layout = { full: 231, collapsed: 44 }
    const { resize } = fakeLayout(layout)
    const user = userEvent.setup()
    const { unmount } = render(<SimulationIndicator />)

    expect(reserved()).toBe('231px')

    await user.click(screen.getByRole('button', { name: 'Recolher aviso de simulação' }))
    expect(reserved()).toBe('44px')

    await user.click(screen.getByRole('button', { name: 'Expandir aviso de simulação' }))
    expect(reserved()).toBe('231px')

    layout.full = 300
    act(() => resize())
    expect(reserved()).toBe('300px')

    unmount()
    expect(reserved()).toBe('')
  })
})
