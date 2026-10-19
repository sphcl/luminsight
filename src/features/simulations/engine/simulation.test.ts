import { describe, it, expect } from 'vitest'
import {
  buildTranscript,
  calculateSimulationScore,
  evaluateDecision,
  getDecisionCountRange,
  getFirstName,
  isBranchingSimulation,
  isPerfectRun,
  personalizeSimulation,
  resolveNextSceneId,
  summarizeSimulation,
  type SimulationDecisionRecord,
} from './simulation'
import {
  buildBranchingSimulation,
  buildDecision,
  buildScene,
  buildSimulation,
} from '@/test/fixtures/simulation'

function record(sceneId: string, isCorrect: boolean): SimulationDecisionRecord {
  return { sceneId, selectedOptionId: isCorrect ? 'a' : 'b', isCorrect }
}

const allCorrect = [record('cena-01', true), record('cena-02', true), record('cena-03', true)]
const oneWrong = [record('cena-01', true), record('cena-02', false), record('cena-03', true)]
const allWrong = [record('cena-01', false), record('cena-02', false), record('cena-03', false)]

describe('evaluateDecision', () => {
  it('retorna acerto com o feedback da opção correta', () => {
    expect(evaluateDecision(buildDecision(), 'a')).toEqual({
      isCorrect: true,
      feedback: 'Feedback A',
    })
  })

  it('retorna erro com o feedback da opção escolhida', () => {
    expect(evaluateDecision(buildDecision(), 'b')).toEqual({
      isCorrect: false,
      feedback: 'Feedback B',
    })
  })

  it('retorna null para opção que não existe', () => {
    expect(evaluateDecision(buildDecision(), 'z')).toBeNull()
  })
})

describe('calculateSimulationScore', () => {
  it('todas corretas', () => {
    expect(calculateSimulationScore(allCorrect)).toBe(100)
  })

  it('uma errada', () => {
    expect(calculateSimulationScore(oneWrong)).toBe(66)
  })

  it('todas erradas', () => {
    expect(calculateSimulationScore(allWrong)).toBe(0)
  })

  it('lista vazia', () => {
    expect(calculateSimulationScore([])).toBe(0)
  })
})

describe('isPerfectRun', () => {
  it('todas corretas', () => {
    expect(isPerfectRun(allCorrect)).toBe(true)
  })

  it('uma errada', () => {
    expect(isPerfectRun(oneWrong)).toBe(false)
  })

  it('todas erradas', () => {
    expect(isPerfectRun(allWrong)).toBe(false)
  })

  it('lista vazia', () => {
    expect(isPerfectRun([])).toBe(false)
  })
})

describe('summarizeSimulation', () => {
  it('junta acertos, total, nota e execução perfeita', () => {
    expect(summarizeSimulation(oneWrong)).toEqual({
      correctDecisions: 2,
      totalDecisions: 3,
      score: 66,
      isPerfect: false,
      decisions: oneWrong,
    })
  })
})

describe('buildTranscript', () => {
  it('mantém as cenas anteriores com a resposta escolhida e só as mensagens visíveis da atual', () => {
    const { scenes } = buildSimulation()
    const current = scenes[1]!
    const entries = buildTranscript(scenes.slice(0, 2), current.messages.slice(0, 1), [
      record('cena-01', true),
    ])

    expect(entries.map((entry) => entry.kind)).toEqual(['message', 'message', 'reply', 'message'])
    expect(entries[2]).toMatchObject({ kind: 'reply', text: 'Opção A' })
  })

  it('mostra só as cenas do caminho percorrido, pulando as que ficaram de fora', () => {
    const { scenes } = buildBranchingSimulation()
    const visited = [scenes[0]!, scenes[2]!]
    const entries = buildTranscript(visited, visited[1]!.messages, [record('cena-01', false)])

    const keys = entries.map((entry) => entry.key)
    expect(keys.some((key) => key.startsWith('cena-02'))).toBe(false)
    expect(keys).toContain('cena-03-0')
  })
})

describe('resolveNextSceneId', () => {
  it('segue a ordem das cenas quando a opção não define o próximo passo', () => {
    const { scenes } = buildSimulation({ scenes: [buildScene(1), buildScene(2)] })
    expect(resolveNextSceneId(scenes, scenes[0]!, 'a')).toBe('cena-02')
    expect(resolveNextSceneId(scenes, scenes[1]!, 'a')).toBeNull()
  })

  it('respeita nextSceneId e trata null como fim', () => {
    const { scenes } = buildBranchingSimulation()
    expect(resolveNextSceneId(scenes, scenes[0]!, 'b')).toBe('cena-03')
    expect(resolveNextSceneId(scenes, scenes[0]!, 'a')).toBeNull()
  })
})

describe('isBranchingSimulation', () => {
  it('diferencia simulação linear de ramificada', () => {
    expect(isBranchingSimulation(buildSimulation().scenes)).toBe(false)
    expect(isBranchingSimulation(buildBranchingSimulation().scenes)).toBe(true)
  })
})

describe('getDecisionCountRange', () => {
  it('conta todas as cenas quando é linear', () => {
    expect(getDecisionCountRange(buildSimulation().scenes)).toEqual({ min: 2, max: 2 })
  })

  it('devolve o menor e o maior caminho quando ramifica', () => {
    expect(getDecisionCountRange(buildBranchingSimulation().scenes)).toEqual({ min: 1, max: 2 })
  })
})

describe('getFirstName', () => {
  it('usa só o primeiro nome', () => {
    expect(getFirstName('  Ana Maria Souza ')).toBe('Ana')
  })

  it('cai no fallback sem nome', () => {
    expect(getFirstName(null)).toBe('Usuário')
    expect(getFirstName('   ')).toBe('Usuário')
  })
})

describe('personalizeSimulation', () => {
  it('troca o marcador pelo nome em todas as mensagens sem mexer no resto', () => {
    const simulation = buildSimulation({
      scenes: [
        buildScene(1, {
          messages: [{ sender: 'attacker', content: 'Olá, {nome}. Tudo bem, {nome}?' }],
        }),
      ],
    })

    const personalized = personalizeSimulation(simulation, '<b>Ana</b>')

    expect(personalized.scenes[0]?.messages[0]?.content).toBe(
      'Olá, <b>Ana</b>. Tudo bem, <b>Ana</b>?'
    )
    expect(simulation.scenes[0]?.messages[0]?.content).toBe('Olá, {nome}. Tudo bem, {nome}?')
  })
})
