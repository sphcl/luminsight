import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Input } from './Input'

describe('Input', () => {
  it('associa o label ao campo', () => {
    render(<Input label="Email" />)
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
  })

  it('exibe a mensagem de erro', () => {
    render(<Input label="Email" error="Email inválido" />)
    expect(screen.getByRole('alert')).toHaveTextContent('Email inválido')
  })

  it('marca o campo como inválido quando há erro', () => {
    render(<Input label="Email" error="Email inválido" />)
    expect(screen.getByLabelText('Email')).toHaveAttribute('aria-invalid', 'true')
  })

  it('esconde a dica quando há erro', () => {
    render(<Input label="Senha" hint="Mínimo 8 caracteres" error="Senha fraca" />)
    expect(screen.queryByText('Mínimo 8 caracteres')).not.toBeInTheDocument()
  })

  it('aceita digitação do usuário', async () => {
    render(<Input label="Nome" />)
    const input = screen.getByLabelText('Nome')

    await userEvent.type(input, 'Sophia')
    expect(input).toHaveValue('Sophia')
  })
})