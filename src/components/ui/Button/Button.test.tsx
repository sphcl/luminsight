import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Button } from './Button'

describe('Button', () => {
  it('renderiza o conteúdo passado', () => {
    render(<Button>Entrar</Button>)
    expect(screen.getByRole('button', { name: 'Entrar' })).toBeInTheDocument()
  })

  it('dispara onClick quando clicado', async () => {
    const onClick = vi.fn()
    render(<Button onClick={onClick}>Clique</Button>)

    await userEvent.click(screen.getByRole('button'))
    expect(onClick).toHaveBeenCalledOnce()
  })

  it('fica desabilitado durante o carregamento', () => {
    render(<Button isLoading>Salvando</Button>)
    expect(screen.getByRole('button')).toBeDisabled()
  })

  it('não dispara onClick quando está carregando', async () => {
    const onClick = vi.fn()
    render(
      <Button isLoading onClick={onClick}>
        Salvando
      </Button>
    )

    await userEvent.click(screen.getByRole('button'))
    expect(onClick).not.toHaveBeenCalled()
  })

  it('não dispara onClick quando desabilitado', async () => {
    const onClick = vi.fn()
    render(
      <Button disabled onClick={onClick}>
        Bloqueado
      </Button>
    )

    await userEvent.click(screen.getByRole('button'))
    expect(onClick).not.toHaveBeenCalled()
  })
})