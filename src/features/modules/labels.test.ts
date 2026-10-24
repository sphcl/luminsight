import { describe, it, expect } from 'vitest'
import { formatModuleLabel, formatUnlockRequirement } from './labels'
import type { ModuleMissingSteps } from './engine/trail'
import { buildModule } from '@/test/fixtures/modules'

function steps(overrides: Partial<ModuleMissingSteps>, thenOrders: number[] = []) {
  return {
    kind: 'steps' as const,
    next: {
      module: buildModule({ order: 3 }),
      lessonsLeft: 0,
      quiz: 'done' as const,
      simulationPending: false,
      ...overrides,
    },
    thenModules: thenOrders.map((order) => buildModule({ order })),
  }
}

describe('formatModuleLabel', () => {
  it('junta número e título', () => {
    expect(formatModuleLabel({ order: 4, title: 'Casos Reais e Golpes Modernos' })).toBe(
      'Módulo 4 · Casos Reais e Golpes Modernos'
    )
  })
})

describe('formatUnlockRequirement', () => {
  it.each([
    ['uma lição', steps({ lessonsLeft: 1 }), 'Falta 1 lição do Módulo 3.'],
    ['só o quiz', steps({ quiz: 'pending' }), 'Falta o quiz do Módulo 3.'],
    [
      'lições e quiz',
      steps({ lessonsLeft: 2, quiz: 'pending' }),
      'Faltam 2 lições e o quiz do Módulo 3.',
    ],
    [
      'três itens',
      steps({ lessonsLeft: 1, quiz: 'pending', simulationPending: true }),
      'Faltam 1 lição, o quiz e a simulação do Módulo 3.',
    ],
    ['quiz reprovado', steps({ quiz: 'failed' }), 'Falta a nota mínima no quiz do Módulo 3 (70%).'],
    [
      'um módulo bloqueado depois',
      steps({ module: buildModule({ order: 2 }), lessonsLeft: 2, quiz: 'pending' }, [3]),
      'Faltam 2 lições e o quiz do Módulo 2, e depois o Módulo 3.',
    ],
    [
      'vários módulos bloqueados depois',
      steps({ module: buildModule({ order: 1 }), lessonsLeft: 3, quiz: 'pending' }, [2, 3]),
      'Faltam 3 lições e o quiz do Módulo 1, e depois os módulos 2 e 3.',
    ],
  ])('%s', (_, requirement, expected) => {
    expect(formatUnlockRequirement(requirement)).toBe(expected)
  })

  it('pré-requisito quebrado', () => {
    expect(formatUnlockRequirement({ kind: 'unavailable' })).toBe('Indisponível no momento.')
  })
})
