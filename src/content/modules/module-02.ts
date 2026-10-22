import {
  PLACEHOLDER_COLOR,
  PLACEHOLDER_ICON,
  buildLessonData,
  type LessonEntry,
  type ModuleContent,
} from '@/content/types'
import { MODULE_01_ID } from './module-01'

export const MODULE_02_ID = 'modulo-02'

export const module02: ModuleContent = {
  title: 'Phishing: A Arte do Engano Digital',
  description:
    'Conheça os principais tipos de phishing, de e-mail a ligação e SMS, e aprenda a reconhecer uma tentativa de ataque antes de clicar.',
  order: 2,
  icon: PLACEHOLDER_ICON,
  color: PLACEHOLDER_COLOR,
  difficulty: 'iniciante',
  totalLessons: 3,
  isActive: true,
  hasSimulation: true,
  requiredModuleId: MODULE_01_ID,
}

export const module02Lessons: LessonEntry[] = [
  {
    id: 'licao-01',
    data: buildLessonData('O que é Phishing', 1, [
      { type: 'heading', content: 'Introdução' },
      {
        type: 'text',
        content:
          'O phishing é um dos tipos mais comuns de ataques cibernéticos e tem como principal característica o uso de engenharia social para manipular suas vítimas. Em vez de tentar invadir diretamente um sistema, o golpista procura convencer a própria pessoa a realizar uma ação que pode colocar seus dados ou sua segurança em risco.',
      },
      {
        type: 'text',
        content:
          'Isso pode acontecer por meio de e-mails, mensagens de texto, ligações telefônicas, redes sociais ou até mesmo sites falsos. O objetivo pode ser roubar senhas e outras informações pessoais, obter dinheiro, assumir o controle de contas ou induzir a vítima a instalar algum programa malicioso.',
      },
      {
        type: 'text',
        content:
          'Mas como esses golpes funcionam na prática? Existem diferentes tipos de phishing, cada um utilizando uma abordagem diferente para tentar conquistar a confiança da vítima.',
      },
    ]),
  },
  {
    id: 'licao-02',
    data: buildLessonData('Os principais tipos de phishing', 2, [
      { type: 'heading', content: 'Principais tipos de phishing' },
      {
        type: 'text',
        content:
          'O phishing pode aparecer de diversas formas. Entre as técnicas mais comuns estão:',
      },
      {
        type: 'example',
        title: 'Clone phishing',
        content:
          'O golpista cria uma mensagem que imita uma comunicação legítima de uma pessoa, empresa ou serviço conhecido. Ela pode conter links, anexos ou páginas falsas criadas para roubar informações ou instalar malware.',
      },
      {
        type: 'example',
        title: 'Spear phishing',
        content:
          'É um ataque direcionado a uma pessoa ou organização específica. O golpista pesquisa informações sobre o alvo e utiliza esses dados para criar uma mensagem mais convincente e personalizada.',
      },
      {
        type: 'example',
        title: 'Smishing',
        content:
          'É o phishing realizado por mensagens de texto, como SMS ou aplicativos de mensagens. A vítima pode receber, por exemplo, uma falsa cobrança, aviso de entrega ou solicitação para atualizar seus dados.',
      },
      {
        type: 'example',
        title: 'Vishing',
        content:
          'É o phishing realizado por chamadas telefônicas. O golpista pode se passar por um banco, empresa, órgão público ou outra instituição conhecida, utilizando técnicas de manipulação para convencer a vítima a fornecer informações ou realizar alguma ação.',
      },
      {
        type: 'example',
        title: 'Phishing em redes sociais',
        content:
          'Utiliza plataformas como Instagram, Facebook, X e outras redes sociais para enganar os usuários. O golpista pode se passar por uma pessoa conhecida, uma empresa ou até mesmo pelo suporte da própria plataforma, tentando obter senhas, códigos de acesso ou outras informações.',
      },
      {
        type: 'text',
        content:
          'Esses são apenas alguns exemplos, também sendo os mais comuns. Os golpistas podem combinar diferentes técnicas e adaptar suas abordagens de acordo com o alvo, com o objetivo sendo sempre o mesmo: fazer com que a vítima confie na mensagem e aja sem perceber que está diante de um golpe.',
      },
    ]),
  },
  {
    id: 'licao-03',
    data: buildLessonData('Como se proteger contra o phishing', 3, [
      { type: 'heading', content: 'Como se proteger contra o phishing' },
      {
        type: 'text',
        content:
          'A melhor defesa contra o phishing começa com atenção. Antes de clicar em um link, abrir um anexo ou fornecer qualquer informação, pare por um tempo e questione: eu estava esperando esta mensagem? Quem realmente está enviando? Esta solicitação faz sentido?',
      },
      {
        type: 'list',
        ordered: false,
        items: [
          'Verifique o remetente: observe cuidadosamente o endereço de e-mail, número de telefone ou perfil que enviou a mensagem. Um nome conhecido não significa necessariamente que a conta seja verdadeira.',
          'Cuidado com links e anexos: não abra links ou arquivos inesperados, principalmente quando a mensagem tentar criar um senso de urgência. Quando possível, acesse o site diretamente pelo navegador ou pelo aplicativo oficial, em vez de utilizar o link recebido.',
          'Proteja suas informações pessoais: evite fornecer senhas, códigos de autenticação, dados bancários ou outras informações sensíveis sem verificar primeiro quem está solicitando e por qual motivo.',
          'Desconfie de pressão e urgência: mensagens que dizem que sua conta será bloqueada imediatamente, que você precisa pagar uma cobrança agora ou que ganhou algum prêmio podem estar tentando fazer você agir sem pensar.',
        ],
      },
      {
        type: 'text',
        content:
          'Além desses cuidados, algumas ferramentas podem ajudar na proteção, como autenticação multifator (MFA), antivírus, filtros de spam e filtros de navegação. Essas tecnologias funcionam como camadas adicionais de segurança, mas não substituem a atenção do usuário.',
      },
      {
        type: 'highlight',
        variant: 'info',
        content:
          'No final, a principal proteção contra o phishing é desenvolver o hábito de parar, verificar e só então agir. Uma mensagem pode parecer verdadeira, vir de alguém conhecido e até estar perfeitamente escrita, mas isso não significa que seja segura.',
      },
      {
        type: 'fact',
        content: 'Fontes consultadas para este módulo.',
        source:
          'IBM, Cloudflare e Prodest (ES). https://www.ibm.com/br-pt/think/topics/phishing · https://www.cloudflare.com/pt-br/learning/access-management/phishing-attack/ · http://prodest.es.gov.br/entenda-o-que-e-phishing-e-adote-medidas-para-evita-lo',
      },
    ]),
  },
]
