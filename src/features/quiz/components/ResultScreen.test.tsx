import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { ResultScreen, type SaveStatus } from './ResultScreen'
import { summarizeResult } from '@/features/quiz/engine/scoring'
import { buildQuestions } from '@/test/fixtures/quiz'

const questions = buildQuestions(10)

function renderResult(correctCount: number, saveStatus: SaveStatus = 'saved') {
  const answers = questions.map((question, index) => ({
    questionId: question.id,
    selectedOptionId: index < correctCount ? 'a' : 'b',
    correct: index < correctCount,
  }))

  return render(
    <MemoryRouter>
      <ResultScreen
        summary={summarizeResult(answers, questions, 120)}
        questions={questions}
        saveStatus={saveStatus}
        backTo="/modulos/modulo-01"
        onRetry={vi.fn()}
      />
    </MemoryRouter>
  )
}

describe('ResultScreen', () => {
  it('mostra aprovado com nota acima de 70', () => {
    renderResult(8)

    expect(screen.getByText('80')).toBeInTheDocument()
    expect(screen.getByText('Aprovado')).toBeInTheDocument()
  })

  it('mostra aprovado exatamente em 70', () => {
    renderResult(7)

    expect(screen.getByText('Aprovado')).toBeInTheDocument()
  })

  it('mostra reprovado com nota abaixo de 70', () => {
    renderResult(6)

    expect(screen.getByText('60')).toBeInTheDocument()
    expect(screen.getByText('Reprovado')).toBeInTheDocument()
  })

  it('lista a revisão de todas as questões', () => {
    renderResult(5)

    expect(screen.getAllByText(/^Acertou/)).toHaveLength(5)
    expect(screen.getAllByText(/^Errou/)).toHaveLength(5)
  })

  it('avisa quando o resultado não foi salvo sem esconder a nota', () => {
    renderResult(9, 'error')

    expect(screen.getByRole('alert')).toHaveTextContent('progresso pode não ter sido registrado')
    expect(screen.getByText('90')).toBeInTheDocument()
  })
})
