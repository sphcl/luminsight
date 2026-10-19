import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { SimulationResult } from './SimulationResult'
import { summarizeSimulation } from '@/features/simulations/engine/simulation'
import { buildBranchingSimulation } from '@/test/fixtures/simulation'

describe('SimulationResult', () => {
  it('revisa só as cenas do caminho percorrido e mostra a conclusão', () => {
    const { scenes } = buildBranchingSimulation()
    const summary = summarizeSimulation([
      { sceneId: 'cena-01', selectedOptionId: 'b', isCorrect: false },
      { sceneId: 'cena-03', selectedOptionId: 'a', isCorrect: true },
    ])

    render(
      <MemoryRouter>
        <SimulationResult
          summary={summary}
          scenes={scenes}
          conclusion={[{ type: 'text', content: 'Lembre-se de verificar.' }]}
          saveStatus="saved"
          backTo="/simulacoes"
          onRetry={vi.fn()}
        />
      </MemoryRouter>
    )

    expect(screen.getByText('1/2')).toBeInTheDocument()
    expect(screen.getByText('1. Pergunta 1')).toBeInTheDocument()
    expect(screen.getByText('2. Pergunta 3')).toBeInTheDocument()
    expect(screen.queryByText(/Pergunta 2/)).not.toBeInTheDocument()
    expect(screen.queryByText(/sem resposta/)).not.toBeInTheDocument()
    expect(screen.getByText('Lembre-se de verificar.')).toBeInTheDocument()
  })
})
