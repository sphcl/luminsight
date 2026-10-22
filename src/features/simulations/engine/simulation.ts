import type {
  SimulationDecision,
  SimulationDecisionOption,
  SimulationDocument,
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

export function isBranchingSimulation(scenes: SimulationScene[]): boolean {
  return scenes.some((scene) =>
    scene.decision.options.some((option) => option.nextSceneId !== undefined)
  )
}

// Opção sem nextSceneId segue a ordem das cenas, e null encerra a simulação.
export function resolveNextSceneId(
  scenes: SimulationScene[],
  scene: SimulationScene,
  selectedOptionId: string
): string | null {
  const option = scene.decision.options.find((candidate) => candidate.id === selectedOptionId)
  if (option?.nextSceneId !== undefined) return option.nextSceneId

  const index = scenes.findIndex((candidate) => candidate.id === scene.id)
  return scenes[index + 1]?.id ?? null
}

// Uso pra tela de introdução dizer quantas decisões a pessoa vai tomar quando o caminho varia.
export function getDecisionCountRange(scenes: SimulationScene[]): { min: number; max: number } {
  const first = scenes[0]
  if (!first) return { min: 0, max: 0 }

  const byId = new Map(scenes.map((scene) => [scene.id, scene]))

  function walk(scene: SimulationScene, visited: Set<string>): { min: number; max: number } {
    const nextIds = new Set(
      scene.decision.options.map((option) => resolveNextSceneId(scenes, scene, option.id))
    )
    let min = Infinity
    let max = 0

    for (const nextId of nextIds) {
      const next = nextId === null ? undefined : byId.get(nextId)
      // Cena inexistente ou ciclo contam como fim; o validate.ts já barra os dois no conteúdo.
      if (!next || visited.has(next.id)) {
        min = Math.min(min, 1)
        max = Math.max(max, 1)
        continue
      }
      const rest = walk(next, new Set([...visited, next.id]))
      min = Math.min(min, rest.min + 1)
      max = Math.max(max, rest.max + 1)
    }

    return { min: Number.isFinite(min) ? min : 1, max: Math.max(max, 1) }
  }

  return walk(first, new Set([first.id]))
}

export const NAME_PLACEHOLDER = '{nome}'
const FALLBACK_NAME = 'Usuário'

export function getFirstName(displayName: string | null | undefined): string {
  return displayName?.trim().split(/\s+/)[0] || FALLBACK_NAME
}

// Troca só texto puro: o React escapa na renderização, então o nome nunca vira markup.
export function personalizeSimulation(
  simulation: SimulationDocument,
  firstName: string
): SimulationDocument {
  return {
    ...simulation,
    scenes: simulation.scenes.map((scene) => ({
      ...scene,
      messages: scene.messages.map((message) => ({
        ...message,
        content: message.content.split(NAME_PLACEHOLDER).join(firstName),
      })),
    })),
  }
}

export type TranscriptEntry =
  | { kind: 'message'; key: string; message: SimulationMessage }
  | { kind: 'reply'; key: string; text: string }
  | {
      kind: 'feedback'
      key: string
      sceneId: string
      isCorrect: boolean
      feedback: string
      correctOptionText: string | null
    }

interface TranscriptOptions {
  // Chat e ligação mostram o feedback dentro da conversa; desligado por padrão pra não mudar quem já usa.
  withFeedback?: boolean
}

function findOption(
  scene: SimulationScene,
  record: SimulationDecisionRecord | undefined
): SimulationDecisionOption | undefined {
  return scene.decision.options.find((option) => option.id === record?.selectedOptionId)
}

// Junto as cenas já passadas com a atual pra conversa não sumir quando troca de cena.
// visitedScenes é o caminho percorrido, e a última é a cena atual.
export function buildTranscript(
  visitedScenes: SimulationScene[],
  visibleMessages: SimulationMessage[],
  decisions: SimulationDecisionRecord[],
  { withFeedback = false }: TranscriptOptions = {}
): TranscriptEntry[] {
  const entries: TranscriptEntry[] = []
  const lastIndex = visitedScenes.length - 1

  visitedScenes.forEach((scene, index) => {
    const messages = index === lastIndex ? visibleMessages : scene.messages
    messages.forEach((message, messageIndex) => {
      entries.push({ kind: 'message', key: `${scene.id}-${messageIndex}`, message })
    })

    const record = decisions.find((decision) => decision.sceneId === scene.id)
    const chosen = findOption(scene, record)
    if (!chosen) return
    entries.push({ kind: 'reply', key: `${scene.id}-reply`, text: chosen.text })

    if (withFeedback) {
      const correct = scene.decision.options.find((option) => option.isCorrect)
      entries.push({
        kind: 'feedback',
        key: `${scene.id}-feedback`,
        sceneId: scene.id,
        isCorrect: chosen.isCorrect,
        feedback: chosen.feedback,
        correctOptionText: chosen.isCorrect ? null : (correct?.text ?? null),
      })
    }
  })

  return entries
}
