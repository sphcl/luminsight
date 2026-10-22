import {
  PLACEHOLDER_COLOR,
  PLACEHOLDER_ICON,
  buildLessonData,
  type LessonEntry,
  type ModuleContent,
} from '@/content/types'
import { MODULE_03_ID } from './module-03'

export const MODULE_04_ID = 'modulo-04'

export const module04: ModuleContent = {
  title: 'Casos Reais e Golpes Modernos',
  description:
    'Acompanhe dois casos documentados no Brasil, o golpe do falso gerente e uma quadrilha que usava IA em escala, e o que eles ensinam sobre fraude.',
  order: 4,
  icon: PLACEHOLDER_ICON,
  color: PLACEHOLDER_COLOR,
  difficulty: 'intermediario',
  totalLessons: 3,
  isActive: true,
  hasSimulation: true,
  requiredModuleId: MODULE_03_ID,
}

export const module04Lessons: LessonEntry[] = [
  {
    id: 'licao-01',
    data: buildLessonData('Introdução', 1, [
      { type: 'heading', content: 'Dos conceitos para a realidade' },
      {
        type: 'text',
        content:
          'Nos módulos anteriores, vimos como a engenharia social funciona, quais são os principais tipos de golpe e como a inteligência artificial pode ser utilizada pelos criminosos. Agora, vamos observar essas técnicas fora da teoria.',
      },
      {
        type: 'text',
        content:
          'Os golpes apresentados a seguir aconteceram com pessoas reais e mostram como diferentes recursos podem ser combinados para tornar uma fraude mais convincente. Em alguns casos, a inteligência artificial aparece diretamente na criação de vozes, imagens ou vídeos. Em outros, ela faz parte de uma estrutura maior utilizada pelos criminosos.',
      },
      {
        type: 'highlight',
        variant: 'info',
        content:
          'Conhecer esses casos é importante porque ajuda a perceber que situações discutidas anteriormente não são apenas possibilidades. Elas já estão sendo utilizadas em golpes que podem causar grandes prejuízos financeiros e emocionais.',
      },
    ]),
  },
  {
    id: 'licao-02',
    data: buildLessonData('Casos reais', 2, [
      {
        type: 'heading',
        content: 'Caso 1: aposentada perde cerca de R$ 50 mil no golpe do falso gerente',
      },
      {
        type: 'text',
        content:
          'Em março de 2026, uma aposentada de São José do Rio Preto, no interior de São Paulo, relatou ter sido vítima do conhecido golpe do falso gerente de banco.',
      },
      {
        type: 'text',
        content:
          'Nesse tipo de fraude, o criminoso entra em contato com a vítima se passando por um funcionário da instituição financeira. A abordagem pode envolver informações sobre a conta bancária ou outros dados pessoais, utilizados para fazer com que a ligação pareça verdadeira.',
      },
      {
        type: 'text',
        content:
          'Nesse caso, a vítima acreditou estar conversando com alguém que realmente trabalhava no banco. Durante a abordagem, os criminosos conseguiram convencê-la a realizar procedimentos que permitiram a contratação de empréstimos em seu nome. Quando percebeu o que havia acontecido, a aposentada descobriu que havia sofrido um prejuízo de aproximadamente R$ 50 mil.',
      },
      {
        type: 'text',
        content:
          'Além do prejuízo financeiro, a reportagem relata o desespero da vítima ao perceber que havia sido enganada. Esse aspecto é importante porque demonstra que as consequências de um golpe não terminam quando o criminoso consegue o dinheiro. A vítima também pode enfrentar dificuldades para resolver a situação com a instituição financeira e recuperar os valores.',
      },
      {
        type: 'fact',
        content: 'Caso documentado em março de 2026, São José do Rio Preto (SP).',
        source:
          'G1, 2026. https://g1.globo.com/sp/sao-jose-do-rio-preto-aracatuba/noticia/2026/03/18/aposentada-relata-desespero-ao-cair-em-golpe-do-falso-gerente-de-banco-e-notar-prejuizo-de-r-50-mil-fizeram-emprestimos.ghtml',
      },
      {
        type: 'heading',
        content: 'Caso 2: quadrilha utilizava inteligência artificial para aplicar golpes',
      },
      {
        type: 'text',
        content:
          'Em outubro de 2025, uma investigação revelou uma quadrilha que utilizava inteligência artificial para aplicar golpes e que também utilizava as redes sociais para ostentar o dinheiro obtido com os crimes e ensinar outras pessoas a praticarem fraudes.',
      },
      {
        type: 'text',
        content:
          'Segundo a reportagem do Jornal Nacional, o grupo havia transformado a aplicação de golpes em uma atividade organizada. Os integrantes utilizavam recursos tecnológicos para criar abordagens mais convincentes e alcançar as vítimas de maneira mais eficiente.',
      },
      {
        type: 'text',
        content:
          'Um dos pontos que chama atenção no caso é justamente a forma como os criminosos utilizavam a própria internet para divulgar o resultado dos crimes. Nas redes sociais, integrantes do grupo exibiam uma vida de luxo, com carros, viagens e outros bens, enquanto também compartilhavam conteúdos ensinando como realizar golpes.',
      },
      {
        type: 'text',
        content:
          'A utilização da inteligência artificial fazia parte desse processo de modernização das fraudes. Recursos de IA podem facilitar a produção de conteúdos falsos e permitir que criminosos criem abordagens mais personalizadas e convincentes. Dessa forma, uma mesma técnica de fraude pode ser adaptada para diferentes vítimas sem que o criminoso precise realizar todo o trabalho manualmente.',
      },
      {
        type: 'text',
        content:
          'O caso também mostra que a utilização criminosa da IA não acontece necessariamente de forma isolada. A tecnologia pode ser incorporada a uma estrutura já organizada, na qual existem pessoas responsáveis por diferentes etapas do golpe, desde a preparação da abordagem até o contato com as vítimas e a obtenção do dinheiro.',
      },
      {
        type: 'text',
        content:
          'Outro aspecto importante é a divulgação desse tipo de conhecimento nas redes sociais. Ao ensinar outras pessoas a aplicarem golpes, os criminosos contribuem para a disseminação dessas práticas e tornam a fraude um problema ainda maior.',
      },
      {
        type: 'fact',
        content: 'Reportagem do Jornal Nacional, outubro de 2025.',
        source:
          'G1, 2025. https://g1.globo.com/jornal-nacional/noticia/2025/10/01/bandidos-que-usavam-ia-para-aplicar-golpes-ostentavam-vida-de-luxo-e-ensinavam-nas-redes-sociais-como-praticar-crime.ghtml',
      },
    ]),
  },
  {
    id: 'licao-03',
    data: buildLessonData('Conclusão', 3, [
      { type: 'heading', content: 'O que esses casos nos ensinam' },
      {
        type: 'text',
        content:
          'Os dois casos apresentados mostram que os golpes podem assumir formas diferentes, mas têm algo em comum: a tecnologia pode ser utilizada para aumentar o alcance, a eficiência e a capacidade de convencimento dos criminosos.',
      },
      {
        type: 'text',
        content:
          'No caso da quadrilha, a inteligência artificial fazia parte de uma estrutura criminosa organizada, mostrando que a tecnologia pode ser incorporada a diferentes etapas de uma fraude. Já no caso do falso gerente, vemos que uma abordagem aparentemente simples, como uma ligação telefônica, ainda pode causar grandes prejuízos quando o criminoso consegue conquistar a confiança da vítima.',
      },
      {
        type: 'text',
        content:
          'Isso também mostra que não devemos pensar na inteligência artificial como algo separado dos golpes que já conhecemos. Muitas fraudes continuam utilizando estratégias tradicionais de engenharia social, enquanto novas tecnologias são incorporadas para torná-las mais convincentes ou facilitar sua aplicação.',
      },
      {
        type: 'text',
        content:
          'Por isso, conhecer os casos reais é importante. Eles mostram que os golpes apresentados neste curso não são situações hipotéticas ou distantes da realidade. Pessoas e organizações são afetadas por essas práticas, e os criminosos estão constantemente adaptando suas estratégias às novas tecnologias.',
      },
      {
        type: 'highlight',
        variant: 'info',
        content:
          'A principal lição é que a tecnologia pode tornar um golpe mais sofisticado, mas a atenção da vítima continua sendo uma das principais barreiras contra a fraude. Desconfiar de abordagens inesperadas, confirmar informações por canais oficiais e evitar tomar decisões financeiras sob pressão são atitudes que podem impedir que uma tentativa de golpe se transforme em um prejuízo.',
      },
    ]),
  },
]
