import { createContext, useContext, useLayoutEffect, useRef, useState, type ReactNode } from 'react'

type CollapseState = [boolean, (collapsed: boolean) => void]

const CollapseContext = createContext<CollapseState | null>(null)

// Fica só em memória e por simulação: a sessão é remontada a cada simulação, então o aviso sempre volta inteiro.
export function SimulationIndicatorProvider({ children }: { children: ReactNode }) {
  const state = useState(false)
  return <CollapseContext.Provider value={state}>{children}</CollapseContext.Provider>
}

const INDICATOR_HEIGHT_VAR = '--simulation-indicator-height'

// Mais de um aviso pode estar montado ao mesmo tempo na troca de fase; reservo o maior.
const reservedHeights = new Map<object, number>()

function applyReservation() {
  const height = Math.max(0, ...reservedHeights.values())
  const root = document.documentElement.style
  if (height > 0) root.setProperty(INDICATOR_HEIGHT_VAR, `${height}px`)
  else root.removeProperty(INDICATOR_HEIGHT_VAR)
}

// O body reserva a altura medida no rodapé (index.css), senão o aviso cobre o fim da página na fonte grande.
function useReservedHeight(isCollapsed: boolean) {
  const ref = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    const element = ref.current
    if (!element) return
    const key = {}
    let isActive = true
    const update = () => {
      if (!isActive) return
      reservedHeights.set(key, element.getBoundingClientRect().height)
      applyReservation()
    }

    update()
    const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(update)
    observer?.observe(element)
    return () => {
      isActive = false
      observer?.disconnect()
      reservedHeights.delete(key)
      applyReservation()
    }
  }, [isCollapsed])

  return ref
}

const bannerClass =
  'fixed inset-x-0 bottom-0 z-40 flex items-center justify-center gap-2 border-t-2 border-amber-600 bg-amber-100 px-4 text-center text-slate-900'

const tagClass =
  'shrink-0 bg-amber-800 px-2 py-0.5 text-xs font-extrabold uppercase tracking-wide text-white'

// Fixed e não sticky pra nenhum scroll, de página ou de container, conseguir tirar o aviso da tela.
export function SimulationIndicator() {
  const shared = useContext(CollapseContext)
  const local = useState(false)
  const [isCollapsed, setIsCollapsed] = shared ?? local
  const ref = useReservedHeight(isCollapsed)

  if (isCollapsed) {
    return (
      // Recolhido continua atravessando o rodapé inteiro e dizendo que é simulação, só ocupa menos.
      <div ref={ref} role="note" aria-label="Aviso de simulação" className={bannerClass}>
        <button
          type="button"
          onClick={() => setIsCollapsed(false)}
          aria-label="Expandir aviso de simulação"
          className="flex min-h-7 w-full items-center justify-center gap-2 text-xs"
        >
          <span className={tagClass}>Simulação</span>
          <span>Contatos e mensagens fictícios</span>
        </button>
      </div>
    )
  }

  return (
    <div
      ref={ref}
      role="note"
      aria-label="Aviso de simulação"
      // Cores fixas de propósito: a faixa tem que ser igual e inequívoca em qualquer tema (contraste em docs/seguranca.md).
      className={`${bannerClass} min-h-12 py-2 text-sm`}
    >
      <span className={tagClass}>Simulação</span>
      <span>
        Treino do LumInsight com contatos e mensagens fictícios. Nada aqui é uma comunicação real.
      </span>
      <button
        type="button"
        onClick={() => setIsCollapsed(true)}
        aria-label="Recolher aviso de simulação"
        className="inline-flex h-11 w-11 shrink-0 items-center justify-center text-lg text-slate-900 hover:bg-amber-200"
      >
        <span aria-hidden="true">×</span>
      </button>
    </div>
  )
}
