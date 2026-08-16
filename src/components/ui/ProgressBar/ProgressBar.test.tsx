import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ProgressBar } from './ProgressBar'

describe('ProgressBar', () => {
  it('calcula a porcentagem corretamente', () => {
    render(<ProgressBar value={50} max={100} label="Progresso" />)
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '50')
  })

  it('limita valores acima do máximo em 100%', () => {
    render(<ProgressBar value={150} max={100} label="Progresso" />)
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '100')
  })

  it('limita valores negativos em 0%', () => {
    render(<ProgressBar value={-10} max={100} label="Progresso" />)
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '0')
  })

  it('não quebra quando max é zero', () => {
    render(<ProgressBar value={10} max={0} label="Progresso" />)
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '10')
  })

  it('exibe a porcentagem quando solicitado', () => {
    render(<ProgressBar value={75} showPercentage label="Progresso" />)
    expect(screen.getByText('75%')).toBeInTheDocument()
  })
})