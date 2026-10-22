import { useEffect, useRef, useState } from 'react'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import {
  evaluateDecision,
  isBranchingSimulation,
  resolveNextSceneId,
  summarizeSimulation,
  type DecisionEvaluation,
  type SimulationDecisionRecord,
  type SimulationSummary,
} from '@/features/simulations/engine/simulation'
import type {
  SimulationDecisionOption,
  SimulationDocument,
  SimulationMessage,
  SimulationScene,
} from '@/types/simulation.types'

interface UseSimulationOptions {
  onFinish?: (summary: SimulationSummary) => void
  // Conversa (chat e ligação): depois da escolha, a próxima cena chega sozinha, sem botão de continuar.
  autoAdvance?: boolean
}

export interface UseSimulationReturn {
  currentScene: SimulationScene | undefined
  // Posição da cena atual no caminho percorrido, não no array de cenas.
  sceneIndex: number
  // null quando a simulação ramifica e o total depende das escolhas.
  totalScenes: number | null
  visitedScenes: SimulationScene[]
  isLastScene: boolean
  visibleMessages: SimulationMessage[]
  areMessagesComplete: boolean
  decisions: SimulationDecisionRecord[]
  hasDecided: boolean
  selectedOption: SimulationDecisionOption | null
  feedback: DecisionEvaluation | null
  chooseOption: (optionId: string) => void
  goToNextScene: () => void
  isFinished: boolean
  result: SimulationSummary | null
}

export function useSimulation(
  simulation: SimulationDocument,
  { onFinish, autoAdvance = false }: UseSimulationOptions = {}
): UseSimulationReturn {
  const prefersReducedMotion = usePrefersReducedMotion()
  const scenes = simulation.scenes
  const [path, setPath] = useState<string[]>(() => (scenes[0] ? [scenes[0].id] : []))
  const [revealedCount, setRevealedCount] = useState(0)
  const [decisions, setDecisions] = useState<SimulationDecisionRecord[]>([])
  const [result, setResult] = useState<SimulationSummary | null>(null)
  // Ref e não state pelo mesmo motivo do quiz: dois cliques no mesmo render finalizariam duas vezes.
  const hasFinishedRef = useRef(false)

  const visitedScenes = path.flatMap((sceneId) => {
    const scene = scenes.find((candidate) => candidate.id === sceneId)
    return scene ? [scene] : []
  })
  const currentScene: SimulationScene | undefined = visitedScenes[visitedScenes.length - 1]
  const sceneIndex = Math.max(0, visitedScenes.length - 1)
  const totalMessages = currentScene?.messages.length ?? 0
  const visibleCount = prefersReducedMotion ? totalMessages : Math.min(revealedCount, totalMessages)
  const areMessagesComplete = visibleCount >= totalMessages

  const currentRecord = currentScene
    ? decisions.find((decision) => decision.sceneId === currentScene.id)
    : undefined
  const hasDecided = currentRecord !== undefined
  const selectedOption =
    currentScene?.decision.options.find(
      (option) => option.id === currentRecord?.selectedOptionId
    ) ?? null
  const feedback =
    currentScene && currentRecord
      ? evaluateDecision(currentScene.decision, currentRecord.selectedOptionId)
      : null
  const isFinished = result !== null
  const nextSceneId =
    currentScene && currentRecord
      ? resolveNextSceneId(scenes, currentScene, currentRecord.selectedOptionId)
      : null
  const isLastScene = hasDecided && nextSceneId === null

  useEffect(() => {
    if (prefersReducedMotion || !currentScene || revealedCount >= currentScene.messages.length)
      return

    // eslint-disable-next-line security/detect-object-injection -- índice numérico controlado pelo hook
    const nextMessage = currentScene.messages[revealedCount]
    const timeoutId = setTimeout(
      () => setRevealedCount((count) => count + 1),
      Math.max(0, nextMessage?.delay ?? 0)
    )
    return () => clearTimeout(timeoutId)
  }, [currentScene, revealedCount, prefersReducedMotion])

  function chooseOption(optionId: string) {
    if (!currentScene || hasDecided || !areMessagesComplete || isFinished) return

    const evaluation = evaluateDecision(currentScene.decision, optionId)
    if (!evaluation) return

    const record: SimulationDecisionRecord = {
      sceneId: currentScene.id,
      selectedOptionId: optionId,
      isCorrect: evaluation.isCorrect,
    }
    setDecisions((previous) =>
      previous.some((item) => item.sceneId === record.sceneId) ? previous : [...previous, record]
    )

    if (autoAdvance) {
      advance(resolveNextSceneId(scenes, currentScene, optionId), [...decisions, record])
    }
  }

  function advance(target: string | null, decisionsSoFar: SimulationDecisionRecord[]) {
    if (target !== null) {
      setPath((previous) => [...previous, target])
      setRevealedCount(0)
      return
    }

    if (hasFinishedRef.current) return
    hasFinishedRef.current = true

    const summary = summarizeSimulation(decisionsSoFar)
    setResult(summary)
    onFinish?.(summary)
  }

  function goToNextScene() {
    if (!hasDecided || isFinished) return
    advance(nextSceneId, decisions)
  }

  return {
    currentScene,
    sceneIndex,
    totalScenes: isBranchingSimulation(scenes) ? null : scenes.length,
    visitedScenes,
    isLastScene,
    visibleMessages: currentScene?.messages.slice(0, visibleCount) ?? [],
    areMessagesComplete,
    decisions,
    hasDecided,
    selectedOption,
    feedback,
    chooseOption,
    goToNextScene,
    isFinished,
    result,
  }
}
