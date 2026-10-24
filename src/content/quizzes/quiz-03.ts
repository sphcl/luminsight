import type { QuizQuestion } from '@/types/quiz.types'

const trueFalseOptions = [
  { id: 'a', text: 'Verdadeiro' },
  { id: 'b', text: 'Falso' },
]

export const quiz03Questions: QuizQuestion[] = [
  {
    id: 'q1',
    type: 'multiple_choice',
    prompt: 'O que é Inteligência Artificial Generativa?',
    options: [
      { id: 'a', text: 'Uma tecnologia usada apenas para criar imagens.' },
      {
        id: 'b',
        text: 'Uma tecnologia capaz de criar conteúdos como textos, imagens, vídeos e áudios a partir de comandos.',
      },
      { id: 'c', text: 'Um sistema utilizado exclusivamente para detectar golpes.' },
      { id: 'd', text: 'Um programa que funciona apenas quando conectado a redes sociais.' },
    ],
    correctOptionId: 'b',
    explanation:
      'A IA generativa cria conteúdos originais a partir de um comando do usuário, o chamado prompt. Ela não se limita a um formato: produz texto, imagem, vídeo e áudio.',
  },
  {
    id: 'q2',
    type: 'multiple_choice',
    prompt: 'O termo deepfake é formado pela combinação de quais palavras?',
    options: [
      { id: 'a', text: 'Deep learning e fake.' },
      { id: 'b', text: 'Digital e fake.' },
      { id: 'c', text: 'Deep technology e fraud.' },
      { id: 'd', text: 'Data learning e fake.' },
    ],
    correctOptionId: 'a',
    explanation:
      'Deepfake combina deep learning, que é a técnica de aprendizado profundo usada para gerar o conteúdo, com fake, que indica que o resultado é falso.',
  },
  {
    id: 'q3',
    type: 'multiple_choice',
    prompt: 'Qual das opções apresenta um possível uso mal-intencionado de um deepfake?',
    options: [
      { id: 'a', text: 'Criar uma apresentação para um trabalho.' },
      { id: 'b', text: 'Traduzir um texto automaticamente.' },
      { id: 'c', text: 'Clonar o rosto ou a voz de uma pessoa para aplicar um golpe.' },
      { id: 'd', text: 'Criar uma imagem para uma rede social.' },
    ],
    correctOptionId: 'c',
    explanation:
      'A tecnologia em si é neutra. O que caracteriza o uso mal-intencionado é empregá-la para se passar por outra pessoa, como clonar rosto ou voz para aplicar um golpe.',
  },
  {
    id: 'q4',
    type: 'multiple_choice',
    prompt: 'O que é phishing?',
    options: [
      { id: 'a', text: 'Uma técnica utilizada para melhorar a segurança de senhas.' },
      {
        id: 'b',
        text: 'Uma técnica de engenharia social usada para enganar pessoas e obter informações.',
      },
      { id: 'c', text: 'Um programa que identifica automaticamente deepfakes.' },
      { id: 'd', text: 'Uma ferramenta usada para criar vídeos com inteligência artificial.' },
    ],
    correctOptionId: 'b',
    explanation:
      'O phishing é engenharia social: criminosos se passam por empresas confiáveis para roubar senhas, dados bancários e informações pessoais. O ataque é sobre convencer a pessoa, não sobre invadir o sistema.',
  },
  {
    id: 'q5',
    type: 'multiple_choice',
    prompt: 'Por que os golpes personalizados podem ser mais difíceis de identificar?',
    options: [
      { id: 'a', text: 'Porque não utilizam nenhuma informação sobre a vítima.' },
      { id: 'b', text: 'Porque são sempre realizados presencialmente.' },
      {
        id: 'c',
        text: 'Porque utilizam informações e características específicas para tornar o golpe mais convincente.',
      },
      { id: 'd', text: 'Porque não fazem uso de inteligência artificial.' },
    ],
    correctOptionId: 'c',
    explanation:
      'Quando a abordagem usa informações reais sobre a vítima, ela deixa de parecer uma mensagem genérica. É isso que derruba a desconfiança, e é por isso que dados vazados têm valor para quem aplica golpes.',
  },
  {
    id: 'q6',
    type: 'multiple_choice',
    prompt: 'Qual dessas situações pode ser um sinal de que um vídeo foi manipulado por IA?',
    options: [
      { id: 'a', text: 'O vídeo possuir boa qualidade.' },
      { id: 'b', text: 'A pessoa aparecer falando normalmente.' },
      { id: 'c', text: 'Falhas na sincronização entre a voz e os movimentos da boca.' },
      { id: 'd', text: 'O vídeo possuir mais de um minuto.' },
    ],
    correctOptionId: 'c',
    explanation:
      'Falhas de sincronia entre voz e movimento da boca, piscadas incomuns e expressões faciais estranhas são os sinais visuais mais frequentes. Qualidade, duração e naturalidade aparente não dizem nada sobre autenticidade.',
  },
  {
    id: 'q7',
    type: 'scenario',
    scenario: 'Alguém liga dizendo ser um familiar e pede dinheiro com urgência.',
    prompt: 'Qual seria uma atitude segura?',
    options: [
      { id: 'a', text: 'Fazer a transferência imediatamente para ajudar.' },
      {
        id: 'b',
        text: 'Pedir informações pessoais para confirmar a identidade e realizar o pagamento.',
      },
      {
        id: 'c',
        text: 'Desligar e entrar em contato com o familiar por outro meio para confirmar a situação.',
      },
      {
        id: 'd',
        text: 'Compartilhar a ligação com outras pessoas para verificar se é verdadeira.',
      },
    ],
    correctOptionId: 'c',
    explanation:
      'Desligar e ligar de volta por um número que você já conhece é o que desmonta o golpe, porque tira o criminoso do canal que ele controla. Pedir dados pessoais não ajuda, já que ele pode tê-los obtido em vazamentos.',
  },
  {
    id: 'q8',
    type: 'multiple_choice',
    prompt: 'Qual atitude ajuda a se proteger de golpes que utilizam IA?',
    options: [
      { id: 'a', text: 'Acreditar em qualquer áudio ou vídeo enviado por conhecidos.' },
      { id: 'b', text: 'Compartilhar informações rapidamente para alertar outras pessoas.' },
      { id: 'c', text: 'Ignorar qualquer conteúdo que utilize inteligência artificial.' },
      {
        id: 'd',
        text: 'Verificar a fonte, desconfiar de situações urgentes e confirmar a identidade da pessoa.',
      },
    ],
    correctOptionId: 'd',
    explanation:
      'As três atitudes juntas cobrem os pontos que o golpe explora: a origem do conteúdo, a pressa artificial e a identidade de quem está do outro lado. Ignorar todo conteúdo com IA não é viável nem necessário.',
  },
  {
    id: 'q9',
    type: 'scenario',
    scenario:
      'Um conhecido manda um áudio no WhatsApp pedindo uma transferência urgente. A voz é idêntica à dele.',
    prompt: 'O que esse cenário tem de arriscado?',
    options: [
      { id: 'a', text: 'Nada, porque a voz é uma forma confiável de identificação.' },
      {
        id: 'b',
        text: 'O uso de voz clonada por IA é hoje uma das táticas mais comuns, então a voz sozinha não prova identidade.',
      },
      {
        id: 'c',
        text: 'O risco só existe se a mensagem vier por ligação, e não por áudio gravado.',
      },
      { id: 'd', text: 'O risco só existe se o valor pedido for alto.' },
    ],
    correctOptionId: 'b',
    explanation:
      'Segundo a Febraban, a voz clonada em golpes por WhatsApp é uma das táticas mais frequentes. Isso muda uma premissa antiga: reconhecer a voz de alguém já não é prova de quem está do outro lado.',
  },
  {
    id: 'q10',
    type: 'true_false',
    prompt: 'O Brasil já possui uma lei específica e definitiva sobre deepfakes.',
    options: trueFalseOptions,
    correctOptionId: 'b',
    explanation:
      'Ainda não existe lei específica, mas já se aplicam instrumentos como o estelionato eletrônico qualificado (art. 171, §2º-A do Código Penal), a Resolução TSE 23.748/2026 e as leis 13.718/2018 e 14.811/2024. O Marco Legal da IA segue em tramitação.',
  },
]
