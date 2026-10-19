import type { ContentBlock } from './module.types'

export type SimulationFormat = 'chat' | 'email' | 'call'

export interface SimulationMessage {
  sender: 'attacker' | 'system'
  content: string
  // Em milissegundos, contados a partir da mensagem anterior da cena.
  delay?: number
  subject?: string
  // Texto livre de exibição, só o email usa.
  sentAt?: string
}

// Sempre fictício: no email o address precisa ser de domínio reservado (.example, .invalid, .test).
export interface SimulationContact {
  name: string
  address: string
}

export interface SimulationDecisionOption {
  id: string
  text: string
  isCorrect: boolean
  feedback: string
  // Sem o campo segue pra próxima cena pela ordem; null encerra a simulação.
  nextSceneId?: string | null
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
  // Na caixa de entrada cada email tem remetente próprio; sem isso vale o contact da simulação.
  contact?: SimulationContact
}

// moduleId fica como campo pq a tela de simulação busca direto pelo id dela, não vem do módulo.
export interface SimulationDocument {
  id: string
  moduleId: string
  title: string
  description: string
  format: SimulationFormat
  contact: SimulationContact
  estimatedMinutes: number
  scenes: SimulationScene[]
  conclusion?: ContentBlock[]
}
