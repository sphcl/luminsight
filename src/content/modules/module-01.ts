import {
  PLACEHOLDER_COLOR,
  PLACEHOLDER_ICON,
  buildLessonData,
  type LessonEntry,
  type ModuleContent,
} from '@/content/types'

export const MODULE_01_ID = 'modulo-01'

export const module01: ModuleContent = {
  title: 'Fundamentos da Engenharia Social',
  description:
    'Entenda o que é engenharia social, quais emoções os golpistas exploram e por que a tecnologia sozinha não protege ninguém.',
  order: 1,
  icon: PLACEHOLDER_ICON,
  color: PLACEHOLDER_COLOR,
  difficulty: 'iniciante',
  totalLessons: 3,
  isActive: true,
  hasSimulation: false,
  requiredModuleId: null,
}

export const module01Lessons: LessonEntry[] = [
  {
    id: 'licao-01',
    data: buildLessonData('O que é Engenharia Social', 1, [
      { type: 'heading', content: 'O que é Engenharia Social' },
      {
        type: 'text',
        content:
          'A definição de Engenharia Social apresentada no livro A Arte de Enganar, escrito por Kevin Mitnick, resume bem a sua essência: "A engenharia social usa a influência e a persuasão para enganar as pessoas e convencê-las de que o engenheiro social é alguém que na verdade ele não é, ou pela manipulação. Como resultado, o engenheiro social pode aproveitar-se das pessoas para obter as informações com ou sem o uso da tecnologia."',
      },
      {
        type: 'text',
        content:
          'Por meio de manipulações, mentiras e estratégias de persuasão, os engenheiros sociais se aproveitam de suas vítimas para alcançar seus objetivos. Explorando emoções humanas fundamentais, como o medo, a urgência ou a curiosidade, eles criam oportunidades de ataque focando na fragilidade comportamental. Dessa forma, mesmo com todos os avanços das tecnologias de segurança, a manipulação psicológica persiste como um vetor altamente eficaz para burlar defesas e extrair informações confidenciais, transformando a interação humana em uma porta de entrada para invasões.',
      },
      {
        type: 'fact',
        content:
          'A engenharia social usa influência e persuasão para enganar pessoas, com ou sem o uso de tecnologia.',
        source: 'MITNICK, Kevin. A Arte de Enganar.',
      },
      {
        type: 'video',
        url: 'https://www.youtube.com/watch?v=rXa-GfoCGus',
        title: 'O que é engenharia social',
      },
    ]),
  },
  {
    id: 'licao-02',
    data: buildLessonData('A firewall humana e os ataques com IA', 2, [
      { type: 'heading', content: 'Por que a tecnologia sozinha não basta' },
      {
        type: 'text',
        content:
          'E, continuando a reflexão, Kevin Mitnick traz uma advertência certeira: "À medida que os especialistas contribuem para o desenvolvimento contínuo de melhores tecnologias de segurança, tornando ainda mais difícil a exploração de vulnerabilidades técnicas, os atacantes se voltarão cada vez mais para a exploração do elemento humano. Quebrar a \'firewall humana\' quase sempre é fácil, não exige nenhum investimento além do custo de uma ligação telefônica e envolve um risco mínimo."',
      },
      {
        type: 'text',
        content:
          'É exatamente essa lógica que nos leva ao cenário crítico que está no auge hoje em dia: os ataques potencializados pela Inteligência Artificial. Atualmente, tornou-se muito mais fácil aplicar e sofrer esse tipo de golpe. Com o uso de IAs, os criminosos conseguem imitar a voz de pessoas conhecidas (deepfakes de áudio), manipular imagens em tempo real e criar documentos falsos com um nível de perfeição assustador. Como resultado, muitas vezes já não conseguimos distinguir com clareza o que é gerado por IA e o que é real.',
      },
      {
        type: 'highlight',
        variant: 'warning',
        content:
          'Quebrar a firewall humana quase sempre é fácil: não exige investimento além do custo de uma ligação telefônica e envolve risco mínimo para o atacante.',
      },
    ]),
  },
  {
    id: 'licao-03',
    data: buildLessonData('Vishing na prática', 3, [
      { type: 'heading', content: 'Engenharia social em sua forma crua' },
      {
        type: 'text',
        content:
          'Para ilustrar a aplicação prática da engenharia social, o vídeo a seguir demonstra o ataque chamado Vishing, golpe feito através de chamadas telefônicas, usando apenas da lábia o atacante consegue informações confidenciais.',
      },
      {
        type: 'video',
        url: 'https://www.youtube.com/watch?v=xuYoMs6CLEw',
        title: 'Social Engineering: Vishing Example',
        caption: 'Para melhor compreensão do vídeo, é aconselhado ativar as legendas em português.',
      },
      {
        type: 'text',
        content:
          'Nesse vídeo é apresentada a engenharia social em sua forma crua. Usando apenas a persuasão e apelos emocionais, como a urgência e a empatia, o golpista consegue informações privilegiadas para usar em um possível ataque depois. Ele ainda consegue alterar informações existentes, como trocar a senha da vítima e fazer com que ela não tenha mais acesso ao sistema ou serviço.',
      },
      {
        type: 'fact',
        content: 'Referências utilizadas neste módulo.',
        source:
          'MITNICK, Kevin D. A Arte de Enganar. São Paulo: Pearson Makron Books, 2003. Vídeos complementares disponíveis em youtube.com/watch?v=rXa-GfoCGus e youtube.com/watch?v=xuYoMs6CLEw',
      },
    ]),
  },
]
