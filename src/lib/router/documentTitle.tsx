import { useEffect } from 'react'
import { Outlet, useLocation, useMatches } from 'react-router-dom'
import { formatDocumentTitle } from './useDocumentTitle'

interface TitleHandle {
  title?: string
}

// Raiz da árvore de rotas: aplica o title declarado no handle da rota mais funda.
export function RouteTitle() {
  const matches = useMatches()
  const { pathname } = useLocation()
  const title = [...matches]
    .reverse()
    .map((match) => (match.handle as TitleHandle | undefined)?.title)
    .find(Boolean)

  useEffect(() => {
    document.title = formatDocumentTitle(title)
  }, [title, pathname])

  return <Outlet />
}
