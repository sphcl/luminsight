import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { serverTimestamp } from 'firebase/firestore'
import { FirebaseError } from 'firebase/app'
import { Onboarding } from './Onboarding'
import { useAuth } from '@/hooks/useAuth'
import { completeOnboarding } from '@/services/user.service'
import { useAuthStore } from '@/store/auth.store'
import { TEST_USER } from '@/test/fixtures/modules'
import type { OnboardingProfile, UserDocument } from '@/types/user.types'

vi.mock('@/hooks/useAuth')
vi.mock('@/services/user.service', () => ({ completeOnboarding: vi.fn() }))

const userDocument = { onboardingCompleted: false } as UserDocument

const PROFILE: OnboardingProfile = {
  securityKnowledge: 'intermediario',
  scamExperience: 'prefiro_nao_responder',
  motivation: 'proteger_familia',
}

function renderOnboarding() {
  return render(
    <MemoryRouter initialEntries={['/onboarding']}>
      <Routes>
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/dashboard" element={<p>Página do dashboard</p>} />
      </Routes>
    </MemoryRouter>
  )
}

type User = ReturnType<typeof userEvent.setup>

async function acceptResearch(user: User) {
  await user.click(screen.getByRole('checkbox', { name: 'Tenho 18 anos ou mais' }))
  await user.click(screen.getByRole('checkbox', { name: 'Aceito participar da pesquisa' }))
}

async function answerAll(user: User, { withRisk = false } = {}) {
  await user.click(screen.getByRole('button', { name: 'Continuar' }))
  await user.click(screen.getByRole('radio', { name: 'Intermediário' }))
  await user.click(screen.getByRole('button', { name: 'Continuar' }))
  if (withRisk) {
    await user.click(screen.getByRole('radio', { name: 'Alta' }))
    await user.click(screen.getByRole('button', { name: 'Continuar' }))
  }
  await user.click(screen.getByRole('radio', { name: 'Prefiro não responder' }))
  await user.click(screen.getByRole('button', { name: 'Continuar' }))
  await user.click(screen.getByRole('radio', { name: 'Proteger a família' }))
}

describe('Onboarding', () => {
  beforeEach(() => {
    vi.mocked(useAuth).mockReturnValue({
      user: TEST_USER,
      userDocument,
      isInitializing: false,
      isAuthenticated: true,
      hasCompletedOnboarding: false,
    })
    vi.mocked(completeOnboarding).mockReset()
    useAuthStore.setState({ userDocument })
  })

  it('começa pelo aviso da pesquisa, antes de qualquer pergunta', () => {
    renderOnboarding()

    expect(screen.getByRole('heading', { name: 'Antes de começar' })).toBeInTheDocument()
    expect(screen.getByText(/Trabalho de Conclusão de Curso/)).toBeInTheDocument()
    expect(screen.getByText(/usa o site inteiro do mesmo jeito/)).toBeInTheDocument()
    expect(screen.getByText('Passo 1 de 4')).toBeInTheDocument()
    expect(screen.queryByRole('radio')).not.toBeInTheDocument()
  })

  it('caixas começam desmarcadas e o aceite só destrava com a declaração de 18 anos', async () => {
    const user = userEvent.setup()
    renderOnboarding()

    const adult = screen.getByRole('checkbox', { name: 'Tenho 18 anos ou mais' })
    const accept = screen.getByRole('checkbox', { name: 'Aceito participar da pesquisa' })
    expect(adult).not.toBeChecked()
    expect(accept).not.toBeChecked()
    expect(accept).toBeDisabled()

    await user.click(adult)
    await user.click(accept)
    expect(accept).toBeChecked()

    await user.click(adult)
    expect(accept).not.toBeChecked()
    expect(accept).toBeDisabled()
  })

  it('só deixa continuar depois de responder o passo atual', async () => {
    const user = userEvent.setup()
    renderOnboarding()
    await user.click(screen.getByRole('button', { name: 'Continuar' }))

    const continueButton = screen.getByRole('button', { name: 'Continuar' })
    expect(continueButton).toBeDisabled()

    await user.click(screen.getByRole('radio', { name: 'Iniciante' }))
    expect(continueButton).toBeEnabled()
  })

  it('quem não aceitou não vê a pergunta de percepção de risco', async () => {
    vi.mocked(completeOnboarding).mockResolvedValue({
      onboardingProfile: PROFILE,
      researchConsent: {
        accepted: false,
        isAdult: false,
        decidedAt: serverTimestamp(),
        version: 'onboarding-v2',
      },
    })
    const user = userEvent.setup()
    renderOnboarding()

    await answerAll(user)
    expect(screen.queryByText(/chance de você cair/)).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Concluir' }))

    expect(completeOnboarding).toHaveBeenCalledWith(TEST_USER.uid, PROFILE, {
      isAdult: false,
      accepted: false,
    })
  })

  it('quem aceitou responde a percepção de risco e ela vai junto do consentimento', async () => {
    vi.mocked(completeOnboarding).mockResolvedValue({
      onboardingProfile: PROFILE,
      researchConsent: {
        accepted: true,
        isAdult: true,
        decidedAt: serverTimestamp(),
        version: 'onboarding-v2',
      },
      riskBaseline: { riskPerception: 'alta', collectedAfterUse: false },
    })
    const user = userEvent.setup()
    renderOnboarding()

    await acceptResearch(user)
    await answerAll(user, { withRisk: true })
    await user.click(screen.getByRole('button', { name: 'Concluir' }))

    expect(completeOnboarding).toHaveBeenCalledWith(TEST_USER.uid, PROFILE, {
      isAdult: true,
      accepted: true,
      riskPerception: 'alta',
    })
    expect(useAuthStore.getState().userDocument).toMatchObject({
      onboardingCompleted: true,
      onboardingProfile: PROFILE,
      researchConsent: { accepted: true },
    })
    expect(await screen.findByText('Página do dashboard')).toBeInTheDocument()
  })

  it('a escala de percepção de risco não tem opção do meio', async () => {
    const user = userEvent.setup()
    renderOnboarding()
    await acceptResearch(user)
    await user.click(screen.getByRole('button', { name: 'Continuar' }))
    await user.click(screen.getByRole('radio', { name: 'Iniciante' }))
    await user.click(screen.getByRole('button', { name: 'Continuar' }))

    expect(
      screen.getAllByRole('radio').map((radio) => radio.closest('label')?.textContent)
    ).toEqual(['Muito baixa', 'Baixa', 'Alta', 'Muito alta'])
  })

  it('só conclui com todas as perguntas respondidas', async () => {
    const user = userEvent.setup()
    renderOnboarding()
    await user.click(screen.getByRole('button', { name: 'Continuar' }))

    await user.click(screen.getByRole('radio', { name: 'Iniciante' }))
    await user.click(screen.getByRole('button', { name: 'Continuar' }))
    await user.click(screen.getByRole('radio', { name: 'Não' }))
    await user.click(screen.getByRole('button', { name: 'Continuar' }))

    const finishButton = screen.getByRole('button', { name: 'Concluir' })
    expect(finishButton).toBeDisabled()
    await user.click(finishButton)
    expect(completeOnboarding).not.toHaveBeenCalled()

    await user.click(screen.getByRole('radio', { name: 'Curiosidade' }))
    expect(finishButton).toBeEnabled()
  })

  it('mantém as respostas ao voltar um passo', async () => {
    const user = userEvent.setup()
    renderOnboarding()
    await user.click(screen.getByRole('button', { name: 'Continuar' }))

    await user.click(screen.getByRole('radio', { name: 'Avançado' }))
    await user.click(screen.getByRole('button', { name: 'Continuar' }))
    await user.click(screen.getByRole('button', { name: 'Voltar' }))

    expect(screen.getByRole('radio', { name: 'Avançado' })).toBeChecked()
  })

  it('falha ao gravar mostra uma frase só, mantém as respostas e registra o tipo no console', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
    vi.mocked(completeOnboarding).mockRejectedValue(new FirebaseError('permission-denied', 'x'))
    const user = userEvent.setup()
    renderOnboarding()

    await answerAll(user)
    await user.click(screen.getByRole('button', { name: 'Concluir' }))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Não conseguimos salvar suas respostas agora. Elas continuam aqui; tente concluir de novo.'
    )
    expect(screen.getByRole('radio', { name: 'Proteger a família' })).toBeChecked()
    expect(consoleError).toHaveBeenCalledWith(
      '[pesquisa] onboarding com consentimento não gravado',
      {
        tipo: 'recusa_do_banco',
        codigo: 'permission-denied',
      }
    )
    expect(screen.queryByText('Página do dashboard')).not.toBeInTheDocument()
    vi.restoreAllMocks()
  })

  it('erro de validação aparece com a mesma frase pra quem usa, mas outro tipo no console', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
    const { z } = await import('zod')
    const zodError = z
      .object({ riskPerception: z.enum(['alta']) })
      .safeParse({ riskPerception: 'media' }).error
    vi.mocked(completeOnboarding).mockRejectedValue(zodError)
    const user = userEvent.setup()
    renderOnboarding()

    await answerAll(user)
    await user.click(screen.getByRole('button', { name: 'Concluir' }))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Não conseguimos salvar suas respostas agora.'
    )
    expect(consoleError).toHaveBeenCalledWith(
      '[pesquisa] onboarding com consentimento não gravado',
      {
        tipo: 'validacao',
        codigo: 'riskPerception:invalid_value',
      }
    )
    vi.restoreAllMocks()
  })
})
