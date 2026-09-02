import { useParams } from 'react-router-dom'
import { PagePlaceholder } from '@/components/shared/PagePlaceholder'

export function Modulo() {
  const { moduleId } = useParams<{ moduleId: string }>()

  return (
    <PagePlaceholder
      title="Módulo"
      description={`O conteúdo do módulo "${moduleId ?? '—'}" será implementado na Fase 7.`}
      phase="Fase 7"
    />
  )
}
