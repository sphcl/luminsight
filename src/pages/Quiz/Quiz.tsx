import { useParams } from 'react-router-dom'
import { PagePlaceholder } from '@/components/shared/PagePlaceholder'

export function Quiz() {
  const { moduleId } = useParams<{ moduleId: string }>()

  return (
    <PagePlaceholder
      title="Quiz"
      description={`O quiz do módulo "${moduleId ?? '—'}" será implementado na Fase 8.`}
      phase="Fase 8"
    />
  )
}
