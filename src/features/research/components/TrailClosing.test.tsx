import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TrailClosing } from './TrailClosing'
import { saveTrailFeedback } from '@/services/research.service'

vi.mock('@/services/research.service', () => ({ saveTrailFeedback: vi.fn() }))

type User = ReturnType<typeof userEvent.setup>

async function answerRequired(user: User) {
  await user.click(screen.getByRole('radio', { name: 'Avançado' }))
  await user.click(screen.getByRole('radio', { name: 'Baixa' }))
  await user.click(screen.getByRole('radio', { name: 'Gostei muito' }))
  await user.click(screen.getByRole('checkbox', { name: 'Simulações' }))
}

describe('TrailClosing', () => {
  beforeEach(() => {
    vi.mocked(saveTrailFeedback).mockReset()
    vi.mocked(saveTrailFeedback).mockResolvedValue()
  })

  it('repete as mesmas perguntas do onboarding no pós-teste', () => {
    render(<TrailClosing uid="u1" onSkip={vi.fn()} />)

    expect(
      screen.getByRole('group', { name: 'Qual seu nível de conhecimento sobre segurança digital?' })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('group', {
        name: 'Na sua opinião, qual a chance de você cair em um golpe digital?',
      })
    ).toBeInTheDocument()
  })

  it('"nada em especial" desmarca as outras, e marcar outra desmarca ela', async () => {
    const user = userEvent.setup()
    render(<TrailClosing uid="u1" onSkip={vi.fn()} />)
    const lessons = screen.getByRole('checkbox', { name: 'Lições' })
    const quizzes = screen.getByRole('checkbox', { name: 'Quizzes' })
    const nothing = screen.getByRole('checkbox', { name: 'Nada em especial' })

    await user.click(lessons)
    await user.click(quizzes)
    await user.click(nothing)
    expect(nothing).toBeChecked()
    expect(lessons).not.toBeChecked()
    expect(quizzes).not.toBeChecked()

    await user.click(lessons)
    expect(nothing).not.toBeChecked()
    expect(lessons).toBeChecked()
  })

  it('só envia com as respostas obrigatórias, e o comentário é opcional', async () => {
    const user = userEvent.setup()
    render(<TrailClosing uid="u1" onSkip={vi.fn()} />)
    const send = screen.getByRole('button', { name: 'Enviar respostas' })
    expect(send).toBeDisabled()

    await answerRequired(user)
    await user.click(send)

    expect(saveTrailFeedback).toHaveBeenCalledWith('u1', {
      securityKnowledge: 'avancado',
      riskPerception: 'baixa',
      satisfaction: 'gostei_muito',
      mostUseful: ['simulacoes'],
      comment: '',
    })
    expect(await screen.findByRole('status')).toHaveTextContent('Agradecemos suas respostas!')
  })

  it('o campo de comentário não passa de 500 caracteres', () => {
    render(<TrailClosing uid="u1" onSkip={vi.fn()} />)

    expect(screen.getByRole('textbox', { name: /comentário/ })).toHaveAttribute('maxLength', '500')
  })

  it('pular não grava nada', async () => {
    const onSkip = vi.fn()
    const user = userEvent.setup()
    render(<TrailClosing uid="u1" onSkip={onSkip} />)

    await user.click(screen.getByRole('button', { name: 'Pular' }))

    expect(onSkip).toHaveBeenCalledOnce()
    expect(saveTrailFeedback).not.toHaveBeenCalled()
  })
})
