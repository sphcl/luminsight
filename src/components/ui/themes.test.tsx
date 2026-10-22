import { describe, it, expect, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Badge, Button, Card, Input, ProgressBar, Skeleton } from '@/components/ui'

// Código-fonte de todas as telas: cor fixa funciona no tema claro e some no escuro sem ninguém perceber.
const sources = import.meta.glob(['/src/**/*.tsx', '!/src/**/*.test.tsx'], {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>

// Essas imitam app real (ou são a faixa de aviso) e ficam iguais em qualquer tema de propósito.
const FIXED_ON_PURPOSE = [
  'ChatInterface.tsx',
  'EmailInterface.tsx',
  'CallInterface.tsx',
  'ContactAvatar.tsx',
  'DecisionPanel.tsx',
  'DecisionFeedback.tsx',
  'SimulationIndicator.tsx',
]

const HARDCODED_COLOR =
  /^(?:bg|text|border|ring|divide)-(?:white|black|(?:slate|gray|zinc|neutral|indigo|blue|red|green|emerald|amber|yellow)-\d{2,3})$/

// Testo só a utilidade depois do último ":" (hover:, dark:...), sem regex aninhado.
function hardcodedColors(source: string): string[] {
  return (source.match(/[\w:/.[\]-]+/g) ?? []).filter((token) =>
    HARDCODED_COLOR.test(token.split(':').pop() ?? '')
  )
}

describe('tokens de tema', () => {
  it('encontrou os arquivos das telas', () => {
    expect(Object.keys(sources).length).toBeGreaterThan(30)
  })

  it('nenhuma tela do LumInsight usa cor fixa fora dos tokens', () => {
    const offenders = Object.entries(sources)
      .filter(([path]) => !FIXED_ON_PURPOSE.some((name) => path.endsWith(name)))
      .flatMap(([path, source]) => hardcodedColors(source).map((token) => `${path}: ${token}`))
      // bg-black/50 é o véu atrás da sidebar no mobile, escuro nos dois temas de propósito.
      .filter((entry) => !entry.endsWith('bg-black'))

    expect(offenders).toEqual([])
  })
})

describe('componentes nos dois temas', () => {
  afterEach(() => {
    document.documentElement.classList.remove('dark')
  })

  it.each([false, true])('renderizam com tokens com dark=%s', (dark) => {
    document.documentElement.classList.toggle('dark', dark)

    render(
      <Card>
        <Badge variant="success">Concluído</Badge>
        <Input label="Nome" />
        <ProgressBar value={40} label="Progresso" />
        <Skeleton className="h-4" />
        <Button>Salvar</Button>
        <Button variant="secondary">Cancelar</Button>
      </Card>
    )

    expect(screen.getByRole('button', { name: 'Salvar' })).toHaveClass(
      'bg-accent',
      'text-accent-on'
    )
    expect(screen.getByRole('button', { name: 'Cancelar' })).toHaveClass(
      'border-strong',
      'text-ink'
    )
    expect(screen.getByLabelText('Nome')).toHaveClass('border-control', 'bg-surface', 'text-ink')
    expect(screen.getByRole('progressbar')).toHaveClass('h-0.5', 'bg-rule')
  })

  it('botões, inclusive o pequeno, têm alvo mínimo de 44px', () => {
    render(
      <>
        <Button size="sm">Pequeno</Button>
        <Button>Normal</Button>
      </>
    )

    for (const name of ['Pequeno', 'Normal']) {
      expect(screen.getByRole('button', { name })).toHaveClass('min-h-11')
    }
  })
})
