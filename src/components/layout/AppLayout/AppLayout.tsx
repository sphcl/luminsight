import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { LateConsentGate } from '@/features/research/components/LateConsentGate'
import { useAuth } from '@/hooks/useAuth'
import { Header } from '../Header/Header'
import { Sidebar } from '../Sidebar/Sidebar'

const MAIN_CONTENT_ID = 'main-content'

// Layout das páginas autenticadas: Header fixo no topo, Sidebar lateral
// (some para fora da tela no mobile, controlada por isSidebarOpen) e o
// conteúdo da rota atual dentro de <main>.
export function AppLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const { userDocument } = useAuth()
  // Em memória de propósito: recarregar a página traz o aviso de volta, e a conta segue sem decisão.
  const [hasDeferredConsent, setHasDeferredConsent] = useState(false)
  // Só conta antiga chega aqui sem o campo: quem passou pelo onboarding novo já decidiu lá.
  const needsLateConsent =
    userDocument !== null && !userDocument.researchConsent && !hasDeferredConsent

  return (
    <div className="min-h-screen bg-canvas">
      {/* Skip-link: só some do fluxo por padrão (sr-only) e reaparece com
          foco de teclado (focus:not-sr-only), permitindo pular Header +
          Sidebar direto para o conteúdo principal. */}
      <a
        href={`#${MAIN_CONTENT_ID}`}
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:bg-surface focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-accent"
      >
        Pular para o conteúdo
      </a>

      <div className="flex min-h-screen flex-col">
        <Header onToggleSidebar={() => setIsSidebarOpen((open) => !open)} />

        <div className="flex flex-1">
          <Sidebar isOpen={isSidebarOpen} onNavigate={() => setIsSidebarOpen(false)} />

          <main
            id={MAIN_CONTENT_ID}
            role="main"
            tabIndex={-1}
            className="min-w-0 flex-1 px-4 py-8 sm:px-8 md:px-12"
          >
            {needsLateConsent ? (
              <LateConsentGate onDecideLater={() => setHasDeferredConsent(true)} />
            ) : (
              <Outlet />
            )}
          </main>
        </div>
      </div>
    </div>
  )
}
