import type {
  SimulationContact,
  SimulationDocument,
  SimulationScene,
} from '@/types/simulation.types'
import { MODULE_02_ID } from '@/content/modules/module-02'

interface InboxEmail {
  id: string
  order: number
  contact: SimulationContact
  subject: string
  sentAt: string
  body: string
  isPhishing: boolean
  justification: string
}

// Cada email é uma cena com a mesma pergunta; a justificativa aparece seja qual for a escolha.
function toScene(email: InboxEmail): SimulationScene {
  return {
    id: email.id,
    order: email.order,
    contact: email.contact,
    messages: [
      {
        sender: 'attacker',
        content: email.body,
        subject: email.subject,
        sentAt: email.sentAt,
        delay: 600,
      },
    ],
    decision: {
      prompt: 'Este e-mail é phishing ou normal?',
      options: [
        { id: 'a', text: 'Phishing', isCorrect: email.isPhishing, feedback: email.justification },
        { id: 'b', text: 'Normal', isCorrect: !email.isPhishing, feedback: email.justification },
      ],
    },
  }
}

const emails: InboxEmail[] = [
  {
    id: 'email-01',
    order: 1,
    contact: { name: 'Banco Aurora', address: 'seguranca@bancoaur0ra.example' },
    subject: 'Ação necessária: sua conta será bloqueada',
    sentAt: '27/08/2026 - 08:42',
    body: 'Olá, cliente.\n\nIdentificamos uma atividade incomum em sua conta e, por motivos de segurança, precisamos confirmar sua identidade.\n\nPara evitar o bloqueio temporário do seu acesso, confirme seus dados através do link abaixo:\n\n[CONFIRMAR MINHA CONTA]\n\nA confirmação deve ser realizada dentro das próximas 2 horas. Caso contrário, sua conta poderá ser bloqueada temporariamente.\n\nAtenciosamente,\nEquipe de Segurança\nBanco Aurora',
    isPhishing: true,
    justification:
      'O endereço do remetente utiliza "bancoaur0ra", com o número 0 no lugar da letra o, tentando se passar pelo domínio verdadeiro. A mensagem cria um senso de urgência ao afirmar que a conta será bloqueada em apenas 2 horas. Existe um link solicitando que o usuário confirme seus dados. A combinação desses elementos indica uma tentativa de induzir o usuário a clicar no link e fornecer informações.',
  },
  {
    id: 'email-02',
    order: 2,
    contact: { name: 'Biblioteca Central', address: 'biblioteca@universidade.example' },
    subject: 'Renovação de empréstimo',
    sentAt: '27/08/2026 - 09:15',
    body: 'Olá,\n\nInformamos que o prazo de devolução do livro "Introdução à Segurança da Informação" foi renovado.\n\nA nova data prevista para devolução é 03/09/2026.\n\nCaso você não tenha solicitado essa renovação ou tenha alguma dúvida sobre o empréstimo, entre em contato diretamente com a Biblioteca Central.\n\nAtenciosamente,\nBiblioteca Central\nUniversidade',
    isPhishing: false,
    justification:
      'A mensagem apresenta informações relacionadas a um serviço que o usuário utiliza e não solicita senha, código de autenticação ou dados pessoais. Também não existe uma pressão para que o usuário realize alguma ação imediatamente. O e-mail apenas informa a nova data de devolução e oferece um meio de contato caso exista algum problema.',
  },
  {
    id: 'email-03',
    order: 3,
    contact: { name: 'Departamento de Recursos Humanos', address: 'rh@empresa-seg.example' },
    subject: 'Documento referente ao projeto',
    sentAt: '27/08/2026 - 10:03',
    body: 'Olá, {nome}.\n\nConforme conversamos anteriormente sobre o projeto de segurança da informação, estou enviando o documento solicitado para sua análise.\n\nO arquivo contém as informações que discutimos durante nossa última reunião.\n\nVocê pode acessá-lo através do link abaixo:\n\n[ABRIR DOCUMENTO]\n\nCaso tenha alguma dificuldade para acessar o arquivo, me avise.\n\nAtenciosamente,\nMarcos\nDepartamento de Recursos Humanos',
    isPhishing: true,
    justification:
      'A mensagem utiliza informações específicas sobre o destinatário, incluindo seu nome e uma referência a um projeto, para criar uma sensação de familiaridade. Isso pode fazer com que o usuário confie na mensagem e clique no link sem verificar sua origem. O fato de a mensagem conhecer informações reais sobre o usuário não significa que ela seja legítima. Este tipo de ataque demonstra como informações disponíveis sobre uma pessoa podem ser utilizadas para tornar um golpe mais convincente.',
  },
  {
    id: 'email-04',
    order: 4,
    contact: { name: 'Loja Mercado', address: 'pedidos@lojamercado.example' },
    subject: 'Seu pedido foi entregue',
    sentAt: '27/08/2026 - 14:27',
    body: 'Olá!\n\nSeu pedido foi marcado como entregue hoje.\n\nNúmero do pedido: #45821\n\nA entrega foi realizada no endereço cadastrado durante a compra.\n\nCaso você não tenha recebido o pedido, acesse o aplicativo ou site oficial da Loja Mercado para consultar os detalhes da entrega.\n\nObrigado por comprar conosco.\nEquipe Loja Mercado',
    isPhishing: false,
    justification:
      'O e-mail fornece uma informação relacionada a uma compra e não exige que o usuário forneça senha, código de autenticação ou informações bancárias. Um ponto importante é que a mensagem orienta o usuário a acessar o aplicativo ou site oficial diretamente, em vez de fornecer um link suspeito. Mesmo assim, o usuário ainda deve verificar se realmente realizou aquela compra antes de considerar a mensagem confiável.',
  },
  {
    id: 'email-05',
    order: 5,
    contact: {
      name: 'Segurança da Conta',
      address: 'seguranca@servicos-online-seguranca.example',
    },
    subject: 'Nova tentativa de acesso detectada',
    sentAt: '27/08/2026 - 17:51',
    body: 'Olá,\n\nUma nova tentativa de acesso à sua conta foi identificada.\n\nData: 27/08/2026\nHorário: 17:43\nLocalização: São Paulo, Brasil\n\nSe você não reconhece esta atividade, confirme sua identidade imediatamente através do nosso contato de e-mail para podermos lhe enviar o link de segurança.\n\nPor motivos de segurança, sua conta poderá ser temporariamente limitada caso a confirmação não seja realizada.\n\nAtenciosamente,\nEquipe de Segurança',
    isPhishing: true,
    justification:
      'Apesar de utilizar uma linguagem profissional e não apresentar erros evidentes de português, este e-mail tenta criar preocupação sobre uma possível invasão da conta e utiliza isso para induzir o usuário a enviar seus dados em privado. O endereço também utiliza um domínio diferente do serviço que supostamente representa. Além disso, serviços de segurança nunca pedem conversas em privado, pois é sempre o usuário quem deve confirmar a entrada de acesso. Este é um exemplo importante porque demonstra que um phishing pode ser bem escrito, profissional e convincente, sem utilizar táticas como links diretos.',
  },
]

export const SIMULATION_01_ID = 'simulacao-01'

export const simulation01: SimulationDocument = {
  id: SIMULATION_01_ID,
  moduleId: MODULE_02_ID,
  title: 'Detecte o Phishing',
  description:
    'Você recebeu 5 novos e-mails em sua caixa de entrada. Alguns são mensagens legítimas, outros foram criados para tentar enganar você. Abra cada mensagem, analise cuidadosamente as informações disponíveis e decida se é PHISHING ou NORMAL.\n\nNão escolha apenas pela aparência da mensagem, observe o remetente, o conteúdo, os links, os pedidos realizados e principalmente se existe algum motivo para desconfiar.',
  format: 'email',
  // Cada email tem remetente próprio; esse só aparece se uma cena vier sem contact.
  contact: { name: 'Caixa de entrada', address: 'caixa@email.example' },
  estimatedMinutes: 10,
  scenes: emails.map(toScene),
}
