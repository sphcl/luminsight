import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { QuestionCard } from './QuestionCard'
import type { PublicQuestion } from '@/features/quiz/types/public-question'

const fourOptions = [
  { id: 'a', text: 'Alternativa A' },
  { id: 'b', text: 'Alternativa B' },
  { id: 'c', text: 'Alternativa C' },
  { id: 'd', text: 'Alternativa D' },
]

function renderCard(question: PublicQuestion, revealedCorrectOptionId: string | null = null) {
  return render(
    <QuestionCard
      question={question}
      selectedOptionId={revealedCorrectOptionId ? 'b' : null}
      isLocked={revealedCorrectOptionId !== null}
      revealedCorrectOptionId={revealedCorrectOptionId}
      onSelect={vi.fn()}
    />
  )
}

describe('QuestionCard', () => {
  it('renderiza multiple_choice com quatro alternativas num grupo com legenda', () => {
    renderCard({ id: 'q1', type: 'multiple_choice', prompt: 'Qual?', options: fourOptions })

    expect(screen.getByRole('group', { name: 'Qual?' })).toBeInTheDocument()
    expect(screen.getAllByRole('radio')).toHaveLength(4)
  })

  it('renderiza true_false com duas alternativas', () => {
    renderCard({
      id: 'q2',
      type: 'true_false',
      prompt: 'É verdade?',
      options: [
        { id: 'a', text: 'Verdadeiro' },
        { id: 'b', text: 'Falso' },
      ],
    })

    expect(screen.getAllByRole('radio')).toHaveLength(2)
    expect(screen.getByRole('radio', { name: 'Verdadeiro' })).toBeInTheDocument()
  })

  it('renderiza scenario com o texto do cenário antes da pergunta', () => {
    renderCard({
      id: 'q3',
      type: 'scenario',
      scenario: 'Você recebe uma mensagem estranha.',
      prompt: 'O que fazer?',
      options: fourOptions,
    })

    const scenario = screen.getByText('Você recebe uma mensagem estranha.')
    const prompt = screen.getByText('O que fazer?')
    expect(scenario.compareDocumentPosition(prompt) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
  })

  it('renderiza visual com a imagem e o alt descritivo', () => {
    renderCard({
      id: 'q4',
      type: 'visual',
      imageSrc: '/images/email-falso.png',
      imageAlt: 'Email com remetente falso pedindo senha',
      prompt: 'Esse email é confiável?',
      options: fourOptions,
    })

    expect(
      screen.getByRole('img', { name: 'Email com remetente falso pedindo senha' })
    ).toHaveAttribute('src', '/images/email-falso.png')
  })

  it('mostra placeholder acessível quando a imagem ainda está pendente', () => {
    renderCard({
      id: 'q5',
      type: 'visual',
      imageSrc: '[PENDENTE] Lorem ipsum.',
      imageAlt: 'Descrição da imagem',
      prompt: 'Pergunta',
      options: fourOptions,
    })

    expect(screen.getByRole('img', { name: 'Descrição da imagem' }).tagName).toBe('DIV')
  })

  it('não revela a alternativa correta no DOM antes da confirmação', () => {
    const { container } = renderCard({
      id: 'q1',
      type: 'multiple_choice',
      prompt: 'Qual?',
      options: fourOptions,
    })

    expect(container.innerHTML).not.toMatch(/correct|correta/i)
    const labelClasses = screen
      .getAllByRole('radio')
      .map((radio) => radio.closest('label')?.className)
    expect(new Set(labelClasses).size).toBe(1)
  })

  it('marca a correta e a errada só depois da confirmação', () => {
    renderCard({ id: 'q1', type: 'multiple_choice', prompt: 'Qual?', options: fourOptions }, 'a')

    expect(screen.getByText('Correta')).toBeInTheDocument()
    expect(screen.getByText('Sua resposta')).toBeInTheDocument()
    screen.getAllByRole('radio').forEach((radio) => expect(radio).toBeDisabled())
  })
})
