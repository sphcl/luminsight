export type SimulationFormat = 'chat' | 'email' | 'call'

export interface SimulationMessage {
  sender: 'attacker' | 'system'
  content: string
  delay?: number
}

export interface SimulationDecisionOption {
  id: string
  text: string
  isCorrect: boolean
  feedback: string
}

export interface SimulationDecision {
  prompt: string
  options: SimulationDecisionOption[]
}

export interface SimulationScene {
  id: string
  order: number
  messages: SimulationMessage[]
  decision: SimulationDecision
}

// moduleId fica como campo pq a tela de simulação busca direto pelo id dela, não vem do módulo.
export interface SimulationDocument {
  id: string
  moduleId: string
  title: string
  description: string
  format: SimulationFormat
  estimatedMinutes: number
  scenes: SimulationScene[]
}
