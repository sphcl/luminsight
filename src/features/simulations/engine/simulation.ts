import type {
  SimulationDecision,
  SimulationDecisionOption,
  SimulationMessage,
  SimulationScene,
} from '@/types/simulation.types'

export interface DecisionEvaluation {
  isCorrect: boolean
  feedback: string
}

export interface SimulationDecisionRecord {
  sceneId: string
  selectedOptionId: string
  isCorrect: boolean
}

export interface SimulationSummary {
  correctDecisions: number
  totalDecisions: number
  score: number
  isPerfect: boolean
  decisions: SimulationDecisionRecord[]
}

// Devolvo null pra opção que não existe na decisão, assim quem chama ignora em vez de contar como erro.
export function evaluateDecision(
  decision: SimulationDecision,
  selectedOptionId: string
): DecisionEvaluation | null {
  const option = decision.options.find((candidate) => candidate.id === selectedOptionId)
  if (!option) return null

  return { isCorrect: option.isCorrect, feedback: option.feedback }
}

export function calculateSimulationScore(decisions: SimulationDecisionRecord[]): number {
  if (decisions.length === 0) return 0

  const correct = decisions.filter((decision) => decision.isCorrect).length
  return Math.floor((correct / decisions.length) * 100)
}

// Lista vazia não conta como perfeita porque ninguém jogou nada.
export function isPerfectRun(decisions: SimulationDecisionRecord[]): boolean {
  return decisions.length > 0 && decisions.every((decision) => decision.isCorrect)
}

export function summarizeSimulation(decisions: SimulationDecisionRecord[]): SimulationSummary {
  return {
    correctDecisions: decisions.filter((decision) => decision.isCorrect).length,
    totalDecisions: decisions.length,
    score: calculateSimulationScore(decisions),
    isPerfect: isPerfectRun(decisions),
    decisions,
  }
}

export type TranscriptEntry =
  | { kind: 'message'; key: string; message: SimulationMessage }
  | { kind: 'reply'; key: string; text: string }

function findOption(
  scene: SimulationScene,
  record: SimulationDecisionRecord | undefined
): SimulationDecisionOption | undefined {
  return scene.decision.options.find((option) => option.id === record?.selectedOptionId)
}

// Junto as cenas já passadas com a atual pra conversa não sumir quando troca de cena.
export function buildTranscript(
  scenes: SimulationScene[],
  sceneIndex: number,
  visibleMessages: SimulationMessage[],
  decisions: SimulationDecisionRecord[]
): TranscriptEntry[] {
  const entries: TranscriptEntry[] = []

  scenes.slice(0, sceneIndex + 1).forEach((scene, index) => {
    const messages = index === sceneIndex ? visibleMessages : scene.messages
    messages.forEach((message, messageIndex) => {
      entries.push({ kind: 'message', key: `${scene.id}-${messageIndex}`, message })
    })

    const record = decisions.find((decision) => decision.sceneId === scene.id)
    const chosen = findOption(scene, record)
    if (chosen) entries.push({ kind: 'reply', key: `${scene.id}-reply`, text: chosen.text })
  })

  return entries
}
