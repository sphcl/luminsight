import type {
  SimulationDecision,
  SimulationDocument,
  SimulationScene,
} from '@/types/simulation.types'

export function buildDecision(overrides: Partial<SimulationDecision> = {}): SimulationDecision {
  return {
    prompt: 'O que você faz?',
    options: [
      { id: 'a', text: 'Opção A', isCorrect: true, feedback: 'Feedback A' },
      { id: 'b', text: 'Opção B', isCorrect: false, feedback: 'Feedback B' },
    ],
    ...overrides,
  }
}

export function buildScene(
  index: number,
  overrides: Partial<SimulationScene> = {}
): SimulationScene {
  return {
    id: `cena-0${index}`,
    order: index,
    messages: [
      { sender: 'system', content: `Contexto ${index}` },
      {
        sender: 'attacker',
        content: `Mensagem ${index}`,
        subject: `Assunto ${index}`,
        delay: 1000,
      },
    ],
    decision: buildDecision({ prompt: `Pergunta ${index}` }),
    ...overrides,
  }
}

export function buildSimulation(overrides: Partial<SimulationDocument> = {}): SimulationDocument {
  return {
    id: 'simulacao-01',
    moduleId: 'modulo-01',
    title: 'Simulação de teste',
    description: 'Descrição da simulação',
    format: 'chat',
    contact: { name: 'Contato Fictício', address: 'contato@golpe.example' },
    estimatedMinutes: 10,
    scenes: [buildScene(1), buildScene(2)],
    ...overrides,
  }
}

// Acertar encerra na hora, errar leva pra próxima cena: caminho de 1 a 3 decisões.
export function buildBranchingSimulation(): SimulationDocument {
  const branch = (index: number, nextOnWrong: string | null) =>
    buildDecision({
      prompt: `Pergunta ${index}`,
      options: [
        { id: 'a', text: 'Opção A', isCorrect: true, feedback: 'Feedback A', nextSceneId: null },
        {
          id: 'b',
          text: 'Opção B',
          isCorrect: false,
          feedback: 'Feedback B',
          nextSceneId: nextOnWrong,
        },
      ],
    })

  return buildSimulation({
    scenes: [
      buildScene(1, { decision: branch(1, 'cena-03') }),
      buildScene(2, { decision: branch(2, null) }),
      buildScene(3),
    ],
  })
}
