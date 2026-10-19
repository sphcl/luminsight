import type { ModuleDocument } from '@/types/module.types'
import {
  PLACEHOLDER_COLOR,
  PLACEHOLDER_ICON,
  buildLessonData,
  type LessonEntry,
} from '@/content/types'
import { MODULE_02_ID } from './module-02'

export const MODULE_03_ID = 'modulo-03'

export const module03: ModuleDocument = {
  title: 'Inteligência Artificial nas Mãos dos Golpistas',
  description:
    'Veja como deepfakes, clonagem de voz e phishing personalizado por IA mudaram os golpes digitais, o cenário brasileiro em 2026 e o que diz a lei.',
  order: 3,
  icon: PLACEHOLDER_ICON,
  color: PLACEHOLDER_COLOR,
  difficulty: 'intermediario',
  estimatedMinutes: 40,
  totalLessons: 3,
  isActive: true,
  hasSimulation: true,
  requiredModuleId: MODULE_02_ID,
}

export const module03Lessons: LessonEntry[] = [
  {
    id: 'licao-01',
    data: buildLessonData('IA generativa, deepfake e phishing personalizado', 1, [
      { type: 'heading', content: 'O que é IA Generativa' },
      {
        type: 'text',
        content:
          'A Inteligência Artificial Generativa é uma tecnologia capaz de criar conteúdos originais como textos, imagens, vídeos e áudios a partir de um comando ou solicitação feita pelo usuário (o famoso prompt). Essa tecnologia vem avançando rapidamente com modelos de deep learning (aprendizado profundo), trazendo muita facilidade para tarefas do dia a dia. No entanto, este avanço também tem sido utilizado para fins desonestos como os deepfakes.',
      },
      {
        type: 'text',
        content:
          'O deepfake é um termo que combina deep learning (aprendizado profundo) e fake (falso), sendo uma tecnologia capaz de criar cenários realistas com rostos e clonagem de vozes, representando riscos significativos de fraudes, golpes, desinformação, fake news e chantagens.',
      },
      // Sem o arquivo do vídeo hospedado, fica só a legenda que o material trazia junto dele.
      {
        type: 'text',
        content:
          'Um vídeo gerado por IA do ator Will Smith comendo espaguete virou uma forma de medir a evolução da tecnologia.',
      },
      {
        type: 'text',
        content:
          'Vale lembrar que o phishing é uma técnica de engenharia social usada para enganar usuários de internet em que criminosos se passam por empresas confiáveis para roubar senhas, dados bancários e informações pessoais. Em geral, as famílias não recebem nenhum treinamento significativo sobre phishing, e acabam sendo atingidas por golpes mais direcionados do que nunca, devido aos ataques estarem mais personalizados e mais difíceis de serem detectados. Apesar de erros notáveis, é nítida uma grande evolução de 2023 até 2025, suficientemente convincente para pessoas leigas sobre o assunto. Este tipo de conteúdo acabou se tornando comum, podendo ser utilizado para espalhar boatos, influenciar eleições e realizar ameaças.',
      },
      {
        type: 'text',
        content:
          'Um exemplo que evidencia os impactos do uso dessa tecnologia pode ser observado em uma reportagem publicada pela BBC News Brasil. Machado (2024) apresenta casos em que criminosos utilizaram recursos de inteligência artificial para clonar características físicas e a voz de pessoas, empregando esses recursos em golpes financeiros.',
      },
      {
        type: 'highlight',
        variant: 'danger',
        content:
          '"Eram o meu rosto, meu cabelo e a minha voz. O único detalhe é que a voz estava um pouco em descompasso com o vídeo, mas sabemos que isso pode acontecer devido à conexão com a internet. É assustador ver a evolução desse tipo de golpe." (MACHADO, 2024)',
      },
      {
        type: 'text',
        content:
          'O relato evidencia como o aprimoramento dessas tecnologias pode tornar os golpes mais difíceis de serem identificados pelas próprias vítimas e demonstra que o avanço dessas tecnologias não está relacionado apenas às possibilidades de inovação, mas também à criação de novos riscos no ambiente digital, reforçando a necessidade de conscientização sobre os riscos relacionados ao uso da inteligência artificial.',
      },
    ]),
  },
  {
    id: 'licao-02',
    data: buildLessonData('O cenário no Brasil em 2026', 2, [
      { type: 'heading', content: 'O cenário no Brasil em 2026' },
      {
        type: 'text',
        content:
          'Levantamentos recentes mostram como esse tipo de golpe cresceu no país. A Serasa Experian identificou quase 1,5 milhão de tentativas de fraude em cadastros e validações de identidade apenas no primeiro trimestre de 2026, o equivalente a uma tentativa a cada cinco segundos.',
      },
      {
        type: 'fact',
        content:
          'Segundo a Febraban, uma das táticas mais comuns é o uso de voz clonada em golpes por WhatsApp, o que muda uma premissa importante: ouvir a voz de um familiar ou conhecido já não é, sozinho, prova suficiente de quem está do outro lado.',
        source: 'EXAME, 2026.',
      },
      {
        type: 'fact',
        content:
          'No estado de São Paulo, dados da Fundação Seade de 2026 mostram que 82% dos idosos já foram alvo de tentativas de golpes digitais e 12% efetivamente sofreram fraudes. 68% desse público afirma não conseguir se proteger nesse ambiente.',
        source: 'Fundação Seade, 2026.',
      },
      {
        type: 'fact',
        content:
          'A Agência Lupa aponta que a produção de conteúdos falsos com uso de IA cresceu 308% entre 2024 e 2025.',
        source: 'IIMA, 2026.',
      },
      {
        type: 'text',
        content:
          'Esses golpes também já atingiram pessoas públicas: em 2026, criminosos usaram uma chamada de vídeo falsa do apresentador Renato Ambrósio anunciando um prêmio para induzir vítimas a fornecer dados pessoais, além de manipular imagens e vozes de celebridades como Gisele Bündchen e Sérgio Reis (BAND, 2026). Isso mostra que nenhum público está isento do risco, famosos ou não.',
      },
      { type: 'heading', content: 'O que diz a lei brasileira' },
      {
        type: 'text',
        content:
          'O Brasil ainda não tem uma lei específica e definitiva sobre deepfakes, mas já existem instrumentos legais aplicáveis.',
      },
      {
        type: 'list',
        ordered: false,
        items: [
          'Estelionato (art. 171, §2º-A do Código Penal): criar ou disseminar deepfakes para aplicar golpes financeiros é tipificado como estelionato eletrônico qualificado, com pena de até 8 anos de reclusão.',
          'Marco Legal da IA (PL 2.338/2023): aprovado no Senado em dezembro de 2024 e em tramitação na Câmara dos Deputados, classifica sistemas de IA por nível de risco e prevê sanções para usos indevidos.',
          'Resolução TSE 23.748/2026: proíbe o uso de deepfakes para beneficiar ou prejudicar candidaturas nas eleições, mesmo quando há autorização para uso da imagem ou voz.',
          'Lei 13.718/2018 e Lei 14.811/2024: tipificam especificamente os deepfakes de conteúdo sexual, com penas mais rigorosas quando envolvem crianças e adolescentes.',
        ],
      },
    ]),
  },
  {
    id: 'licao-03',
    data: buildLessonData('Como se proteger', 3, [
      { type: 'heading', content: 'Mas, afinal, como se proteger?' },
      {
        type: 'list',
        ordered: false,
        items: [
          'Fique atento a detalhes visuais e sonoros: piscadas incomuns, expressões faciais estranhas e falhas na sincronia labial podem indicar um deepfake.',
          'Verifique a fonte: desconfie de vídeos e áudios compartilhados sem contexto ou de fontes duvidosas.',
          'Desconfie de urgência: golpistas usam o medo e a pressa para impedir que você pense.',
          'Combine uma senha de família: crie uma palavra ou frase secreta que só vocês conhecem. Se alguém ligar pedindo socorro ou dinheiro, peça para falar essa palavra.',
          'Use ferramentas de verificação: há softwares que ajudam a detectar manipulações digitais, como o Deepware Scanner e o Microsoft Video Authenticator.',
        ],
      },
      { type: 'heading', content: 'Mais dicas de proteção' },
      {
        type: 'list',
        ordered: false,
        items: [
          'Limite o que você publica: vídeos falando diretamente para a câmera e áudios são as matérias-primas favoritas para clonagem de voz. Quanto menos material público, mais difícil fica clonar sua voz ou seu rosto.',
          'Desconfie mesmo de videochamadas: chamadas de vídeo falsas já são usadas para simular a presença de uma pessoa em tempo real. Instabilidade de conexão não deve ser a única explicação aceita para estranhezas no áudio ou na imagem.',
          'Não confirme dados por iniciativa da ligação: nunca informe senhas, códigos de verificação ou dados bancários para quem ligou pedindo. Ligue de volta usando um número que você já conhece.',
          'Denuncie: golpes que envolvem estelionato podem ser registrados em delegacia, inclusive Delegacias de Crimes Cibernéticos, e reportados às plataformas onde o conteúdo falso circula.',
        ],
      },
      {
        type: 'highlight',
        variant: 'info',
        content:
          'A tecnologia deepfake pode ser uma ferramenta muito poderosa, mas seu uso de forma indevida pode causar consequências graves. Por isso, é importante ter uma postura crítica e cuidadosa ao consumir conteúdos digitais, buscando verificar as informações antes de acreditar ou compartilhá-las.',
      },
    ]),
  },
]
