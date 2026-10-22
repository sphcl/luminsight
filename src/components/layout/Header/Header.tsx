import { Link, useLocation } from 'react-router-dom'
import { Button } from '@/components/ui'
import { ROUTES } from '@/constants/routes'
import { useAuth } from '@/hooks/useAuth'
import { useAuthActions } from '@/features/auth/hooks/useAuthActions'
import { FontSizeControl, ThemeToggle } from '@/features/preferences/PreferenceControls'
import { cn } from '@/utils/helpers/classnames'
import { MenuIcon } from '../icons'

interface HeaderProps {
  // Só as telas com sidebar passam isso; sem ele o botão de menu nem aparece.
  onToggleSidebar?: () => void
}

const navLinkClass =
  'inline-flex min-h-11 items-center px-3 text-sm font-medium text-ink-soft transition-colors hover:bg-surface-muted hover:text-ink motion-reduce:transition-none'

// Header único do site inteiro (painel, home e login), pra disposição não mudar ao trocar de tela.
export function Header({ onToggleSidebar }: HeaderProps) {
  const { user, userDocument, isAuthenticated } = useAuth()
  const { logout, isLoading: isLoggingOut } = useAuthActions()
  const { pathname } = useLocation()
  const isOnAuthPage = pathname === ROUTES.LOGIN || pathname === ROUTES.REGISTER

  const displayName = userDocument?.displayName ?? user?.displayName ?? 'Usuário'
  const initial = displayName.trim().charAt(0).toUpperCase() || '?'

  return (
    <header className="flex h-16 shrink-0 items-center justify-between gap-2 border-b border-rule bg-canvas px-4 sm:px-8">
      <div className="flex items-center gap-2">
        {onToggleSidebar && (
          <button
            type="button"
            onClick={onToggleSidebar}
            className="-ml-2 inline-flex h-11 w-11 items-center justify-center text-ink-soft hover:bg-surface-muted md:hidden"
            aria-label="Abrir menu de navegação"
          >
            <MenuIcon className="h-5 w-5" aria-hidden="true" />
          </button>
        )}

        {/* O nome acessível começa pelo texto visível (WCAG 2.5.3) e diz pra onde o link leva. */}
        <Link
          to={ROUTES.HOME}
          aria-label="LumInsight, página inicial"
          className="inline-flex min-h-11 items-center font-serif text-2xl font-medium tracking-[-0.02em] text-ink transition-colors hover:text-accent motion-reduce:transition-none"
        >
          LumInsight
        </Link>
      </div>

      <div className="flex items-center gap-1">
        <Link to={ROUTES.HOME} className={navLinkClass}>
          Home
        </Link>
        {isAuthenticated && (
          <Link to={ROUTES.DASHBOARD} className={navLinkClass}>
            Painel
          </Link>
        )}
        <FontSizeControl />
        <ThemeToggle />
        {isAuthenticated ? (
          <>
            <Link
              to={ROUTES.PERFIL}
              aria-label={`Perfil de ${displayName}`}
              className="ml-2 flex min-h-11 items-center gap-2 rounded-full pr-1 transition-colors hover:bg-surface-muted motion-reduce:transition-none sm:pr-3"
            >
              {user?.photoURL ? (
                <img
                  src={user.photoURL}
                  alt=""
                  className="h-11 w-11 rounded-full object-cover"
                  // Evita vazar a URL da página atual para o CDN de avatar do Google
                  // via cabeçalho Referer quando a imagem é carregada.
                  referrerPolicy="no-referrer"
                />
              ) : (
                <span
                  aria-hidden="true"
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-rule font-serif text-lg text-ink"
                >
                  {initial}
                </span>
              )}
              <span className="hidden text-sm font-medium text-ink-soft sm:inline">
                {displayName}
              </span>
            </Link>

            <Button
              variant="ghost"
              size="sm"
              isLoading={isLoggingOut}
              onClick={() => void logout()}
            >
              Sair
            </Button>
          </>
        ) : (
          !isOnAuthPage && (
            <Link to={ROUTES.LOGIN} className={cn(navLinkClass, 'text-accent hover:text-accent')}>
              Entrar
            </Link>
          )
        )}
      </div>
    </header>
  )
}
