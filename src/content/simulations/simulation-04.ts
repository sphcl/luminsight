import type { SimulationDocument, SimulationScene } from '@/types/simulation.types'
import { MODULE_05_ID } from '@/content/modules/module-05'

const pendingDecision = {
  prompt: '[PENDENTE] Lorem ipsum dolor sit amet.',
  options: [
    { id: 'a', text: '[PENDENTE] Lorem ipsum dolor sit amet.', isCorrect: true, feedback: '[PENDENTE] Lorem ipsum dolor sit amet.' },
    { id: 'b', text: '[PENDENTE] Lorem ipsum dolor sit amet.', isCorrect: false, feedback: '[PENDENTE] Lorem ipsum dolor sit amet.' },
    { id: 'c', text: '[PENDENTE] Lorem ipsum dolor sit amet.', isCorrect: false, feedback: '[PENDENTE] Lorem ipsum dolor sit amet.' },
    { id: 'd', text: '[PENDENTE] Lorem ipsum dolor sit amet.', isCorrect: false, feedback: '[PENDENTE] Lorem ipsum dolor sit amet.' },
  ],
}

const scenes: SimulationScene[] = [
  {
    id: 'cena-01',
    order: 1,
    messages: [
      { sender: 'attacker', content: '[PENDENTE] Lorem ipsum dolor sit amet.' },
      { sender: 'system', content: '[PENDENTE] Lorem ipsum dolor sit amet.' },
    ],
    decision: pendingDecision,
  },
  {
    id: 'cena-02',
    order: 2,
    messages: [
      { sender: 'attacker', content: '[PENDENTE] Lorem ipsum dolor sit amet.' },
      { sender: 'system', content: '[PENDENTE] Lorem ipsum dolor sit amet.' },
    ],
    decision: pendingDecision,
  },
  {
    id: 'cena-03',
    order: 3,
    messages: [
      { sender: 'attacker', content: '[PENDENTE] Lorem ipsum dolor sit amet.' },
      { sender: 'system', content: '[PENDENTE] Lorem ipsum dolor sit amet.' },
    ],
    decision: pendingDecision,
  },
]

export const SIMULATION_04_ID = 'simulacao-04'

export const simulation04: SimulationDocument = {
  id: SIMULATION_04_ID,
  moduleId: MODULE_05_ID,
  title: '[PENDENTE] Lorem ipsum dolor sit amet.',
  description: '[PENDENTE] Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
  format: 'chat',
  estimatedMinutes: 10,
  scenes,
}
