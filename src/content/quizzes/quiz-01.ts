import type { QuizQuestion } from '@/types/quiz.types'

const trueFalseOptions = [
  { id: 'a', text: 'Verdadeiro' },
  { id: 'b', text: 'Falso' },
]

export const quiz01Questions: QuizQuestion[] = [
  {
    id: 'q1',
    type: 'multiple_choice',
    prompt: 'Segundo Kevin Mitnick, o que a engenharia social utiliza para enganar as pessoas?',
    options: [
      { id: 'a', text: 'Falhas técnicas nos sistemas de segurança.' },
      { id: 'b', text: 'Influência e persuasão.' },
      { id: 'c', text: 'Programas maliciosos instalados no computador da vítima.' },
      { id: 'd', text: 'Interceptação de redes sem fio.' },
    ],
    correctOptionId: 'b',
    explanation:
      'Mitnick define a engenharia social como o uso de influência e persuasão para convencer a vítima de que o atacante é alguém que ele não é. O ataque pode acontecer com ou sem o uso de tecnologia.',
  },
  {
    id: 'q2',
    type: 'true_false',
    prompt: 'Um sistema com boas tecnologias de segurança está protegido contra engenharia social.',
    options: trueFalseOptions,
    correctOptionId: 'b',
    explanation:
      'Mesmo com todos os avanços das tecnologias de segurança, a manipulação psicológica continua sendo um vetor eficaz. O ataque não tenta vencer o sistema, ele convence a pessoa que já tem acesso a ele.',
  },
  {
    id: 'q3',
    type: 'multiple_choice',
    prompt: 'Quais emoções os engenheiros sociais costumam explorar nas vítimas?',
    options: [
      { id: 'a', text: 'Alegria, nostalgia e gratidão.' },
      { id: 'b', text: 'Medo, urgência e curiosidade.' },
      { id: 'c', text: 'Tédio, cansaço e distração.' },
      { id: 'd', text: 'Orgulho, vaidade e competitividade.' },
    ],
    correctOptionId: 'b',
    explanation:
      'Essas três emoções reduzem o tempo de reflexão da vítima. O medo e a urgência empurram para a ação imediata, e a curiosidade faz a pessoa abrir o que não deveria.',
  },
  {
    id: 'q4',
    type: 'multiple_choice',
    prompt: 'O que Mitnick chama de firewall humana?',
    options: [
      { id: 'a', text: 'Um software de proteção instalado em cada computador.' },
      { id: 'b', text: 'A equipe de segurança da informação de uma empresa.' },
      {
        id: 'c',
        text: 'O elemento humano como camada de defesa, que os atacantes tentam quebrar.',
      },
      { id: 'd', text: 'Um conjunto de regras de acesso à rede corporativa.' },
    ],
    correctOptionId: 'c',
    explanation:
      'A expressão trata as pessoas como uma camada de proteção. Mitnick aponta que essa é justamente a camada mais fácil de quebrar, porque não exige investimento técnico nenhum do atacante.',
  },
  {
    id: 'q5',
    type: 'multiple_choice',
    prompt:
      'Por que, segundo Mitnick, os atacantes tendem a se voltar cada vez mais para o elemento humano?',
    options: [
      { id: 'a', text: 'Porque as pessoas têm acesso a mais sistemas que os administradores.' },
      { id: 'b', text: 'Porque as tecnologias de segurança ficaram mais difíceis de explorar.' },
      { id: 'c', text: 'Porque a legislação pune menos esse tipo de ataque.' },
      { id: 'd', text: 'Porque as empresas pararam de investir em treinamento.' },
    ],
    correctOptionId: 'b',
    explanation:
      'À medida que a exploração de vulnerabilidades técnicas fica mais difícil, o custo de atacar a pessoa passa a ser muito menor que o de atacar o sistema.',
  },
  {
    id: 'q6',
    type: 'multiple_choice',
    prompt: 'O que é vishing?',
    options: [
      { id: 'a', text: 'Phishing realizado por mensagem de texto.' },
      { id: 'b', text: 'Phishing realizado por chamada telefônica.' },
      { id: 'c', text: 'Phishing realizado por redes sociais.' },
      { id: 'd', text: 'Phishing realizado com anexo malicioso.' },
    ],
    correctOptionId: 'b',
    explanation:
      'O vishing é a engenharia social aplicada por voz. O atacante usa apenas persuasão durante a ligação para obter informações confidenciais.',
  },
  {
    id: 'q7',
    type: 'true_false',
    prompt: 'Um ataque de engenharia social sempre depende de alguma ferramenta tecnológica.',
    options: trueFalseOptions,
    correctOptionId: 'b',
    explanation:
      'A própria definição de Mitnick diz que o engenheiro social pode se aproveitar das pessoas com ou sem o uso da tecnologia. Uma ligação telefônica basta.',
  },
  {
    id: 'q8',
    type: 'scenario',
    scenario:
      'No vídeo de vishing apresentado no módulo, o atacante usa apenas persuasão e apelos emocionais durante a ligação.',
    prompt: 'Além de obter informações, o que ele consegue fazer?',
    options: [
      { id: 'a', text: 'Instalar um programa no computador da vítima.' },
      { id: 'b', text: 'Alterar a senha da vítima e tirar o acesso dela ao serviço.' },
      { id: 'c', text: 'Interceptar as mensagens trocadas pela vítima.' },
      { id: 'd', text: 'Clonar o cartão bancário da vítima.' },
    ],
    correctOptionId: 'b',
    explanation:
      'O ataque não para na coleta de dados. Com as informações obtidas, o golpista altera a senha e passa a controlar o acesso, deixando a vítima de fora da própria conta.',
  },
  {
    id: 'q9',
    type: 'multiple_choice',
    prompt: 'Como a inteligência artificial mudou os ataques de engenharia social?',
    options: [
      { id: 'a', text: 'Tornou-os mais raros, por causa dos filtros automáticos.' },
      {
        id: 'b',
        text: 'Permitiu imitar vozes, manipular imagens em tempo real e criar documentos falsos convincentes.',
      },
      { id: 'c', text: 'Fez com que passassem a depender exclusivamente de e-mail.' },
      { id: 'd', text: 'Eliminou a necessidade de manipulação psicológica.' },
    ],
    correctOptionId: 'b',
    explanation:
      'A IA não substituiu a manipulação, ela aumentou o poder de convencimento. Com deepfakes de áudio e imagem, ficou mais difícil distinguir o que é real do que é gerado.',
  },
  {
    id: 'q10',
    type: 'scenario',
    scenario:
      'Você recebe uma ligação de alguém que demonstra pressa e apela para a sua empatia, pedindo que você confirme uma informação do seu cadastro.',
    prompt: 'Qual é a melhor atitude?',
    options: [
      { id: 'a', text: 'Confirmar a informação, já que a pessoa parece precisar de ajuda.' },
      { id: 'b', text: 'Perguntar o nome e o setor do atendente antes de confirmar.' },
      { id: 'c', text: 'Encerrar a ligação e procurar a instituição por um canal oficial.' },
      { id: 'd', text: 'Confirmar apenas parte da informação, para testar a pessoa.' },
    ],
    correctOptionId: 'c',
    explanation:
      'Pressa e apelo emocional juntos são o padrão clássico do vishing. Perguntar nome e setor não resolve, porque o golpista inventa qualquer resposta. Trocar para um canal que você mesmo inicia desmonta o ataque.',
  },
]
