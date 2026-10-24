import type { QuizQuestion } from '@/types/quiz.types'

const trueFalseOptions = [
  { id: 'a', text: 'Verdadeiro' },
  { id: 'b', text: 'Falso' },
]

export const quiz02Questions: QuizQuestion[] = [
  {
    id: 'q1',
    type: 'scenario',
    scenario:
      'Um funcionário recebe um e-mail aparentemente enviado pelo diretor da empresa. A mensagem pede que ele envie imediatamente uma lista de clientes para um endereço externo. O nome e o cargo do diretor aparecem corretamente na mensagem.',
    prompt: 'Qual é a atitude mais segura?',
    options: [
      { id: 'a', text: 'Enviar os dados, pois o nome do diretor está correto.' },
      {
        id: 'b',
        text: 'Responder ao e-mail perguntando se o diretor realmente fez a solicitação.',
      },
      {
        id: 'c',
        text: 'Verificar a solicitação por outro canal oficial antes de enviar qualquer informação.',
      },
      { id: 'd', text: 'Encaminhar a mensagem para outro funcionário decidir o que fazer.' },
    ],
    correctOptionId: 'c',
    explanation:
      'Uma solicitação inesperada de informações deve ser verificada por um canal independente. Mesmo que o nome e o cargo estejam corretos, isso não garante que a mensagem seja realmente do diretor.',
  },
  {
    id: 'q2',
    type: 'multiple_choice',
    prompt: 'Qual é a principal diferença entre phishing e spear phishing?',
    options: [
      {
        id: 'a',
        text: 'O phishing ocorre apenas por telefone, enquanto o spear phishing ocorre apenas por e-mail.',
      },
      {
        id: 'b',
        text: 'O phishing normalmente utiliza abordagens mais amplas, enquanto o spear phishing é direcionado a um alvo específico.',
      },
      {
        id: 'c',
        text: 'O phishing sempre contém malware, enquanto o spear phishing nunca contém arquivos.',
      },
      {
        id: 'd',
        text: 'O phishing é realizado por empresas, enquanto o spear phishing é realizado por usuários comuns.',
      },
    ],
    correctOptionId: 'b',
    explanation:
      'O spear phishing é uma forma direcionada de phishing. O atacante pesquisa informações sobre uma pessoa ou organização e utiliza esses dados para criar uma abordagem mais específica e convincente.',
  },
  {
    id: 'q3',
    type: 'scenario',
    scenario:
      'Você recebe uma mensagem SMS informando que seu pacote está retido e que precisa pagar uma pequena taxa através de um link para liberar a entrega. Mas você não estava esperando nenhuma cobrança.',
    prompt: 'Qual comportamento é mais seguro?',
    options: [
      { id: 'a', text: 'Acessar o link e verificar se o valor da cobrança está correto.' },
      { id: 'b', text: 'Responder ao SMS perguntando qual empresa realizou o envio.' },
      {
        id: 'c',
        text: 'Ignorar a mensagem e verificar a situação diretamente pelo site ou aplicativo oficial da transportadora.',
      },
      { id: 'd', text: 'Realizar o pagamento, pois o valor solicitado é pequeno.' },
    ],
    correctOptionId: 'c',
    explanation:
      'A mensagem apresenta uma cobrança inesperada e utiliza um link para induzir a vítima a realizar uma ação. O mais seguro é acessar diretamente o canal oficial da empresa, sem utilizar o link recebido.',
  },
  {
    id: 'q4',
    type: 'scenario',
    scenario:
      'Uma pessoa recebe uma ligação de alguém que afirma trabalhar no banco. O suposto funcionário diz que houve uma tentativa de fraude e solicita o código de autenticação recebido no celular para cancelar a operação.',
    prompt: 'Qual é o principal sinal de alerta nessa situação?',
    options: [
      { id: 'a', text: 'O contato ter sido realizado por telefone.' },
      { id: 'b', text: 'O banco mencionar uma possível tentativa de fraude.' },
      { id: 'c', text: 'O funcionário utilizar linguagem formal durante a conversa.' },
      {
        id: 'd',
        text: 'A solicitação de um código de autenticação durante uma ligação inesperada.',
      },
    ],
    correctOptionId: 'd',
    explanation:
      'Códigos de autenticação são informações sensíveis e não devem ser fornecidos a terceiros em uma ligação inesperada. O golpista pode utilizar uma situação de emergência para pressionar a vítima a revelar o código.',
  },
  {
    id: 'q5',
    type: 'scenario',
    scenario:
      'Um usuário recebe um e-mail de uma empresa conhecida informando que sua senha precisa ser atualizada. O endereço do remetente parece legítimo, mas o link da mensagem direciona para uma página que possui um endereço diferente do site oficial.',
    prompt: 'O que esse comportamento pode indicar?',
    options: [
      {
        id: 'a',
        text: 'Uma tentativa de phishing utilizando uma página falsa para capturar informações.',
      },
      { id: 'b', text: 'Uma atualização automática e obrigatória do navegador.' },
      { id: 'c', text: 'Uma confirmação normal de identidade realizada pela empresa.' },
      { id: 'd', text: 'Uma mensagem de spam sem qualquer risco.' },
    ],
    correctOptionId: 'a',
    explanation:
      'Um link que direciona para um domínio diferente do site oficial pode indicar que a página foi criada para imitar o serviço legítimo e capturar informações da vítima. É importante verificar o endereço do site antes de inserir qualquer dado.',
  },
  {
    id: 'q6',
    type: 'multiple_choice',
    prompt: 'O que caracteriza o clone phishing?',
    options: [
      {
        id: 'a',
        text: 'A criação de uma mensagem que imita uma comunicação legítima de uma pessoa, empresa ou serviço conhecido.',
      },
      { id: 'b', text: 'O envio de mensagens em massa sem nenhuma personalização.' },
      { id: 'c', text: 'A cópia do número de telefone da vítima para outro aparelho.' },
      { id: 'd', text: 'A instalação de um programa que registra o que a vítima digita.' },
    ],
    correctOptionId: 'a',
    explanation:
      'O clone phishing imita uma comunicação que a vítima reconhece. A mensagem pode conter links, anexos ou páginas falsas criadas para roubar informações ou instalar malware.',
  },
  {
    id: 'q7',
    type: 'multiple_choice',
    prompt: 'Smishing é o phishing realizado por qual meio?',
    options: [
      { id: 'a', text: 'Chamadas telefônicas.' },
      { id: 'b', text: 'Mensagens de texto, como SMS ou aplicativos de mensagens.' },
      { id: 'c', text: 'Perfis falsos em redes sociais.' },
      { id: 'd', text: 'Anexos de e-mail.' },
    ],
    correctOptionId: 'b',
    explanation:
      'No smishing a vítima recebe, por exemplo, uma falsa cobrança, um aviso de entrega ou um pedido para atualizar dados. O meio muda, mas a técnica de manipulação é a mesma.',
  },
  {
    id: 'q8',
    type: 'true_false',
    prompt:
      'Receber uma mensagem de um perfil com o nome de alguém conhecido é garantia de que a conta é verdadeira.',
    options: trueFalseOptions,
    correctOptionId: 'b',
    explanation:
      'Um nome conhecido não significa que a conta seja verdadeira. O golpista pode se passar por uma pessoa próxima, por uma empresa ou até pelo suporte da própria plataforma.',
  },
  {
    id: 'q9',
    type: 'multiple_choice',
    prompt:
      'Qual é o papel de ferramentas como autenticação multifator, antivírus e filtros de spam na proteção contra phishing?',
    options: [
      { id: 'a', text: 'Eliminam completamente o risco de phishing.' },
      {
        id: 'b',
        text: 'Funcionam como camadas adicionais, mas não substituem a atenção do usuário.',
      },
      { id: 'c', text: 'Só são úteis em ambientes corporativos.' },
      { id: 'd', text: 'Impedem que a vítima receba qualquer mensagem suspeita.' },
    ],
    correctOptionId: 'b',
    explanation:
      'Essas tecnologias reduzem a exposição, mas o phishing ataca a decisão da pessoa, não o sistema. Nenhuma camada técnica impede alguém de digitar a própria senha num site falso.',
  },
  {
    id: 'q10',
    type: 'scenario',
    scenario: 'Você recebe uma mensagem com um link e está em dúvida se deve clicar.',
    prompt: 'Quais perguntas ajudam a identificar um possível phishing antes de agir?',
    options: [
      { id: 'a', text: 'Quantas pessoas receberam essa mensagem e em que horário ela chegou.' },
      {
        id: 'b',
        text: 'Eu estava esperando esta mensagem, quem realmente está enviando e esta solicitação faz sentido.',
      },
      { id: 'c', text: 'Se o texto tem erros de português e se a formatação está correta.' },
      { id: 'd', text: 'Se a mensagem chegou por e-mail ou por SMS.' },
    ],
    correctOptionId: 'b',
    explanation:
      'Essas três perguntas atacam o ponto certo: expectativa, origem e coerência do pedido. Erro de português deixou de ser sinal confiável, porque ferramentas de IA produzem textos corretos.',
  },
]
