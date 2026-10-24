import {
  PLACEHOLDER_COLOR,
  PLACEHOLDER_ICON,
  buildLessonData,
  type LessonEntry,
  type ModuleContent,
} from '@/content/types'
import { MODULE_04_ID } from './module-04'

export const MODULE_05_ID = 'modulo-05'

export const module05: ModuleContent = {
  title: 'Como se Proteger, Agir e Reportar',
  description:
    'Saiba o que fazer antes, durante e depois de um golpe: como se proteger, como agir nas primeiras horas e onde denunciar pelos canais oficiais.',
  order: 5,
  icon: PLACEHOLDER_ICON,
  color: PLACEHOLDER_COLOR,
  difficulty: 'avancado',
  totalLessons: 3,
  isActive: true,
  hasSimulation: false,
  requiredModuleId: MODULE_04_ID,
}

export const module05Lessons: LessonEntry[] = [
  {
    id: 'licao-01',
    data: buildLessonData('Proteção', 1, [
      { type: 'heading', content: 'Como se proteger, agir e reportar' },
      {
        type: 'text',
        content:
          'Diante do aumento dos ataques cibernéticos, este guia orienta a navegação segura no ambiente digital através de três pilares: Proteção, Ação e Denúncia. O objetivo é conscientizar o usuário, incentivando-o a se manter atualizado e reforçar a importância de utilizar os canais oficiais sempre que necessário.',
      },
      { type: 'heading', content: 'Pontos principais para proteção' },
      {
        type: 'example',
        title: 'Confirme a identidade',
        content:
          'Nunca faça transferências bancárias feitas por familiares sem antes ligar para confirmar.',
      },
      {
        type: 'example',
        title: 'Desconfie de propostas vantajosas',
        content: 'Se uma promoção parece boa demais para ser verdade, desconfie imediatamente.',
      },
      {
        type: 'example',
        title: 'Senhas fortes e únicas',
        content: 'Utilize combinações de letras e números para criar senhas mais seguras.',
      },
      {
        type: 'example',
        title: 'Downloads',
        content:
          'Não baixe arquivos de fontes desconhecidas e links em e-mails suspeitos de fontes desconhecidas.',
      },
      {
        type: 'example',
        title: 'Autenticação de dois fatores',
        content:
          'Ative a verificação em duas etapas nas suas contas, isso aumenta a proteção e segurança delas.',
      },
      {
        type: 'example',
        title: 'Segurança biométrica',
        content:
          'Senha e biometria são pessoais. Cadastrar a digital de outra pessoa dá a ela acesso total ao seu aparelho.',
      },
    ]),
  },
  {
    id: 'licao-02',
    data: buildLessonData('Ação', 2, [
      { type: 'heading', content: 'O que fazer assim que perceber o golpe' },
      {
        type: 'text',
        content:
          'O vídeo curto a seguir fala sobre como funciona o golpe do pix, criado pelo Banco Central do Brasil.',
      },
      {
        type: 'video',
        url: 'https://www.youtube.com/watch?v=srmMQwAGoQU',
        title: 'BC te Explica #125, como funciona o golpe do Pix errado ou devolução do Pix',
      },
      {
        type: 'highlight',
        variant: 'warning',
        content:
          'Por ordem de prioridade, a coisa mais importante de se fazer em primeiro lugar assim que perceber um golpe é entrar em contato com o seu banco.',
      },
      {
        type: 'text',
        content:
          'Em caso de transações e compras suspeitas, a regra de ouro é agir rápido e entrar em contato com o seu banco pelos canais oficiais.',
      },
      {
        type: 'text',
        content:
          'Se o golpe foi realizado via Pix, você deve acessar o extrato no aplicativo, selecionar a transação fraudulenta e utilizar a opção de contestação ou devolução. É aqui que entra o MED (Mecanismo Especial de Devolução), uma ferramenta oficial regulada pelo Banco Central que permite ao seu banco solicitar a recuperação do dinheiro diretamente na conta do recebedor golpista, caso ainda haja saldo disponível. Se a fraude ocorreu no cartão de crédito, o processo é similar: localize a compra no app e utilize a opção de Contestar Compra ou Reportar Problema.',
      },
      { type: 'heading', content: 'O golpe do Pix errado' },
      {
        type: 'text',
        content:
          'Um golpe comum funciona ao contrário: você recebe um Pix de alguém desconhecido e, pouco depois, essa pessoa entra em contato dizendo que transferiu por engano e pede a devolução para outra chave. O dinheiro costuma vir de uma conta invadida, então devolver para a chave indicada significa perder o valor e ainda aparecer na movimentação do golpe.',
      },
      {
        type: 'highlight',
        variant: 'warning',
        content:
          'A devolução correta é feita pela opção Devolver Pix dentro do aplicativo do banco, que envia o valor de volta para a conta de origem, ou pelo suporte oficial da instituição. Nunca faça um novo Pix para uma chave enviada por mensagem.',
      },
      { type: 'heading', content: 'Etapas essenciais' },
      {
        type: 'text',
        content: 'Para te ajudar a se proteger e agir rápido, siga estas etapas essenciais.',
      },
      {
        type: 'list',
        ordered: true,
        items: [
          'Bloqueie e entre em contato com seu banco imediatamente: corte o contato com o golpista e bloqueie o número ou canal de comunicação; entre nos canais oficiais do seu banco para bloquear cartões que possam ter sido comprometidos; caso tenha sido por Pix, acione o MED, e se a compra foi por cartão, conteste diretamente no app do banco.',
          'Proteja suas contas: mude imediatamente todas as senhas que possam ter sido comprometidas; verifique as sessões ativas e desvincule aparelhos desconhecidos conectados às suas contas.',
          'Guarde provas e registre: reúna e salve todas as evidências (prints de conversas, áudios, extratos e notificações); registre um Boletim de Ocorrência online na Delegacia Virtual; se o golpe envolve redes sociais, denuncie o perfil.',
        ],
      },
    ]),
  },
  {
    id: 'licao-03',
    data: buildLessonData('Denúncia', 3, [
      { type: 'heading', content: 'Onde denunciar' },
      {
        type: 'text',
        content:
          'Após iniciar as ações para tentar reparar o dano causado e proteger suas contas, o passo seguinte é formalizar o ocorrido. Fazer a denúncia e registrar o caso nos órgãos competentes é fundamental para tentar responsabilizar os fraudadores e ajudar a derrubar perfis e sites maliciosos.',
      },
      {
        type: 'text',
        content:
          'Abaixo estão os principais canais oficiais onde você pode realizar denúncias e registros.',
      },
      // Canais oficiais reais de propósito: a regra de marca fictícia vale pra cenário de golpe, não pra referência.
      {
        type: 'link',
        url: 'https://delegaciadigital.policia-civil.sp.gov.br/pagina-inicial',
        title: 'Delegacia Eletrônica (Polícia Civil)',
        description:
          'Canal essencial para registrar o Boletim de Ocorrência (B.O.) online de crimes cibernéticos, estelionato e fraudes financeiras no seu estado. Cada estado tem sua própria delegacia eletrônica: procure a do estado onde você mora. Este link leva à do estado de São Paulo.',
      },
      {
        type: 'link',
        url: 'https://www.consumidor.gov.br',
        title: 'Consumidor.gov.br',
        description:
          'Plataforma oficial do Governo Federal para mediação de conflitos e reclamações contra empresas e instituições financeiras que não prestaram o suporte adequado.',
      },
      {
        type: 'link',
        url: 'https://cert.br/contato/',
        title: 'CERT.br (Centro de Resposta e Tratamento de Incidentes)',
        description:
          'Canal para notificar e reportar incidentes de segurança, páginas falsas de phishing e fraudes na internet brasileira.',
      },
      {
        type: 'example',
        title: 'Canais internos das redes sociais e plataformas',
        content:
          'Ferramentas nativas de denúncia (report) de perfis falsos, anúncios fraudulentos ou contas invadidas diretamente no Instagram, WhatsApp, Facebook ou sites de e-commerce.',
      },
      { type: 'heading', content: 'História interativa: o caso da Sara' },
      {
        type: 'text',
        content:
          'Vamos finalizar este módulo com um caça-palavras. Detalhe: a história a seguir possui algumas palavras em destaque, talvez lembrar delas poderá ser de alguma importância.',
      },
      {
        type: 'text',
        content:
          'Sara recebeu uma **mensagem** no WhatsApp de um número desconhecido, com a foto de perfil de seu primo. O **golpista** usou IA (Inteligência Artificial) para clonar a voz dele e manipular uma foto, fazendo Sara acreditar que estava realmente conversando com seu familiar.',
      },
      {
        type: 'text',
        content:
          'Na conversa, o golpista pediu dinheiro emprestado para uma suposta emergência. Preocupada, Sara realizou um **Pix** rapidamente. Logo depois, ao conferir o comprovante, percebeu que o nome do recebedor não era o do seu primo. Desconfiada, ela fez o **bloqueio** do contato e realizou uma **ligação** para o número original dele, confirmando que o evento se passava de uma **fraude**.',
      },
      {
        type: 'text',
        content:
          'Para tentar recuperar o dinheiro, Sara entrou em contato com o **banco** e solicitou o **MED** (Mecanismo Especial de Devolução) pelo aplicativo. Ela também guardou prints das conversas, registrou um **boletim** de ocorrência e fez uma **denúncia** da conta falsa.',
      },
      {
        type: 'text',
        content:
          'Com isso, Sara aprendeu a importância de verificar a identidade de quem pede dinheiro, mesmo quando a mensagem parece vir de alguém conhecido. Afinal, antes de realizar qualquer transferência, é essencial confirmar a solicitação por outro meio de contato.',
      },
      {
        type: 'highlight',
        variant: 'danger',
        content:
          'Sara nunca recebeu o dinheiro de volta. O MED só funciona enquanto ainda houver saldo na conta do golpista, e na maior parte dos casos o valor já foi movimentado.',
      },
      {
        type: 'link',
        url: 'https://wordwall.net/pt/resource/121920441?wwmethod=link',
        title: 'Caça-palavras do Módulo 5',
        description: 'Encontre as palavras em destaque na história da Sara.',
      },
      {
        type: 'fact',
        content: 'Referências utilizadas neste módulo.',
        source:
          'BANCO CENTRAL DO BRASIL. BC te Explica #125. 2026. · BRASIL. Ministério da Justiça e Segurança Pública. Sofri um golpe, e agora? 2026. · CERT.br. Golpes: Caiu? O que Fazer. 2026. · CONSUMIDOR.GOV.BR. Plataforma Nacional de Resolução de Conflitos de Consumo. 2026.',
      },
    ]),
  },
]
