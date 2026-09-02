import { useParams } from 'react-router-dom'
import { PagePlaceholder } from '@/components/shared/PagePlaceholder'

export function Licao() {
  const { moduleId, lessonId } = useParams<{ moduleId: string; lessonId: string }>()

  return (
    <PagePlaceholder
      title="Lição"
      description={`O conteúdo da lição "${lessonId ?? '—'}" (módulo "${moduleId ?? '—'}") será implementado na Fase 7.`}
      phase="Fase 7"
    />
  )
}
