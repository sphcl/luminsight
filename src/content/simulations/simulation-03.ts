import type { SimulationDocument, SimulationScene } from '@/types/simulation.types'
import { MODULE_04_ID } from '@/content/modules/module-04'

// Árvore de decisão: cada opção diz pra onde vai, e null encerra a conversa.
const scenes: SimulationScene[] = [
  {
    id: 'cena-01',
    order: 1,
    messages: [
      {
        sender: 'attacker',
        content:
          'Olá, boa tarde! Aqui é o Ricardo, gerente da sua agência. Tudo bem? Estou entrando em contato porque identificamos uma movimentação fora do padrão na sua conta e preciso confirmar algumas informações com você.',
        delay: 600,
      },
    ],
    decision: {
      prompt: 'O que você responderia?',
      options: [
        {
          id: 'a',
          text: 'Oi, tudo bem. Pode me explicar o que aconteceu?',
          isCorrect: false,
          nextSceneId: 'cena-02a',
          feedback:
            'Cuidado. Responder já confirma que o número está ativo e que você está disposto a conversar. A partir daqui você passa a reagir ao problema dele, em vez de avaliar quem ele é.',
        },
        {
          id: 'b',
          text: 'Qual é o número da minha conta? Quero confirmar que você realmente é meu gerente.',
          isCorrect: false,
          nextSceneId: 'cena-02b',
          feedback:
            'Parece uma saída esperta, mas mantém a conversa viva e ele tem resposta pronta. Testar o golpista com perguntas não funciona, porque ele pode ter seus dados.',
        },
        {
          id: 'c',
          text: 'Vou verificar diretamente pelo aplicativo ou pelo telefone oficial do banco antes de continuar.',
          isCorrect: true,
          nextSceneId: 'cena-02c',
          feedback:
            'Boa decisão. Você trocou para um canal que você mesmo controla, que é exatamente o que o golpe tenta impedir.',
        },
      ],
    },
  },
  {
    id: 'cena-02a',
    order: 2,
    messages: [
      {
        sender: 'attacker',
        content:
          'Identificamos uma tentativa de transferência de R$ 4.800 para uma conta que não faz parte do seu histórico. Para sua segurança, preciso confirmar alguns dados antes de bloquear a operação.',
        delay: 600,
      },
    ],
    decision: {
      prompt: 'O que você faria?',
      options: [
        {
          id: 'a',
          text: 'Claro. Quais informações você precisa?',
          isCorrect: false,
          nextSceneId: 'cena-03',
          feedback:
            'Perigo. Você aceitou o papel de quem precisa provar algo. A partir daqui cada pedido vai parecer razoável, porque você já concordou com a premissa.',
        },
        {
          id: 'b',
          text: 'Que dados você precisa confirmar? Não vou passar senha nem código.',
          isCorrect: false,
          nextSceneId: 'cena-03',
          feedback:
            'Melhor que ceder, mas a conversa continua. E o golpe não precisa da sua senha: basta que você autorize uma operação no próprio aplicativo.',
        },
        {
          id: 'c',
          text: 'Vou entrar no aplicativo para verificar se essa movimentação realmente aparece.',
          isCorrect: true,
          nextSceneId: null,
          feedback:
            'Correto. Checar no aplicativo oficial é verificação independente. Se a movimentação não existe, a conversa inteira cai por terra.',
        },
      ],
    },
  },
  {
    id: 'cena-02b',
    order: 3,
    messages: [
      {
        sender: 'attacker',
        content:
          'Sim, sou responsável pelo atendimento da sua conta. Por segurança, não consigo informar todos os dados por aqui. Mas posso confirmar alguns dados seus para validar o atendimento.',
        delay: 600,
      },
    ],
    decision: {
      prompt: 'O que você faria?',
      options: [
        {
          id: 'a',
          text: 'Tudo bem. Pode perguntar.',
          isCorrect: false,
          nextSceneId: 'cena-03',
          feedback:
            'Cuidado. Ele inverteu a verificação: agora é você quem está sendo checado. E os dados que ele vai citar podem ter vindo de um vazamento.',
        },
        {
          id: 'b',
          text: 'Prefiro confirmar sua identidade por um canal oficial do banco antes de continuar.',
          isCorrect: true,
          nextSceneId: null,
          feedback:
            'Correto. Note que a recusa dele em dar informações foi apresentada como cuidado com a segurança. Essa inversão é parte da técnica.',
        },
        {
          id: 'c',
          text: 'Se você é meu gerente, então já deve ter meus dados. Pode verificar pelo sistema.',
          isCorrect: false,
          nextSceneId: 'cena-03',
          feedback:
            'Você manteve a conversa e deu a ele a deixa para citar algum dado seu e reforçar a credibilidade.',
        },
      ],
    },
  },
  {
    id: 'cena-02c',
    order: 4,
    messages: [
      {
        sender: 'attacker',
        content:
          'Entendo sua preocupação, mas precisamos resolver isso rapidamente. Se você sair da conversa agora, a transferência pode ser concluída e o banco não conseguirá bloqueá-la a tempo.',
        delay: 600,
      },
    ],
    decision: {
      prompt: 'O que você faria?',
      options: [
        {
          id: 'a',
          text: 'Vou continuar por aqui para resolver logo.',
          isCorrect: false,
          nextSceneId: 'cena-03',
          feedback:
            'A pressão funcionou. O prazo não existe, ele foi criado justamente para impedir você de verificar.',
        },
        {
          id: 'b',
          text: 'Se for realmente uma situação de segurança, vou entrar em contato com o banco pelos canais oficiais.',
          isCorrect: true,
          nextSceneId: null,
          feedback:
            'Correto. Você manteve a decisão mesmo sob pressão, que é a parte mais difícil. Um contato legítimo nunca é prejudicado por você confirmar pelo canal oficial.',
        },
        {
          id: 'c',
          text: 'Você pode me mandar um link para eu confirmar o bloqueio?',
          isCorrect: false,
          nextSceneId: 'cena-03',
          feedback:
            'Perigo. Você pediu exatamente o que ele queria enviar. Links em conversa não solicitada levam a páginas falsas de captura de dados.',
        },
      ],
    },
  },
  {
    id: 'cena-03',
    order: 5,
    messages: [
      {
        sender: 'attacker',
        content:
          'Para bloquear a movimentação, será necessário confirmar uma operação de segurança no aplicativo. Vou acompanhar você durante o procedimento.',
        delay: 600,
      },
      {
        sender: 'attacker',
        content: 'Quando aparecer a solicitação, me avise. Não feche o aplicativo.',
        delay: 1200,
      },
    ],
    decision: {
      prompt: 'O que você faria?',
      options: [
        {
          id: 'a',
          text: 'Vou seguir suas instruções para impedir a transferência.',
          isCorrect: false,
          nextSceneId: 'cena-04',
          feedback:
            'Você caiu no golpe. A operação que ele acompanha não bloqueia nada: é a autorização da transferência que ele quer fazer.',
        },
        {
          id: 'b',
          text: 'Antes de fazer qualquer coisa, vou verificar com o banco por outro canal.',
          isCorrect: true,
          nextSceneId: null,
          feedback:
            'Correto. Nenhum banco acompanha o cliente passo a passo por mensagem para executar operação no aplicativo.',
        },
        {
          id: 'c',
          text: 'Pode me explicar exatamente o que essa operação vai fazer?',
          isCorrect: false,
          nextSceneId: 'cena-04',
          feedback:
            'Ele vai explicar, e a explicação vai parecer convincente. Pedir detalhes a quem está mentindo não gera verificação.',
        },
      ],
    },
  },
  {
    id: 'cena-04',
    order: 6,
    messages: [
      {
        sender: 'attacker',
        content:
          'A confirmação precisa ser feita agora. É só uma etapa de segurança e não haverá nenhum débito na sua conta.',
        delay: 600,
      },
    ],
    decision: {
      prompt: 'O que você faria?',
      options: [
        {
          id: 'a',
          text: 'Vou confirmar, já que você disse que é um procedimento de segurança.',
          isCorrect: false,
          nextSceneId: null,
          feedback:
            'Você caiu no golpe. A garantia de que não haverá débito veio justamente de quem quer debitar.',
        },
        {
          id: 'b',
          text: 'Não vou confirmar nenhuma operação que eu não tenha iniciado. Vou encerrar a conversa e procurar o banco por um canal oficial.',
          isCorrect: true,
          nextSceneId: null,
          feedback:
            'Correto, e essa é a regra que vale para qualquer variação desse golpe: você só confirma o que você mesmo começou.',
        },
        {
          id: 'c',
          text: 'Vou pedir para você me ligar pelo telefone oficial da agência.',
          isCorrect: false,
          nextSceneId: null,
          feedback:
            'Quase. Mas quem liga continua sendo ele, e o identificador de chamadas pode ser forjado. Quem precisa iniciar o contato é você.',
        },
      ],
    },
  },
]

export const SIMULATION_03_ID = 'simulacao-03'

export const simulation03: SimulationDocument = {
  id: SIMULATION_03_ID,
  moduleId: MODULE_04_ID,
  title: 'Seu gerente entrou em contato',
  description:
    'Você recebe uma mensagem no WhatsApp de alguém que se identifica como seu gerente bancário. A foto do perfil é de um funcionário do banco e a pessoa afirma estar entrando em contato por causa de uma movimentação suspeita na sua conta.',
  format: 'chat',
  contact: { name: 'Ricardo (gerente)', address: '(00) 90000-0003' },
  estimatedMinutes: 10,
  scenes,
  conclusion: [
    {
      type: 'text',
      content:
        'O golpe se sustenta em três pilares: autoridade, porque ele se apresenta como alguém com poder sobre a sua conta; medo, porque apresenta uma perda iminente; e urgência, porque cria um prazo para impedir que você verifique.',
    },
    {
      type: 'highlight',
      variant: 'info',
      content:
        'Uma única regra derruba os três: encerre a conversa e procure o banco por um canal que você mesmo escolhe. Não importa quanto ele saiba sobre você, porque dados vazam.',
    },
  ],
}
