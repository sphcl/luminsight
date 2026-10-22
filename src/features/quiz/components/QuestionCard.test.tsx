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
      selectedOptionIds={revealedCorrectOptionId ? ['b'] : []}
      isLocked={revealedCorrectOptionId !== null}
      revealedCorrectOptionIds={revealedCorrectOptionId ? [revealedCorrectOptionId] : null}
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

  it('multiple_answer usa checkbox, mostra cenário e avisa quantas são corretas', () => {
    render(
      <QuestionCard
        question={{
          id: 'q6',
          type: 'multiple_answer',
          prompt: 'Quais serão suas ações?',
          scenario: 'Um curso suspeito.',
          options: fourOptions,
          expectedSelections: 2,
        }}
        selectedOptionIds={['a', 'c']}
        isLocked={false}
        revealedCorrectOptionIds={null}
        onSelect={vi.fn()}
      />
    )

    const group = screen.getByRole('group', { name: 'Quais serão suas ações?' })
    expect(group).toHaveAccessibleDescription(
      'Mais de uma alternativa está correta. Marque as 2 alternativas corretas.'
    )
    expect(screen.queryAllByRole('radio')).toHaveLength(0)
    const boxes = screen.getAllByRole('checkbox')
    expect(boxes).toHaveLength(4)
    expect(boxes.filter((box) => (box as HTMLInputElement).checked)).toHaveLength(2)
    expect(screen.getByText('Um curso suspeito.')).toBeInTheDocument()
    expect(screen.getByText('Múltipla resposta')).toBeInTheDocument()
  })

  it('multiple_answer revelado marca todas as certas e a escolhida errada', () => {
    render(
      <QuestionCard
        question={{
          id: 'q6',
          type: 'multiple_answer',
          prompt: 'Quais?',
          options: fourOptions,
          expectedSelections: 2,
        }}
        selectedOptionIds={['a', 'b']}
        isLocked
        revealedCorrectOptionIds={['a', 'd']}
        onSelect={vi.fn()}
      />
    )

    expect(screen.getAllByText('Correta')).toHaveLength(2)
    expect(screen.getAllByText('Sua resposta')).toHaveLength(1)
  })
})
