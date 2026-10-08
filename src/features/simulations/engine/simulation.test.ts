import { describe, it, expect } from 'vitest'
import {
  buildTranscript,
  calculateSimulationScore,
  evaluateDecision,
  isPerfectRun,
  summarizeSimulation,
  type SimulationDecisionRecord,
} from './simulation'
import { buildDecision, buildSimulation } from '@/test/fixtures/simulation'

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
    const entries = buildTranscript(scenes, 1, current.messages.slice(0, 1), [
      record('cena-01', true),
    ])

    expect(entries.map((entry) => entry.kind)).toEqual(['message', 'message', 'reply', 'message'])
    expect(entries[2]).toMatchObject({ kind: 'reply', text: 'Opção A' })
  })
})
