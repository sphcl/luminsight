import type { QuizQuestion } from '@/types/quiz.types'

const trueFalseOptions = [
  { id: 'a', text: 'Verdadeiro' },
  { id: 'b', text: 'Falso' },
]

export const quiz04Questions: QuizQuestion[] = [
  {
    id: 'q1',
    type: 'scenario',
    scenario:
      'Você recebe uma mensagem de alguém que afirma ser seu gerente bancário e informa que existe uma movimentação suspeita em sua conta.',
    prompt: 'Qual é a atitude mais segura?',
    options: [
      { id: 'a', text: 'Continuar a conversa e pedir mais detalhes sobre a movimentação.' },
      { id: 'b', text: 'Informar alguns dados pessoais para confirmar sua identidade.' },
      { id: 'c', text: 'Confirmar a situação diretamente com o banco por um canal oficial.' },
      { id: 'd', text: 'Seguir as instruções do suposto gerente para resolver o problema.' },
    ],
    correctOptionId: 'c',
    explanation:
      'Bancos não tratam de movimentação por mensagem. Encerrar o contato e procurar a instituição por um canal oficial é o que desmonta o golpe, porque o ataque depende de manter você no canal que o criminoso controla.',
  },
  {
    id: 'q2',
    type: 'scenario',
    scenario:
      'Durante uma conversa, o suposto gerente afirma que você precisa agir imediatamente para impedir uma transferência e diz que não há tempo para desligar a ligação.',
    prompt: 'Qual é o principal sinal de alerta?',
    options: [
      { id: 'a', text: 'O gerente mencionar uma movimentação financeira.' },
      { id: 'b', text: 'O uso de uma linguagem profissional.' },
      { id: 'c', text: 'O contato utilizar informações sobre a conta.' },
      { id: 'd', text: 'A tentativa de criar urgência e pressionar a vítima.' },
    ],
    correctOptionId: 'd',
    explanation:
      'O prazo não existe, ele é criado para impedir a única coisa que derrubaria o golpe: parar e verificar. Mencionar movimentação, usar linguagem profissional e conhecer dados da conta são elementos que um contato legítimo também teria.',
  },
  {
    id: 'q3',
    type: 'scenario',
    scenario:
      'Um suposto gerente entra em contato pelo WhatsApp e diz que precisa proteger sua conta. Para isso, pede que você abra o aplicativo do banco e siga algumas instruções.',
    prompt: 'Qual atitude é mais segura?',
    options: [
      {
        id: 'a',
        text: 'Não realizar nenhum procedimento solicitado pela conversa e confirmar a situação diretamente com o banco por um canal oficial.',
      },
      {
        id: 'b',
        text: 'Pedir para o gerente explicar o procedimento e seguir caso pareça seguro.',
      },
      { id: 'c', text: 'Seguir as instruções, já que o gerente está tentando proteger a conta.' },
      {
        id: 'd',
        text: 'Perguntar ao gerente alguns dados pessoais para ter certeza de que ele é funcionário do banco.',
      },
    ],
    correctOptionId: 'a',
    explanation:
      'Pedir que a vítima opere o próprio aplicativo sob orientação é como o golpista consegue autorização para transações sem nunca pedir a senha. Testar o suposto gerente com perguntas também não funciona, porque ele pode ter os seus dados.',
  },
  {
    id: 'q4',
    type: 'multiple_choice',
    prompt: 'O que o caso da quadrilha que utilizava inteligência artificial demonstra?',
    options: [
      {
        id: 'a',
        text: 'Que a inteligência artificial é utilizada somente por empresas e instituições.',
      },
      {
        id: 'b',
        text: 'Que criminosos podem incorporar novas tecnologias às suas estratégias de fraude.',
      },
      {
        id: 'c',
        text: 'Que golpes com IA dependem exclusivamente de mensagens falsas por e-mail.',
      },
      {
        id: 'd',
        text: 'Que a utilização de inteligência artificial impede a atuação de criminosos organizados.',
      },
    ],
    correctOptionId: 'b',
    explanation:
      'A IA não criou um tipo novo de crime, ela foi incorporada a uma estrutura que já existia. O caso mostra divisão de tarefas entre os integrantes e uso de tecnologia para dar escala a abordagens que antes eram manuais.',
  },
  {
    id: 'q5',
    type: 'multiple_choice',
    prompt: 'Considerando os dois casos apresentados, qual conclusão pode ser tirada?',
    options: [
      {
        id: 'a',
        text: 'Apenas golpes que utilizam inteligência artificial podem causar grandes prejuízos.',
      },
      { id: 'b', text: 'Golpes tradicionais deixaram de funcionar com o avanço da tecnologia.' },
      {
        id: 'c',
        text: 'A tecnologia pode tornar as fraudes mais sofisticadas, mas estratégias de manipulação continuam sendo utilizadas.',
      },
      {
        id: 'd',
        text: 'A melhor forma de evitar golpes é confiar nas orientações recebidas de funcionários que entram em contato.',
      },
    ],
    correctOptionId: 'c',
    explanation:
      'Um dos casos usa IA em escala e o outro é uma ligação telefônica comum, mas os dois causaram prejuízo. O que muda é a ferramenta; a manipulação da confiança continua sendo o centro do ataque.',
  },
  {
    id: 'q6',
    type: 'scenario',
    // O material trazia o marcador "[LOJA FICTÍCIA]"; uso a mesma loja fictícia da simulação do módulo 2.
    scenario:
      'Você recebe um SMS dizendo: "Parabéns! Você ganhou R$ 300 em compras na Loja Mercado! Clique aqui para resgatar seu prêmio."',
    prompt: 'O que você deve fazer?',
    options: [
      { id: 'a', text: 'Clicar no link para verificar se a promoção é verdadeira.' },
      { id: 'b', text: 'Responder à mensagem perguntando como receber o prêmio.' },
      {
        id: 'c',
        text: 'Acessar o site ou aplicativo oficial da empresa por conta própria para verificar se existe alguma promoção.',
      },
      {
        id: 'd',
        text: 'Encaminhar a mensagem para amigos para descobrir se eles também receberam.',
      },
    ],
    correctOptionId: 'c',
    explanation:
      'Prêmio inesperado é a isca pelo lado do benefício, em vez do medo. Clicar ou responder confirma que o número está ativo. Verificar pelo canal oficial, aberto por você, resolve a dúvida sem risco.',
  },
  {
    id: 'q7',
    type: 'multiple_choice',
    prompt:
      'No caso da aposentada, o que os criminosos usaram para fazer a abordagem parecer verdadeira?',
    options: [
      { id: 'a', text: 'Um aplicativo falso instalado no celular dela.' },
      { id: 'b', text: 'Informações sobre a conta bancária e dados pessoais da vítima.' },
      { id: 'c', text: 'Um documento falsificado enviado por e-mail.' },
      { id: 'd', text: 'Um vídeo gerado por inteligência artificial.' },
    ],
    correctOptionId: 'b',
    explanation:
      'A abordagem envolveu dados que a vítima acreditava que só o banco teria. É esse conhecimento que cria a confiança inicial, mesmo sem nenhum recurso técnico sofisticado.',
  },
  {
    id: 'q8',
    type: 'true_false',
    prompt:
      'As consequências de um golpe terminam no momento em que o criminoso consegue o dinheiro.',
    options: trueFalseOptions,
    correctOptionId: 'b',
    explanation:
      'A vítima ainda enfrenta o desgaste emocional e a dificuldade de resolver a situação com a instituição financeira e recuperar os valores. No caso da aposentada, o prejuízo veio de empréstimos contratados em nome dela.',
  },
  {
    id: 'q9',
    type: 'multiple_choice',
    prompt: 'Por que a divulgação de métodos de golpe nas redes sociais agrava o problema?',
    options: [
      { id: 'a', text: 'Porque facilita o trabalho da polícia na identificação dos criminosos.' },
      { id: 'b', text: 'Porque contribui para a disseminação dessas práticas entre mais pessoas.' },
      { id: 'c', text: 'Porque reduz o valor obtido em cada golpe aplicado.' },
      { id: 'd', text: 'Porque obriga as vítimas a denunciarem o crime.' },
    ],
    correctOptionId: 'b',
    explanation:
      'Ao ensinar outras pessoas a aplicarem golpes, os criminosos transformam um método individual em conhecimento replicável. É isso que faz a fraude deixar de ser caso isolado e virar problema de escala.',
  },
  {
    id: 'q10',
    type: 'scenario',
    scenario:
      'Um conhecido comenta que não se preocupa com esses golpes porque, segundo ele, "isso só pega gente desatenta".',
    prompt: 'Qual resposta é mais correta, considerando os casos do módulo?',
    options: [
      { id: 'a', text: 'Ele está certo, atenção basta para nunca cair em um golpe.' },
      { id: 'b', text: 'Ele está certo, porque golpes com IA só atingem empresas.' },
      {
        id: 'c',
        text: 'Os golpes combinam tecnologia e manipulação, e já atingiram pessoas de perfis variados, inclusive quem se considera atento.',
      },
      { id: 'd', text: 'Ele está errado, porque não existe mais forma de se proteger de golpes.' },
    ],
    correctOptionId: 'c',
    explanation:
      'Os ataques são construídos para funcionar justamente contra quem está atento, usando dados reais e pressão de tempo. A defesa não pode depender de autoconfiança, precisa ser um processo fixo de verificação por canal independente.',
  },
]
