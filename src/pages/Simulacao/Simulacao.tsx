import { useParams } from 'react-router-dom'
import { PagePlaceholder } from '@/components/shared/PagePlaceholder'

export function Simulacao() {
  const { simulationId } = useParams<{ simulationId: string }>()

  return (
    <PagePlaceholder
      title="Simulação"
      description={`A simulação "${simulationId ?? '—'}" será implementada na Fase 9.`}
      phase="Fase 9"
    />
  )
}
