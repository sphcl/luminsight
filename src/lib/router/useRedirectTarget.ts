import { useSearchParams } from 'react-router-dom'
import { ROUTES } from '@/constants/routes'
import { getSafeRedirectPath, REDIRECT_QUERY_PARAM } from '@/utils/security/redirect'

// Lê e valida o "?redirect=" da URL atual. Usado tanto por PublicOnlyRoute
// (decide pra onde mandar quem já está logado) quanto pelas páginas de Login
// e Register (decidem pra onde navegar depois de um onSuccess) — mesma regra
// de segurança, um único lugar que sabe validar o valor.
export function useRedirectTarget(fallback: string = ROUTES.DASHBOARD): string {
  const [searchParams] = useSearchParams()
  return getSafeRedirectPath(searchParams.get(REDIRECT_QUERY_PARAM)) ?? fallback
}
