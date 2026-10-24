import type { ConsentVersion } from '@/types/user.types'

// Trocar pelo e-mail real antes do deploy; o teste "nenhum [PENDENTE] sobrou" segura até lá.
export const RESEARCH_CONTACT = '[PENDENTE]'

export interface ConsentText {
  version: ConsentVersion
  title: string
  paragraphs: string[]
}

const SHARED_CLOSING = [
  'Os resultados são publicados só em conjunto, sem nome, e-mail ou qualquer coisa que identifique você.',
  'Participar é opcional e só vale para quem tem 18 anos ou mais. Quem tem menos de 18, ou não quer participar, usa o site inteiro do mesmo jeito.',
  'Você pode mudar de ideia quando quiser, no seu Perfil.',
  `Dúvidas sobre a pesquisa: ${RESEARCH_CONTACT}`,
]

// Se o texto mudar, a versão muda junto: é ela que diz o que cada pessoa aceitou.
export const CONSENT_TEXTS: Record<ConsentVersion, ConsentText> = {
  'onboarding-v1': {
    version: 'onboarding-v1',
    title: 'Antes de começar',
    paragraphs: [
      'O LumInsight faz parte de um Trabalho de Conclusão de Curso em Segurança da Informação.',
      'Se você aceitar participar da pesquisa, vamos usar seu progresso e suas respostas nos quizzes e nas simulações.',
      ...SHARED_CLOSING,
    ],
  },
  'retroativo-v1': {
    version: 'retroativo-v1',
    title: 'Uma pergunta sobre a pesquisa',
    paragraphs: [
      'O LumInsight faz parte de um Trabalho de Conclusão de Curso em Segurança da Informação.',
      'Se você aceitar participar da pesquisa, vamos usar seu progresso e suas respostas nos quizzes e nas simulações, inclusive o que você já fez aqui.',
      ...SHARED_CLOSING,
    ],
  },
}
