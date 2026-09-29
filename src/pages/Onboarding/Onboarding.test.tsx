import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Onboarding } from './Onboarding'
import { useAuth } from '@/hooks/useAuth'
import { completeOnboarding } from '@/services/user.service'
import { useAuthStore } from '@/store/auth.store'
import { TEST_USER } from '@/test/fixtures/modules'
import type { UserDocument } from '@/types/user.types'

vi.mock('@/hooks/useAuth')
vi.mock('@/services/user.service', () => ({ completeOnboarding: vi.fn() }))

const userDocument = { onboardingCompleted: false } as UserDocument

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

  it('só deixa continuar depois de responder o passo atual', async () => {
    const user = userEvent.setup()
    render(<Onboarding />)

    const continueButton = screen.getByRole('button', { name: 'Continuar' })
    expect(continueButton).toBeDisabled()

    await user.click(screen.getByRole('radio', { name: /Sei o básico/ }))
    expect(continueButton).toBeEnabled()
  })

  it('percorre os passos e conclui gravando as respostas', async () => {
    const profile = {
      securityKnowledge: 'basico' as const,
      scamExperience: 'quase' as const,
      learningGoals: ['phishing' as const, 'senhas' as const],
    }
    vi.mocked(completeOnboarding).mockResolvedValue(profile)
    const user = userEvent.setup()
    render(<Onboarding />)

    await user.click(screen.getByRole('radio', { name: /Sei o básico/ }))
    await user.click(screen.getByRole('button', { name: 'Continuar' }))

    await user.click(screen.getByRole('radio', { name: /Quase caí/ }))
    await user.click(screen.getByRole('button', { name: 'Continuar' }))

    const finishButton = screen.getByRole('button', { name: 'Concluir' })
    expect(finishButton).toBeDisabled()
    await user.click(screen.getByRole('checkbox', { name: /emails e links falsos/ }))
    await user.click(screen.getByRole('checkbox', { name: /senhas seguras/ }))
    await user.click(finishButton)

    expect(completeOnboarding).toHaveBeenCalledWith(TEST_USER.uid, profile)
    expect(useAuthStore.getState().userDocument).toMatchObject({
      onboardingCompleted: true,
      onboardingProfile: profile,
    })
  })

  it('mantém as respostas ao voltar um passo', async () => {
    const user = userEvent.setup()
    render(<Onboarding />)

    await user.click(screen.getByRole('radio', { name: /Sei o básico/ }))
    await user.click(screen.getByRole('button', { name: 'Continuar' }))
    await user.click(screen.getByRole('button', { name: 'Voltar' }))

    expect(screen.getByRole('radio', { name: /Sei o básico/ })).toBeChecked()
  })

  it('mostra mensagem genérica quando a gravação falha', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    vi.mocked(completeOnboarding).mockRejectedValue(new Error('permission-denied'))
    const user = userEvent.setup()
    render(<Onboarding />)

    await user.click(screen.getByRole('radio', { name: /Sei o básico/ }))
    await user.click(screen.getByRole('button', { name: 'Continuar' }))
    await user.click(screen.getByRole('radio', { name: 'Não' }))
    await user.click(screen.getByRole('button', { name: 'Continuar' }))
    await user.click(screen.getByRole('checkbox', { name: /senhas seguras/ }))
    await user.click(screen.getByRole('button', { name: 'Concluir' }))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Não foi possível salvar suas respostas'
    )
    expect(screen.queryByText(/permission-denied/)).not.toBeInTheDocument()
    vi.restoreAllMocks()
  })
})
