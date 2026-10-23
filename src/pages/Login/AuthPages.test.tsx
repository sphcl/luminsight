import type { ReactElement } from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { Login } from './Login'
import { Register } from '../Register/Register'

// As páginas importam o barrel de auth, que puxa o AuthProvider e inicializaria o Firebase de verdade; no CI não tem chave.
vi.mock('@/lib/firebase', () => ({ auth: {} }))

function renderAt(path: string, page: ReactElement) {
  return render(<MemoryRouter initialEntries={[path]}>{page}</MemoryRouter>)
}

describe('links entre login e cadastro', () => {
  it('login leva para o cadastro', () => {
    renderAt('/login', <Login />)

    expect(screen.getByRole('link', { name: 'Criar conta' })).toHaveAttribute('href', '/register')
  })

  it('cadastro leva para o login', () => {
    renderAt('/register', <Register />)

    expect(screen.getByRole('link', { name: 'Entrar' })).toHaveAttribute('href', '/login')
  })

  it('mantém o redirect ao trocar de tela', () => {
    renderAt('/login?redirect=%2Ftrilha', <Login />)

    expect(screen.getByRole('link', { name: 'Criar conta' })).toHaveAttribute(
      'href',
      '/register?redirect=%2Ftrilha'
    )
  })
})
