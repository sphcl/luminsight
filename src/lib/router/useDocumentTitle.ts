import { useEffect } from 'react'

const SITE_NAME = 'LumInsight'

export function formatDocumentTitle(title?: string): string {
  return title ? `${title} · ${SITE_NAME}` : SITE_NAME
}

// Página com nome dinâmico (módulo, lição) sobrescreve o título da rota quando os dados chegam.
export function useDocumentTitle(title: string | undefined) {
  useEffect(() => {
    if (title) document.title = formatDocumentTitle(title)
  }, [title])
}
