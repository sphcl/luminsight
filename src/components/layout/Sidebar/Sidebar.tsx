import type { ComponentType, SVGProps } from 'react'
import { NavLink } from 'react-router-dom'
import { cn } from '@/utils/helpers/classnames'
import { ROUTES } from '@/constants/routes'
import { DashboardIcon, TrilhaIcon, SimulacoesIcon, PerfilIcon } from '../icons'

interface SidebarProps {
  isOpen: boolean
  onNavigate: () => void
}

interface NavItem {
  to: string
  label: string
  Icon: ComponentType<SVGProps<SVGSVGElement>>
}

const NAV_ITEMS: NavItem[] = [
  { to: ROUTES.DASHBOARD, label: 'Dashboard', Icon: DashboardIcon },
  { to: ROUTES.TRILHA, label: 'Trilha', Icon: TrilhaIcon },
  { to: ROUTES.SIMULACOES, label: 'Simulações', Icon: SimulacoesIcon },
  { to: ROUTES.PERFIL, label: 'Perfil', Icon: PerfilIcon },
]

export function Sidebar({ isOpen, onNavigate }: SidebarProps) {
  return (
    <>
      {/* Overlay escurecido no mobile: clicar fora fecha a sidebar. No
          desktop a sidebar é estática (md:static), então isso nunca aparece. */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={onNavigate}
          aria-hidden="true"
        />
      )}

      <nav
        aria-label="Navegação principal"
        className={cn(
          'fixed inset-y-0 left-0 z-40 w-64 -translate-x-full border-r border-rule bg-canvas p-4',
          'transition-transform duration-200 motion-reduce:transition-none md:static md:z-0 md:w-56 md:translate-x-0',
          isOpen && 'translate-x-0'
        )}
      >
        <ul className="flex flex-col gap-1">
          {NAV_ITEMS.map(({ to, label, Icon }) => (
            <li key={to}>
              <NavLink
                to={to}
                onClick={onNavigate}
                className={({ isActive }) =>
                  cn(
                    // Selecionado é régua de 3px à esquerda, nunca preenchimento inteiro.
                    'flex min-h-11 items-center gap-3 border-l-[3px] border-transparent px-3 text-sm font-medium text-ink-soft',
                    'transition-colors hover:bg-surface-muted hover:text-ink motion-reduce:transition-none',
                    isActive && 'border-accent text-ink'
                  )
                }
              >
                <Icon className="h-5 w-5" aria-hidden="true" />
                {label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </>
  )
}
