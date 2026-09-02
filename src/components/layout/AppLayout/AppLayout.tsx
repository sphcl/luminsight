import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Header } from '../Header/Header'
import { Sidebar } from '../Sidebar/Sidebar'

const MAIN_CONTENT_ID = 'main-content'

// Layout das páginas autenticadas: Header fixo no topo, Sidebar lateral
// (some para fora da tela no mobile, controlada por isSidebarOpen) e o
// conteúdo da rota atual dentro de <main>.
export function AppLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-surface-muted">
      {/* Skip-link: só some do fluxo por padrão (sr-only) e reaparece com
          foco de teclado (focus:not-sr-only), permitindo pular Header +
          Sidebar direto para o conteúdo principal. */}
      <a
        href={`#${MAIN_CONTENT_ID}`}
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-primary-700 focus:shadow-card"
      >
        Pular para o conteúdo
      </a>

      <div className="flex min-h-screen flex-col">
        <Header onToggleSidebar={() => setIsSidebarOpen((open) => !open)} />

        <div className="flex flex-1">
          <Sidebar isOpen={isSidebarOpen} onNavigate={() => setIsSidebarOpen(false)} />

          <main id={MAIN_CONTENT_ID} role="main" className="flex-1 p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  )
}
