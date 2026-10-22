import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FirebaseError } from 'firebase/app'
import { LoginForm } from './LoginForm'
import { RegisterForm } from './RegisterForm'
import { loginWithEmail, loginWithGoogle, registerWithEmail } from '@/services/auth.service'

vi.mock('@/services/auth.service', () => ({
  loginWithEmail: vi.fn(),
  loginWithGoogle: vi.fn(),
  registerWithEmail: vi.fn(),
  logout: vi.fn(),
}))

beforeEach(() => {
  vi.spyOn(console, 'error').mockImplementation(() => undefined)
})

afterEach(() => {
  vi.restoreAllMocks()
  vi.mocked(loginWithEmail).mockReset()
  vi.mocked(registerWithEmail).mockReset()
  vi.mocked(loginWithGoogle).mockReset()
})

async function submitLogin(email: string, password: string) {
  const user = userEvent.setup()
  render(<LoginForm onSuccess={vi.fn()} />)
  await user.type(screen.getByLabelText('Email'), email)
  await user.type(screen.getByLabelText('Senha'), password)
  await user.click(screen.getByRole('button', { name: 'Entrar' }))
}

describe('LoginForm', () => {
  it('não chama o Firebase quando o email é inválido', async () => {
    await submitLogin('isso-nao-e-email', 'qualquer')

    expect(await screen.findByText('Informe um email válido.')).toBeInTheDocument()
    expect(loginWithEmail).not.toHaveBeenCalled()
  })

  // Se as duas mensagens um dia diferirem, dá pra descobrir quais emails têm conta.
  it('mostra a mesma mensagem para usuário inexistente e senha errada', async () => {
    vi.mocked(loginWithEmail).mockRejectedValueOnce(new FirebaseError('auth/user-not-found', 'x'))
    await submitLogin('ninguem@example.com', 'senha-qualquer')
    const unknownUser = (await screen.findByRole('alert')).textContent
    document.body.innerHTML = ''

    vi.mocked(loginWithEmail).mockRejectedValueOnce(new FirebaseError('auth/wrong-password', 'x'))
    await submitLogin('ana@example.com', 'senha-errada')
    const wrongPassword = (await screen.findByRole('alert')).textContent

    expect(unknownUser).toBe(wrongPassword)
    expect(unknownUser).not.toMatch(/auth\//)
  })

  it('chama onSuccess depois de entrar', async () => {
    vi.mocked(loginWithEmail).mockResolvedValueOnce({} as never)
    const onSuccess = vi.fn()
    const user = userEvent.setup()
    render(<LoginForm onSuccess={onSuccess} />)

    await user.type(screen.getByLabelText('Email'), 'ana@example.com')
    await user.type(screen.getByLabelText('Senha'), 'senha-certa')
    await user.click(screen.getByRole('button', { name: 'Entrar' }))

    expect(loginWithEmail).toHaveBeenCalledWith('ana@example.com', 'senha-certa')
    expect(onSuccess).toHaveBeenCalledOnce()
  })

  it('login com Google cancelado mostra mensagem e não chama onSuccess', async () => {
    vi.mocked(loginWithGoogle).mockRejectedValueOnce(
      new FirebaseError('auth/popup-closed-by-user', 'x')
    )
    const onSuccess = vi.fn()
    const user = userEvent.setup()
    render(<LoginForm onSuccess={onSuccess} />)

    await user.click(screen.getByRole('button', { name: 'Entrar com Google' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('Login cancelado.')
    expect(onSuccess).not.toHaveBeenCalled()
  })
})

async function fillRegister(values: {
  name: string
  email: string
  password: string
  confirm: string
}) {
  const user = userEvent.setup()
  await user.type(screen.getByLabelText('Nome'), values.name)
  await user.type(screen.getByLabelText('Email'), values.email)
  await user.type(screen.getByLabelText('Senha'), values.password)
  await user.type(screen.getByLabelText('Confirmar senha'), values.confirm)
  await user.click(screen.getByRole('button', { name: 'Criar conta' }))
}

describe('RegisterForm', () => {
  it.each([
    ['nome com markup', { name: '<b>Ana</b>' }, 'O nome não pode conter números ou símbolos.'],
    ['nome com dígito', { name: 'Ana 2' }, 'O nome não pode conter números ou símbolos.'],
    [
      'senha curta',
      { password: '1234567', confirm: '1234567' },
      'A senha deve ter pelo menos 8 caracteres.',
    ],
    ['confirmação diferente', { confirm: 'outra-senha-123' }, 'As senhas não coincidem.'],
  ])('barra %s antes de chamar o Firebase', async (_, overrides, message) => {
    render(<RegisterForm />)

    await fillRegister({
      name: 'Ana Souza',
      email: 'ana@example.com',
      password: 'senha-segura-123',
      confirm: 'senha-segura-123',
      ...overrides,
    })

    expect(await screen.findByText(message)).toBeInTheDocument()
    expect(registerWithEmail).not.toHaveBeenCalled()
  })

  it('envia o nome sem espaço nas pontas e chama onSuccess', async () => {
    vi.mocked(registerWithEmail).mockResolvedValueOnce({} as never)
    const onSuccess = vi.fn()
    render(<RegisterForm onSuccess={onSuccess} />)

    await fillRegister({
      name: '  Ana Souza  ',
      email: 'ana@example.com',
      password: 'senha-segura-123',
      confirm: 'senha-segura-123',
    })

    expect(registerWithEmail).toHaveBeenCalledWith(
      'Ana Souza',
      'ana@example.com',
      'senha-segura-123'
    )
    expect(onSuccess).toHaveBeenCalledOnce()
  })

  it('avisa email já cadastrado sem vazar o código do Firebase', async () => {
    vi.mocked(registerWithEmail).mockRejectedValueOnce(
      new FirebaseError('auth/email-already-in-use', 'x')
    )
    render(<RegisterForm />)

    await fillRegister({
      name: 'Ana Souza',
      email: 'ana@example.com',
      password: 'senha-segura-123',
      confirm: 'senha-segura-123',
    })

    expect(await screen.findByRole('alert')).toHaveTextContent('Este email já está cadastrado.')
    expect(screen.queryByText(/auth\//)).not.toBeInTheDocument()
  })
})
