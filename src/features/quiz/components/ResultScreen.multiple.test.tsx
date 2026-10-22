import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { ResultScreen } from './ResultScreen'
import { summarizeResult } from '@/features/quiz/engine/scoring'
import { buildMultipleAnswerQuestion } from '@/test/fixtures/quiz'

describe('ResultScreen com multiple_answer', () => {
  it('mostra a seleção parcial como erro e lista todas as corretas', () => {
    const questions = [buildMultipleAnswerQuestion({ correctOptionIds: ['a', 'd'] })]
    const summary = summarizeResult(
      [{ questionId: 'q1', selectedOptionIds: ['a'], correct: true }],
      questions,
      30
    )

    render(
      <MemoryRouter>
        <ResultScreen
          summary={summary}
          questions={questions}
          saveStatus="saved"
          backTo="/modulos/modulo-05"
          onRetry={vi.fn()}
        />
      </MemoryRouter>
    )

    expect(screen.getByText(/Errou: sua resposta foi "Alternativa A"/)).toBeInTheDocument()
    expect(
      screen.getByText('Resposta correta: "Alternativa A / Alternativa D"')
    ).toBeInTheDocument()
  })
})
