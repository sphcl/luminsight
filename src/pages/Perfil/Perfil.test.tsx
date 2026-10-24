import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Timestamp } from 'firebase/firestore'
import { Perfil } from './Perfil'
import { useAuth } from '@/hooks/useAuth'
import { getModules } from '@/services/modules.service'
import { getUserProgress } from '@/services/progress.service'
import { updateDisplayName } from '@/services/user.service'
import { useAuthStore } from '@/store/auth.store'
import { TEST_USER, buildProgress, buildTrail } from '@/test/fixtures/modules'
import type { UserDocument } from '@/types/user.types'

vi.mock('@/hooks/useAuth')
vi.mock('@/services/modules.service', () => ({ getModules: vi.fn() }))
vi.mock('@/services/progress.service', () => ({ getUserProgress: vi.fn() }))
vi.mock('@/services/user.service', () => ({ updateDisplayName: vi.fn() }))
vi.mock('@/services/auth.service', () => ({ logout: vi.fn() }))

const userDocument = {
  displayName: 'Ana Maria',
  email: 'ana@example.com',
  photoURL: null,
  createdAt: Timestamp.fromDate(new Date(2026, 2, 15)),
  role: 'user',
  onboardingCompleted: true,
  onboardingProfile: {
    securityKnowledge: 'iniciante',
    scamExperience: 'sim',
    motivation: 'curiosidade',
  },
} as UserDocument

describe('Perfil', () => {
  beforeEach(() => {
    vi.mocked(useAuth).mockReturnValue({
      user: TEST_USER,
      userDocument,
      isInitializing: false,
      isAuthenticated: true,
      hasCompletedOnboarding: true,
    })
    vi.mocked(getModules).mockResolvedValue(buildTrail())
    vi.mocked(getUserProgress).mockResolvedValue({})
    useAuthStore.setState({ userDocument })
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('mostra os dados da conta', () => {
    render(<Perfil />)

    expect(screen.getAllByText('Ana Maria').length).toBeGreaterThan(0)
    expect(screen.getByText('ana@example.com')).toBeInTheDocument()
    expect(screen.getByText('15 de março de 2026')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Sair da conta' })).toBeInTheDocument()
  })

  it('não exibe a resposta sobre golpe do onboarding', () => {
    render(<Perfil />)

    expect(screen.queryByText(/golpe/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/^sim$/i)).not.toBeInTheDocument()
  })

  it('valida o nome antes de salvar', async () => {
    const user = userEvent.setup()
    render(<Perfil />)

    const input = screen.getByLabelText('Nome')
    await user.clear(input)
    await user.type(input, 'Ana <script>')
    await user.click(screen.getByRole('button', { name: 'Salvar nome' }))

    expect(screen.getByRole('alert')).toHaveTextContent(
      'O nome não pode conter números ou símbolos.'
    )
    expect(updateDisplayName).not.toHaveBeenCalled()
  })

  it('envia só o displayName e atualiza o nome na tela', async () => {
    vi.mocked(updateDisplayName).mockResolvedValue('Ana Souza')
    const user = userEvent.setup()
    render(<Perfil />)

    const input = screen.getByLabelText('Nome')
    await user.clear(input)
    await user.type(input, '  Ana Souza ')
    await user.click(screen.getByRole('button', { name: 'Salvar nome' }))

    expect(updateDisplayName).toHaveBeenCalledTimes(1)
    expect(updateDisplayName).toHaveBeenCalledWith(TEST_USER.uid, { displayName: 'Ana Souza' })
    expect(useAuthStore.getState().userDocument).toEqual({
      ...userDocument,
      displayName: 'Ana Souza',
    })
    expect(await screen.findByRole('status')).toHaveTextContent('Nome atualizado.')
  })

  it('mostra o histórico de quizzes com melhor nota e tentativas', async () => {
    vi.mocked(getUserProgress).mockResolvedValue({
      'modulo-01': buildProgress({ quizBestScore: 80, quizAttempts: 3 }),
      'modulo-02': buildProgress({ lessonsCompleted: ['licao-01'] }),
    })
    render(<Perfil />)

    const table = await screen.findByRole('table')
    const rows = within(table).getAllByRole('row')
    expect(rows).toHaveLength(2)
    expect(within(rows[1] as HTMLElement).getByText('1. Módulo 1')).toBeInTheDocument()
    expect(within(rows[1] as HTMLElement).getByText('80')).toBeInTheDocument()
    expect(within(rows[1] as HTMLElement).getByText('3')).toBeInTheDocument()
  })

  it('a tabela rola dentro de uma região com rótulo que o teclado alcança', async () => {
    vi.mocked(getUserProgress).mockResolvedValue({
      'modulo-01': buildProgress({ quizBestScore: 80, quizAttempts: 3 }),
    })
    render(<Perfil />)

    const region = await screen.findByRole('region', { name: 'Tabela do histórico de quizzes' })
    expect(region).toContainElement(screen.getByRole('table'))
    expect(region).toHaveAttribute('tabindex', '0')
  })

  it('avisa quando ainda não fez nenhum quiz', async () => {
    render(<Perfil />)

    expect(await screen.findByText('Você ainda não fez nenhum quiz.')).toBeInTheDocument()
  })
})
