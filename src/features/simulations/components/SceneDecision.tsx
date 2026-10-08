import type { UseSimulationReturn } from '@/features/simulations/hooks/useSimulation'
import { DecisionFeedback } from './DecisionFeedback'
import { DecisionPanel, type DecisionPanelVariant } from './DecisionPanel'

interface SceneDecisionProps {
  session: UseSimulationReturn
  variant: DecisionPanelVariant
}

export function SceneDecision({ session, variant }: SceneDecisionProps) {
  const { currentScene, areMessagesComplete, hasDecided, feedback } = session
  if (!currentScene || !areMessagesComplete) return null

  if (!hasDecided || !feedback) {
    return (
      <DecisionPanel
        decision={currentScene.decision}
        variant={variant}
        onChoose={session.chooseOption}
      />
    )
  }

  const correctOption = currentScene.decision.options.find((option) => option.isCorrect)

  return (
    <DecisionFeedback
      key={currentScene.id}
      feedback={feedback}
      correctOptionText={correctOption?.text ?? null}
      isLastScene={session.sceneIndex === session.totalScenes - 1}
      onContinue={session.goToNextScene}
    />
  )
}
