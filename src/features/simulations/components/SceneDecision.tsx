import type { UseSimulationReturn } from '@/features/simulations/hooks/useSimulation'
import { DecisionFeedback } from './DecisionFeedback'
import { DecisionPanel, type DecisionPanelVariant } from './DecisionPanel'

interface SceneDecisionProps {
  session: UseSimulationReturn
  variant: DecisionPanelVariant
  // Conversa: sem painel de feedback nem botão de continuar, o feedback vai pro fluxo e a cena seguinte chega sozinha.
  conversational?: boolean
}

export function SceneDecision({ session, variant, conversational = false }: SceneDecisionProps) {
  const { currentScene, areMessagesComplete, hasDecided, feedback } = session
  if (!currentScene || !areMessagesComplete) return null

  if (conversational) {
    if (hasDecided || session.isFinished) return null
    return (
      <DecisionPanel
        // key por cena pra o painel remontar e o autoFocus valer a cada grupo novo de opções.
        key={currentScene.id}
        decision={currentScene.decision}
        variant={variant}
        onChoose={session.chooseOption}
        autoFocus={session.sceneIndex > 0}
      />
    )
  }

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
      isLastScene={session.isLastScene}
      onContinue={session.goToNextScene}
    />
  )
}
