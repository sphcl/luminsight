import { useEffect, useRef, useState } from 'react'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import {
  evaluateDecision,
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
}

export interface UseSimulationReturn {
  currentScene: SimulationScene | undefined
  sceneIndex: number
  totalScenes: number
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
  { onFinish }: UseSimulationOptions = {}
): UseSimulationReturn {
  const prefersReducedMotion = usePrefersReducedMotion()
  const scenes = simulation.scenes
  const [sceneIndex, setSceneIndex] = useState(0)
  const [revealedCount, setRevealedCount] = useState(0)
  const [decisions, setDecisions] = useState<SimulationDecisionRecord[]>([])
  const [result, setResult] = useState<SimulationSummary | null>(null)
  // Ref e não state pelo mesmo motivo do quiz: dois cliques no mesmo render finalizariam duas vezes.
  const hasFinishedRef = useRef(false)

  // eslint-disable-next-line security/detect-object-injection - índice numérico controlado pelo hook
  const currentScene = scenes[sceneIndex]
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
  }

  function goToNextScene() {
    if (!hasDecided || isFinished) return

    if (sceneIndex < scenes.length - 1) {
      setSceneIndex(sceneIndex + 1)
      setRevealedCount(0)
      return
    }

    if (hasFinishedRef.current) return
    hasFinishedRef.current = true

    const summary = summarizeSimulation(decisions)
    setResult(summary)
    onFinish?.(summary)
  }

  return {
    currentScene,
    sceneIndex,
    totalScenes: scenes.length,
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
