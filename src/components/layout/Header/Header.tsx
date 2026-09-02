import { Button } from '@/components/ui'
import { useAuth } from '@/hooks/useAuth'
import { useAuthActions } from '@/features/auth/hooks/useAuthActions'
import { MenuIcon } from '../icons'

interface HeaderProps {
  onToggleSidebar: () => void
}

export function Header({ onToggleSidebar }: HeaderProps) {
  const { user, userDocument } = useAuth()
  const { logout, isLoading: isLoggingOut } = useAuthActions()

  const displayName = userDocument?.displayName ?? user?.displayName ?? 'Usuário'
  const initial = displayName.trim().charAt(0).toUpperCase() || '?'

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-surface-border bg-surface px-4">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onToggleSidebar}
          className="rounded-lg p-2 text-slate-600 hover:bg-surface-muted md:hidden"
          aria-label="Abrir menu de navegação"
        >
          <MenuIcon className="h-5 w-5" aria-hidden="true" />
        </button>

        <span className="text-lg font-extrabold text-slate-900">LumInsight</span>
      </div>

      <div className="flex items-center gap-3">
        {user?.photoURL ? (
          <img
            src={user.photoURL}
            alt={displayName}
            className="h-9 w-9 rounded-full object-cover"
            // Evita vazar a URL da página atual para o CDN de avatar do Google
            // via cabeçalho Referer quando a imagem é carregada.
            referrerPolicy="no-referrer"
          />
        ) : (
          <span
            aria-hidden="true"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-100 text-sm font-semibold text-primary-700"
          >
            {initial}
          </span>
        )}

        <span className="hidden text-sm font-medium text-slate-700 sm:inline">{displayName}</span>

        <Button variant="ghost" size="sm" isLoading={isLoggingOut} onClick={() => void logout()}>
          Sair
        </Button>
      </div>
    </header>
  )
}
