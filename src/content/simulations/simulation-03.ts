import type { SimulationDocument, SimulationScene } from '@/types/simulation.types'
import { MODULE_03_ID } from '@/content/modules/module-03'

// "Parcial" no material vira isCorrect false: só a opção marcada como certa conta ponto.
const scenes: SimulationScene[] = [
  {
    id: 'cena-01',
    order: 1,
    messages: [
      {
        sender: 'attacker',
        content:
          'Oi! Sou eu! Meu celular quebrou e estou usando o telefone de um amigo. Preciso da sua ajuda, aconteceu uma coisa e estou desesperado.',
        delay: 600,
      },
    ],
    decision: {
      prompt: 'O que você faria?',
      options: [
        {
          id: 'a',
          text: 'Perguntaria imediatamente o que aconteceu.',
          isCorrect: false,
          feedback:
            'Cuidado. Você ainda não confirmou quem está do outro lado. Continue a conversa, mas não forneça informações pessoais nem faça nenhum pagamento.',
        },
        {
          id: 'b',
          text: 'Pediria para a pessoa confirmar quem ela é antes de continuar a conversa.',
          isCorrect: true,
          feedback:
            'Boa decisão. Mesmo que a voz pareça familiar, ela pode ter sido clonada por inteligência artificial. Confirmar a identidade é uma forma importante de evitar o golpe.',
        },
        {
          id: 'c',
          text: 'Ficaria tranquilo, pois reconheceu a voz.',
          isCorrect: false,
          feedback:
            'Cuidado. Reconhecer a voz não é suficiente para confirmar a identidade. Atualmente, ferramentas de IA conseguem reproduzir vozes de pessoas reais.',
        },
        {
          id: 'd',
          text: 'Perguntaria quanto dinheiro ela precisa.',
          isCorrect: false,
          feedback:
            'Perigo. O golpista pode estar tentando levar você diretamente para uma situação de pagamento. Antes de falar sobre dinheiro, confirme quem está ligando.',
        },
      ],
    },
  },
  {
    id: 'cena-02',
    order: 2,
    messages: [
      {
        sender: 'attacker',
        content:
          'Eu sofri um acidente. Estou bem, mas preciso pagar uma coisa aqui. Você consegue fazer um PIX de R$ 2.000 para mim? É urgente!',
        delay: 600,
      },
    ],
    decision: {
      prompt: 'O que você faz?',
      options: [
        {
          id: 'a',
          text: 'Faz o PIX rapidamente para ajudar.',
          isCorrect: false,
          feedback:
            'Você caiu no golpe. A urgência é uma das principais estratégias utilizadas por golpistas para impedir que a vítima tenha tempo de pensar e verificar a situação.',
        },
        {
          id: 'b',
          text: 'Pergunta para qual chave PIX deve enviar.',
          isCorrect: false,
          feedback:
            'Ainda há risco. Você ainda não confirmou a identidade da pessoa. Não realize nenhum pagamento antes de verificar se a situação é verdadeira.',
        },
        {
          id: 'c',
          text: 'Desliga e liga para o número que você já tem salvo do seu familiar.',
          isCorrect: true,
          feedback:
            'Você identificou o golpe. Uma das formas mais seguras de verificar a situação é encerrar a ligação e entrar em contato com o familiar por um canal que você já conhece.',
        },
        {
          id: 'd',
          text: 'Pede para o suposto familiar mandar uma foto para confirmar.',
          isCorrect: false,
          feedback:
            'Cuidado. Uma foto também pode ser manipulada ou gerada por inteligência artificial. Procure confirmar a situação por outro meio.',
        },
      ],
    },
  },
  {
    id: 'cena-03',
    order: 3,
    messages: [
      {
        sender: 'attacker',
        content:
          'Não desliga! Meu celular está quebrado. Se você ligar para o meu número, não vai conseguir falar comigo. Por favor, confia em mim, eu preciso desse dinheiro agora!',
        delay: 600,
      },
    ],
    decision: {
      prompt: 'Qual é a melhor atitude?',
      options: [
        {
          id: 'a',
          text: 'Confiar na pessoa porque ela conhece informações sobre você.',
          isCorrect: false,
          feedback:
            'Cuidado. Saber informações sobre você não prova identidade. Esses dados circulam em vazamentos e em perfis públicos, e são usados justamente para construir confiança falsa.',
        },
        {
          id: 'b',
          text: 'Continuar conversando até ter certeza de que é realmente seu familiar.',
          isCorrect: false,
          feedback:
            'Ainda há risco. Quanto mais a conversa continua no canal que o golpista controla, mais tempo ele tem para aplicar pressão. A certeza não vai vir dessa ligação.',
        },
        {
          id: 'c',
          text: 'Encerrar a ligação e procurar confirmar a situação pessoalmente ou por outro contato conhecido.',
          isCorrect: true,
          feedback:
            'Você identificou os sinais. Mudar para um canal que você mesmo escolhe é o que tira o controle das mãos do golpista.',
        },
        {
          id: 'd',
          text: 'Fazer metade do PIX e esperar para ver o que acontece.',
          isCorrect: false,
          feedback:
            'Você caiu no golpe. Transferir qualquer valor confirma para o criminoso que você é um alvo que responde, e o dinheiro enviado dificilmente é recuperado.',
        },
      ],
    },
  },
]

const SIMULATION_MODULO_03_ID = 'simulacao-modulo-03'

export const simulationModulo03: SimulationDocument = {
  id: SIMULATION_MODULO_03_ID,
  moduleId: MODULE_03_ID,
  title: 'Você recebeu uma ligação',
  description: 'Você está em casa quando recebe uma ligação.',
  format: 'call',
  contact: { name: 'Número desconhecido', address: '(00) 90000-0002' },
  estimatedMinutes: 10,
  scenes,
  conclusion: [
    {
      type: 'text',
      content: 'Nesse caso, vários elementos indicam uma possível tentativa de golpe:',
    },
    {
      type: 'list',
      ordered: false,
      items: [
        'A pessoa afirma estar em uma situação de emergência.',
        'Existe uma tentativa de criar pressa.',
        'Ela solicita uma transferência de dinheiro.',
        'Tenta impedir que você confirme sua identidade por outro meio.',
        'A voz familiar pode ter sido clonada por inteligência artificial.',
      ],
    },
    {
      type: 'highlight',
      variant: 'info',
      content: 'Lembre-se: uma voz familiar não é necessariamente uma prova de identidade.',
    },
  ],
}
